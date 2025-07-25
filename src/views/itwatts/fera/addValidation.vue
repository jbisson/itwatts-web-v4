<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import security from "@/security";
import { useRouter } from 'vue-router';
import { useUserProfile } from '@/stores/user-profile';

import Validations from '@/components/itwatts/fera/Validations.vue';

import config from "@/config/config.json";
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('feraAddValidation.pageTitle') });
const router = useRouter();
const tab = ref();
const loading = ref(false);
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();

const privacyConsent = ref();

const breadcrumbs = ref([
  {
    text: t('feraAddValidation.pageCategory'),
    disabled: false,
    to: '#'
  },
  {
    text: t('feraAddValidation.pageTitle'),
    disabled: true
  }
]);

async function refresh() {
  if (!security.isTokenValid([])) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }
}

watch(() => [], refresh);
refresh();
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" sm="12" lg="12">
      <v-row>
        <v-col cols="12">
          <v-progress-linear
            v-if="loading"
            indeterminate
            stream
            color="primary"            
          ></v-progress-linear>
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="info"
          :text="infoAlert"
          v-if="infoAlert"
        ></v-alert>
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="warning"
          :text="warningAlert"
          v-if="warningAlert"
        ></v-alert>
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="error"
          :text="errorAlert"
          v-if="errorAlert"
        ></v-alert>
        </v-col>
      </v-row><br>
      <v-row>
        <v-col cols="12" sm="12">
          <v-card elevation="10" class="px-6">
            
          
      <v-row>
        <v-col cols="12" sm="4">
          <v-card elevation="10" class="mt-6">
            <v-card-item class="text-center">
              <img src='@/assets/images/itwatts/fera/bronze_badge.png' width="200"/>
              <h6 class="text-subtitle-1 text-13 my-4 textSecondary"><br><br><br><br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Equipement
              </h6>
              <v-btn flat color="primary">Select</v-btn>
            </v-card-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card elevation="10" class=" mt-6">
            <v-card-item class="text-center">
              <img src='@/assets/images/itwatts/fera/silver_badge.png' width="200"/>
              <h6 class="text-subtitle-1 text-13 my-4 textSecondary"><br><br><br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Equipement<br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Height + Weight
              </h6>
              <v-btn flat color="primary">Select</v-btn>
            </v-card-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card elevation="10" class=" mt-6">
            <v-card-item class="text-center">
              <img src='@/assets/images/itwatts/fera/gold_badge.png' width="200"/>
              <h6 class="text-subtitle-1 text-13 my-4 textSecondary"><br><br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Equipement<br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Height + Weight<br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Dual Recording
              </h6>
              <v-btn flat color="primary">Select</v-btn>
            </v-card-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card elevation="10" class=" mt-6">
            <v-card-item class="text-center">
              <img src='@/assets/images/itwatts/fera/platinum_badge.png' width="200"/>
              <h6 class="text-subtitle-1 text-13 my-4 textSecondary"><br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Equipement<br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Height + Weight<br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Dual Recording<br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Power Test Video
              </h6>
              <v-btn flat color="primary">Select</v-btn>
            </v-card-item>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card elevation="10" class=" mt-6">
            <v-card-item class="text-center">
              <img src='@/assets/images/itwatts/fera/diamond_badge.png' width="200"/>
              <h6 class="text-subtitle-1 text-13 my-4 textSecondary">
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Equipement<br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Height + Weight<br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Dual Recording<br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Power Test Video<br>
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon>Strava
              </h6>
              <v-btn flat color="primary">Select</v-btn>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>

    </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
