<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from '@/stores/user-profile';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument, FilterOption } from "vue3-easy-data-table";
import { useRouter, useRoute } from 'vue-router';

import config from "@/config/config.json";
import security from "@/security";
import { useTeamStore } from '@/stores/apps/teams';

import zwiftPower from '@/assets/images/itwatts/logos/zwift_power.png';
import strava from '@/assets/images/itwatts/logos/strava.png';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('teamPowerStats.pageTitle') });
const usersResult = reactive([] as any);
const itemsSelected = ref<Item[]>([]);
const zpPreferencesList = reactive([] as any);
const filterOptions = reactive([] as any);
const dialogUsers = reactive([] as any);
const searchValue = ref();
const dialog = ref(false);
const dialogConfirmDeleteList = ref(false);
const isFormValid = ref();
const chip = ref(true);
const dialogListName = ref();
const filterSelection = ref();
const loading = ref(false);
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();
const team = ref();
const powerSource = ref('zwiftPower');
const timeRange = ref('3monthsAgo');

const router = useRouter();
const route = useRoute();
const breadcrumbs = ref([
  {
    text: '',
    disabled: false,
    to: "#",
  },
  {
    text: t('teamPowerStats.pageTitle'),
    disabled: true,
  },
]);

const overallHeaders: Header[] = reactive([
  { text: t('common.name'), width: 150, value: "name", sortable: true },
  { text: 'ZP ID', width: 150, value: "zp_id", sortable: true },
  { text: t('common.gender'), value: "gender", sortable: true },
  { text: t('common.weightKg'), value: "zp_profile.weight", sortable: true },
  { text: t('common.heightCm'), value: "zp_profile.height", sortable: true },
  { text: '15s (w)', value: "zp_profile.w15", sortable: true },
  { text: '15s (w/kg)', value: "zp_profile.wkg15", sortable: true },  
  { text: '1min (w)', value: "zp_profile.w60", sortable: true },
  { text: '1min (w/kg)', value: "zp_profile.wkg60", sortable: true },  
  { text: '5min (w)', value: "zp_profile.w300", sortable: true },
  { text: '5min (w/kg)', value: "zp_profile.wkg300", sortable: true },  
  { text: '20min (w)', value: "zp_profile.w1200", sortable: true },
  { text: '20min (w/kg)', value: "zp_profile.wkg1200", sortable: true },   
]);

const rules = ref({
  required: (value: any) => !!value || t('validations.required'),
});

usersResult.value = [];

