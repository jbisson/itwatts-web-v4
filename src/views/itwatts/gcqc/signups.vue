<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from "../../../stores/user-profile";

import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue";
import GcqcSignupsComponent from "@/components/itwatts/gcqc/GcqcSignups.vue";

import config from "@/config/config.json";
import security from "@/security";
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n({ useScope: 'global' });
const route = useRoute(); 
const results = reactive([] as any);
const router = useRouter();

const page = ref({ title: t('gcqcSignups.pageTitle')});
const breadcrumbs = ref([
  {
    text: t('gcqcSignups.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('gcqcSignups.pageTitle'),
    disabled: true,
  },
]);

const rolesRequired = ['SUPER_ADMIN'];
const userStoreProfile = useUserProfile();

refresh();

function refresh() {
  if (!security.isTokenValid(rolesRequired)) {
    router.push({ path: '/itwatts/signin' });
    return;
  }

  page.value.title = t('gcqcSignups.pageTitle');
  
  axios.post(`${config.serverApi.publicHostname}/v1/zp-signups/4095393`, {
  headers: {
    withCredentials: true,
  }
  }).then(response => {
    results.value = response.data.data;
  });
}

watch(() => [], refresh);
refresh();

</script>

<template>
  <router-view :key="route.name" />
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" sm="6" lg="6">
      <GcqcSignupsComponent :results="results.value"/>
    </v-col>
  </v-row>
</template>
