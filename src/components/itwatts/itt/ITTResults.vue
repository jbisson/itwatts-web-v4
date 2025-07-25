<script setup lang="ts">
  import { toRefs, ref, onMounted, reactive, watch } from "vue";
  import axios from 'axios';
  import config from "@/config/config.json";
  import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import AppBaseCard from '@/components/shared/AppBaseCard.vue';
  import CountryFlag from 'vue-country-flag-next';
  import { useUserProfile } from "../../../stores/user-profile";
  import SegmentsAnalysis from "@/components/itwatts/itt/SegmentsAnalysis.vue";

  const { t, locale } = useI18n({ useScope: 'global' });
  const props = defineProps<{
    results: any
    overallResults: boolean
  }>()
  
  const categories = reactive([] as any);
  let segmentDialogSegments = null;
  let segmentDialogHeight = null;
  let segmentDialogWeight = null;
  let segmentDialogPower = null;
  const segmentDialogVisible = ref(false);
  const segmentDialogName = ref();
  
  const tabs = ref();
  
  const overallHeaders: Header[] = [
      { text: t('resultComponent.name'), width: 140, value: "name", sortable: true },
      { text: t('resultComponent.position'), value: "position", width: 10, sortable: true },
      { text: t('resultComponent.points'), value: "total_points", width: 10, sortable: true },
      { text: "Nb Évènements", value: "nb_events", width: 10, sortable: true },
      { text: "TT Club Score", value: "total_tt_club_score", width: 10, sortable: true },    
      { text: "ITWatts Score", value: "total_efficiency", width: 10, sortable: true },
      { text: "Temps (mm:ss)", value: "total_time", width: 10, sortable: true },
      { text: "Temps référence (mm:ss)", value: "total_reference_time", width: 10, sortable: true },
      { text: "Gain de temps (mm:ss)", value: "gain", width: 10, sortable: true },
      { text: "Cda", value: "cda", width: 10, sortable: true },
    ];

  const individualHeaders: Header[] = [
    { text: t('resultComponent.name'), width: 140, value: "name", sortable: true },
    { text: t('resultComponent.position'), value: "position", width: 10, sortable: true },
    { text: t('resultComponent.points'), value: "total_points", width: 10, sortable: true },
    { text: "TT Club Score", value: "tt_club_score", width: 10, sortable: true },    
    { text: "ITWatts Score", value: "efficiency", width: 10, sortable: true },
    { text: "Temps (mm:ss)", value: "time", width: 10, sortable: true },
    { text: "Temps référence (mm:ss)", value: "reference_time", width: 10, sortable: true },    
    { text: "Gain de temps (mm:ss)", value: "gain", width: 10, sortable: true },
    { text: "Vitesse moyenne (km/h)", value: "avg_speed", width: 10, sortable: true },
    { text: "Cda", value: "cda", width: 10, sortable: true },
    { text: "Power (watts)", value: "avg_power", width: 10, sortable: true },
    { text: "Power (w/kg)", value: "avg_power_wkg", width: 10, sortable: true },
    { text: 'Analyser', value: "analysis", width: 10, sortable: false },
  ];
    
  function refresh() {
    categories.value = [];
    if (props.results) {
      //console.log(JSON.stringify(props.results));
      let foundUser = 0;
      if (props.results.race_result_per_category) {       
        let nbResults = 0;
        tabs.value = props.results.race_result_per_category[0].category;
        nbResults = props.results.race_result_per_category[0].result.length;

        for (let i = 0;i < props.results.race_result_per_category.length;i++) {
          categories.value.push(props.results.race_result_per_category[i].category);

          if (!foundUser) {
            foundUser = 
              props.results.race_result_per_category[i].result.find((result : any) => result.id === useUserProfile().user_id);
            if (foundUser) {
              tabs.value = props.results.race_result_per_category[i].category;
            } else if (props.results.race_result_per_category[i].result.length > nbResults) {
              tabs.value = props.results.race_result_per_category[i].category;
              nbResults = props.results.race_result_per_category[i].result.length;
            }
          }          
        }
      } else if (props.results.overall_riders_result_per_category) {
        let nbResults = 0;
        tabs.value = props.results.overall_riders_result_per_category[0].category;
        nbResults = props.results.overall_riders_result_per_category[0].result.length;
        
        for (let i = 0;i < props.results.overall_riders_result_per_category.length;i++) {
          categories.value.push(props.results.overall_riders_result_per_category[i].category);

          if (!foundUser) {
            foundUser = 
              props.results.overall_riders_result_per_category[i].result.find((result :any) => result.id === useUserProfile().user_id);
            if (foundUser) {
              tabs.value = props.results.overall_riders_result_per_category[i].category;
            } else if (props.results.overall_riders_result_per_category[i].result.length > nbResults) {
              tabs.value = props.results.overall_riders_result_per_category[i].category;
              nbResults = props.results.overall_riders_result_per_category[i].result.length;
            }
          } 
        }
      }
    }
  }

  const onClickRow = (item: ClickRowArgument) => {
    // @ts-ignore: Object is possibly 'null'.
    window.open(`https://zwiftpower.com/profile.php?z=${item.zp_id}`, '_blank').focus();
  };
  
  function openSegmentGraph(item: any) {
    segmentDialogName.value = `${item.name} - ${props.results.metadata.name}`;
    segmentDialogSegments = {
      reference: item.course_reference_time,
      real: item.course
    };
    segmentDialogHeight = item.height;
    segmentDialogWeight = item.weight;
    segmentDialogPower = item.avg_power;
    segmentDialogVisible.value = true;
  }  

  refresh();
  watch(() => [props.results], refresh);
 
</script>

<template>  
  <v-card class="auto">
    <v-card-item v-if="props.results && props.results.metadata && props.results.metadata.course_name">
    <div>
      <div class="text-overline mb-1">
        {{props.results.metadata.course_name}}
      </div>
      <div class="text-subtitle-2">
        {{props.results.metadata.course_km}} KM
      </div>
    </div>
  </v-card-item>
  </v-card>
  <v-toolbar color="primary">
  <template v-slot:extension>
    <v-tabs v-model="tabs">
      <v-tab v-for="cat in categories.value" :key="cat" :value="cat">
        {{ cat }}
      </v-tab>
    </v-tabs>
  </template>
</v-toolbar>    
<v-window v-model="tabs">
<v-window-item v-for="(cat, index) in categories.value" :key="cat" :value="cat">          
  <v-card flat>
    <EasyDataTable v-if="props.results.overall_riders_result_per_category"
          @click-row="onClickRow"
          :headers="overallHeaders"
          :items="props.results.overall_riders_result_per_category[index].result"
          alternating
        >
        </EasyDataTable>
      <EasyDataTable v-if="props.results.race_result_per_category"
          :headers="individualHeaders"
          :items="props.results.race_result_per_category[index].result"
          alternating>
        <template #item-analysis="{ id, name, course_reference_time, course, height, weight, avg_power }">          
          <v-btn color="primary" class="mb-1" @click="openSegmentGraph({id, name, course_reference_time, course, weight, height, avg_power})" size="x-small">Segments</v-btn>
        </template>
      </EasyDataTable>
      <SegmentsAnalysis :visible="segmentDialogVisible" :name="segmentDialogName" :segments="segmentDialogSegments"
        :height="segmentDialogHeight" :weight="segmentDialogWeight" :power="segmentDialogPower" @handledialog="segmentDialogVisible = false" ></SegmentsAnalysis>
    </v-card>
  </v-window-item>
  </v-window>  
</template>