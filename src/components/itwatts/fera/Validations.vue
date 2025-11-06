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
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { uuid } from 'vue-uuid';
import config from "@/config/config.json";

// Import FilePond styles
import 'filepond/dist/filepond.min.css';
import { Cropper, Preview, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { useUserProfile } from '@/stores/user-profile';
import DatePicker from '@/components/forms/form-elements/datetime/DatePicker.vue';

const emit = defineEmits(['onSuccess', 'onError', 'onLoading']);
const { t, locale } = useI18n({ useScope: 'global' });
const router = useRouter();

const props = defineProps({
  user: Object,
  loadFromUserProfile: Boolean,
});

const filePondTrainerRef = ref();
const cropperTrainerRef = ref();
const validationDialog = ref(false);
const validationDialogItem = ref();
const deleteValidationDialog = ref();
const validations = ref([]);
const loading = ref(false);
const isValidationFormValid = ref();
const validationGroups = ref(['5.W.4.T']);

const validationsHeaders = ref([
  { title: t('common.date'), key: 'power_test_date', sortable: true, align: 'start' },
  { title: t('common.name'), key: 'name', sortable: false },
  { title: t('common.trainerModel'), key: 'trainer_model', sortable: false },
  { title: t('common.powerSourceModel'), key: 'power_source_model', sortable: false },
  { title: t('actions.actions'), key: 'actions', sortable: false },
]);

const rules = ref({
  required: (value: any) => !!value || t('validations.required'),
  email: (value: any) => {
      const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(value) || t('validations.invalidEmail');
    },
});

const FilePond = vueFilePond(FilePondPluginFileEncode, FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize);

const now = new Date();
const defaultValidation = {
  id: uuid.v4(),
  name: '',
  power_test_date: '',
  dual_recording: '',  
  trainer_model: '',
  trainer_model_other: '',
  power_source_model: '',
  power_source_model_other: '',
  serial_number: '',
  trainer_firmware: '',
  power_source_firmware: '',
  imagePath: '',
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

async function onRemoveTrainerFile() {
  validationDialogItem.value.equipement_photo = '';  
}

async function onDeletePowerTestFile() {
  try {
    const profilePhoto = await axios.delete<any>(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/images/equipement_${trainerDialogItem.value.id}`,
    {
      withCredentials: true
    });
    validationDialogItem.value.equipement_photo = '';
  }  catch (err: any) {
    emit('onError', t('errors.errorOccured', [err]));
    console.log(`Error: ${err} stack: ${err.stack}`);
  }
}

applyDefaultValidation();

function applyDefaultValidation() {
  setTimeout(() => {
    defaultValidation.id = uuid.v4();
    // console.log('Default: ' + JSON.stringify(defaultValidation));
    validationDialogItem.value = Object.assign({}, defaultValidation);
  });
}

function closeValidationDialog() {
  validationDialog.value = false;
  applyDefaultValidation();
}

async function editValidation(item: any) {
  validationDialogItem.value = Object.assign({}, 
    validations.value.find((validation: any) => validation.id === item.id)
  );

  validationDialogItem.value.equipement_photo = '';
  try {
    const profilePhoto = await axios.get<any>(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/images/equipement_${powerTestDialogItem.value.id}`,
    {
      withCredentials: true
    });
    validationDialogItem.value.equipement_photo = profilePhoto.data.file_name_path;
  }  catch (err: any) {
    // noop
  } finally {
    validationDialog.value = true;
  }  
}

function deleteValidation(item: any) {
  validationDialogItem.value = Object.assign({}, item);
  deleteValidationDialog.value = true;
}

async function confirmDeleteValidationDialog(id: any) {  
  validations.value = validations.value.filter((validation: any) => validation.id !== id);
  deleteValidationDialog.value = false;
  applyDefaultValidation();
  await saveValidation();
}

function closeDeleteValidationDialog() {
  deleteValidationDialog.value = false;
  applyDefaultValidation();
}

async function saveValidationDialog() {
  /*if (cropperTrainerRef.value && filePondTrainerRef.value.getFiles().length > 0) {
    cropperTrainerRef.value.getResult().canvas.toBlob(async (blob: any) => {
      try {
        loading.value = true;
        emit('onLoading', true);
        const response = await axios.put(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/images/equipement_${trainerDialogItem.value.id}`,
        {
          file: blob,
        }, 
        {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
            withCredentials: true,
        });
        console.log(`trainers: ${JSON.stringify(response.data)}`);
        
        //trainerDialogItem.value.imagePath = 
        powerTests.value = powerTests.value.filter((powerTest) => (powerTest.id !== powerTestDialogItem.value.id));
        console.log(`powerTests: ${JSON.stringify(powerTests.value)}`);

        powerTests.value.push(powerTestDialogItem.value);
        console.log(`trainers apres: ${JSON.stringify(powerTests.value)}`);
        powerTestDialog.value = false;
  
        await savePowerTest();
      } catch (err: any) {
        emit('onError', t('errors.errorOccured', [err]));
        console.log(`Error: ${err} stack: ${err.stack}`);
      } finally {
        loading.value = false;
        emit('onLoading', false);
        applyDefaultPowerTest();
      }
  }, filePondTrainerRef.value.getFiles()[0].fileType);      
  } else {*/
    validations.value = validations.value.filter((validation) => (validation.id !== validationDialogItem.value.id));
    console.log(`validations: ${JSON.stringify(validations.value)}`);
    validations.value.push(validationDialogItem.value);
    console.log(`validations apres: ${JSON.stringify(validations.value)}`);
    validationDialog.value = false;
    await saveValidation();
    applyDefaultValidation();
  //}
}

async function saveValidation() {
  emit('onError', '');
  try {
    emit('onLoading', true);
    loading.value = true;
    
    console.log(`validations: ${JSON.stringify(validations.value)}`);
    const user = await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
    {
      validations: validations.value,
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

function onAddFitFiles(error: any, file: any) {
  if (filePondTrainerRef.value.getFiles().length > 0) {
    // noop
  }
}

function onChange({coordinates, image2, canvas }) {
  // noop
}

async function refresh() {
  try {
    validations.value = [];

    const user = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
    {
      withCredentials: true
    });
    if (user.data.validations) {
      validations.value = user.data.validations;
    }

    // console.log(`Response from /v1/user: ${JSON.stringify(user.data)}`);
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  }
}

watch(() => [], refresh);
refresh();

</script>

<template>
  <v-form v-model="isValidationFormValid">
    <v-data-table class="border rounded-md" :headers="validationsHeaders" :items="validations"
      :sort-by="[{ key: 'model', order: 'asc' }]" hide-default-footer>                    
      <template v-slot:top>
        <v-toolbar class="bg-lightsecondary" flat>
          <v-toolbar-title>{{ t('feraValidationsComponent.validation', 2) }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog v-model="validationDialog" max-width="500px">
            <template v-slot:activator="{ props }">
              <v-btn color="primary" variant="flat" dark v-bind="props">{{ t('actions.add') }}</v-btn>
            </template>
            <v-card>
              <v-card-title class="d-flex justify-space-between align-center bg-primary">
                <div class="text-h3">{{ t('feraValidationsComponent.validation', 1) }}</div>               
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  @click="closeValidationDialog()">
                </v-btn>
              </v-card-title>
              <v-card-text>
                <h6 class="text-h6">Information</h6>                   
                <v-container class="px-0">
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-text-field
                      color="primary"
                      variant="outlined"
                      hide-details="auto"
                      v-model="validationDialogItem.id"
                      disabled
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-select
                          :label="t('common.group')"
                          :items="[{text: '5.W.4.T', value: '5w4t'}]"
                          item-title="text"
                          item-value="value"
                          return-object
                          variant="outlined"
                          v-model="validationDialogItem.group"
                      ></v-select>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-select
                        :label="t('common.type')"
                        :items="[{text: 'Bronze', value: 'bronze'}, {text: 'Silver', value: 'silver'}, {text: 'Gold', value: 'gold'},
                          {text: 'Platinium', value: 'platinium'}, {text: 'Diamond', value: 'diamond'}
                        ]"
                        item-title="text"
                        item-value="value"
                        return-object
                        variant="outlined"
                        v-model="validationDialogItem.type"
                      ></v-select>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <DatePicker hide-details="auto" v-model="validationDialogItem.power_test_date" :rules="[rules.required]" :label="t('feraPowerTestsComponent.powerTestCreated')"/>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-autocomplete            
                        v-model="validationDialogItem.trainer_model"
                        :label="t('common.trainerModel')"
                        :items="useTrainerStore().trainers"
                        :item-title="'text'"
                        :item-value="'value'"
                        variant="outlined"
                        :rules="[rules.required]"
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="10">
                      <v-text-field
                        :label="t('common.whichOne')"
                        hide-details="auto"
                        v-model="validationDialogItem.trainer_model_other"
                        v-if="validationDialogItem.trainer_model === 'other'"
                        :rules="[(value: any) => !!value && validationDialogItem.trainer_model === 'other']"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-text-field
                        :label="t('common.trainerFirmwareVersion')"
                        hide-details="auto"
                        v-model="validationDialogItem.trainer_firmware"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">{{ t('feraPowerTestsComponent.didYouUseDualRecording') }}
                      <v-radio-group inline hide-details="auto" v-model="validationDialogItem.dual_recording" :rules=[rules.required]>
                        <v-radio :label="t('common.yes')" color="primary" value="yes"></v-radio>
                        <v-radio :label="t('common.no')" color="primary" value="no"></v-radio>                  
                      </v-radio-group>
                      <v-autocomplete            
                      v-model="validationDialogItem.power_source_model"
                      :label="t('common.powerSourceModel')"
                      :items="usePowerSourceStore().powerSources"
                      :item-title="'text'"
                      :item-value="'value'"
                      variant="outlined"
                      :rules="[rules.required]"
                      v-if="validationDialogItem.dual_recording === 'yes'"
                    ></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="10">
                      <v-text-field
                      :label="t('common.whichOne')"
                      hide-details="auto"
                      v-model="validationDialogItem.power_source_model_other"
                      v-if="validationDialogItem.power_source_model === 'other'"
                      :rules="[(value: any) => !!value && validationDialogItem.power_source_model === 'other']"
                      ></v-text-field>                      
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-text-field
                      :label="t('common.powerSourceFirmwareVersion')"
                      hide-details="auto"
                      v-model="validationDialogItem.power_source_firmware"
                      v-if="validationDialogItem.dual_recording === 'yes'"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10" v-if="validationDialogItem.equipement_photo">                                    
                      <v-img :src="validationDialogItem.equipement_photo"></v-img><br>
                      <v-btn color="secondary" @click="onDeletePowerTestFile()">Remove image</v-btn>                                    
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">                                    
                      <file-pond 
                        ref="filePondTrainerRef"
                        :label-idle="t('common.placeFitFileHere')" allow-multiple="false" max-files="2" allowImagePreview="false" @addfile="onAddFitFiles" @removefile="onRemoveTrainerFile"/>                        
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-text>
                <h6 class="text-h6">Data</h6>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="tonal" color="error" @click="closeValidationDialog()">{{ t('actions.cancel') }}</v-btn>
                <v-btn variant="flat" color="primary" @click="saveValidationDialog()" :disabled="!isValidationFormValid || loading">{{ t('actions.save') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="deleteValidationDialog" max-width="600px">
            <v-card>
              <v-card-title class="text-h5 text-center py-6">
                {{ t('dialogs.areYouSure',
                  [validationDialogItem.name])
                }}</v-card-title>                              
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="tonal" color="error" @click="closeDeleteValidationDialog">{{ t('actions.cancel') }}</v-btn>
                <v-btn variant="flat" color="primary" @click="confirmDeleteValidationDialog(validationDialogItem.id)">{{ t('actions.ok') }}</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>                      
      </template>
      <template v-slot:item.created="{ value }">
        {{ value.split('T')[0] }}
      </template>                    
      <template v-slot:item.primary="{ value }">
        <v-checkbox hide-details color="primary" disabled :model-value="value">                                      
        </v-checkbox>
      </template>
      <template v-slot:item.trainer_model="{ value }">
        {{ value ? useTrainerStore().trainers.find((trainer) => trainer.value === value).text : ''}}
      </template>
      <template v-slot:item.power_source_model="{ value }">
        {{ value ? usePowerSourceStore().powerSources.find((powerMeter: any) => powerMeter.value === value).text : ''}}
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex align-center">
          <v-tooltip :text="t('actions.edit')">
            <template v-slot:activator="{ props }">
              <v-btn icon flat @click="editValidation(item)" v-bind="props">
                <PencilIcon stroke-width="1.5" size="20" class="text-primary"/>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip :text="t('actions.delete')">
            <template v-slot:activator="{ props }">
              <v-btn icon flat @click="deleteValidation(item)" v-bind="props">
                <TrashIcon stroke-width="1.5" size="20" class="text-error"/>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>
    </v-data-table>
  </v-form>
</template>