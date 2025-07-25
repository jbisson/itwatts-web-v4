<script setup lang="ts">
  import { toRefs, ref, onMounted, reactive, watch } from "vue";
    import axios from 'axios';
  import config from "@/config/config.json";
  import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';

  const { t, locale } = useI18n({ useScope: 'global' });
  const props = defineProps<{
    stageResults: any
  }>()
  
  const categories = reactive([] as any);
  
  const tabs = ref();
  
  const stageHeaders: Header[] = [
      { text: 'Nom', value: 'name', sortable: true },
      { text: 'FRHC (eGAP)', value: 'eGAPpos', width: 50, sortable: true },
      { text: 'Sprint', value: 'sprintPoints', width: 50, sortable: true },
      { text: 'Polka', value: 'polkaPoints', width: 50, sortable: true },
      { text: 'FIN', value: 'finishPoints', width: 50, sortable: true },
      { text: 'Bonus', value: 'bonusPoints', width: 50, sortable: true },
      { text: 'Effort', value: 'effort', sortable: true },
      { text: 'Pts total', value: 'totalPoints', width: 50, sortable: true },      
    ];

  function refresh() {
    categories.value = ['FRR'];        
  }
 
  refresh();
  watch(() => [props.results], refresh);

</script>

<template>
  <v-card class="auto">
    <v-card-item v-if="props.stageResults">
      <div class="text-subtitle-2">
        L'équipe <b>5.W.4.T</b> a terminé en <b>{{props.stageResults.pos}}ième</b> position à cette étape.
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
      <EasyDataTable v-if="props.stageResults"            
        :headers="stageHeaders"
        :items="props.stageResults.riders"
        alternating
      />    
    </v-card>
  </v-window-item>
</v-window>
</template>