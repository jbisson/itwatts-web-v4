<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch, onBeforeUpdate } from 'vue';
import vueFilePond from 'vue-filepond';
import { setOptions }  from 'vue-filepond';
import axios from 'axios';
import { useI18n } from 'vue-i18n';


import config from '@/config/config.json';
import { useUserProfile } from '@/stores/user-profile';
import { useTeamStore } from '@/stores/apps/teams';

const { t } = useI18n({ useScope: 'global' });

const props = defineProps<{
  user: any,
  onWindowChanged: any,
}>();

const emit = defineEmits(['update:dialog', 'handledialog'])

const loading = ref();
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();

async function refresh() {
  infoAlert.value = '';
  errorAlert.value = '';
  warningAlert.value = '';
}

async function onSave() {
  loading.value = true;
  
  try {
    const response = await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
    {
      mywhoosh_id: props.user.mywhoosh_id,
    }, {
      withCredentials: true,
    });
    infoAlert.value = t('dialogs.success');
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
            <h5 class="text-h5">{{ t('common.zwift') }}</h5>
            <div class="mt-5">
              <v-text-field variant="outlined" hide-details v-model="user.zp_id" label="Zwift Power ID" disabled></v-text-field>                
            </div>
          </v-card-item>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card elevation="10">
          <v-card-item>
            <h5 class="text-h5">{{ t('common.myWhoosh') }}</h5>
            <div class="mt-5">
              <v-text-field variant="outlined" hide-details v-model="user.mywhoosh_id" label="MyWhoosh ID"></v-text-field>                
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
