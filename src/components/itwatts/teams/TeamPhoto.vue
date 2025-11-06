<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch, onBeforeUpdate } from 'vue';
import vueFilePond from 'vue-filepond';
import { setOptions }  from 'vue-filepond';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

const FilePond = vueFilePond(FilePondPluginFileEncode, FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize, FilePondPluginImageResize, FilePondPluginImageTransform);

import { Cropper, RectangleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

import { useUserProfile } from '@/stores/user-profile';
import config from "@/config/config.json";

const { t } = useI18n({ useScope: 'global' });

const props = defineProps<{
  team: any,
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
})

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

function refresh() {
  infoAlert.value = '';
  errorAlert.value = '';
  warningAlert.value = '';

  // console.log('refresh');
}

async function onSave() {
  try {
    if (cropperRef.value && filePondRef.value.getFiles().length > 0) {
      loading.value = true;
      cropperRef.value.getResult().canvas.toBlob(async blob => {
        try {
          const response = await axios.put(`${config.serverApi.publicHostname}/v1/teams/${props.team.id}/images/banner_team_photo`,
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
          errorAlert.value = `Oupss, une erreur est survenue...Detail: ${err}`;
          console.log(`Error: ${err} stack: ${err.stack}`);
        } finally {
          loading.value = false;
        }
      }, filePondRef.value.getFiles()[0].fileType);      
    } else {
      emit('handledialog');
    } 
  } catch (err: any) {
    errorAlert.value = `Oupss, une erreur est survenue...Detail: ${err} stack: ${err.stack}`;
    console.log(`Error: ${err} stack: ${err.stack}`);
  } finally {
    loading.value = false;
  }
}

function clear() {
  cropperSrc.value = '';
}

watch(() => [], refresh);
refresh();

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
    <v-form>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center bg-primary">
          <div class="text-h3">
            {{ t('teamPhotoComponent.title')}} ({{ props.team.display_name }})
          </div>
          <v-btn            
            icon="mdi-close"
            variant="text"
            @click="$emit('handledialog');clear();">
          </v-btn>
        </v-card-title>              
        <v-card-text >
          <v-row>
            <v-col cols="12" sm="6">                
              <file-pond 
                ref="filePondRef"
                :label-idle="t('common.placeImageHere')" allow-multiple="false" max-files="1" 
                accepted-file-types="image/jpeg, image/png" allowImagePreview="false"
                @addfile="onAddFile" @removefile="onRemoveFile"/>
              <div v-if="cropperSrc">
                <cropper
                ref="cropperRef"              
                class="cropper"
                :src="cropperSrc"
                :debounce="false"
                :stencil-props="{
                  previewClass: 'preview',
                  aspectRatio: 3.5,
                }"
                :stencil-component="RectangleStencil"
              ></cropper><br>
                <v-btn color="primary" @click="zoomIn()" size="x-small">+</v-btn>&nbsp;&nbsp;&nbsp;
                <v-btn color="primary" @click="zoomOut()" size="x-small">-</v-btn>
              </div>
              </v-col> 
          </v-row> 
        </v-card-text>
        <v-card-actions>
          <v-btn color="error" @click="$emit('handledialog');clear();">{{ t('actions.cancel') }}</v-btn>
          <v-btn color="primary" flat @click="onSave()">{{ t('actions.save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>        
  </v-dialog>
</template>