async function refresh() {
  if (!security.isTokenValid([])) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  try {
    loading.value = true;
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
 
  interface ResponseData {
    data: any,
  }

  usersResult.value = [];
  zpPreferencesList.value = [];

  try {
    loading.value = true;
    const response = await axios.get<ResponseData>(`${config.serverApi.publicHostname}/v1/users?team=${route.params.teamName}&additionalFields=zp_profile(processed),zp_profile(profile_stats)&sortBy=first_name,last_name`,
    {
      withCredentials: true
    });
    for (const user of response.data.data) {
      user.name = `${user.first_name} ${user.last_name}`;

      if (timeRange.value === '3monthsAgo') {
        user.zp_profile.weight = user.zp_profile.processed.newest_event_weight;
        user.zp_profile.height = user.zp_profile.processed.newest_event_height;
        user.zp_profile.w15 = user.zp_profile.profile_stats.w15;
        user.zp_profile.wkg15 = user.zp_profile.profile_stats.wkg15;
        user.zp_profile.w60 = user.zp_profile.profile_stats.w60;
        user.zp_profile.wkg60 = user.zp_profile.profile_stats.wkg60;
        user.zp_profile.w300 = user.zp_profile.profile_stats.w300;
        user.zp_profile.wkg300 = user.zp_profile.profile_stats.wkg300;
        user.zp_profile.w1200 = user.zp_profile.profile_stats.w1200;
        user.zp_profile.wkg1200 = user.zp_profile.profile_stats.wkg1200;
      } else if (timeRange.value === '1YrAgo' && user.zp_profile.processed.one_year_ago_stats) {
        user.zp_profile.weight = user.zp_profile.processed.one_year_ago_stats.weight;
        user.zp_profile.height = user.zp_profile.processed.one_year_ago_stats.height;
        user.zp_profile.w15 = user.zp_profile.processed.one_year_ago_stats.w15;
        user.zp_profile.wkg15 = user.zp_profile.processed.one_year_ago_stats.wkg15;
        user.zp_profile.w60 = user.zp_profile.processed.one_year_ago_stats.w60;
        user.zp_profile.wkg60 = user.zp_profile.processed.one_year_ago_stats.wkg60;
        user.zp_profile.w300 = user.zp_profile.processed.one_year_ago_stats.w300;
        user.zp_profile.wkg300 = user.zp_profile.processed.one_year_ago_stats.wkg300;
        user.zp_profile.w1200 = user.zp_profile.processed.one_year_ago_stats.w1200;
        user.zp_profile.wkg1200 = user.zp_profile.processed.one_year_ago_stats.wkg1200;
      } else if (timeRange.value === '2YrsAgo' && user.zp_profile.processed.two_years_ago_stats) {
        user.zp_profile.weight = user.zp_profile.processed.two_years_ago_stats.weight;
        user.zp_profile.height = user.zp_profile.processed.two_years_ago_stats.height;
        user.zp_profile.w15 = user.zp_profile.processed.two_years_ago_stats.w15;
        user.zp_profile.wkg15 = user.zp_profile.processed.two_years_ago_stats.wkg15;
        user.zp_profile.w60 = user.zp_profile.processed.two_years_ago_stats.w60;
        user.zp_profile.wkg60 = user.zp_profile.processed.two_years_ago_stats.wkg60;
        user.zp_profile.w300 = user.zp_profile.processed.two_years_ago_stats.w300;
        user.zp_profile.wkg300 = user.zp_profile.processed.two_years_ago_stats.wkg300;
        user.zp_profile.w1200 = user.zp_profile.processed.two_years_ago_stats.w1200;
        user.zp_profile.wkg1200 = user.zp_profile.processed.two_years_ago_stats.wkg1200;
      }

      usersResult.value.push(user);
      
      if (user.zp_preferences && user.id === useUserProfile().user_id) {
        zpPreferencesList.value = user.zp_preferences.my_lists;
      }
    }    
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  } finally {
    loading.value = false;
  }
}

function openNewListDialog() {
  dialogUsers.value = itemsSelected;
  dialog.value = true;
}

async function save() {
  const zp_ids = dialogUsers.value.map((user: any) => user.zp_id);
  
  zpPreferencesList.value.push({
    name: dialogListName.value,
    zp_ids: zp_ids
  });

  await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
  {
    zp_preferences: {
      my_lists: zpPreferencesList.value
    }
  },
  {
    withCredentials: true
  });
  dialog.value = false;
}

function showDialogRemoveList(list: any) {
  dialogListName.value = list.name;
  dialogConfirmDeleteList.value = true;
}

async function deleteList() {
  zpPreferencesList.value = zpPreferencesList.value.filter((list: any) => list.name !== dialogListName.value);
  await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
  {
    zp_preferences: {
      my_lists: zpPreferencesList.value
    }
  },
  {
    withCredentials: true
  });
  dialogConfirmDeleteList.value = false;
}

