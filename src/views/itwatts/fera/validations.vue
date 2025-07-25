<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import security from "@/security";
import { useRouter } from 'vue-router';
import { useUserProfile } from '@/stores/user-profile';

import Validations from '@/components/itwatts/fera/Validations.vue';

import config from "@/config/config.json";
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('feraValidations.pageTitle') });
const router = useRouter();
const tab = ref();
const loading = ref(false);
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();

const privacyConsent = ref();

const breadcrumbs = ref([
  {
    text: t('feraValidations.pageCategory'),
    disabled: false,
    to: '#'
  },
  {
    text: t('feraValidations.pageTitle'),
    disabled: true
  }
]);

async function refresh() {
  if (!security.isTokenValid([])) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  try {
    const user = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}?fields=fera_privacy`,
    {
      withCredentials: true
    });
    if (user.data.fera_privacy) {
      privacyConsent.value = user.data.fera_privacy;
    } else {
      tab.value = 'privacy';
    }
    console.log(`Response from /v1/user: ${JSON.stringify(user.data)}`);
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  }
}

watch(() => [], refresh);
refresh();
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" sm="12" lg="12">
      <v-row>
        <v-col cols="12">
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
      </v-row><br>
      <v-card elevation="10">
        <v-card-item>
          <Validations @onSuccess="(msg) => infoAlert = msg" @onError="(msg) => errorAlert = msg" @onLoading="(loadingVal) => loading = loadingVal"/>          
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</template>
