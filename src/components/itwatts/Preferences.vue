<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch, onBeforeUpdate } from 'vue';
import vueFilePond from 'vue-filepond';
import { setOptions }  from 'vue-filepond';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';
// Import image preview plugin styles
//import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
//const FilePond = vueFilePond(FilePondPluginImagePreview);
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

const FilePond = vueFilePond(FilePondPluginFileEncode,
  FilePondPluginFileValidateSize, FilePondPluginImageResize, FilePondPluginImageTransform, FilePondPluginFileValidateType);

import { Cropper, Preview, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { useTrainerStore } from '@/stores/apps/trainers';
import { useClubStore } from '@/stores/apps/clubs';
import { usePowerSourceStore } from '@/stores/apps/power-sources';
import { useRegionStore } from '@/stores/apps/regions';

import config from '@/config/config.json';
import { useUserProfile } from '@/stores/user-profile';
import { useTeamStore } from '@/stores/apps/teams';

const { t } = useI18n({ useScope: 'global' });

const props = defineProps<{
  user: any,
}>();

const emit = defineEmits(['update:dialog', 'handledialog'])

const loading = ref();
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();

const cropperRef = ref();
const imageZoomSize = ref();
const filePondRef = ref();
let cropperSrc = ref();

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

function onChange({coordinates, image2, canvas }) {
  //console.log(`onChange: ${JSON.stringify(canvas.toDataURL())}`);
  //cropper2.value = canvas.toDataURL();
  //image.value = canvas.toDataURL();
  //image.value = canvas.toDataURL();
  //coordinates.value = coordinates2;
}

function zoomIn() {
  cropperRef.value.zoom(1.1);
}

function zoomOut() {
  cropperRef.value.zoom(0.9);
}

function onRemoveFile() {
  cropperSrc.value = '';
}

function onImageZoomChanged() {
  cropperRef.value.zoom(imageZoomSize.value);
}

function onAddFile(error, file) {
  if (filePondRef.value.getFiles().length > 0) {
    loading.value = true;
    cropperSrc.value = filePondRef.value.getFiles()[0].getFileEncodeDataURL();
    loading.value = false;
  }  
  //cropper2.value = file.source;
  //cropper2.value = 'https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80';
  //console.log(test);
}

async function refresh() {
  //console.log(props.user.profile_url);
  cropperSrc.value = '';
  infoAlert.value = '';
  errorAlert.value = '';
  warningAlert.value = '';

  useTrainerStore().fetchTrainers();
  useClubStore().fetchClubs();
  usePowerSourceStore().fetchPowerSources();
  useRegionStore().fetchRegions();
  useRegionStore().fetchRegions();
  useTeamStore().fetchMyTeams();
}

async function onSave() {
  loading.value = true;
  
  try {
    const response = await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
    {
      email: props.user.email,
      irl_team: props.user.irl_team,
      twitch_username: props.user.twitch_username,
      x_username: props.user.x_username,
      youtube_username: props.user.youtube_username,
      fb_username: props.user.fb_username,
      ig_username: props.user.ig_username,
      primary_team_id: props.user.primary_team_id,
      mywhoosh_id: props.user.mywhoosh_id,
      region: props.user.region,
    }, {
      withCredentials: true,
    });

    if (cropperRef.value && filePondRef.value.getFiles().length > 0) {
      cropperRef.value.getResult().canvas.toBlob(async blob => {
        try {
          const response = await axios.put(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/images/profile`,
          {
            file: blob,
          }, 
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
              withCredentials: true,
          });
          location.reload();
        } catch (err: any) {
          errorAlert.value = t('errors.errorOccured', [err]);
          console.log(`Error: ${err} stack: ${err.stack}`);
        } finally {
          loading.value = false;
        }
			}, filePondRef.value.getFiles()[0].fileType);      
    } else {
      emit('handledialog');
      location.reload();
    } 
  } catch (err: any) {
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`Error: ${err} stack: ${err.stack}`);
  } finally {
    loading.value = false;
  }
}

watch(() => [], refresh);
refresh();

function sendEmailValidation() {
  infoAlert.value = `Un courriel vous a été envoyé à l'instant, veuillez cliquer sur le lien envoyé afin de valider votre courriel.`;
}
async function sendEmailLink() {
  infoAlert.value = '';
  errorAlert.value = '';
  try {
    axios.post(`${config.serverApi.publicHostname}/v1/users/${props.user.id}/sendEmailValidation`,
    {      
    },
    {
      withCredentials: true
    });
    infoAlert.value = `Un courriel vous a été envoyé à l'instant, veuillez cliquer sur le lien envoyé afin de valider votre courriel.`;
  } catch (err: any) {
    console.log(`Error while send email validation. ${err} stack: ${err.stack}`);
    errorAlert.value = t('errors.errorOccured', [err]);
  }
}

</script>
<style lang="scss">
  .preview {
	border: dashed 5px #E31C79;
}
.line {
	border-style: dashed;
	border-color: red;
}
</style>

<template>
  <v-form>  
    <v-card>    
      <v-card-title>
        <v-row>
          <v-col>
            <v-progress-linear
              v-if="loading"
              indeterminate
              stream
              color="primary"            
            ></v-progress-linear>
                <v-alert
                style="white-space: pre-line;"
                density="compact"
                type="info"
                title="Succès"
                :text="infoAlert"
                v-if="infoAlert"
              ></v-alert>
                <v-alert
                  style="white-space: pre-line;"
                  density="compact"
                  type="error"
                  title="Erreur"
                  :text="errorAlert"
                  v-if="errorAlert"
                ></v-alert>
                <v-alert
                  style="white-space: pre-line;"
                  density="compact"
                  type="warning"
                  title="Attention"
                  :text="warningAlert"
                  v-if="warningAlert"
              ></v-alert>
          </v-col>   
        </v-row> 
      </v-card-title>
      <v-row class="ma-sm-n2 ma-n1">
        <v-col cols="12" sm="6">
          <v-card elevation="10">
            <v-card-item>
              <h5 class="text-h5">{{ t('common.platforms') }}</h5>
                        <v-row>
            <v-col cols="12" sm="6">
              <v-text-field variant="outlined" hide-details v-model="user.zp_id" label="Zwift Power ID" disabled></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field variant="outlined" hide-details v-model="user.mywhoosh_id" label="MyWhoosh ID"></v-text-field>
            </v-col>
          </v-row> 

            </v-card-item>
            </v-card>
        </v-col>   
      </v-row>       
         
    </v-card>
  </v-form>
</template>
