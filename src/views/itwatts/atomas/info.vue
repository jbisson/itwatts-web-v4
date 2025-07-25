<script setup lang="ts">
import { ref } from "vue";
import { useUserProfile } from "../../../stores/user-profile";

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('atomasInfo.pageTitle') });
const breadcrumbs = ref([
  {
    text: t('atomasInfo.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('atomasInfo.pageTitle'),
    disabled: true,
  },
]);

const userStoreProfile = useUserProfile();
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
          <h2 class="text-h5">{{ $t('atomasInfo.pageTitle') }}</h2>
        </div>
        <div class="align-center">
          <h2 class="mb-1">{{ $t('atomasInfo.what') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">{{ $t('atomasInfo.whatInfo1') }}
            <br />{{ $t('atomasInfo.whatInfo2') }}
<br />{{ $t('atomasInfo.whatInfo3') }}
<br />{{ $t('atomasInfo.whatInfo4') }}
<br />{{ $t('atomasInfo.whatInfo5') }}
<br /><br />
<i18n-t keypath="atomasInfo.whatInfo6" tag="p" scope="global">
  <a href="http://marinelli.tv/" target="_blank">{{ $t('atomasInfo.jasminTitch') }}</a>
</i18n-t>
          </div>
          <h2 class="mb-1">{{ $t('atomasInfo.who') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">{{ $t('atomasInfo.whoInfo') }}</div>
          <h2 class="mb-1">{{ $t('atomasInfo.when') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">{{ $t('atomasInfo.whenInfo') }}</div>
          <h2 class="mb-1">{{ $t('atomasInfo.pointsSystem') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">
            {{ $t('atomasInfo.pointsSystemInfo') }}
          </div>
          <h2 class="mb-1">{{ $t('atomasInfo.howToParticipate') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">
            <i18n-t keypath="atomasInfo.howToParticipateInfo" tag="p" scope="global">
              <a href="https://www.facebook.com/Lacourseatomas" target="_blank">{{ $t('atomasInfo.officialAtomasPage') }}</a>
            </i18n-t>
          </div>
          <h2 class="mb-1">{{ $t('atomasInfo.questions') }}</h2>
            <i18n-t keypath="atomasInfo.questionsInfo" tag="p" scope="global">            
              <a href="https://www.facebook.com/Lacourseatomas" target="_blank">{{ $t('atomasInfo.officialAtomasPage') }}</a>
              <a href="https://www.facebook.com/jasmin.marinelli">Jasmin Marinelli</a>
            </i18n-t>          
          <img src="@/assets/images/itwatts/atomas/logo.png" style="width: 100%" />
        </div>
      </v-card-text>
    </v-card>  
    </v-col>  
  </v-row>
</template>
