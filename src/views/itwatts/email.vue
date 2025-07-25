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
import { decodeBase64 } from '@/utils/string';
//import { addUserCompliance } from '@/utils/zp';

const { t } = useI18n({ useScope: 'global' });
const page = ref({ title: t('email.pageTitle') });

const loading = ref(false);
const emailVerified = ref(false);
const error = ref();

const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('email.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('email.pageTitle'),
    disabled: true,
  },
]);

const userStoreProfile = useUserProfile();

async function refresh() {
  console.log(useUserProfile().user_id);

  if (!security.isLoggedIn() || !useUserProfile().user_id) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    useUserProfile().login_post_back_page_query = router.currentRoute.value.query;
    router.push({ path: '/itwatts/signin' });
    return;
  }
  loading.value = true;
  try {
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`, {
      withCredentials: true});
      console.log(response.data.email_validated_date);
      emailVerified.value = response.data.email_validated_date;
  } catch (error: any) {
    console.log(`Error while fetching user ${error} ${error.stack}`);
  } finally {
    loading.value = false;

    if (!emailVerified.value) {
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        try {
          const response = await axios.post(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/validateEmail?code=${code}`, {},
          {
            withCredentials: true,
          });
          emailVerified.value = response.status === 200;
        } catch (error) {
          // 400 expected.
          if (error.response.status !== 400) {
            console.log(`Error while trying to validate email ${error} ${error.stack}`);
          }          
        }
      }      
    }

    if (!emailVerified.value) {
      error.value = `Malheureusement ${useUserProfile().first_name}, la vérification de votre courriel: ${useUserProfile().email} a échoué...`;
    }
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
    <v-col cols="8">        
        <v-alert
          density="compact"
          type="error"
          :title="t('common.error')"
          :text="error"
          v-if="error"
        ></v-alert>
      </v-col>
    <v-col cols="8" v-if="emailVerified">
      <UiParentCard :title="t('email.pageTitle')">
        <p class="my-4 text-body-1 text-10"  v-if="emailVerified">
          Excellent <b>{{ useUserProfile().first_name }}</b>, votre courriel {{ }} a bien été vérifier!
          <br><br>
          <img src='@/assets/images/itwatts/youpi.png' width="50%"/>
        </p>
        </UiParentCard>
    </v-col> 
  </v-row>
</template>
