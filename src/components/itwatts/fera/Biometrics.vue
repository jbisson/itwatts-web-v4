<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch, nextTick } from 'vue';
import { useTrainerStore } from '@/stores/apps/trainers';
import { usePowerSourceStore } from '@/stores/apps/power-sources';
import { setOptions }  from 'vue-filepond';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import vueFilePond from 'vue-filepond';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { uuid } from 'vue-uuid';
import config from "@/config/config.json";
import { rules } from '@/utils/rules';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';

import 'vue-advanced-cropper/dist/style.css';
import { useUserProfile } from '@/stores/user-profile';
import DatePicker from '@/components/forms/form-elements/datetime/DatePicker.vue';
import { round } from '@/utils/numbers';

const emit = defineEmits(['onSuccess', 'onError', 'onLoading']);
const { t, locale } = useI18n({ useScope: 'global' });

const props = defineProps({
  user: Object,
  loadFromUserProfile: Boolean,
});

const router = useRouter();
const loading = ref(false);

const weightDialog = ref(false);
const weightDialogItem = ref();
const deleteWeightDialog = ref();
const weights = ref([]);
const isWeightFormValid = ref();

const heightDialog = ref(false);
const heightDialogItem = ref();
const deleteHeightDialog = ref();
const heights = ref([]);
const isHeightFormValid = ref();

const weightHeaders = ref([
  { title: t('common.date'), key: 'date', sortable: true, maxWidth: 100},  
  { title: t('common.metric'), key: 'weight_metric_value', maxWidth: 80, sortable: true },  
  { title: t('common.imperial'), key: 'weight_imperial_value', maxWidth: 80, sortable: true, align: ' d-none d-lg-table-cell' },
  { title: t('common.validation'), key: 'validation', align: 'center', sortable: true },
  { title: t('actions.actions'), key: 'actions', sortable: false, align: `${props.loadFromUserProfile ? '' : ' d-none'}` },
]);

const heightHeaders = ref([
  { title: t('common.date'), key: 'date', sortable: true, maxWidth: 100 },  
  { title: t('common.metric'), key: 'height_metric_value', maxWidth: 80, sortable: true },  
  { title: t('common.imperial'), key: 'height_imperial_value', maxWidth: 80, sortable: true, align: ' d-none d-lg-table-cell' },
  { title: t('common.validation'), key: 'validation', align: 'center', sortable: true },
  { title: t('actions.actions'), key: 'actions', sortable: false, align: `${props.loadFromUserProfile ? '' : ' d-none'}` },
]);

const FilePond = vueFilePond(FilePondPluginFileEncode, FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize);

const now = new Date();
const defaultWeight = {
  id: uuid.v4(),  
  date: '',
  unit: 'metric',
  weight_metric_value: '',
  weight_imperial_value: '',
  video_url: '',
  created: now.toISOString(),
  last_modified: now.toISOString(),
}

const defaultHeight = {
  id: uuid.v4(),  
  date: '',
  unit: 'metric',
  height_metric_value: '',
  height_ft_imperial_value: '',
  height_in_imperial_value: '',
  video_url: '',
  created: now.toISOString(),
  last_modified: now.toISOString(),
}

setOptions(
  {
    allowFileTypeValidation: false,
    acceptedFileTypes: ['.fit'],
    maxFileSize: '20MB',
  }
);

applyDefaultWeight();
applyDefaultHeight();

function applyDefaultWeight() {
  setTimeout(() => {
    defaultWeight.id = uuid.v4();
    // console.log('Default: ' + JSON.stringify(defaultWeight));
    weightDialogItem.value = Object.assign({}, defaultWeight);
  });
}

function applyDefaultHeight() {
  setTimeout(() => {
    defaultHeight.id = uuid.v4();
    // console.log('Default: ' + JSON.stringify(defaultHeight));
    heightDialogItem.value = Object.assign({}, defaultHeight);
  });
}

function closeWeightDialog() {
  weightDialog.value = false;
  applyDefaultWeight();
}

function closeHeightDialog() {
  heightDialog.value = false;
  applyDefaultHeight();
}

async function editWeight(item: any) {
  weightDialogItem.value = Object.assign({}, 
    weights.value.find((weight: any) => weight.id === item.id)
  );
  weightDialog.value = true;
}

async function editHeight(item: any) {
  heightDialogItem.value = Object.assign({}, 
    heights.value.find((height: any) => height.id === item.id)
  );
  heightDialog.value = true;
}

function deleteWeight(item: any) {
  weightDialogItem.value = Object.assign({}, item);
  deleteWeightDialog.value = true;
}

function deleteHeight(item: any) {
  heightDialogItem.value = Object.assign({}, item);
  deleteHeightDialog.value = true;
}

