<script setup lang="ts">
  import { toRefs, ref, onMounted, reactive, watch } from "vue";
  import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
  import { useI18n } from 'vue-i18n';

  const { t, locale } = useI18n({ useScope: 'global' });
  const props = defineProps<{
    results: any
  }>()
  
  const categories = reactive([] as any);
  
  const tabs = ref();
  
  const overallHeaders: Header[] = [
      { text: t('resultComponent.name'), width: 140, value: "name", sortable: true },
      { text: 'Position', value: "position", width: 10, sortable: true },
      { text: 'Pink', value: "pink", width: 10, sortable: true },
      { text: 'Fortune', value: "fortune", width: 10, sortable: true },
      { text: "Total", value: "total", width: 10, sortable: true },      
  ];

  function refresh() {
    categories.value = [];
    if (props.results) {
      console.log(JSON.stringify(props.results));
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
    // window.open(`https://zwiftpower.com/profile.php?z=${item.zp_id}`, '_blank').focus();
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
        >          
          <template #item-team="{ tname, tbd, tbc, tc }">
            <span v-html="tname" v-if="tname" :style="'font-weight: bold;padding: 0.2em 0.6em 0.3em;border-style:solid;border-width: 2px;border-radius: 3px;margin-left:5px;background-color:#' + tbc + ';border-color:#' + tbd + ';!important;color:#' + tc"></span>
          </template>
    </EasyDataTable>
    </v-card>
  </v-window-item>
  </v-window>  
</template>