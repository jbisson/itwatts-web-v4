<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

import { useUserProfile } from '@/stores/user-profile';
import { useTeamStore } from '@/stores/apps/teams';
import config from '@/config/config.json';
import security from '@/security';
import { useRegionStore } from '@/stores/apps/regions';

const { t } = useI18n({ useScope: 'global' });

const breadcrumbs = ref([
  {
    text: '',
    disabled: false,
    to: "#",
  },
  {
    text: t('teamInfo.pageTitle'),
    disabled: true,
  },
]);

const ridersHeaders = ref([
  { title: t('common.name'), key: 'first_name', align: 'start' },
  { title: t('common.region'), key: 'region', align: 'start' },
  { title: t('common.gender'), key: 'gender', width: 20, sortable: true },
  { title: 'Strava', key: 'strava_url', sortable: false },
  { title: t('common.zwiftPower'), key: 'zp_id', sortable: false },  
]);

const page = ref({ title: t('teamInfo.pageTitle') });
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();
const teamPhotoBanner = ref();
const team = ref();
const riders = ref([]);
const manageTeamVisible = ref(false);


async function refresh() {
  teamPhotoBanner.value = null;
  riders.value = [];
  team.value = null;
  manageTeamVisible.value = false;

  if (!security.isTokenValid([])) {
    console.log('Token not valid.');
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });    
  }
  
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

  if (team.value.managers.includes(useUserProfile().user_id) || security.isTokenValid(['SUPER_ADMIN'])) {    
    manageTeamVisible.value = true;
  }

  breadcrumbs.value[0].text = team.value.display_name;
  await useRegionStore().fetchRegions();

  if (team.value.riders && team.value.riders.length > 0) {    
    try {
      const teamUsersResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users?team=${route.params.teamName}`,
      {
        withCredentials: true
      });

      for (let i = 0;i < teamUsersResponse.data.data.length;i++) {
        const user = teamUsersResponse.data.data[i];
        user.region = user.strava_profile.city ? 
          `${useRegionStore().regionsMap.get(user.region)} - ${user.strava_profile.city}` :
          useRegionStore().regionsMap.get(user.region)
        riders.value.push(user);
      }
      //riders.value = teamUsersResponse.data.data;
    } catch (error: any) {
      errorAlert.value = t('errors.errorOccured', [error]);
    }
  }

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

  }  
}

function manageTeam() {
  router.push({ path: `/itwatts/team/${team.value.name}/manage` });  
}

function stravaTeam() {  
  router.push({ path: `/itwatts/team/${team.value.name}/strava` });
}

function powerStats() {  
  router.push({ path: `/itwatts/team/${team.value.name}/power-stats` });
}

watch(() => [], refresh);

watch(() => route.params.teamName, (newValue, oldValue) => {
  refresh();
});

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
          <v-img v-if="teamPhotoBanner" :src="teamPhotoBanner"></v-img>
          <p>
            <br>
            <v-btn color="primary" variant="flat" dark @click="manageTeam()" v-if="manageTeamVisible">{{ t('actions.manage') }}</v-btn>&nbsp;
            <v-btn color="primary" variant="flat" dark @click="stravaTeam()" v-if="manageTeamVisible">Strava</v-btn>&nbsp;
            <v-btn color="primary" variant="flat" dark @click="powerStats()" v-if="manageTeamVisible">{{ t('teamPowerStats.pageTitle') }}</v-btn>
            <br><br>
          </p>
          <v-data-table class="border rounded-md" :headers="ridersHeaders" :items="riders"
            :sort-by="[{ key: 'model', order: 'asc' }]" items-per-page="25" density="compact">                    
            <template v-slot:top>
              <v-toolbar class="bg-lightsecondary" flat>
                <v-toolbar-title>{{ t('teamInfo.riders') }}</v-toolbar-title>
              </v-toolbar>
            </template>
            <template v-slot:item.first_name="{ item }">
              <a :href="'/itwatts/user/profile/' + item.id">{{ item.first_name }} {{ item.last_name }}</a>
            </template>
            <template v-slot:item.zp_id="{ item }">
              <a :href="'https://zwiftpower.com/profile.php?z=' + item.zp_id" target="_blank">{{ item.zp_id }}</a>
            </template>
            <template v-slot:item.strava_url="{ item }">
              <a :href="item.strava_url" target="_blank">{{ item.strava_url }} </a>
            </template>
            <template v-slot:item.region="{ item }">
              {{ item.region }}
            </template>
            
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  </template>
