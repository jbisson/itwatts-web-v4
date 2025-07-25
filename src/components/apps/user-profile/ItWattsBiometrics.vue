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

onUpdated(() => {

});

watch(() => [], refresh);
refresh();

</script>
<template>
  <v-row>
    <v-col>
      <v-card elevation="10">
        <v-card-item>
          <h4 class="text-h4">{{ t('feraBiometricsComponent.biometrics', 0) }}</h4>
          <br>
          <Biometrics :user="props.user" />          
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</template>
