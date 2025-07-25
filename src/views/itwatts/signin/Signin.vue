<script setup lang="ts">
import { ref } from "vue";
import { useUserProfile } from "@/stores/user-profile";

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n'

import config from "@/config/config.json";

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('signin.pageTitle') });
const breadcrumbs = ref([
  {
    text: t('signin.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('signin.pageTitle'),
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
    <v-col cols="12" sm="6" lg="6">      
      <v-card>
        <v-card-text>
          <a :href="config.serverApi.publicHostname + '/auth/strava'" class="social-button" id="strava-connect"> <span>{{ $t('signin.withStrava') }}</span></a>
        </v-card-text>
      </v-card>
    </v-col>  
  </v-row>
</template>
