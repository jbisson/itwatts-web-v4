<script setup lang="ts">
import { ref, watch, reactive, onUpdated } from 'vue';
import { useI18n } from 'vue-i18n';

import Biometrics from '@/components/itwatts/fera/Biometrics.vue';

const { t, locale } = useI18n({ useScope: 'global' });

const props = defineProps({
  user: Object,  
});

async function refresh() {  
}

const notableAchievementsItems = ref([
  {
    date: '2024-02-15',
    type: 'Virtual Race',
    title: 'My Whoosh - Sunday Race Club Race',
    position: '🥇',
    validation: 'FERA 2025-05-17',
  },
  {
    date: '2025-02-15',
    type: 'IRL Race',
    title: 'FQSC Chalevoix IRL race',
    position: '🥈',
    validation: '',
  },
  {
    date: '2025-02-15',
    type: 'IRL Segment',
    title: 'IRL Pink Lake Segment ',
    position: '34:34',    
    validation: '',
  },  
  {
    date: '2025-04-01',
    type: 'Title',
    title: 'E-Sport Canadian Champion',
    position: '',    
    validation: 'FERA 2025-05-17',
  }, 
]);

watch(() => [], refresh);
refresh();

</script>
<template>
  <v-row>
    <v-col>
      <v-card elevation="10">
        <v-card-item>
          <h4 class="text-h4">Notable Achievements</h4>
          <br>        
          
          <v-data-table class="no-border" :items="notableAchievementsItems"
            :sort-by="[{ key: 'model', order: 'asc' }]" hide-default-footer hide-default-header>
            <template v-slot:top>
            </template>
            <template v-slot:item.validation="{ value }">

              <v-chip
                v-if="value"
                class="ma-2"
                color="green"
                prepend-icon="mdi-checkbox-marked-circle"
                label
              >{{ value }}
              </v-chip>
            </template>
            <template v-slot:item.date="{ value }">
              <a href="">{{ value }}</a>
            </template>
          </v-data-table><br>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</template>