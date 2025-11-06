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

const performanceProfileItems = ref([
  {
    date: '2023-12-01',
    type: 'Dual Recording',
    perf1: '240 Watts @5mins',
    validation: 'FERA 2025-05-17',
  },
  {
    date: '2025-02-15',
    type: 'Dual Recording',
    validation: '',
  },
  {
    date: '2025-02-15',
    type: 'Power Passport',
    validation: '',
  },  
  {
    date: '2025-04-01',
    type: 'IRL Segment',
    title: 'Pink sign-to-sign',
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
          <h4 class="text-h4">Performance Profile</h4>
          <br>        
          
          <v-data-table class="no-border" :items="performanceProfileItems"
            :sort-by="[{ key: 'model', order: 'asc' }]" hide-default-footer hide-default-header v-if="false">
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