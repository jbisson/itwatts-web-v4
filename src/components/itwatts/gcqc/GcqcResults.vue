<script setup lang="ts">
  import { toRefs, ref, onMounted, reactive, watch } from "vue";
    import axios from 'axios';
  import config from "@/config/config.json";
  import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';

  const { t, locale } = useI18n({ useScope: 'global' });
  const props = defineProps<{
    results: any
    overallResults: boolean
  }>()
  
    const categories = reactive([] as any);
  
  const tabs = ref();
  
  const overallHeaders: Header[] = [
      { text: t('resultComponent.name'), value: "name", sortable: true },
      { text: t('resultComponent.position'), value: "position", sortable: true },
      { text: t('resultComponent.points'), value: "total_points", sortable: true },
    ];

  const individualHeaders: Header[] = [
    { text: t('resultComponent.name'), value: "name", sortable: true },
    { text: t('resultComponent.position'), value: "position", sortable: true },    
  ];
    
  function refresh() {
    categories.value = [];
    if (props.results) {
      if (props.results.race_result_per_category) {       
        tabs.value = props.results.race_result_per_category[0].category;

        for (let i = 0;i < props.results.race_result_per_category.length;i++) {
          categories.value.push(props.results.race_result_per_category[i].category);
        }
      } else if (props.results.overall_riders_result_per_category) {
        tabs.value = props.results.overall_riders_result_per_category[0].category;

        for (let i = 0;i < props.results.overall_riders_result_per_category.length;i++) {
          categories.value.push(props.results.overall_riders_result_per_category[i].category);
        }
      }
    }
  }

  const onClickRow = (item: ClickRowArgument) => {
    // @ts-ignore: Object is possibly 'null'.
    window.open(`https://zwiftpower.com/profile.php?z=${item.ZwiftId}`, '_blank').focus();
  };
  
  refresh();
  watch(() => [props.results], refresh);
 
</script>

<template>  
  <v-card class="auto">
    <v-card-item v-if="props.results && props.results.metadata && props.results.metadata.course_name">
    <div>
      <div class="text-overline mb-1">
        <a :href="'https://zwiftpower.com/events.php?zid=' + props.results.metadata.zid" target="_blank">{{props.results.metadata.course_name}} ({{props.results.metadata.course_lap}} Laps)</a>
      </div>
      <div class="text-subtitle-2">
        {{props.results.metadata.course_km}} KM@{{props.results.metadata.course_elevation}}m
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
        />
      <EasyDataTable v-if="props.results.race_result_per_category"
          @click-row="onClickRow"
          :headers="individualHeaders"
          :items="props.results.race_result_per_category[index].result"
          alternating
        />      
  </v-card>
</v-window-item>
</v-window>  
  
</template>