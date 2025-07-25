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
  visible: any,
}>();

const emit = defineEmits(['update:dialog', 'handledialog'])
const dialog = computed({
  // getter
  get() {
    return props.visible;
  },
  // setter
  set(value) {    
    emit('update:dialog', value)    
  }
});

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

const rules = ref({
  required: (value: any) => !!value || t('validations.required'),
  email: (value: any) => {
      const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(value) || t('validations.invalidEmail');
    },
});

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
    errorAlert.value = `Oupss, une erreur est survenue...Detail: sendEmailLink ${err}`;
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
  <v-dialog v-model="dialog" max-width="700">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center bg-primary">
        <div class="text-h3">
          {{ user.first_name }} {{ user.last_name }}
        </div>
        <v-btn            
          icon="mdi-close"
          variant="text"
          @click="$emit('handledialog')">
        </v-btn>
      </v-card-title>      
      <v-form>   
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
      </v-form>
      <v-card-title>{{ t('profileComponent.photo') }}</v-card-title>
        <v-form>   
          <v-card-text >
            <v-row>
              <v-col cols="12" sm="6">
                <p v-if="!user.profile_url" class="text-error">{{ t('profileComponent.noPhoto') }}</p>
                <v-img v-if="user.profile_url" :src="user.profile_url"></v-img><br>
                <file-pond 
                ref="filePondRef"
                :label-idle="t('common.placeImageHere')" allow-multiple="false" max-files="1" accepted-file-types="image/jpeg, image/png" allowImagePreview="false" @addfile="onAddFile" @removefile="onRemoveFile"/>
                <div v-if="cropperSrc">
                  <cropper
                  ref="cropperRef"              
                  class="cropper"
                  :src="cropperSrc"
                  @change="onChange"
                  :debounce="false"
                  :stencil-props="{
                    previewClass: 'preview'
                  }"
                  :stencil-component="CircleStencil"
                ></cropper><br>
                  <v-btn color="primary" @click="zoomIn()" size="x-small">+</v-btn>&nbsp;&nbsp;&nbsp;
                  <v-btn color="primary" @click="zoomOut()" size="x-small">-</v-btn>
                </div>
                </v-col> 
            </v-row> 
          </v-card-text>
        </v-form>
        <v-divider class="mx-4 mb-1"></v-divider>
        <v-card-title>{{ t('common.personal') }}</v-card-title>
      <v-form>   
        <v-card-text>
          <v-row>   
          </v-row>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field variant="outlined" hide-details v-model="user.first_name" :label="t('common.firstName')" :disabled="true"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field variant="outlined" hide-details v-model="user.last_name" :label="t('common.lastName')" :disabled="true"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field variant="outlined" hide-details v-model="user.email" :label="t('common.email')"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" v-if="user.groups.includes('swat_2024_2025')">
              <v-autocomplete
                v-model="user.region"
                :label="t('common.region')"
                :items="useRegionStore().regions"
                :item-title="'text'"
                :item-value="'value'"
                variant="outlined"
                :rules="[rules.required]"
            ></v-autocomplete>
            </v-col>
            <v-col cols="12" sm="6" v-if="user.groups.includes('swat_2024_2025')">
              <v-autocomplete            
                v-model="user.irl_team"
                :label="t('common.irlTeam')"
                :items="useClubStore().clubs"
                :item-title="'text'"
                :item-value="'value'"
                variant="outlined"
              ></v-autocomplete>    
            </v-col>
          </v-row> 
        </v-card-text>
        <v-divider class="mx-4 mb-1"></v-divider>
        <v-card-title>{{ t('common.platforms') }}</v-card-title>
        <v-form>   
          <v-card-text>
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
          </v-card-text>
        </v-form>
        <v-card-title>{{ t('common.teams') }}</v-card-title>
        <v-form>   
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">                
                <v-autocomplete            
                v-model="user.primary_team_id"
                :label="t('userProfile.primaryTeam')"
                :items="useTeamStore().myTeams"
                :item-title="'display_name'"
                :item-value="'id'"
                variant="outlined"
            ></v-autocomplete>
              </v-col>
            </v-row> 
          </v-card-text>
        </v-form>
        <v-divider class="mx-4 mb-1"></v-divider>        
        <v-card-title>{{ t('profileComponent.socialMedia') }}</v-card-title>
        <v-form>   
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field variant="outlined" hide-details v-model="user.twitch_username" :label="t('userProfile.twitch')"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field variant="outlined" hide-details v-model="user.x_username" :label="t('userProfile.x')"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field variant="outlined" hide-details v-model="user.youtube_username" :label="t('userProfile.youtube')"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field variant="outlined" hide-details v-model="user.fb_username" :label="t('userProfile.fb')"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field variant="outlined" hide-details v-model="user.ig_username" :label="t('userProfile.ig')"></v-text-field>
              </v-col>
            </v-row> 
          </v-card-text>
        </v-form>
        <v-card-actions>
          <v-btn variant="tonal" color="error" @click="$emit('handledialog')">{{ t('actions.cancel') }}</v-btn>
          <v-btn variant="flat" color="primary" @click="onSave()">{{ t('actions.save') }}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