function filterDataTable() {  
  if (filterSelection.value) {
    filterOptions.value = [{
      field: 'zp_id',
      comparison: 'in',
      criteria: filterSelection.value.zp_ids
      }];
  } else {
    filterOptions.value = [];
    itemsSelected.value = [];
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
    <v-col cols="12" sm="12" lg="12">
      <v-card>
        <v-card-text>          
          <v-row class="d-flex flex-nowrap">
            <v-col cols="10" md="3" sm="6">
              <div
                :class="[
                    'pa-6 d-flex ga-3 align-center cursor-pointer rounded-lg bg-lightinfo',
                    { 'rounded elevation-4' : powerSource === 'zwiftPower'}
                ]"
                @click="powerSource = 'zwiftPower'"
                >
                <div class="d-flex ga-3 align-center">
                  <v-avatar size="38" class="bg-info rounded-md">
                    <img :src="zwiftPower" height="25" />
                  </v-avatar>
                  <div>
                      <h6 class="text-h6 font-weight-medium ">Zwift Power</h6>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col cols="10" md="3" sm="6" v-if="false">
              <div
                :class="[
                    'pa-6 d-flex ga-3 align-center cursor-pointer rounded-lg bg-lightsuccess',
                    { 'rounded elevation-4' : powerSource === 'strava'}
                ]"
                >
                <div class="d-flex ga-3 align-center">
                  <v-avatar size="38" class="bg-success rounded-md">
                      <img :src="strava" height="25" />
                  </v-avatar>
                  <div>
                      <h6 class="text-h6 font-weight-medium ">Strava</h6>
                  </div>
                </div>
              </div>                     
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="5">
              <div class="text-body-1">{{ t('teamPowerStats.statsInfo')}}</div>
              <v-chip-group
                selected-class="text-primary"
                filter
                mandatory
                v-model="timeRange"
                @click="refresh()"
              >
              <v-chip value="3monthsAgo">{{ t('teamPowerStats.3monthsAgo') }}</v-chip>
              <v-chip value="1YrAgo">{{ t('teamPowerStats.1yearAgo') }}</v-chip>
              <v-chip value="2YrsAgo">{{ t('teamPowerStats.3yearsAgo') }}</v-chip>
            </v-chip-group>                        
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">     
              <v-chip-group
                v-model="filterSelection"
                selected-class="text-primary"
                @update:modelValue="filterDataTable"
                column>
                <v-chip  
                  variant="outlined"            
                  v-for="list in zpPreferencesList.value"
                  :key="list"
                  :value="list"
                  filter
                  >
                  {{ list.name }}
                  <template #close>
                    <v-icon icon="mdi-close-circle" @click.stop="showDialogRemoveList(list)" />
                  </template>
                </v-chip>
              </v-chip-group>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6" sm="4" lg="3">
              <v-text-field
                v-model="searchValue"
                variant="outlined"
                append-inner-icon="mdi-magnify"
                :placeholder="t('actions.search')"
                hide-details
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="9" sm="9" lg="9" class="text-sm-right">
              <v-btn v-if="itemsSelected.length > 0" color="primary" @click="openNewListDialog()"><v-icon class="mr-2">mdi-account-multiple-plus</v-icon>{{ t('teamPowerStats.addList') }}</v-btn>
            </v-col>
          </v-row>
          <div class="align-center"><br>
            <EasyDataTable
                v-model:items-selected="itemsSelected"
                :search-field="['name', 'zp_id'] "
                :search-value="searchValue"
                :headers="overallHeaders"
                :items="usersResult.value"
                :filter-options="filterOptions.value"
                alternating
                :theme-color="'#1E88E5'"
                >
                <template #item-name="{ name, id, zp_id }">
                  <!-- <a :href="'/itwatts/user/profile/' + id">{{ first_name }} {{ last_name }}</a>-->
                  <a :href="'https://zwiftpower.com/profile.php?z=' + zp_id" target="_blank">{{ name }}</a>
                </template>
            </EasyDataTable>
            <v-dialog v-model="dialog" max-width="500">
              <v-card>
                <v-form ref="myform" v-model="isFormValid">   
                  <v-card-text>
                    <h4 class="text-h3 mb-4">{{ t('teamPowerStats.addList') }}</h4>
                    <p>
                      <v-text-field
                        v-model="dialogListName"
                        variant="outlined"
                        :placeholder="t('teamPowerStats.nameList')"
                        hide-details
                        density="compact"
                        :rules="[rules.required]"
                      ></v-text-field>
                    </p><br>
                    <h4 class="text-h6 mb-4">{{ t('teamPowerStats.riders') }}</h4>
                    <div class="my-5 text-subtitle-1 lh-md">
                      <span
                        v-for="(user,lineNumber) of dialogUsers.value" 
                        v-bind:key="lineNumber" >
                        - {{ user.first_name }} {{ user.last_name }}<br/>
                      </span><br>
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn variant="tonal" color="error" @click="dialog = false">{{ t('actions.cancel') }}</v-btn>
                    <v-btn variant="flat" color="primary" @click="save" :disabled="!isFormValid">{{ t('actions.save') }}</v-btn>                    
                  </v-card-actions>
                </v-form>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogConfirmDeleteList" max-width="500">
              <v-card>
                <v-card-text class="mb-4">
                  <h4 class="text-h4 mb-5">{{ t('actions.confirm') }}</h4>
                  {{ t('teamPowerStats.areYouSureRemoveList', [dialogListName]) }}
                </v-card-text>                
                <v-card-actions>
                  <v-btn variant="tonal" color="error" @click="dialogConfirmDeleteList = false">{{ t('actions.cancel') }}</v-btn>
                  <v-btn variant="flat" color="primary" @click="deleteList()">{{ t('common.yes') }}</v-btn>                    
                  </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
