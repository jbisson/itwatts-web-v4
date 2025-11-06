<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from '@/stores/user-profile';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter, useRoute } from 'vue-router';

import config from '@/config/config.json';
import security from '@/security';
import Power from "@/components/itwatts/Power.vue";
import StravaSegment from "@/components/itwatts/strava/StravaSegment.vue";
import RiderList from "@/components/itwatts/teams/RiderList.vue";
import { useTeamStore } from '@/stores/apps/teams';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('teamStrava.pageTitle') });
const usersResult = reactive([] as any);
const router = useRouter();
const route = useRoute();
const breadcrumbs = ref([
  {
    text: '',
    disabled: false,
    to: "#",
  },
  {
    text: t('teamStrava.pageTitle'),
    disabled: true,
  },
]);

const errorAlert = ref();
const warningAlert = ref();
const infoAlert = ref();
const loading = ref();
const searchValue = ref();
const errorOccured = ref(false);

const powerDialogVisible = ref(false);
const powerDialogUserID = ref();
const powerDialogStravaActivities = reactive([] as any);
const filterOptions = reactive([] as any);

const riderListDialogVisible = ref(false);
const riderListDialogUsers = reactive([] as any);

const range = ref();
const timeRange = ref('months6');
let maxMonths = 0;

const powerDialogRange = ref();
const powerDialogStartDate = ref();
const powerDialogEndDate = ref();
const powerDialogEffortDuration = ref();
const powerDialogName = ref();
const team = ref();
const segmentDialogGender = ref();
const segmentDialogStravaAthleteID = ref();
const segmentDialogUserID = ref();

const segmentDialogVisible = ref(false);
const segmentDialogName = ref();
const segmentDialogStravaTopSegments = reactive([] as any);
const itemsSelected = ref<Item[]>([]);

let allUsersStravaTopSegments = new Map();

const overallHeaders: Header[] = reactive([
  { text: t('common.name'), value: "name", sortable: true },
  { text: 'Total KM', value: "km_total", sortable: true },
  { text: t('teamStrava.virtualKm'), value: "km_virtual", sortable: true },
  { text: 'IRL KM', value: "km_irl", sortable: true },
  { text: 'NB Top10 KOM', value: "top10_koms", sortable: true },
  { text: 'NB Top1 KOM', value: "top1_koms", sortable: true },
  { text: t('teamStrava.nbActivities'), value: "nb_activities", sortable: true },
  { text: t('actions.actions'), value: "analysis", width: 10, sortable: false },
]);

usersResult.value = [];
const scope = 'read,read_all,profile:read_all,profile:write,activity:read_all';

function onLoginRequired() {
  useUserProfile().login_post_back_page = router.currentRoute.value.path;
  console.log('token not valid.');
  router.push({ path: '/itwatts/signin', query: { scope: scope } }); 
}

