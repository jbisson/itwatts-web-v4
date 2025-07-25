<script setup lang="ts">
import { ref } from "vue";
import { useUserProfile } from "@/stores/user-profile";
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('ittInfo.pageTitle') });
const breadcrumbs = ref([
  {
    text: t('ittInfo.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('ittInfo.pageTitle'),
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
          <h2 class="text-h5">{{ $t('ittInfo.pageTitle') }}</h2>
        </div>
        <div class="align-center">
          <h2 class="mb-1">{{ $t('ittInfo.what') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">{{ $t('ittInfo.whatInfo1') }}            
          <br />
          </div>
          <h2 class="mb-1">{{ $t('ittInfo.who') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">{{ $t('ittInfo.whoInfo') }}</div>
          <h2 class="mb-1">{{ $t('ittInfo.when') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">{{ $t('ittInfo.whenInfo') }}</div>
          <h2 class="mb-1">{{ $t('ittInfo.pointsSystem') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">
            {{ $t('ittInfo.pointsSystemInfo1') }}
            <br /><br />
            <i18n-t keypath="ittInfo.pointsSystemInfo2" tag="p" scope="global">
              <a href="https://zwifterbikes.web.app/." 
              target="_blank">https://zwifterbikes.web.app/</a>
            </i18n-t>
            <br />{{ $t('ittInfo.pointsSystemInfo3') }}
          </div>
          <h2 class="mb-1">{{ $t('ittInfo.howToParticipate') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">            
            <i18n-t keypath="ittInfo.howToParticipateInfo" tag="p" scope="global">
              <a href="https://zwifthacks.com/app/events/?key=6703e9db5ac91" 
              target="_blank">https://zwifthacks.com/app/events/?key=6703e9db5ac91</a>
            </i18n-t>
          </div>
          <h2 class="mb-1">{{ $t('ittInfo.questions') }}</h2>
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">
            {{ $t('ittInfo.questionsInfo') }}
          </div>          
          <img src="@/assets/images/itwatts/itt/chronos_itt_watts_logo.png" style="width: 75%" />
        </div>
      </v-card-text>
    </v-card>  
    </v-col>  
  </v-row>
</template>
