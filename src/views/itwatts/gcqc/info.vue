<script setup lang="ts">
import { ref } from "vue";
import { useUserProfile } from "../../../stores/user-profile";

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('gcqcInfo.pageTitle') });
const breadcrumbs = ref([
  {
    text: t('gcqcInfo.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('gcqcInfo.pageTitle'),
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
          <h2 class="text-h5">{{ $t('gcqcInfo.pageTitle') }}</h2>
        </div>
        <div class="align-center">
          <h2 class="mb-1">{{ $t('gcqcInfo.what') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">{{ $t('gcqcInfo.whatInfo1') }}            
<br />
          </div>
          <h2 class="mb-1">{{ $t('gcqcInfo.who') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">{{ $t('gcqcInfo.whoInfo') }}</div>
          <h2 class="mb-1">{{ $t('gcqcInfo.when') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">{{ $t('gcqcInfo.whenInfo') }}</div>
          <h2 class="mb-1">{{ $t('gcqcInfo.pointsSystem') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">
            {{ $t('gcqcInfo.pointsSystemInfo') }}
          </div>
          <h2 class="mb-1">{{ $t('gcqcInfo.howToParticipate') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">
            <i18n-t keypath="gcqcInfo.howToParticipateInfo" tag="p" scope="global">
              <a href="https://www.facebook.com/groups/1003278640147612" target="_blank">{{ $t('gcqcInfo.officialGcqcPage') }}</a>
            </i18n-t>            
          </div>
          <h2 class="mb-1">{{ $t('gcqcInfo.questions') }}</h2>
            <i18n-t keypath="gcqcInfo.questionsInfo" tag="p" scope="global">            
              <a href="https://www.facebook.com/groups/1003278640147612" target="_blank">{{ $t('gcqcInfo.officialGcqcPage') }}</a>              
            </i18n-t>          
          <img src="@/assets/images/itwatts/gcqc/reglements.jpg" style="width: 100%" />
        </div>
      </v-card-text>
    </v-card>  
    </v-col>  
  </v-row>
</template>