async function refresh() {
  // console.log('strava refresh');
  if (!security.isTokenValid([])) {
    return onLoginRequired();
  }

  if (!useUserProfile().strava_scope.includes('activity:read_all')) {
    // Don't authorize the user if he doesn't accept the strava conscent
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    console.log(`strava login scope no read_all ${useUserProfile().strava_scope}`);
    router.push({ path: '/itwatts/signin', query: { scope: scope } });
    return;
  }

  loading.value = true;
  errorOccured.value = false;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  maxMonths = (currentYear - 2015) * 12 + currentMonth;
  range.value = [maxMonths - 12, maxMonths];
  powerDialogRange.value = [maxMonths - 12, maxMonths];
    
  try {
    usersResult.value = [];
    if (useTeamStore().myTeams) {
      team.value = useTeamStore().myTeams.find((team: any) => team.name === route.params.teamName);
    } else if (security.isTokenValid(['SUPER_ADMIN']) && useTeamStore().teams) {
      team.value = useTeamStore().teams.find((team: any) => team.name === route.params.teamName);
    }

    if (!team.value || !(team.value.managers.includes(useUserProfile().user_id) ||
      team.value.riders.includes(useUserProfile().user_id) || security.isTokenValid(['SUPER_ADMIN']))) {
      useUserProfile().login_post_back_page = router.currentRoute.value.path;
      router.push({ path: '/itwatts/signin' });
      return;
    }
    breadcrumbs.value[0].text = team.value.display_name;
    
    if (team.value.riders.length > 0) {
      const userResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users?team=${team.value.name}&additionalFields=strava_activities(processed.overall)&sortBy=first_name`, {
        withCredentials: true,
      });
    
      for (const user of userResponse.data.data) {      
        /*allStravaActivities = new Map(userResponse.data.data.map((user: any) => {
          if (user.strava_activities) {
            return [user.id, user.strava_activities.processed.activities]
          }
          return ['', null];
        }));*/
        allUsersStravaTopSegments = new Map(userResponse.data.data.map((user: any) => {
          if (user.strava_activities) {
            return [user.id, user.strava_activities.processed.top_segments]
          }
          return ['', null];
        }));

        if (useUserProfile().user_id === user.id && user.strava_preferences) {
          useUserProfile().strava_preferences.hidden_segments = user.strava_preferences.hidden_segments;
        }
        if (user.strava_login) {
          user.km_total = 0;
          user.km_virtual = 0;
          user.km_irl = 0;
          user.top10_koms = 0;
          user.top1_koms = 0;
          user.nb_activities = 0;

          if (user.strava_activities && user.strava_activities.processed &&
            user.strava_activities.processed.overall && 
            user.strava_activities.processed.overall[timeRange.value]) {            
              user.km_total = user.strava_activities.processed.overall[timeRange.value].total_km;
              user.km_virtual = user.strava_activities.processed.overall[timeRange.value].virtual_km;
              user.km_irl = user.strava_activities.processed.overall[timeRange.value].irl_km;
              user.top10_koms = user.strava_activities.processed.overall[timeRange.value].nb_top_10;
              user.top1_koms = user.strava_activities.processed.overall[timeRange.value].nb_top_1;
              user.nb_activities = user.strava_activities.processed.overall[timeRange.value].nb_activities;
          }

          usersResult.value.push(user);
        }
      }
    }  
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      useUserProfile().login_post_back_page = router.currentRoute.value.path;
      router.push({ path: '/itwatts/signin' });
    }
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`an error occured: ${err} ${err.stack}`);
  }
  loading.value = false;  
}

const openPowerGraph = async (item: any) => {
  try {
    loading.value = true;
    const userResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users/${item.id}?fields=strava_activities(processed.activities)`, {
      withCredentials: true,
    });

    powerDialogName.value = `${item.first_name} ${item.last_name}`;
    powerDialogStravaActivities.value = userResponse.data.strava_activities.processed.activities;
    //console.log(JSON.stringify(Array.from(allStravaActivities.get(item.id)).length));
    powerDialogUserID.value = item.id;
    powerDialogVisible.value = true;
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      useUserProfile().login_post_back_page = router.currentRoute.value.path;
      router.push({ path: '/itwatts/signin' });
    }
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`an error occured: ${err} ${err.stack}`);
  } finally {
    loading.value = false;
  }
}

const openStravaSegmentGraph = async (item: any) => {
  console.log(`strava top segment: ${JSON.stringify(allUsersStravaTopSegments.get(item.id))}`);
  segmentDialogName.value = `${item.first_name} ${item.last_name}`;  
  segmentDialogStravaTopSegments.value = allUsersStravaTopSegments.get(item.id) ? Array.from(allUsersStravaTopSegments.get(item.id)) : [];
  segmentDialogGender.value = item.gender;
  segmentDialogUserID.value = item.id;
  segmentDialogStravaAthleteID.value = item.strava_url ? item.strava_url.replace('https://www.strava.com/athletes/', '') : '';  
  segmentDialogVisible.value = true;
}

function powerDialogDateRangeChanged() {
  powerDialogStartDate.value = `${Math.floor(2015 + powerDialogRange.value[0] / 12)}-${minTwoDigits((powerDialogRange.value[0]%12)+1)}`;
  powerDialogEndDate.value = `${Math.floor(2015 + powerDialogRange.value[1] / 12)}-${minTwoDigits((powerDialogRange.value[1]%12)+1)}`;  
}

