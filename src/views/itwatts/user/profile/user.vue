<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

// components
import ProfileBanner from '@/components/apps/user-profile/ItWattsProfileBanner.vue';
import IntroCard from '@/components/apps/user-profile/ItWattsIntroCard.vue';
import PhotosCard from '@/components/apps/user-profile/PhotosCard.vue';
import PostListing from '@/components/apps/user-profile/PostListing.vue';
import AddPost from '@/components/apps/user-profile/posts/AddPost.vue';
import ItWattsTodo from '@/components/apps/user-profile/ItWattsTodo.vue';
import ItWattsBiometrics from '@/components/apps/user-profile/ItWattsBiometrics.vue';
import ItWattsEquipments from '@/components/apps/user-profile/ItWattsEquipment.vue';
import ItWattsPerformanceProfile from '@/components/apps/user-profile/ItWattsPerformanceProfile.vue';
import ItWattsNotableAchievements from '@/components/apps/user-profile/ItWattsNotableAchievements.vue';

import { useI18n } from 'vue-i18n';

import config from "@/config/config.json";
import security from "@/security";
import { useUserProfile } from '@/stores/user-profile';

const router = useRouter();

const { t } = useI18n({ useScope: 'global' });

const userID = useRoute().params['userID'];
const page = ref({ title: t('userProfile.title') });
const user = reactive([] as any);

const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();
const breadcrumbs = ref([
  {
    text: t('userProfile.pageCategory'),
    disabled: false,
    href: '#',
    //href: '/itwatts/team/swat/members'
  },
  {
    text: '',
    disabled: false,
    href: '#'
  }
]);

async function refresh() {
  if (!security.isTokenValid([])) {
    router.push({ path: '/itwatts/signin' });
    return;
  }

  interface ResponseData {
    data: any,
  }

  try {
    const response = await axios.get<ResponseData>(`${config.serverApi.publicHostname}/v1/users/${userID}`,
    {
      withCredentials: true
    });
    user.value = response.data;
    breadcrumbs.value[1].text = `${user.value.first_name} ${user.value.last_name}`;

    if (user.value.primary_team_id) {
      const teamResponse = await axios.get<ResponseData>(`${config.serverApi.publicHostname}/v1/teams/${user.value.primary_team_id}`,
      {
        withCredentials: true
      });
      user.value.primary_team = teamResponse.data;

      try {
        const teamPhotoResponse = await axios.get(`${config.serverApi.publicHostname}/v1/teams/${user.value.primary_team_id}/images/banner_team_photo`,
        {
          withCredentials: true
        });
        user.value.primary_team_banner_url = teamPhotoResponse.data.file_name_path;
      } catch (err: any) {
        // noop
      }
    }


    // console.log(JSON.stringify(user.value.strava_login));
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`An error occured: ${err} stack: ${err.stack}`);
  }

  try {
    const profilePhoto = await axios.get<ResponseData>(`${config.serverApi.publicHostname}/v1/users/${userID}/images/profile`,
    {
      withCredentials: true
    });
    //console.log(profilePhoto.data);
    user.value.profile_url = profilePhoto.data.file_name_path;
  }  catch (err: any) {
    // noop
  }
}

watch(() => [], refresh);
refresh();
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
      <v-col cols="12">
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="info"
          title="Succès"
          :text="infoAlert"
          v-if="infoAlert"
        ></v-alert>
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="error"
          title="Erreur"
          :text="errorAlert"
          v-if="errorAlert"
        ></v-alert>
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="warning"
          title="Attention"
          :text="warningAlert"
          v-if="warningAlert"
        ></v-alert><br>
      </v-col>      
    </v-row>
    <ProfileBanner :user="user.value"/>
    <v-row class="mt-4">
      <v-col cols="auto">
        <IntroCard :user="user.value" />
      </v-col>
      <v-col cols="auto">
        <ItWattsBiometrics :user="user.value"/>
      </v-col>
      <v-col cols="auto">
        <ItWattsEquipments :user="user.value"/>
      </v-col>
      <v-col cols="auto">
        <ItWattsNotableAchievements />        
      </v-col>
      <v-col cols="auto">
        <ItWattsPerformanceProfile />
      </v-col>
    </v-row>    
</template>
