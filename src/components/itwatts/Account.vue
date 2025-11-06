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
import { OpenStreetMapProvider } from 'leaflet-geosearch';

import config from '@/config/config.json';
import { useUserProfile } from '@/stores/user-profile';
import { useTeamStore } from '@/stores/apps/teams';
let debounceSearchLocationTimer : any = null;

import userM from '@/assets/images/profile/user-1.jpg';
import userF from '@/assets/images/profile/user-3.jpg';

const { t } = useI18n({ useScope: 'global' });

const props = defineProps<{
  user: any,
  onWindowChanged: any
}>();

const emit = defineEmits(['update:dialog', 'handledialog'])

const loading = ref();
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();
const searchAddress = ref();
const profileUrl = ref();
const searchAddressResults = ref([] as any);

const cropperRef = ref();
const imageZoomSize = ref();
const filePondRef = ref();
let cropperSrc = ref();
const emailCode = ref();
const verificationCodeVisibility = ref(false);

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

function onAddFile(error: any, file: any) {
  if (filePondRef.value.getFiles().length > 0) {
    loading.value = true;
    cropperSrc.value = filePondRef.value.getFiles()[0].getFileEncodeDataURL();
    loading.value = false;
  }
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

  // console.log('props user' + JSON.stringify(props.user));
  if (props.user.location && props.user.location.city) {
    searchAddress.value = {
      lat: props.user.location.lat,
      lng: props.user.location.lng,
      city: props.user.location.city,
      state: props.user.location.state,
      country: props.user.location.country,
      label: `${props.user.location.city}, ${props.user.location.state}`,
      searchDone: true,
    }
  }

  try {
    const profilePhoto = await axios.get(`${config.serverApi.publicHostname}/v1/users/${props.user.id}/images/profile`,
    {
      withCredentials: true
    });    
    profileUrl.value = profilePhoto.data.file_name_path;
    useUserProfile().profile_url = profileUrl.value;
  }  catch (err: any) {
    // noop
    profileUrl.value = props.user.gender === 'F' ? userF : userM;
  }
}

async function onSave() {
  loading.value = true;
  
  try {
    const body = {
      email: props.user.email,
      twitch_username: props.user.twitch_username,
      x_username: props.user.x_username,
      youtube_username: props.user.youtube_username,
      fb_username: props.user.fb_username,
      ig_username: props.user.ig_username,
      location: {},
    }
    if (searchAddress.value) {
      body.location = {
        lat: searchAddress.value.lat,
        lng: searchAddress.value.lng,
        city: searchAddress.value.city,
        state: searchAddress.value.state,
        country: searchAddress.value.country,
      }
    }

    const response = await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
      body, {
      withCredentials: true,
    });

    if (cropperRef.value && filePondRef.value.getFiles().length > 0) {
      cropperRef.value.getResult().canvas.toBlob(async (blob: any)  => {
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
      //location.reload();
    }
    infoAlert.value = t('dialogs.success');
  } catch (err: any) {
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`Error: ${err} stack: ${err.stack}`);
  } finally {
    loading.value = false;
  }
}

//watch(() => [], refresh);
//refresh();

watch(() => props.user, (newUser, oldUser) => {
    refresh();
  }
)

