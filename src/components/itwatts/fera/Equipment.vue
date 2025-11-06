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
import { rules } from '@/utils/rules';

const emit = defineEmits(['onSuccess', 'onError', 'onLoading']);
const { t, locale } = useI18n({ useScope: 'global' });

const props = defineProps({
  user: Object,
  loadFromUserProfile: Boolean,
});

const router = useRouter();

const filePondTrainerRef = ref();
const filePondPowerMeterRef = ref();
let cropperTrainerSrc = ref();
let cropperPowerMeterSrc = ref();
const cropperTrainerRef = ref();
const cropperPowerMeterRef = ref();
const trainerDialog = ref(false);
const trainerDialogItem = ref();
const deleteTrainerDialog = ref();
const powerMeterDialog = ref(false);
const powerMeterDialogItem = ref();
const deletePowerMeterDialog = ref();

const trainers = ref([]);
const powerMeters = ref([]);
const loading = ref(false);
const isTrainerFormValid = ref();

const trainerHeaders = ref([
  { title: t('common.model'), key: 'model', sortable: true, align: 'start' },
  { title: t('common.primary'), key: 'primary', sortable: false, align: `${props.loadFromUserProfile ? '' : ' d-none'}` },
  { title: t('common.serialNumber'), key: 'serial_number', sortable: false, align: `${props.loadFromUserProfile ? '' : ' d-none'}` },
  { title: t('common.firmware'), key: 'firmware', sortable: false, align: `${props.loadFromUserProfile ? '' : ' d-none'}` },
  { title: t('common.validation'), key: 'validation', align: 'center', sortable: true },
  { title: t('actions.actions'), key: 'actions', sortable: false, align: `${props.loadFromUserProfile ? '' : ' d-none'}` },
]);

const powerMetersHeaders = ref([
  { title: t('common.model'), key: 'model', sortable: true, align: 'start' },
  { title: t('common.dualRecording'), key: 'dual_recording', sortable: false, align: `${props.loadFromUserProfile ? '' : ' d-none'}` },
  { title: t('common.serialNumber'), key: 'serial_number', sortable: false, align: `${props.loadFromUserProfile ? '' : ' d-none'}` },
  { title: t('common.firmware'), key: 'firmware', sortable: false, align: `${props.loadFromUserProfile ? '' : ' d-none'}` },
  { title: t('common.validation'), key: 'validation', align: 'center', sortable: true },
  { title: t('actions.actions'), key: 'actions', sortable: false, align: `${props.loadFromUserProfile ? '' : ' d-none'}` },
]);

const FilePond = vueFilePond(FilePondPluginFileEncode, FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize, FilePondPluginImageResize, FilePondPluginImageTransform);

const now = new Date();
const defaultTrainer = {
  id: uuid.v4(),
  model: '',
  model_other: '',
  primary: false,
  serial_number: '',
  firmware: '',
  imagePath: '',
  created: now.toISOString(),
  last_modified: now.toISOString(),
  equipment_photo: null,
}

const defaultPowerMeter = {
  id: uuid.v4(),
  model: '',
  model_other: '',
  serial_number: '',
  dual_recording: true,
  firmware: '',
  imagePath: '',
  created: now.toISOString(),
  last_modified: now.toISOString(),
  equipment_photo: null,
}


setOptions(
  {
    allowFileSizeValidation: true,
    maxFileSize: '20MB',
    allowImageResize: true,
    imageResizeUpscale: false,
    imageResizeTargetWidth: 2000,
    imageResizeTargetHeight: 2000,
  }
);

async function onRemoveTrainerFile() {
  trainerDialogItem.value.equipement_photo = '';
  cropperTrainerSrc.value = '';
}

async function onDeleteTrainerFile() {
  try {
    const profilePhoto = await axios.delete<any>(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/images/equipement_${trainerDialogItem.value.id}`,
    {
      withCredentials: true
    });
    trainerDialogItem.value.equipement_photo = '';
    cropperTrainerSrc.value = '';
  }  catch (err: any) {
    emit('onError', t('errors.errorOccured', [err]));
    console.log(`Error: ${err} stack: ${err.stack}`);
  }
}

async function onRemovePowerMeterFile() {
  powerMeterDialogItem.value.equipement_photo = '';
  cropperPowerMeterSrc.value = '';
}
async function onDeletePowerMeterFile() {
  try {
    const profilePhoto = await axios.delete<any>(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/images/power_meter_${powerMeterDialogItem.value.id}`,
    {
      withCredentials: true
    });
    powerMeterDialogItem.value.equipement_photo = '';
    cropperPowerMeterSrc.value = '';
  }  catch (err: any) {
    emit('onError', t('errors.errorOccured', [err]));
    console.log(`Error: ${err} stack: ${err.stack}`);
  }
}

