<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n({ useScope: 'global' });

</script>
<template>
    <v-card variant="outlined" class="bg-surface">
        <v-card-item>
          {{ t('common.toCome') }}   
        </v-card-item>
    </v-card>
</template>