async function verifyEmailLink() {
  infoAlert.value = '';
  errorAlert.value = '';
  loading.value = true;

  try {
    await axios.post(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/validateEmail?code=${emailCode.value}`,
    {      
    },
    {
      withCredentials: true
    });
    props.user.email_validated_date = new Date();
  } catch (err: any) {
    if (err.response && err.response.status === 400) {
      errorAlert.value = t('errors.codeNotValid');
      return;
    }
    console.log(`Error while send email validation. ${err} ${err.stack}`);
    errorAlert.value = t('errors.errorOccured', [err]);
  } finally {
    loading.value = false;
  }
}

async function sendEmailLink() {
  infoAlert.value = '';
  errorAlert.value = '';
  try {
    axios.post(`${config.serverApi.publicHostname}/v1/users/${props.user.id}/sendEmailValidation?lang=${useUserProfile().lang}`,
    {      
    },
    {
      withCredentials: true
    });
    verificationCodeVisibility.value = true;
    infoAlert.value = t('accountSettings.emailSent');
  } catch (err: any) {
    console.log(`Error while send email validation. ${err} stack: ${err.stack}`);
    errorAlert.value = t('errors.errorOccured', [err]);
  }
}

function onSearchLocationChanged(location: any) {
  if (!searchAddress.value.searchDone) {
    const location = searchAddress.value;    
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=10&addressdetails=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.address) {
          let city = data.address.city || data.address.town || data.address.village || '';
          let state = data.address.state || '';
          let country = data.address.country || '';

          // console.log(`City: ${city}, State: ${state}, Country: ${country}`);
          searchAddress.value = 
            {
              lat: location.lat,
              lng: location.lng,
              city: city,
              state: state,
              country: country,
              label: `${city}, ${state}`,
              searchDone: true,
            }              
        }
      })
      .catch(err => console.error(err));
  }
}

async function searchLocation(location: any) {
  clearTimeout(debounceSearchLocationTimer);
  debounceSearchLocationTimer = setTimeout(async () => {
    if (!location) return;
    searchAddressResults.value = [];
    const results = await new OpenStreetMapProvider().search({ query: location });
    
    if (results.length > 0) {
      for (const result of results) {
        searchAddressResults.value.push(
          {
            lat: result.raw.lat,
            lng: result.raw.lon,
            label: `${result.raw.display_name}`,
            searchDone: false,
          }
        );         
      }
    }
  }, 500);
}

watch(() => props.onWindowChanged, (newValue, oldValue) => {
  infoAlert.value = '';
  infoAlert.value = '';
  warningAlert.value = '';
});

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
  <v-row>
    <v-col cols="12">
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="info"
        :text="infoAlert"
        v-if="infoAlert"
      ></v-alert>    
      <v-alert
        style="white-space: pre-line;"      
        density="compact"
        type="error"
        :text="errorAlert"
        v-if="errorAlert"
      ></v-alert>
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="warning"
        :text="warningAlert"
        v-if="warningAlert"
      ></v-alert>
      <v-progress-linear v-if="loading"
        indeterminate
        stream
        color="primary"
      ></v-progress-linear>
    </v-col>
  </v-row>  
  <v-card>    
    <v-row class="ma-sm-n2 ma-n1">
      <v-col cols="12" sm="6">
        <v-card elevation="10">
          <v-card-item>
            <h5 class="text-h5">{{ t('profileComponent.photo') }}</h5>
            <div class="text-subtitle-1 text-textPrimary opacity-80 mt-2">{{ t('accountSettings.changePicture') }}</div>            
            <v-img v-if="profileUrl" :src="profileUrl" class="mt-5"></v-img><br>            
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
          </v-card-item>
          </v-card>
      </v-col>
      <v-col cols="12" sm="6" v-if="false">
        <v-card elevation="10">
          <v-card-item>
            <h5 class="text-h5">Current Package</h5>              
          </v-card-item>
        </v-card>
      </v-col>  

    </v-row>       
    <v-row class="ma-sm-n2 ma-n1">
      <v-col cols="12">
        <v-card elevation="10">
          <v-card-item>
            <h5 class="text-h5">{{ t('common.personal') }}</h5>
            <div class="mt-5">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field variant="outlined" hide-details v-model="user.first_name" :label="t('common.firstName')" :disabled="true"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field variant="outlined" hide-details v-model="user.last_name" :label="t('common.lastName')" :disabled="true"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field variant="outlined" hide-details v-model="user.email" :label="t('common.email')"></v-text-field>
                  
                  <div v-if="props.user.email_validated_date" class="text-14 d-flex align-center font-weight-medium mt-2">
                    <CircleCheckIcon stroke-width="1.5" size="20" class="mr-2 text-secondary " />{{ t('accountSettings.verifiedEmail') }}
                  </div>
                  <p v-if="!props.user.email_validated_date">
                    <br /><b>
                    <i18n-t keypath="accountSettings.emailNotValidated" tag="p" scope="global">
                      <a href="#" @click="sendEmailLink()" :disabled="loading">{{ t('accountSettings.sendMeACode') }}</a>
                    </i18n-t>
                    </b>
                    <div v-if="verificationCodeVisibility">                      
                      <v-otp-input v-model="emailCode"></v-otp-input>
                      <div class="d-flex justify-center">
                        <v-btn color="primary" flat @click="verifyEmailLink()" :disabled="loading">{{ t('accountSettings.verifyCode') }}</v-btn>
                      </div> 
                    </div>
                  </p>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-autocomplete
                    v-model="searchAddress"
                    item-title="label"
                    return-object
                    :items="searchAddressResults"
                    color="primary"
                    :label="t('common.location')"
                    variant="outlined"
                    hide-details
                    @update:search="searchLocation"
                    @update:modelValue="onSearchLocationChanged"
                ></v-autocomplete>
                </v-col>
              </v-row> 
            </div>
          </v-card-item>
        </v-card>
      </v-col>   
    </v-row>
    <v-row class="ma-sm-n2 ma-n1">
      <v-col cols="12">
        <v-card elevation="10">
          <v-card-item>
            <h5 class="text-h5">{{ t('profileComponent.socialMedia') }}</h5>
            <div class="mt-5">
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
            </div>
          </v-card-item>
        </v-card>
      </v-col>   
    </v-row>
    <div class="d-flex justify-end mt-5 pb-3">
      <!---<v-btn color="error" variant="text" @click="$emit('handledialog')" class="mr-4">{{ t('actions.cancel') }}</v-btn>-->
      <v-btn color="primary" variant="text" @click="onSave()">{{ t('actions.save') }}</v-btn>
    </div>
  </v-card>  
</template>
