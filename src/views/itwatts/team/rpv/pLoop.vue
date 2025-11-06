<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from "@/stores/user-profile";

import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue";
import PLoopResultsComponent from "@/components/itwatts/rpv/PLoopCategories.vue";

import config from "@/config/config.json";
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n({ useScope: 'global' });
const route = useRoute(); 
const overallRiderResults = reactive([] as any);
const racesResult = reactive([] as any);
const selectedResult = reactive([] as any);
const overallResults = ref(false);
const loading = ref(false);
const errorAlert = ref();
const warningAlert = ref();
const infoAlert = ref();

const round = 4;
const page = ref({ title: t('rpvPloop.pageTitle')});
const breadcrumbs = ref([
  {
    text: t('rpvPloop.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('rpvPloop.pageTitle'),
    disabled: true,
  },
]);

async function refresh() {
  try {
    loading.value = true;  

    const response = await axios.get(`${config.serverApi.publicHostname}/v1/utils/rpvPloopCategories`, {
      withCredentials: true
    });
    racesResult.value = {
      overall_riders_result_per_category: response.data.overall_riders_result_per_category
    }
  } catch (err: any) {
    errorAlert.value = `Oupss, une erreur est survenue... Detail: ${err}`;
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  } finally {
    loading.value = false;
  }  
}

watch(() => [round], refresh);
refresh();

</script>

<template>
  <router-view :key="route.name" />
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" lg="8">
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
  <v-row>
    <v-col cols="12" lg="8">
      <v-progress-linear
            v-if="loading"
            indeterminate
            stream
            color="primary"            
      ></v-progress-linear>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" lg="8">
      <PLoopResultsComponent :results="racesResult.value"/>
    </v-col>
  </v-row>
</template>
