<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";

import { useUserProfile } from '@/stores/user-profile';
import config from "@/config/config.json";
import security from "@/security";
import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue";
import FRRComponentStage from "@/components/itwatts/frr/FRRResultsStage.vue";
import FRRComponentParticipation from "@/components/itwatts/frr/FRRResultsParticipation.vue";
import FRRComponentTourJerseys from "@/components/itwatts/frr/FRRResultsTourJerseys.vue";

import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t, locale } = useI18n({ useScope: 'global' });
const route = useRoute(); 
const participationResults = reactive([] as any);
const tourJerseyResults = reactive([] as any);
const racesResult = reactive([] as any);
const selectedStageResult = reactive([] as any);
const pickedEvent = ref();
const tabView = ref('participations');

const router = useRouter();
const page = ref({ title: t('swatFRR.pageTitle')});
const breadcrumbs = ref([
  {
    text: t('swatFRR.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatFRR.pageTitle'),
    disabled: true,
  },
]);

refresh();

function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ADMIN', 'SWAT_MEMBER_2024_2025'];
  if (!security.isTokenValid(rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  page.value.title = t('swatFRR.pageTitle');
  
  axios.get(`${config.serverApi.publicHostname}/v1/frr?&serie_name=2024_triquetra`, {
    withCredentials: true
  }).then(response => {
    racesResult.value = response.data.data.stages;
    tourJerseyResults.value = response.data.data.tour;
    
    if (racesResult.value.riders) {
      racesResult.value.riders.sort((rider1: any, rider2: any) => rider2.totalPoints - rider1.totalPoints);
    }    
    
    if (response.data.data) {
      const riders = new Map();

      for (let i = 0;i < response.data.data.stages.length;i++) {
        for (let j = 0;j < response.data.data.stages[i].riders.length;j++) {
          let participations = 1;
          if (riders.has(response.data.data.stages[i].riders[j].name)) {
            participations = riders.get(response.data.data.stages[i].riders[j].name).participations + 1;
          }
          riders.set(response.data.data.stages[i].riders[j].name, {
            name: response.data.data.stages[i].riders[j].name,
            participations
          });
        }
      }   
      participationResults.value = {
        riders: Array.from(riders.values()).sort((rider1, rider2) => rider2.participations - rider1.participations)
      };
    }

    pickedEvent.value = 'participations';
  });
}

watch(() => [], refresh);
refresh();

function onRaceChange(event: any) {
  if (event.target.value === 'participations') {
    tabView.value = 'participations';    
  } else if (event.target.value === 'tourJerseys') {
    tabView.value = 'tourJerseys';
  } else {
    selectedStageResult.value = racesResult.value[event.target.value];
    tabView.value = 'stage';    
  }
}
</script>

<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" lg="8">
      <v-card>
        <v-card-text>      
          <v-radio-group v-model="pickedEvent">
            <v-radio v-on:change="onRaceChange" :label="'Participations'" value="participations"></v-radio>
            <v-radio v-on:change="onRaceChange" :label="'Maillots'" value="tourJerseys"></v-radio>
            <v-radio v-on:change="onRaceChange" v-for="(raceResult, index) in racesResult.value" :label="'Stage ' + raceResult.stage" :value="index" :key="index"></v-radio>
          </v-radio-group>      
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" lg="8">
      <FRRComponentParticipation v-if="tabView === 'participations'" :participationResults="participationResults.value"/>      
      <FRRComponentTourJerseys v-if="tabView === 'tourJerseys'" :tourJerseyResults="tourJerseyResults.value"/>      

      <FRRComponentStage v-if="tabView === 'stage'"
        :stageResults="selectedStageResult.value"
        />      
    </v-col>
  </v-row>
</template>
