<script setup lang="ts">
import { ref, watch, reactive, onUpdated } from 'vue';
import { useI18n } from 'vue-i18n';

import Equipment from '@/components/itwatts/fera/Equipment.vue';

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
          <h4 class="text-h4">{{ t('feraEquipmentComponent.equipment', 0) }}</h4>
          <br>
          <Equipment :user="props.user" />
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</template>