function minTwoDigits(n: any) {
  return (n < 10 ? '0' : '') + n;
}

function isAnalysisButtonsDisplayed(id: any) {  
  return useUserProfile().user_id === id || 
    team.value.managers.includes(useUserProfile().user_id) ||
    security.isTokenValid(['SUPER_ADMIN']);
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

function openNewListDialog() {
  riderListDialogUsers.value = itemsSelected.value;
  riderListDialogVisible.value = true;
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
    <v-col cols="12" sm="12" lg="8">
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
        type="error"
        :text="errorAlert"
        v-if="errorAlert"
      ></v-alert>
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="warning"
        :text="warningAlert"
        v-if="warningAlert"
      ></v-alert>
      <v-progress-linear v-if="loading"
        indeterminate
        stream
        color="primary"
      ></v-progress-linear>
    </v-col>
  </v-row> 
  <v-row>
    <v-col cols="12" sm="12" lg="8">
      <v-card>
        <v-card-item :class="'py-4 px-6 text-white bg-primary'" v-if="false">
          <h4 class="text-h6">Strava</h4>
          <template v-slot:append>
            <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" density="comfortable" v-bind="props"></v-btn>
            </template>
            <v-list>
              <v-list-item @click="">
                <v-list-item-title>TODO</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          </template>
        </v-card-item>
        <v-card-text>
          <v-row>
            <v-col>
              <v-chip-group
                selected-class="text-primary"
                filter
                mandatory
                v-model="timeRange"
                @click="refresh()"
              >
              <v-chip value="months6">{{ t('common.6months') }}</v-chip>
              <v-chip value="months12">{{ t('common.1year') }}</v-chip>
              <v-chip value="months36">{{ t('common.3years') }}</v-chip>
              <v-chip value="lifetime">{{ t('common.lifetime') }}</v-chip>
            </v-chip-group>
            </v-col>
          </v-row>
          <RiderList v-if="team" @onFilterChanged="onFilterChanged" :visible="riderListDialogVisible" :teamName="team.name" :users="riderListDialogUsers.value" @handledialog="riderListDialogVisible = false"></RiderList>
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
          <v-row>
            <v-col cols="12">
              <EasyDataTable
                v-model:items-selected="itemsSelected"
                :search-field="['first_name', 'last_name', 'zp_id'] "
                :search-value="searchValue"
                :headers="overallHeaders"
                :items="usersResult.value"
                :filter-options="filterOptions.value"
                alternating
                >
                <template #item-name="{ first_name, last_name, strava_url, id }">
                  <a :href="'/itwatts/user/profile/' + id" target="_blank">{{ first_name }} {{ last_name }}</a>
                  <!--<a :href="strava_url" target="_blank">{{ name }}</a>-->
                </template>
                <template #item-analysis="{ id, first_name, last_name, strava_rides, gender, strava_url }">                
                  <v-btn color="primary" class="mb-1 mt-1" v-if="isAnalysisButtonsDisplayed(id)" @click="openPowerGraph({id, first_name, last_name, strava_rides})" size="x-small">{{  t('common.power') }}</v-btn>
                  <v-btn color="primary" class="mb-1" v-if="isAnalysisButtonsDisplayed(id)" @click="openStravaSegmentGraph({id, first_name, last_name, strava_rides, gender, strava_url})" size="x-small">{{  t('common.segments') }}</v-btn>                
                </template>
              </EasyDataTable>
            <Power :visible="powerDialogVisible" :name="powerDialogName" :stravaActivites="powerDialogStravaActivities" @handledialog="powerDialogVisible = false" :userID="powerDialogUserID" @loginRequired="onLoginRequired()"></Power>
            <StravaSegment :visible="segmentDialogVisible" :name="segmentDialogName" :userStravaTopSegments="segmentDialogStravaTopSegments" @handledialog="segmentDialogVisible = false" :gender="segmentDialogGender" :userID="segmentDialogUserID" :stravaAthleteID="segmentDialogStravaAthleteID" @loginRequired="onLoginRequired()"></StravaSegment>          
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>  
  </v-row>
</template>
