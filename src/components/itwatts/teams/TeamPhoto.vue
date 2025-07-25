<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch, onBeforeUpdate } from 'vue';
import vueFilePond from 'vue-filepond';
import { setOptions }  from 'vue-filepond';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
function refresh() {
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
          {{ t('teamPhotoComponent.title')}} ({{ props.team.display_name }})
        </div>
        <v-btn            
          icon="mdi-close"
          variant="text"
          @click="$emit('handledialog');clear();">
        </v-btn>
      </v-card-title>      
        <v-form>   
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
            <v-btn variant="tonal" color="error" @click="$emit('handledialog');clear();">{{ t('actions.cancel') }}</v-btn>
            <v-btn variant="flat" color="primary" @click="onSave()">{{ t('actions.save') }}</v-btn>
          </v-card-actions>
        </v-form>        
    </v-card>
  </v-dialog>
</template>
