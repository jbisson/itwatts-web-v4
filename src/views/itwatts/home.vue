<script setup lang="ts">
import { ref } from "vue";

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('home.pageTitle') });
const breadcrumbs = ref([
  {
    text: t('home.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('home.pageTitle'),
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
          <div class="my-5 text-subtitle-1 lh-md">{{ $t('home.intro1') }}
            <br /><br />{{ $t('home.intro2') }}
            <br /><br />{{ $t('home.intro3') }}<a href="mailto:info@itwatts.com" target="_blank">nous contactez</a>.
            <br /><br /><img src="@/assets/images/itwatts/itwatts_server.jpg" style="width: 75%" />
          </div>
        </v-card-text>
      </v-card>      
    </v-col>  
  </v-row>
</template>