applyDefaultTrainer();
applyDefaultPowerMeter();

function applyDefaultTrainer() {
  setTimeout(() => {
    defaultTrainer.id = uuid.v4();
    trainerDialogItem.value = Object.assign({}, defaultTrainer);
    cropperTrainerSrc.value = '';
  });
}

function applyDefaultPowerMeter() {
  setTimeout(() => {
    defaultPowerMeter.id = uuid.v4();
    powerMeterDialogItem.value = Object.assign({}, defaultPowerMeter);
    cropperPowerMeterSrc.value = '';
  });
}

function closeTrainerDialog() {
  trainerDialog.value = false;
  applyDefaultTrainer();
}

function closePowerMeterDialog() {
  powerMeterDialog.value = false;
  applyDefaultPowerMeter();
}

async function editTrainer(item: any) {
  trainerDialogItem.value = Object.assign({}, 
    trainers.value.find((trainer: any) => trainer.id === item.id)
  );

  trainerDialogItem.value.equipement_photo = '';
  try {
    const profilePhoto = await axios.get<any>(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/images/equipement_${trainerDialogItem.value.id}`,
    {
      withCredentials: true
    });
    trainerDialogItem.value.equipement_photo = profilePhoto.data.file_name_path;
  }  catch (err: any) {
    // noop
  } finally {
    trainerDialog.value = true;
  }  
}

async function editPowerMeter(item: any) {
  powerMeterDialogItem.value = Object.assign({}, 
    powerMeters.value.find((powerMeter: any) => powerMeter.id === item.id)
  );
  powerMeterDialogItem.value.equipement_photo = '';
  try {
    const profilePhoto = await axios.get<any>(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/images/power_meter_${powerMeterDialogItem.value.id}`,
    {
      withCredentials: true
    });
    powerMeterDialogItem.value.equipement_photo = profilePhoto.data.file_name_path;
  }  catch (err: any) {
    // noop
  } finally {
    powerMeterDialog.value = true;
  }  
}

function deleteTrainer(item: any) {
  trainerDialogItem.value = Object.assign({}, item);
  deleteTrainerDialog.value = true;
}

function deletePowerMeter(item: any) {
  powerMeterDialogItem.value = Object.assign({}, item);
  deletePowerMeterDialog.value = true;
}

async function confirmDeleteTrainerDialog(id: any) {  
  trainers.value = trainers.value.filter((trainer: any) => trainer.id !== id);
  deleteTrainerDialog.value = false;
  applyDefaultTrainer();
  await saveEquipement();
}

async function confirmDeletePowerMeterDialog(id: any) {
  powerMeters.value = powerMeters.value.filter((powerMeter: any) => powerMeter.id !== id);
  deletePowerMeterDialog.value = false;
  applyDefaultPowerMeter();
  await saveEquipement();
}

function closeDeleteTrainerDialog() {
  deleteTrainerDialog.value = false;
  applyDefaultTrainer();
}

function closeDeletePowerMeterDialog() {
  deletePowerMeterDialog.value = false;
  applyDefaultPowerMeter();
}

function hasPrimaryTrainer() {
  for (let i = 0;i < trainers.value.length;i++) {
    if (trainers.value[i].primary && trainers.value[i].id !== trainerDialogItem.value.id) {
      return true;
    }
  }
  return false;
}

async function saveEquipementDialog() {
  if (cropperTrainerRef.value && filePondTrainerRef.value.getFiles().length > 0) {
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
        
        //trainerDialogItem.value.imagePath = 
        trainers.value = trainers.value.filter((trainer) => (trainer.id !== trainerDialogItem.value.id));
        trainers.value.push(trainerDialogItem.value);
        trainerDialog.value = false;
  
        await saveEquipement();
      } catch (err: any) {
        emit('onError', t('errors.errorOccured', [err]));
        console.log(`Error: ${err} stack: ${err.stack}`);
      } finally {
        loading.value = false;
        emit('onLoading', false);
        applyDefaultTrainer();
      }
  }, filePondTrainerRef.value.getFiles()[0].fileType);      
  } else {
    trainers.value = trainers.value.filter((trainer) => (trainer.id !== trainerDialogItem.value.id));
    trainers.value.push(trainerDialogItem.value);    
    trainerDialog.value = false;
    await saveEquipement();
    applyDefaultTrainer();
  }
}

