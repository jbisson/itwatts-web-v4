<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import Riders from '@/components/itwatts/teams/Riders.vue';
import Invites from '@/components/itwatts/teams/Invites.vue';
import TeamPhoto from '@/components/itwatts/teams/TeamPhoto.vue';

import { useUserProfile } from '@/stores/user-profile';
import config from '@/config/config.json';
import security from '@/security';
import { useTeamStore } from '@/stores/apps/teams';

const router = useRouter();
const route = useRoute();
const { t } = useI18n({ useScope: 'global' });

const breadcrumbs = ref([
  {
    text: '',
    disabled: false,
    to: "#",
  },
  {
    text: t('teamManage.pageTitle'),
    disabled: true,
  },
]);

const page = ref({ title: t('teamManage.pageTitle') });
const loading = ref(false);
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();
const teamPhotoDialogVisible = ref(false);
const teamPhotoBanner = ref();
const teamPhotoBannerView = ref(false);
const team = ref({});

async function refresh() {  
  if (!security.isTokenValid([])) {
    console.log('Token expired');
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;    
  }

  try {
    loading.value = true;
    await useTeamStore().fetchMyTeams(true);
    if (useTeamStore().myTeams) {
      team.value = useTeamStore().myTeams.find((team: any) => team.name === route.params.teamName);
    } else if (security.isTokenValid(['SUPER_ADMIN']) && useTeamStore().teams) {
      team.value = useTeamStore().teams.find((team: any) => team.name === route.params.teamName);
    }
    //console.log(`team: ${JSON.stringify(team.value)}`);
    // console.log(`userID: ${useUserProfile().user_id}`);

    if (!team.value || !(team.value.managers.includes(useUserProfile().user_id) ||
      team.value.riders.includes(useUserProfile().user_id) || security.isTokenValid(['SUPER_ADMIN']))) {
      useUserProfile().login_post_back_page = router.currentRoute.value.path;
      router.push({ path: '/itwatts/signin' });
      return;
    }
  } catch (err: any) {
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`Error: ${err} stack: ${err.stack}`);
    return;
  } finally {
    loading.value = false;
  }

  breadcrumbs.value[0].text = team.value.display_name;
  try {
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/teams/${team.value.id}/images/banner_team_photo`,
    {
      withCredentials: true
    });
    if (response.data) {
      teamPhotoBanner.value = response.data.file_name_path;
      // console.log(response.data.file_name_path);
    }
  } catch (error: any) {    
    return;  
  }
}

watch(() => [], refresh);
refresh();

</script>
<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
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
    <v-col cols="12">
      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="2">
              <v-label class="font-weight-medium">{{ t('common.teamName') }}</v-label>
            </v-col>
            <v-col cols="12" sm="9">
              <v-label>{{ team.name }}</v-label>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="2">
              <v-label class="font-weight-medium">{{ t('common.displayTeamName') }}</v-label>
            </v-col>
            <v-col cols="12" sm="9">
              <v-label>{{ team.display_name }}</v-label>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="2">
              <v-label class="font-weight-medium">{{ t('common.teamLink') }}</v-label>
            </v-col>
            <v-col cols="12" sm="9">
              <v-label>{{ team.link }}</v-label>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="2">
              <v-label class="font-weight-medium">{{ t('teamPhotoComponent.title') }}</v-label>
            </v-col>
            <v-col cols="12" sm="9">
              <v-btn v-if="!teamPhotoBanner" color="primary" @click="teamPhotoDialogVisible = true" size="small">{{ t('actions.add') }}</v-btn>             

              <p v-if="teamPhotoBanner">
                <v-img v-if="teamPhotoBannerView" :src="teamPhotoBanner"></v-img>
                <v-btn v-if="teamPhotoBanner && !teamPhotoBannerView" color="primary" @click="teamPhotoBannerView = true" size="small">{{ t('actions.view') }}</v-btn>

               <br>
               <v-btn v-if="teamPhotoBannerView && teamPhotoBanner" color="primary" @click="teamPhotoDialogVisible = true" size="small">{{ t('actions.edit') }}</v-btn>
              </p>
              <TeamPhoto :visible="teamPhotoDialogVisible" :team="team" @handledialog="teamPhotoDialogVisible = false"/>
             <br>
             
            </v-col>
          </v-row>
          <v-row v-if="team && team.type === 'virtual' && team.zwiftpower_team_id">
            <v-col cols="12" sm="2">
              <v-label class=" font-weight-medium">{{ t('common.zwiftPower') }}</v-label>
            </v-col>
            <v-col cols="12" sm="9">              
                <a target="_blank" :href='"https://zwiftpower.com/team.php?id="+team.zwiftpower_team_id'>https://zwiftpower.com/team.php?id={{team.zwiftpower_team_id}}</a>
            </v-col>
          </v-row>
          <v-row v-if="team && team.type === 'irl' && team.strava_club_id">
            <v-col cols="12" sm="2">
              <v-label class=" font-weight-medium">{{ t('common.strava') }}</v-label>
            </v-col>
            <v-col cols="12" sm="9">              
                <a target="_blank" :href='"https://www.strava.com/clubs/"+team.strava_club_id'>https://www.strava.com/clubs/{{team.strava_club_id}}</a>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" sm="2">
              <v-label class=" font-weight-medium">Team invite link</v-label>
            </v-col>
            <v-col cols="12" sm="9">
              <v-label>{{config.serverWeb.hostname}}/itwatts/accept-team-invite?code={{ team.invite_code }}</v-label>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <Riders :team="team" @onSuccess="(msg) => infoAlert = msg" @onError="(msg) => errorAlert = msg" @onLoading="(loadingVal) => loading = loadingVal"/>          
              <br>
              <Invites :team="team" @onSuccess="(msg) => infoAlert = msg" @onError="(msg) => errorAlert = msg" @onLoading="(loadingVal) => loading = loadingVal"/>          
            </v-col>
          </v-row>          
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  </template>
