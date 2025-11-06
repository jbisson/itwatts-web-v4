<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from '@/stores/user-profile';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter } from 'vue-router';

import config from "@/config/config.json";
import security from "@/security";
import { useTeamStore } from '@/stores/apps/teams';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('swatParticipation.pageTitle') });
const team = ref();
const usersResult = reactive([] as any);
const router = useRouter();
const loading = ref(false);
const errorOccured = ref(false);
const searchValue = ref();

const breadcrumbs = ref([
  {
    text: t('swatParticipation.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatParticipation.pageTitle'),
    disabled: true,
  },
]);

const overallHeaders: Header[] = reactive([
      { text: 'Nom', value: "name", width: 150, sortable: true },
      { text: 'Genre', value: "gender", sortable: true },
      { text: 'Total', value: "total", sortable: true },
      { text: 'ZRL 24-25 ronde2', value: "zrl_2024_season_2", sortable: true },
      { text: 'ZRL 24-25 ronde3', value: "zrl_2024_season_3", sortable: true },
      { text: 'GCQC', value: "gcqc", sortable: true },
      { text: 'FRR Britannia', value: "frr_britannia", sortable: true },
      { text: 'FRR Watopia', value: "frr_watopia", sortable: true },
      { text: 'FRR World', value: "frr_world_tour", sortable: true },
      { text: 'ITT', value: "itt", sortable: true },
      { text: 'TTT', value: "ttt", sortable: true },
      { text: '5.W.4.T workout', value: "swat_workout", sortable: true },       
]);

usersResult.value = [];

async function refresh() {
  if (!security.isTokenValid([])) {
    console.log('Token not valid.');
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  if (useTeamStore().myTeams) {
    team.value = useTeamStore().myTeams.find((team: any) => team.name === 'swat');
  } else if (security.isTokenValid(['SUPER_ADMIN']) && useTeamStore().teams) {
    team.value = useTeamStore().teams.find((team: any) => team.name === 'swat');
  }
  
  if (!team.value || !(team.value.managers.includes(useUserProfile().user_id) ||
    team.value.riders.includes(useUserProfile().user_id) || security.isTokenValid(['SUPER_ADMIN']))) {    
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  interface ResponseData {
    data: any,
  }

  loading.value = true;
  errorOccured.value = false;
  try {
    const start = new Date('2023-09-01T02:00:00Z');
    const response = await axios.get<ResponseData>(`${config.serverApi.publicHostname}/v1/users?groups=swat_2024_2025&zp_profile(events.event_date)=>${start.getTime() / 1000}&additionalFields=zp_profile(events)&sortBy=first_name,last_name`,
    {
      withCredentials: true
    });
    let emailsList = '';
    let emails = 0;

    for (const user of response.data.data) {
      user.total = 0;
      user.zrl_2024_season_2 = 0;
      user.zrl_2024_season_3 = 0;      
      user.gcqc = 0;
      user.frr_britannia = 0;
      user.frr_watopia = 0;
      user.frr_world_tour = 0;
      user.swat_ride = 0;
      user.swat_workout = 0;
      user.ttt = 0;
      user.itt = 0;

      user.name = `${user.first_name} ${user.last_name}`;
      if (user.zp_profile) {
        for (const event of user.zp_profile.events) {
          if (event.event_date*1000 < start.getTime() || event.event_title.indexOf('Group Recon Ride') !== -1 ||
            event.event_date*1000 < new Date('2024-08-01T02:00:00Z').getTime()) {
            continue;
          }
          if (event.event_title.indexOf('Zwift Racing League') !== -1 &&
            event.event_title.indexOf('Zwift Racing League Recon') === -1 &&
            event.event_date*1000 > new Date('2024-11-01T02:00:00Z').getTime()) {
            if (event.event_date*1000 < new Date('2025-01-01T02:00:00Z').getTime()) {
              user.zrl_2024_season_2++;
            } else if (event.event_date*1000 < new Date('2025-02-20T02:00:00Z').getTime()) {
              user.zrl_2024_season_3++;
            }
          } else if (event.event_title.indexOf('La 5.W.4.T. Ride') !== -1 ||
            event.event_title.indexOf('La 5.W.4.T Ride') !== -1) {
            user.swat_ride++;
          } else if (event.event_title.indexOf('FRR') !== -1 &&
            event.event_date*1000 > new Date('2024-10-20T02:00:00Z').getTime()) {
            if (event.event_date*1000 < new Date('2024-12-30T02:00:00Z').getTime()) {
              user.frr_britannia++;
            } else if (event.event_date*1000 < new Date('2025-01-13T02:00:00Z').getTime()) {
              user.frr_watopia++;
            } else if (event.event_date*1000 < new Date('2025-03-04T02:00:00Z').getTime()) {
              if (user.first_name === 'Jonathan') console.log(event.event_title);
              user.frr_world_tour++;
            }            
          } else if (event.event_title.indexOf('La Grosse Course Zwift du Quebec') !== -1) {
            user.gcqc++;
          } else if (event.event_title.indexOf('WTRL Team Time Trial') !== -1) {
            user.ttt++;
          } else if (event.event_title.indexOf('Zwift TT Club Racing') !== -1) {
            user.itt++;
          } else if (event.event_title.indexOf('Les Workouts 5.W.4.T') !== -1) {
            user.swat_workout++;
          }          
        }
        
        user.total = user.zrl_2024_season_2 + user.zrl_2024_season_3 + user.gcqc + user.frr_britannia +
          user.frr_watopia + user.frr_world_tour + user.swat_ride + user.ttt + user.itt + user.swat_workout;
      }
    }    
    usersResult.value = response.data.data;
  } catch (error: any) {
    errorOccured.value = true;
    if (error.response && error.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log('an error occured: ' + error);
  }
  loading.value = false;
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
    <v-col cols="12">
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="error"
        title="Erreur"
        text="Oupss, une erreur est survenue..."
        v-if="errorOccured"
      ></v-alert>
    </v-col>
    <v-col cols="12" sm="12" lg="10">      
    <v-card>
      <v-card-text>
        <div class="d-flex align-center mb-4">
          <h2 class="text-h5">{{ $t('swatParticipation.pageTitle') }}</h2>
        </div>
        <v-col cols="3" sm="3" lg="3">
            <v-text-field
              v-model="searchValue"
              variant="outlined"
              append-inner-icon="mdi-magnify"
              placeholder="Recherche"
              hide-details
              density="compact"
            ></v-text-field>
          </v-col>
        <div class="align-center">
          <v-progress-linear v-if="loading"
              indeterminate
              stream
              color="primary"
            ></v-progress-linear>
          <EasyDataTable
              :search-field="['name', 'zp_id'] "
              :search-value="searchValue"
              :headers="overallHeaders"
              :items="usersResult.value"
              alternating>
              <template #item-name="{ name, id, zp_id }">
                <!--<a :href="'/itwatts/user/profile/' + id">{{ first_name }} {{ last_name }}</a>-->
                <a :href="'https://zwiftpower.com/profile.php?z=' + zp_id" target="_blank">{{ name }}</a>
              </template>
          </EasyDataTable>
        </div>
      </v-card-text>
    </v-card>
    </v-col>  
  </v-row>
</template>
