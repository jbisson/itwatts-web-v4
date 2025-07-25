<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";

import UiParentCard from '@/components/shared/UiParentCard.vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
//import BaseCard from "@/components/BaseCard.vue";
import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter } from 'vue-router';
import { useCookies } from "vue3-cookies";
import { storeToRefs } from 'pinia'

import { useUserProfile } from '@/stores/user-profile';
import config from '@/config/config.json';
import security from '@/security';

const { t } = useI18n({ useScope: 'global' });
const page = ref({ title: t('teamInvite.pageTitle') });

const loading = ref(false);
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();
const teamCode = ref(false);
const email = ref();
const zpID = ref();
const isFormValid = ref();
const emailCodeRequired = ref(false);
const emailCode = ref();

const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('teamInvite.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('teamInvite.pageTitle'),
    disabled: true,
  },
]);

const rules = ref({
  required: (value: any) => !!value || t('validations.required'),
  email: (value: any) => {
      const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(value) || t('validations.invalidEmail');
    },
});

const userStoreProfile = useUserProfile();

async function refresh() {
  const code = new URLSearchParams(window.location.search).get('code');  
  if (!security.isLoggedIn() || !useUserProfile().user_id) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    useUserProfile().login_post_back_page_query = router.currentRoute.value.query;
    return;
  } else if (code && (code.length === 32 || (code.length === 64 && useUserProfile().zp_id && useUserProfile().email))) {
    await validateCode();
    //teamCode.value = true;
  } else {
    teamCode.value = true;
  }
}

async function validateCode() {
  try {
    const code = new URLSearchParams(window.location.search).get('code');
    loading.value = true;
    infoAlert.value = '';
    errorAlert.value = '';
    const response = await axios.post(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/accept-team-invite?code=${code}`,
    {
      email: email.value,
      zp_id: zpID.value,
      email_code: emailCode.value,
    },
    {
      withCredentials: true,
    });
      
    useUserProfile().login_post_back_page = '/itwatts/fera/rider';
    window.location.href = `${config.serverApi.publicHostname}/auth/strava`;
  } catch (err: any) {
    console.log(`an error occured: ${err} stack: ${err.stack}`);
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    } else if (err.response && err.response.status === 304) {
      errorAlert.value = t('errors.expiredLink');      
    } else if (err.response && err.response.status === 403) {
      errorAlert.value = t('teamInvite.notAuthorized');      
    } else if (err.response && err.response.data && err.response.data.message.includes('zp_id')) {
      errorAlert.value = t('teamInvite.invalidZwiftPowerID');
    } else if (err.response && err.response.data && err.response.data.message.includes('Invalid email_code')) {
      errorAlert.value = t('teamInvite.invalidVerificationCode');
    } else if (err.response && err.response.data && err.response.data.message.includes('email_code required')) {
      infoAlert.value = t('teamInvite.fillEmailCode', [email.value]);
      teamCode.value = false;
      emailCodeRequired.value = true;
    } else {
      errorAlert.value = t('errors.errorOccured', [err]);
      console.log(`an error occured: ${err} stack: ${err.stack}`);
    }    
  } finally {
    loading.value = false;
  }
}
watch(() => [], refresh);
refresh();

</script>
<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" sm="5" lg="5">
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
    <v-col cols="12" sm="5" lg="5">
      <v-progress-linear
          v-if="loading"
          indeterminate
          stream
          color="primary"            
        ></v-progress-linear>
      <v-card>
        <v-card-text>
          <v-form v-model="isFormValid">
            <p class="my-4 text-subtitle-1"  v-if="!security.isLoggedIn() || !useUserProfile().user_id">{{ t('teamInvite.needLogin') }}
              <a :href="config.serverApi.publicHostname + '/auth/strava'" class="social-button" id="strava-connect"> <span>{{ t('signin.withStrava') }}</span></a>
            </p>
            <p class="my-4 text-subtitle-1" v-if="teamCode">              
              <v-row>
                <v-col>
                  <span>{{ t('teamInvite.provideEmailAndZwiftPowerID') }}</span>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                    :label="t('common.email')"
                    color="primary"
                    variant="outlined"
                    hide-details="auto"
                    v-model="email"
                    :rules="[rules.required, rules.email]"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field
                  :label="t('common.zwiftPowerID')"
                  color="primary"
                  variant="outlined"
                  hide-details="auto"
                  v-model="zpID"
                  :rules="[rules.required]"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-btn color="primary" flat @click="validateCode()" :disabled="!isFormValid || loading">{{ t('actions.submit') }}</v-btn>
                </v-col>
              </v-row>
            </p>
            <p class="my-4 text-subtitle-1" v-if="emailCodeRequired">
              <v-row>
                <v-col>
                  <span>{{ t('teamInvite.verificationCode') }}</span>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-otp-input v-model="emailCode"></v-otp-input>                    
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-btn color="primary" flat @click="validateCode()" :disabled="!isFormValid || loading">{{ t('actions.submit') }}</v-btn>
                </v-col>
              </v-row>
            </p>
            <p class="my-4 text-body-1 text-10" v-if="security.isLoggedIn() && !teamCode && !emailCodeRequired">
              <b>{{ useUserProfile().first_name }}</b>, {{ t('teamInvite.validatingCode') }}
            </p>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col> 
  </v-row>
</template>
