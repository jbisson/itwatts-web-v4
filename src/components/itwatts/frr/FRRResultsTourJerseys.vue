<script setup lang="ts">
  import { toRefs, ref, onMounted, reactive, watch } from "vue";
    import axios from 'axios';
  import config from "@/config/config.json";
  import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';

  const { t, locale } = useI18n({ useScope: 'global' });
  const props = defineProps<{    
    tourJerseyResults: any
  }>()
  
    const categories = reactive([] as any);
  
  const tabs = ref();

  const tourJerseyResultsHeaders: Header[] = [
    { text: 'Nom', value: 'name', sortable: true },
    { text: 'Vert (green jersey)', value: 'greenJerseyLeaguePos', width: 50, sortable: true },
    { text: 'À pois (polka jersey)', value: 'polkaJerseyLeaguePos', width: 50, sortable: true },
    { text: '(gc overall jersey)', value: 'gcOverallJerseyLeaguePos', width: 50, sortable: true },
    { text: '(all rounder jersey)', value: 'allRounderJerseyLeaguePos', width: 50, sortable: true },
    { text: '(gc least jersey)', value: 'gcLeastTimeJerseyLeaguePos', width: 50, sortable: true },
  ];
    
  function refresh() {
    categories.value = ['FRR'];        
  }
 
  refresh();
  watch(() => [props.tourJerseyResults], refresh);
 
</script>

<template>  
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
        <EasyDataTable v-if="props.tourJerseyResults"
            :headers="tourJerseyResultsHeaders"
            :items="props.tourJerseyResults"
            alternating
          />
      </v-card>
    </v-window-item>
  </v-window>
</template>