<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import security from "@/security";
import { useRouter } from 'vue-router';
import { useUserProfile } from '@/stores/user-profile';
import { useTrainerStore } from '@/stores/apps/trainers';

import config from "@/config/config.json";
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { AlertSmallIcon } from 'vue-tabler-icons';

const filePondRef = ref();
const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('feraInfo.pageTitle') });
const router = useRouter();

const breadcrumbs = ref([
  {
    text: t('feraInfo.pageCategory'),
    disabled: false,
    to: '#'
  },
  {
    text: t('feraInfo.pageTitle'),
    disabled: true
  }
]);

const loading = ref(false);
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();

async function refresh() {
  if (!security.isTokenValid([])) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }
}

watch(() => [], refresh);
refresh();

const faqPage = [
  {
    question: t('feraInfo.whatIsFeraQ'),
    answer: t('feraInfo.whatIsFeraA'),
    answer2: t('feraInfo.whatIsFeraA2')
  },
  {
    question: t('feraInfo.howToJoinQ'),
    answer: t('feraInfo.howToJoinA'),
    answer2: t('feraInfo.howToJoinA2'),
    answer3: t('feraInfo.howToJoinA3'),
    answer4: t('feraInfo.howToJoinA4'),
    answer5: t('feraInfo.howToJoinA5'),
  },
  {
    question: t('feraInfo.knowMoreQ'),
    answer: t('feraInfo.knowMoreA'),
  }
];

</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col>
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
  </v-row>
  <v-row>
    <v-col cols="12" sm="12" lg="12">
      <img src="@/assets/images/itwatts/logos/fera.png" />
      <v-card>
        <v-card-text>
          <div class="text-center mb-8">
            <h3 class="text-h3 font-weight-semibold">{{ $t('feraInfo.faq') }}</h3>        
          </div>
          <v-expansion-panels elevation="10" class="rounded-md overflow-hidden" variant="accordion">
            <v-expansion-panel elevation="10" v-for="item in faqPage" :key="item.question">
              <v-expansion-panel-title class="text-h6 py-6 font-weight-semibold">{{ item.question }}</v-expansion-panel-title>
              <v-divider></v-divider>
              <v-expansion-panel-text class="text-subtitle-1 text-10 text-medium-emphasis pt-3 pb-2">
                {{ item.answer }}
                <p v-if="item.answer2"><br>{{ item.answer2 }}</p>
                <p v-if="item.answer3"><br>{{ item.answer3 }}</p>
                <p v-if="item.answer4"><br>{{ item.answer4 }}</p>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
