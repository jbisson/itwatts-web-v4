<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

import { useUserProfile } from '@/stores/user-profile';
import { useTeamStore } from '@/stores/apps/teams';
import config from '@/config/config.json';
import security from '@/security';
import { useRegionStore } from '@/stores/apps/regions';
import RiderList from "@/components/itwatts/teams/RiderList.vue";

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

const overallHeaders: Header[] = reactive([
  { text: t('common.name'), value: "first_name", sortable: true },
  { text: t('common.location'), value: 'region', sortable: true },
  { text: t('common.gender'), value: 'gender', width: 20, sortable: true },
  { text: t('common.links'), value: 'links', sortable: false },
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
const riders = ref([] as any);
const manageTeamVisible = ref(false);
const searchValue = ref();
const itemsSelected = ref<Item[]>([]);
const usersResult = reactive([] as any);
const filterOptions = reactive([] as any);

const riderListDialogVisible = ref(false);
const riderListDialogUsers = reactive([] as any);

async function refresh() {
  itemsSelected.value = [];
  teamPhotoBanner.value = null;
  usersResult.value = [];
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
        if (user.location && user.location.city) {
          user.region = `${user.location.city} - ${user.location.state}`;          
        } else if (user.strava_profile) {
          if (user.strava_profile.city && user.strava_profile.state) {
            user.region = `${user.strava_profile.city} - ${user.strava_profile.state}`;
          } else if (user.strava_profile.city) {
            user.region = user.strava_profile.city;
          }  else if (user.strava_profile.state) {
            user.region = user.strava_profile.state;
          }
        }
        
        riders.value.push(user);
        usersResult.value.push(user);
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

function openNewListDialog() {
  riderListDialogUsers.value = itemsSelected.value;
  riderListDialogVisible.value = true;
}

function onFilterChanged(filterSelection: any) {
  if (filterSelection) {
    filterOptions.value = [{
      field: 'id',
      comparison: 'in',
      criteria: filterSelection.user_ids
      }];
  } else {
    filterOptions.value = [];
    itemsSelected.value = [];
  }  
}

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
    <v-col>
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
          <RiderList @onFilterChanged="onFilterChanged" :visible="riderListDialogVisible" :teamName="team.name" :users="riderListDialogUsers.value" @handledialog="riderListDialogVisible = false"></RiderList>
          <v-row>
            <v-col cols="6" sm="4" lg="4">
              <v-text-field
                v-model="searchValue"
                variant="outlined"
                append-inner-icon="mdi-magnify"
                :placeholder="t('actions.search')"
                hide-details
                density="compact"
              ></v-text-field><br>
            </v-col>
            <v-col class="text-sm-right">
              <v-btn v-if="itemsSelected.length > 0" color="primary" @click="openNewListDialog()"><v-icon class="mr-2">mdi-account-multiple-plus</v-icon>{{ t('teamPowerStats.addList') }}</v-btn>
            </v-col>
          </v-row> 
          <EasyDataTable
            v-model:items-selected="itemsSelected"
            :search-field="['first_name', 'last_name', 'zp_id'] "
            :search-value="searchValue"
            :headers="overallHeaders"
            :items="usersResult.value"
            :filter-options="filterOptions.value"
            alternating
            >
            <template #item-name="{ name, strava_url, id }">
              <a :href="'/itwatts/user/profile/' + id" target="_blank">{{ name }}</a>
              <!--<a :href="strava_url" target="_blank">{{ name }}</a>-->
            </template>            
            <template #item-first_name="{ first_name, last_name, id }">
              <a :href="'/itwatts/user/profile/' + id">{{ first_name }} {{ last_name }}</a>
            </template>
            <template #item-links="{ zp_id, strava_url, discord_id }">
              <span v-if="strava_url">                
                <a class="text-decoration-none brand-strava" :href="strava_url" target="_blank">
                  <BrandStravaIcon size="21" />
                </a>
              </span>&nbsp;&nbsp;
              <span v-if="zp_id">                
                <a class="text-decoration-none brand-zwiftpower" :href="'https://zwiftpower.com/profile.php?z=' + zp_id" target="_blank">
                  <BrandZwiftIcon size="21" />
                </a>
              </span>&nbsp;&nbsp;
              <span v-if="discord_id">                
                <a class="text-decoration-none brand-discord" :href="'https://discord.com/users/' + discord_id" target="_blank">
                  <BrandDiscordIcon size="21" />
                </a>
              </span>
            </template>
          </EasyDataTable>
                  
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  </template>