async function savePowerMeterDialog() {
  if (cropperPowerMeterRef.value && filePondPowerMeterRef.value.getFiles().length > 0) {
    cropperPowerMeterRef.value.getResult().canvas.toBlob(async (blob: any) => {
      try {
        loading.value = true;
        emit('onLoading', true);
        const response = await axios.put(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/images/power_meter_${powerMeterDialogItem.value.id}`,
        {
          file: blob,
        }, 
        {
          headers: {
              'Content-Type': 'multipart/form-data',
          },
            withCredentials: true,
        });
        powerMeters.value = powerMeters.value.filter((powerMeter: any) => (powerMeter.id !== powerMeterDialogItem.value.id));
        powerMeters.value.push(powerMeterDialogItem.value);
        powerMeterDialog.value = false;
  
        await saveEquipement();
      } catch (err: any) {
        emit('onError', t('errors.errorOccured', [err]));
        console.log(`Error: ${err} stack: ${err.stack}`);
      } finally {
        loading.value = false;
        emit('onLoading', false);
        applyDefaultPowerMeter();
      }
  }, filePondPowerMeterRef.value.getFiles()[0].fileType);      
  } else {
    powerMeters.value = powerMeters.value.filter((powerMeter: any) => (powerMeter.id !== powerMeterDialogItem.value.id));
    powerMeters.value.push(powerMeterDialogItem.value);
    powerMeterDialog.value = false;
    await saveEquipement();
    applyDefaultPowerMeter();
  }  
}

async function saveEquipement() {
  emit('onError', '');
  try {
    emit('onLoading', true);
    loading.value = true;
    
    // console.log(`Trainers: ${JSON.stringify(trainers.value)}`);
    // console.log(`powerMeters: ${JSON.stringify(powerMeters.value)}`);
    const user = await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
    {
      trainers: trainers.value,
      power_meters: powerMeters.value
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

function onAddTrainerFile(error: any, file: any) {
  if (filePondTrainerRef.value.getFiles().length > 0) {
    loading.value = true;
    cropperTrainerSrc.value = filePondTrainerRef.value.getFiles()[0].getFileEncodeDataURL();
    loading.value = false;
  }
}

function onAddPowerMeterFile(error: any, file: any) {
  if (filePondPowerMeterRef.value.getFiles().length > 0) {
    loading.value = true;
    emit('onLoading', true);
    cropperPowerMeterSrc.value = filePondPowerMeterRef.value.getFiles()[0].getFileEncodeDataURL();
    loading.value = false;
    emit('onLoading', false);
  }
}

function onChange({coordinates, image2, canvas }) {
  // noop
}

async function refresh() {
  try {
    await useTrainerStore().fetchTrainers();
    await usePowerSourceStore().fetchPowerSources();
    trainers.value = [];
    powerMeters.value = [];

    let user = props.user;
    if (props.loadFromUserProfile) {
      user = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
      {
        withCredentials: true
      });
      user = user.data;
    }
    
    if (!user) {
      return;
    }

    if (user.trainers) {
      trainers.value = user.trainers;
    }

    if (user.power_meters) {      
      powerMeters.value = user.power_meters;
    }

    // console.log(`Response from /v1/user: ${JSON.stringify(user)}`);
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  }
}

//watch(() => [], refresh);
refresh();

watch(() => props.user, (newValue, oldValue) => {
  refresh();
});

</script>

<template>
  <v-form v-model="isTrainerFormValid">
  <v-data-table class="no-border" :headers="trainerHeaders" :items="trainers"
    :sort-by="[{ key: 'model', order: 'asc' }]" hide-default-footer :hide-default-header="!loadFromUserProfile">                    
    <template v-slot:top>
      <v-toolbar class="bg-lightsecondary" flat v-if="loadFromUserProfile">
        <v-toolbar-title>{{ t('feraRider.trainers') }}</v-toolbar-title>
        <v-dialog v-model="trainerDialog" max-width="500px">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" variant="flat" dark v-bind="props" v-if="loadFromUserProfile">{{ t('actions.add') }}</v-btn>
          </template>
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center bg-primary">
              <div class="text-h3">{{ t('feraRider.trainers') }}</div>               
              <v-btn
                icon="mdi-close"
                variant="text"
                @click="closeTrainerDialog()">
              </v-btn>
            </v-card-title>
            <v-card-text>                              
              <v-container class="px-0">
                <v-row>
                  <v-col cols="12" sm="9">
                    <v-text-field
                    :label="t('common.id')"
                    hide-details="auto"
                    v-model="trainerDialogItem.id"
                    readonly
                    ></v-text-field>
                  </v-col>
                </v-row>                                
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-autocomplete            
                    v-model="trainerDialogItem.model"
                    :label="t('common.model')"
                    :items="useTrainerStore().trainers"
                    :item-title="'text'"
                    :item-value="'value'"
                    variant="outlined"
                    :rules="[rules().required]"
                  ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                    :label="t('common.whichOne')"
                    hide-details="auto"
                    v-model="trainerDialogItem.model_other"
                    v-if="trainerDialogItem.model === 'other'"
                    :rules="[(value: any) => !!value && trainerDialogItem.model === 'other']"
                    ></v-text-field>
                    <v-checkbox v-model="trainerDialogItem.primary" hide-details color="primary"
                    :disabled="hasPrimaryTrainer()">
                      <template v-slot:label class="">{{ t('common.primary') }}</template>
                    </v-checkbox>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                    :label="t('common.serialNumber')"
                    hide-details="auto"
                    v-model="trainerDialogItem.serial_number"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                    :label="t('common.firmwareVersion')"
                    hide-details="auto"
                    v-model="trainerDialogItem.firmware"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="6" v-if="trainerDialogItem.equipement_photo">                                    
                    <v-img :src="trainerDialogItem.equipement_photo"></v-img><br>
                    <v-btn color="secondary" @click="onDeleteTrainerFile()">Remove image</v-btn>                                    
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="6">                                    
                    <file-pond 
                      ref="filePondTrainerRef"
                      :label-idle="t('common.placeImageHere')" allow-multiple="false" max-files="1" accepted-file-types="image/jpeg, image/png" allowImagePreview="false" @addfile="onAddTrainerFile" @removefile="onRemoveTrainerFile"/>
                      <div v-if="cropperTrainerSrc">
                    <cropper
                    ref="cropperTrainerRef"              
                    class="cropper"
                    :src="cropperTrainerSrc"
                    @change="onChange"
                    :debounce="false"
                    :stencil-props="{
                      previewClass: 'preview'
                    }"
                  ></cropper></div>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="tonal" color="error" @click="closeTrainerDialog()">{{ t('actions.cancel') }}</v-btn>
              <v-btn variant="flat" color="primary" @click="saveEquipementDialog()" :disabled="!isTrainerFormValid || loading">{{ t('actions.save') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="deleteTrainerDialog" max-width="600px">
          <v-card>
            <v-card-title class="text-h5 text-center py-6">
              {{ t('dialogs.areYouSure',
                [trainerDialogItem.model ? useTrainerStore().trainers.find((trainer) => trainer.value === trainerDialogItem.model).text : ''])
              }}</v-card-title>                              
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn variant="tonal" color="error" @click="closeDeleteTrainerDialog">{{ t('actions.cancel') }}</v-btn>
              <v-btn variant="flat" color="primary" @click="confirmDeleteTrainerDialog(trainerDialogItem.id)">{{ t('actions.ok') }}</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>                      
    </template>
    <template v-slot:item.model="{ value }">
      {{ value ? useTrainerStore().trainers.find((trainer) => trainer.value === value).text : ''}}
    </template>
    <template v-slot:item.created="{ value }">
      {{ value.split('T')[0] }}
    </template>                    
    <template v-slot:item.primary="{ value }">
      <v-checkbox hide-details color="primary" disabled :model-value="value">                                      
      </v-checkbox>
    </template>
    <template v-slot:item.actions="{ item }">
      <div class="d-flex align-center">
        <v-tooltip :text="t('actions.edit')">
          <template v-slot:activator="{ props }">
              <v-btn icon flat @click="editTrainer(item)" v-bind="props"
                  ><PencilIcon stroke-width="1.5" size="20" class="text-primary"
              /></v-btn>
          </template>
        </v-tooltip>
        <v-tooltip :text="t('actions.delete')">
          <template v-slot:activator="{ props }">
              <v-btn icon flat @click="deleteTrainer(item)" v-bind="props"
                  ><TrashIcon stroke-width="1.5" size="20" class="text-error"
              /></v-btn>
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
  <v-form v-model="isTrainerFormValid">
  <v-data-table class="no-border" :headers="powerMetersHeaders" :items="powerMeters"
    :sort-by="[{ key: 'model', order: 'asc' }]" hide-default-footer :hide-default-header="!loadFromUserProfile">                    
    <template v-slot:top>
      <v-toolbar class="bg-lightsecondary" flat v-if="loadFromUserProfile">
        <v-toolbar-title>{{ t('common.powerMeter', 2) }}</v-toolbar-title>        
        <v-dialog v-model="powerMeterDialog" max-width="500px">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" variant="flat" dark v-bind="props" v-if="loadFromUserProfile">{{ t('actions.add') }}</v-btn>
          </template>
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center bg-primary">
              <div class="text-h3">{{ t('common.powerMeter', 1) }}</div>
              <v-btn            
                icon="mdi-close"
                variant="text"
                @click="closePowerMeterDialog()">
              </v-btn>
            </v-card-title>
            <v-card-text>                              
              <v-container class="px-0">
                <v-row>
                  <v-col cols="12" sm="9">
                    <v-text-field
                    :label="t('common.id')"
                    hide-details="auto"
                    v-model="powerMeterDialogItem.id"
                    readonly
                    ></v-text-field>
                  </v-col>
                </v-row>                                
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-autocomplete            
                    v-model="powerMeterDialogItem.model"
                    :label="t('common.model')"
                    :items="usePowerSourceStore().powerSources"
                    :item-title="'text'"
                    :item-value="'value'"
                    variant="outlined"
                    :rules="[rules().required]"
                  ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                    :label="t('common.whichOne')"
                    hide-details="auto"
                    v-model="powerMeterDialogItem.model_other"
                    v-if="powerMeterDialogItem.model === 'other'"
                    :rules="[(value: any) => !!value && powerMeterDialogItem.model === 'other']"
                    ></v-text-field>                                    
                    <v-checkbox v-model="powerMeterDialogItem.dual_recording" hide-details color="primary">
                      <template v-slot:label class="">{{ t('common.dualRecording') }}</template>
                    </v-checkbox>                                  
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                    :label="t('common.serialNumber')"
                    hide-details="auto"
                    v-model="powerMeterDialogItem.serial_number"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                    :label="t('common.firmwareVersion')"
                    hide-details="auto"
                    v-model="powerMeterDialogItem.firmware"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="6" v-if="powerMeterDialogItem.equipement_photo">
                    <v-img :src="powerMeterDialogItem.equipement_photo"></v-img><br>
                    <v-btn color="secondary" @click="onDeletePowerMeterFile()">{{ t('common.removeImage') }}</v-btn>                                    
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="6"l>
                    <file-pond 
                      ref="filePondPowerMeterRef"
                      :label-idle="t('common.placeImageHere')" allow-multiple="false" max-files="1" accepted-file-types="image/jpeg, image/png" allowImagePreview="false" @addfile="onAddPowerMeterFile" @removefile="onRemovePowerMeterFile"/>                                    
                      <div v-if="cropperPowerMeterSrc">
                    <cropper
                    ref="cropperPowerMeterRef"              
                    class="cropper"
                    :src="cropperPowerMeterSrc"
                    @change="onChange"
                    :debounce="false"
                    :stencil-props="{
                      previewClass: 'preview'
                    }"
                  ></cropper></div>

                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" @click="closePowerMeterDialog()">{{ t('actions.cancel') }}</v-btn>
              <v-btn color="secondary" variant="flat" dark @click="savePowerMeterDialog()" :disabled="!isTrainerFormValid || loading">{{ t('actions.save') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="deletePowerMeterDialog" max-width="600px">
          <v-card>
            <v-card-title class="text-h5 text-center py-6">
              {{ t('dialogs.areYouSure',
                [powerMeterDialogItem.model ? usePowerSourceStore().powerSources.find((powerMeter: any) => powerMeter.value === powerMeterDialogItem.model).text : ''])
              }}</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" @click="closeDeletePowerMeterDialog">{{ t('actions.cancel') }}</v-btn>
              <v-btn color="success" variant="flat" dark @click="confirmDeletePowerMeterDialog(powerMeterDialogItem.id)">OK</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>                      
    </template>
    <template v-slot:item.model="{ value }">
      {{ value ? usePowerSourceStore().powerSources.find((powerMeter: any) => powerMeter.value === value).text : ''}}
    </template>
    <template v-slot:item.created="{ value }">
      {{ value.split('T')[0] }}
    </template>
    <template v-slot:item.dual_recording="{ value }">
      <v-checkbox hide-details color="primary" disabled :model-value="value">                                      
      </v-checkbox>
    </template>
    <template v-slot:item.actions="{ item }">
      <div class="d-flex align-center">
        <v-tooltip :text="t('actions.edit')">
          <template v-slot:activator="{ props }">
              <v-btn icon flat @click="editPowerMeter(item)" v-bind="props"
                  ><PencilIcon stroke-width="1.5" size="20" class="text-primary"
              /></v-btn>
          </template>
        </v-tooltip>
        <v-tooltip :text="t('actions.delete')">
          <template v-slot:activator="{ props }">
              <v-btn icon flat @click="deletePowerMeter(item)" v-bind="props"
                  ><TrashIcon stroke-width="1.5" size="20" class="text-error"
              /></v-btn>
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