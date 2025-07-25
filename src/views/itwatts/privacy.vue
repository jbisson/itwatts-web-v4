<script setup lang="ts">
import { ref } from "vue";
import { useUserProfile } from "../../stores/user-profile";

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('privacy.pageTitle') });
const breadcrumbs = ref([
  {
    text: t('privacy.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('privacy.pageTitle'),
    disabled: true,
  },
]);

</script>

<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" sm="12" lg="8">      
      <v-card>
        <v-card-text>
          <div class="d-flex align-center mb-4">
            <h2 class="text-h5">{{ $t('privacy.pageTitle') }}</h2>
          </div>
          <div class="align-center">
            <i18n-t tag="p" keypath="privacy.pageBody">
              <template #ab><br /></template>
            </i18n-t>
          </div>
        </v-card-text>
      </v-card>
    </v-col>  
  </v-row>
</template>
