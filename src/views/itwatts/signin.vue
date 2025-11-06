<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';

import { useUserProfile } from '@/stores/user-profile';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import config from '@/config/config.json';
import security from "@/security";

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('signin.pageTitle') });
const route = useRoute();
const router = useRouter();
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

async function refresh() {
  if (security.isTokenValid([]) && !route.query.scope) {
    let path = '';
    if (useUserProfile().primary_team) {
      path =  `/itwatts/team/${useUserProfile().primary_team.name}/info`;
    } else {
      path =  `/itwatts/user/profile/${useUserProfile().user_id}`;
    }
    if (path) {
      router.push({ path: path });
    }
  }
}

const scope = route.query.scope ? '?scope=' + route.query.scope : '';
watch(() => [], refresh);
refresh();
</script>

<template>
  <BaseBreadcrumb
    :title="''"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" sm="6" lg="6">      
      <v-card>
        <v-card-text>
          <div v-if="scope">
            {{ t('signin.allowStravaConsent') }} <b>{{ t('signin.giveConcentToContinue') }}</b>
            <br><br>
            <a :href="config.serverApi.publicHostname + '/auth/strava' + scope" class="social-button" id="strava-connect"> <span>{{ t('signin.continueWithStrava') }}</span></a>
          </div>
          <div v-else-if="useUserProfile().login_post_back_page && !scope">
            {{ t('signin.reservedPage') }} <b>{{ t('signin.loginToContinue') }}</b>
            <a :href="config.serverApi.publicHostname + '/auth/strava'" class="social-button" id="strava-connect"> <span>{{ t('signin.withStrava') }}</span></a>
            <br><br>
          </div>
          <div v-else>
            <b>{{ t('signin.loginToContinue') }}</b>
            <a :href="config.serverApi.publicHostname + '/auth/strava?scope=read,read_all,profile:read_all,activity:read_all'" class="social-button" id="strava-connect"> <span>{{ t('signin.withStrava') }}</span></a>
            <br><br>
          </div>
          <!-- 
          <a :href="config.serverApi.publicHostname + '/auth/google'" class="social-button" id="google-connect"> <span>{{ $t('signin.withGoogle') }}</span></a>
          <a :href="config.serverApi.publicHostname + '/auth/facebook'" class="social-button" id="facebook-connect"> <span>{{ $t('signin.withFacebook') }}</span></a><br />
          -->
        </v-card-text>
      </v-card>
    </v-col>  
  </v-row>
</template>
