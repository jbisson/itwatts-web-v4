<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import security from "@/security";
import { useRouter } from 'vue-router';
import { useUserProfile } from '@/stores/user-profile';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';
import { Cropper, Preview, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

import config from "@/config/config.json";
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { AlertSmallIcon } from 'vue-tabler-icons';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('feraTransparency.pageTitle') });
const router = useRouter();

const breadcrumbs = ref([
  {
    text: t('feraTransparency.pageCategory'),
    disabled: false,
    to: '#'
  },
  {
    text: t('feraTransparency.pageTitle'),
    disabled: true
  }
]);

const tab = ref();
const loading = ref(false);
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();
const zwiftpowerBio = ref();

async function getBio() {
  try {    
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/bio`, {
      withCredentials: true,
    });
    zwiftpowerBio.value = response.data.withFERA;

    console.log(`Response from getZpBio: ${JSON.stringify(response.data)}`);
  } catch (err: any) {    
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`An error occured: ${err} stack: ${err.stack}`);
  }  finally {
  }
}

async function refresh() {
  if (!security.isTokenValid([])) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  await getBio();
}

const rules = ref({
  required: (value: any) => !!value || t('validations.required'),
  email: (value: any) => {
      const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(value) || t('validations.invalidEmail');
    },
});

watch(() => [], refresh);
refresh();
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
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
        :text="infoAlert"
        v-if="infoAlert"
      ></v-alert>
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="warning"
        :text="warningAlert"
        v-if="warningAlert"
      ></v-alert>
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="error"
        :text="errorAlert"
        v-if="errorAlert"
      ></v-alert>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" sm="12" lg="12">
      <v-card elevation="10">
        <v-card-item>
          <v-tabs v-model="tab" color="primary" grow>
            <v-tab value="1">{{ t('feraTransparency.zwift') }}</v-tab>            
          </v-tabs>
          <div class="mt-5">
            <v-window v-model="tab">
              <v-window-item value="1">
                <i18n-t keypath="feraTransparency.addBio" tag="p" scope="global">
                  <a href="https://zwiftpower.com/" target="_blank">https://zwiftpower.com</a>
                </i18n-t>
                <v-col cols="8">                
                  <v-textarea rows="15" outlined v-model="zwiftpowerBio"></v-textarea>                  
                  <img src='@/assets/images/itwatts/admission/zwiftpower_bio.png' width="100%"/><br><br>
                </v-col>                
              </v-window-item>
            </v-window>
          </div>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</template>
