<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from "../../../stores/user-profile";

import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue";
import AtomasResultsComponent from "@/components/itwatts/gcqc/GcqcResults.vue";

import config from "@/config/config.json";
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n({ useScope: 'global' });
const route = useRoute(); 
const overallRiderResults = reactive([] as any);
const racesResult = reactive([] as any);
const selectedResult = reactive([] as any);
const pickedEvent = ref();
const overallResults = ref(false);
const loading = ref(false);
const errorAlert = ref();
const warningAlert = ref();
const infoAlert = ref();

const page = ref({ title: t('gcqcResults.pageTitle')});
const breadcrumbs = ref([
  {
    text: t('gcqcResults.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('gcqcResults.pageTitle'),
    disabled: true,
  },
]);

const userStoreProfile = useUserProfile();

async function refresh() {
  page.value.title = t('gcqcResults.pageTitle');
  
  try {
    loading.value = true;
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/zp-race-serie-report/a24_gcqc`, {
      withCredentials: true
    });
    overallRiderResults.value = [];
    racesResult.value = response.data.data.races_result;
            
    selectedResult.value = {
      overall_riders_result_per_category: overallRiderResults.value,
    };
    pickedEvent.value = 'Cummulatif';
  } catch (err: any) {
    errorAlert.value = `Oupss, une erreur est survenue... Detail: ${err}`;
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  } finally {
    loading.value = false;
  }  
}

watch(() => [], refresh);
refresh();

function onRaceChange(event: any) {
  if (event.target.value === 'Cummulatif') {
    selectedResult.value = {
      overall_riders_result_per_category: overallRiderResults.value,
    }
    overallResults.value = true;
    
  } else {
    selectedResult.value = racesResult.value[event.target.value];
    overallResults.value = false;
  }  
}
</script>

<template>
  <router-view :key="route.name" />
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" sm="6" lg="6">
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
    <v-col cols="12" sm="6" lg="6">
      <v-progress-linear
            v-if="loading"
            indeterminate
            stream
            color="primary"            
      ></v-progress-linear>
      <v-card>
        <v-card-text>   
          <v-radio-group v-model="pickedEvent">
            <v-radio v-on:change="onRaceChange" :label="t('atomasResults.cumulative')" value="Cummulatif"></v-radio>
            <v-radio v-on:change="onRaceChange" v-for="(raceResult, index) in racesResult.value" :label="raceResult.metadata.short_event_date + ' ' + raceResult.metadata.course_name" :value="index" :key="index"></v-radio>
          </v-radio-group>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" sm="6" lg="6">
      <AtomasResultsComponent :results="selectedResult.value" :overallResults="overallResults"/>
      </v-col>
  </v-row>
</template>