async function confirmDeleteWeightDialog(id: any) {  
  weights.value = weights.value.filter((weight: any) => weight.id !== id);
  deleteWeightDialog.value = false;
  applyDefaultWeight();
  await saveWeights();
}

async function confirmDeleteHeightDialog(id: any) {  
  heights.value = heights.value.filter((height: any) => height.id !== id);
  deleteHeightDialog.value = false;
  applyDefaultHeight();
  await saveHeights();
}

function closeDeleteWeightDialog() {
  deleteWeightDialog.value = false;
  applyDefaultWeight();
}

function closeDeleteHeightDialog() {
  deleteHeightDialog.value = false;
  applyDefaultHeight();
}

async function saveWeightDialog() {
  weights.value = weights.value.filter((weight) => (weight.id !== weightDialogItem.value.id));
  weights.value.push(weightDialogItem.value);
  weightDialog.value = false;
  await saveWeights();
  applyDefaultWeight();
}

async function saveHeightDialog() {
  heights.value = heights.value.filter((height) => (height.id !== heightDialogItem.value.id));
  heights.value.push(heightDialogItem.value);
  heightDialog.value = false;
  await saveHeights();
  applyDefaultHeight();
}

async function saveWeights() {
  emit('onError', '');
  try {
    emit('onLoading', true);
    loading.value = true;
    
    calculateWeightUnit(weightDialogItem.value.unit === 'metric' ? 'imperial' : 'metric');
    // console.log(`biometrics: ${JSON.stringify(weights.value)}`);
    const user = await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
    {
      weights: weights.value,
    },{
        withCredentials: true
    });
  } catch (err: any) {
    emit('onError', t('errors.errorOccured', [err]));
    console.log(`Error: ${err} stack: ${err.stack}`);
  } finally {
    loading.value = false;
    emit('onLoading', false);
  }
}

async function saveHeights() {
  emit('onError', '');
  try {
    emit('onLoading', true);
    loading.value = true;
    
    calculateHeightUnit(heightDialogItem.value.unit === 'metric' ? 'imperial' : 'metric');
    // console.log(`heights: ${JSON.stringify(heights.value)}`);
    const user = await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
    {
      heights: heights.value,
    },{
      withCredentials: true
    });
  } catch (err: any) {
    emit('onError', t('errors.errorOccured', [err]));
    console.log(`Error: ${err} stack: ${err.stack}`);
  } finally {
    loading.value = false;
    emit('onLoading', false);
  }
}

async function refresh() {
  // console.log('refresh');
  try {
    weights.value = [];
    heights.value = [];

    let user = props.user;
    if (props.loadFromUserProfile) {
      const userResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
      {
        withCredentials: true
      });      
      user = userResponse.data;
    }
    if (!user) {
      return;
    }

    if (user.weights) {
      // console.log(`refresh weights: ${JSON.stringify(user.weights)}`);
      weights.value = user.weights;      
    }

    if (user.heights) {
      // console.log(`refresh heights: ${JSON.stringify(user.heights)}`);
      let heightsVal = [];
      for (let i = 0;i < user.heights.length;i++) {
        user.heights[i].height_imperial_value = `${user.heights[i].height_ft_imperial_value} ft ${user.heights[i].height_in_imperial_value} in`
        heightsVal.push(user.heights[i]);        
      }
      heights.value = heightsVal;
    }

    // console.log(`Response from /v1/user: ${JSON.stringify(user)}`);
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  }
}

function calculateWeightUnit(unit: any) {  
  if (unit === 'imperial') {
    // kg -> lbs
    console.log('calculate weight_imperial_value');
    weightDialogItem.value.weight_imperial_value = round(weightDialogItem.value.weight_metric_value * 2.20462, 1);
  } else {
    // lbs -> kg
    console.log('calculate weight_metric_value');
    weightDialogItem.value.weight_metric_value = round(weightDialogItem.value.weight_imperial_value * 0.453592, 1); 
  }  
  return;
}

function calculateHeightUnit(unit: any) {
  if (unit === 'imperial') {
    // cm -> ft in
    console.log(heightDialogItem.value.height_metric_value);

    const totalInches = heightDialogItem.value.height_metric_value / 2.54;
    heightDialogItem.value.height_ft_imperial_value = Math.floor(totalInches / 12);
    heightDialogItem.value.height_in_imperial_value = round(totalInches % 12, 0);
    heightDialogItem.value.height_imperial_value = `${heightDialogItem.value.height_ft_imperial_value} ft ${heightDialogItem.value.height_in_imperial_value} in`;
    console.log('calculate height_ft_imperial_value: ' + heightDialogItem.value.height_ft_imperial_value);
  } else {
    // ft in -> cm
    console.log('calculate height_metric_value');
    heightDialogItem.value.height_metric_value = Math.round((parseFloat(heightDialogItem.value.height_ft_imperial_value) * 12 + parseFloat(heightDialogItem.value.height_in_imperial_value)) * 2.54);
  }
  
  return;
}

//watch(() => [], refresh);
refresh();

watch(() => props.user, (newValue, oldValue) => {
  refresh();
});

</script>

<template>
  <v-form v-model="isWeightFormValid">
    <v-data-table class="no-border" :headers="weightHeaders" :items="weights" 
      :sort-by="[{ key: 'model', order: 'asc' }]" hide-default-footer hide-default-header>
      <template v-slot:top>
        <v-toolbar class="bg-lightsecondary" flat v-if="loadFromUserProfile">
          <v-toolbar-title>{{ t('common.weightMeasurements', 2) }}</v-toolbar-title>          
          <v-dialog v-model="weightDialog" max-width="500px">
            <template v-slot:activator="{ props }">
              <v-btn color="primary" variant="flat" dark v-bind="props" v-if="loadFromUserProfile">{{ t('actions.add') }}</v-btn>
            </template>
            <v-card>
              <v-card-title class="d-flex justify-space-between align-center bg-primary">
                <div class="text-h3">{{ t('common.weightMeasurements', 1) }}</div>               
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  @click="closeWeightDialog()">
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-container class="px-0">
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-text-field
                      :label="t('common.id')"
                      hide-details="auto"
                      v-model="weightDialogItem.id"
                      readonly
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <DatePicker hide-details="auto" v-model="weightDialogItem.date" :rules="[rules().required]" :label="t('feraBiometricsComponent.measureDate')"/>
                    </v-col>
                  </v-row>
                  <v-row align="center">
                    <v-col cols="12" sm="3">
                      <v-text-field
                      v-if="weightDialogItem.unit === 'metric'"
                      :label="'(kg)'"
                      hide-details="auto"
                      v-model="weightDialogItem.weight_metric_value"
                      type="number"
                      :rules="[rules().required]"
                      ></v-text-field>
                      <v-text-field
                      v-if="weightDialogItem.unit === 'imperial'"
                      :label="'(lbs)'"
                      hide-details="auto"
                      v-model="weightDialogItem.weight_imperial_value"
                      type="number"
                      :rules="[rules().required]"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-radio-group inline hide-details="auto" v-model="weightDialogItem.unit" :rules=[rules().required] v-on:change="calculateWeightUnit(weightDialogItem.value.unit)">
                        <v-radio :label="t('common.metric')" color="primary" value="metric"></v-radio>
                        <v-radio :label="t('common.imperial')" color="primary" value="imperial"></v-radio>                  
                      </v-radio-group>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-text-field
                      :label="t('common.videoUrl')"
                      hide-details="auto"
                      v-model="weightDialogItem.video_url"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="tonal" color="error" @click="closeWeightDialog()">{{ t('actions.cancel') }}</v-btn>
                <v-btn variant="flat" color="primary" @click="saveWeightDialog()" :disabled="!isWeightFormValid || loading">{{ t('actions.save') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="deleteWeightDialog" max-width="600px">
            <v-card>
              <v-card-title class="text-h5 text-center py-6">
                {{ t('dialogs.areYouSure',
                  [`${weightDialogItem.weight_metric_value} kg`])
                }}</v-card-title>                              
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="tonal" color="error" @click="closeDeleteWeightDialog">{{ t('actions.cancel') }}</v-btn>
                <v-btn variant="flat" color="primary" @click="confirmDeleteWeightDialog(weightDialogItem.id)">{{ t('actions.ok') }}</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>                      
      </template>
      <template v-slot:item.created="{ value }">
        {{ value.split('T')[0] }}
      </template>
      <template v-slot:item.weight_metric_value="{ value }">
        {{ value }} kg
      </template>
      <template v-slot:item.weight_imperial_value="{ value }">
        {{ value }} lbs
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex align-center">
          <v-tooltip :text="t('actions.edit')">
            <template v-slot:activator="{ props }">
              <v-btn icon flat @click="editWeight(item)" v-bind="props">
                <PencilIcon stroke-width="1.5" size="20" class="text-primary"/>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip :text="t('actions.delete')">
            <template v-slot:activator="{ props }">
              <v-btn icon flat @click="deleteWeight(item)" v-bind="props">
                <TrashIcon stroke-width="1.5" size="20" class="text-error"/>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>
      <template v-slot:item.validation="{ value }">
        <v-chip
          class="ma-2"
          color="green"
          prepend-icon="mdi-checkbox-marked-circle"
          label
        >FERA 2025-05-17
        </v-chip>
      </template>
    </v-data-table>
  </v-form><br><br>
  <v-form v-model="isHeightFormValid">
    <v-data-table class="no-border" :headers="heightHeaders" :items="heights"
      :sort-by="[{ key: 'model', order: 'asc' }]" hide-default-footer hide-default-header>
      <template v-slot:top>
        <v-toolbar class="bg-lightsecondary" flat v-if="loadFromUserProfile">
          <v-toolbar-title>{{ t('common.heightMeasurements', 2) }}</v-toolbar-title>          
          <v-dialog v-model="heightDialog" max-width="500px">
            <template v-slot:activator="{ props }">
              <v-btn color="primary" variant="flat" dark v-bind="props" v-if="loadFromUserProfile">{{ t('actions.add') }}</v-btn>
            </template>
            <v-card>
              <v-card-title class="d-flex justify-space-between align-center bg-primary">
                <div class="text-h3">{{ t('common.heightMeasurements', 1) }}</div>               
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  @click="closeHeightDialog()">
                </v-btn>
              </v-card-title>
              <v-card-text>                              
                <v-container class="px-0">
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-text-field
                      :label="t('common.id')"
                      hide-details="auto"
                      v-model="heightDialogItem.id"
                      readonly
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <DatePicker hide-details="auto" v-model="heightDialogItem.date" :rules="[rules().required]" :label="t('feraBiometricsComponent.measureDate')"/>
                    </v-col>
                  </v-row>
                  <v-row align="center" v-if="heightDialogItem.unit === 'metric'">
                    <v-col cols="12" sm="3">
                      <v-text-field
                      :label="'(cm)'"
                      hide-details="auto"
                      v-model="heightDialogItem.height_metric_value"
                      :rules="[rules().required]"
                      ></v-text-field>                      
                    </v-col>
                  </v-row>
                  <v-row align="center" v-if="heightDialogItem.unit === 'imperial'">
                    <v-col cols="12" sm="3">
                      <v-text-field
                      :label="'(ft)'"
                      hide-details="auto"
                      v-model="heightDialogItem.height_ft_imperial_value"
                      :rules="[rules().required]"
                      ></v-text-field>
                    </v-col>
                    <v-col align="center" cols="12" sm="3">
                      <v-text-field
                      :label="'(in)'"
                      hide-details="auto"
                      v-model="heightDialogItem.height_in_imperial_value"
                      :rules="[rules().required]"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-radio-group inline hide-details="auto" v-model="heightDialogItem.unit" :rules=[rules().required] v-on:change="calculateHeightUnit(weightDialogItem.value.unit)">
                        <v-radio :label="t('common.metric')" color="primary" value="metric"></v-radio>
                        <v-radio :label="t('common.imperial')" color="primary" value="imperial"></v-radio>                  
                      </v-radio-group>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-text-field
                      :label="t('common.videoUrl')"
                      hide-details="auto"
                      v-model="heightDialogItem.video_url"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" @click="closeHeightDialog()">{{ t('actions.cancel') }}</v-btn>
                <v-btn color="secondary" variant="flat" dark @click="saveHeightDialog()" :disabled="!isHeightFormValid || loading">{{ t('actions.save') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="deleteHeightDialog" max-width="600px">
            <v-card>
              <v-card-title class="text-h5 text-center py-6">
                {{ t('dialogs.areYouSure',
                  [`${heightDialogItem.height_metric_value} cm`])
                }}</v-card-title>                              
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" @click="closeDeleteHeightDialog">{{ t('actions.cancel') }}</v-btn>
                <v-btn color="success" variant="flat" dark @click="confirmDeleteHeightDialog(heightDialogItem.id)">{{ t('actions.ok') }}</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.height_metric_value="{ value }">
        {{ value }} cm
      </template>
      <template v-slot:item.created="{ value }">
        {{ value.split('T')[0] }}
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex align-center">
          <v-tooltip :text="t('actions.edit')">
            <template v-slot:activator="{ props }">
              <v-btn icon flat @click="editHeight(item)" v-bind="props">
                <PencilIcon stroke-width="1.5" size="20" class="text-primary"/>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip :text="t('actions.delete')">
            <template v-slot:activator="{ props }">
              <v-btn icon flat @click="deleteHeight(item)" v-bind="props">
                <TrashIcon stroke-width="1.5" size="20" class="text-error"/>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>
      <template v-slot:item.validation="{ value }">
        <v-chip
          class="ma-2"
          color="green"
          prepend-icon="mdi-checkbox-marked-circle"
          label
        >FERA 2025-05-17
        </v-chip>
      </template>
    </v-data-table>
  </v-form>
</template>

<style lang="scss">/*
.v-table .no-border .v-table__wrapper > table > tbody > tr:not(:last-child) > td,
.v-table .no-border .v-table__wrapper > table > tbody > tr:not(:last-child) > th,
.v-table .no-border .v-table__wrapper > table > thead > tr:last-child > th {
  border: 0
}*/
</style>