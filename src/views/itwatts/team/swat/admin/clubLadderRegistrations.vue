<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from "@/stores/user-profile";

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter, useRoute } from 'vue-router'

import config from "@/config/config.json";
import security from "@/security";
import { exportUser, exportClubLadderFormHeadersForm } from '@/utils/export';
import { getVeloCategory } from '@/utils/zwiftRacing';
import { useTeamStore } from '@/stores/apps/teams';
import ClubLadderSchedule from "@/components/itwatts/ClubLadderSchedule.vue";

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('adminClubLadderRegistration.pageTitle') });
const formsResult = reactive([] as any);
const swatUSersMapZpId = reactive([] as any);
const usersExport = ref('');
const errorAlert = ref();
const searchValue = ref();
const formsResultsMapZpId = reactive([] as any);

const router = useRouter();
const route = useRoute();
const breadcrumbs = ref([
  {
    text: t('adminClubLadderRegistration.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('adminClubLadderRegistration.pageTitle'),
    disabled: true,
  },
]);

const userStoreProfile = useUserProfile();

const overallHeaders: Header[] = reactive([  
  { text: 'Prénom Nom', value: "first_name", sortable: true },
  { text: 'Genre', value: "genre", sortable: true },
  { text: 'Date', value: "date", sortable: true },
  { text: 'Capt Pref', value: "capInterest", sortable: true },
  { text: 'Dispo Lundi', value: "lundi", sortable: true },
  { text: 'Dispo Mardi', value: "mardi", sortable: true },
  { text: 'Dispo Mercredi', value: "mercredi", sortable: true },
  { text: 'Dispo Jeudi', value: "jeudi", sortable: true },
  { text: 'Dispo Vendredi', value: "vendredi", sortable: true },
  { text: 'Dispo Samedi', value: "samedi", sortable: true },
  { text: 'Dispo Dimanche', value: "dimanche", sortable: true },

  { text: 'ZwiftRacingApp vELO', value: "zwiftRacingAppRaceRating", sortable: true },
  { text: 'vELO Cat', value: "zwiftRacingAppRaceRatingCat", sortable: true },
  { text: 'Zp CP20 watts', value: "zpProfileCP20Watts", sortable: true },
  { text: 'Zp CP20 w/kg', value: "zpProfileCP20wkg", sortable: true },
  { text: 'Zp CP5 w/kg', value: "zpProfileCP5wkg", sortable: true },
]);

formsResult.value = [];

function formatDate(date: any) {
  const dateSplit = date.split('T');
  return dateSplit[0];
}

async function refresh(loadDefault = false) {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_CLUB_LADDER_ADMIN', 'SWAT_CLUB_LADDER_CAP'];
  if (!security.isTokenValid( rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }
  errorAlert.value = '';

  try {
    formsResult.value = [];
    
    const swatUsersResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users?team=swat&additionalFields=zp_profile(profile_stats),zp_profile(bio),zp_profile(processed),zp_profile(last_modified),zp_profile(category),zp_profile(zrs),zp_profile(race_ranking)`, {
      withCredentials: true,
    });
    
    console.log('setting it up...');
    const swatUSersMap = new Map(swatUsersResponse.data.data.map((obj: any) => [obj.id, obj]));
    swatUSersMapZpId.value = new Map();
    
    const formsResponse = await axios.get(`${config.serverApi.publicHostname}/v1/forms?name=registerClubLadder2025-10`, {
      withCredentials: true,
    });

    usersExport.value = `${exportUser().headers.concat(exportClubLadderFormHeadersForm().headers).toString()}\n`;
    for (const form of formsResponse.data.data) {
      if (!swatUSersMap.has(form.user_id)) {
        console.log(`UserID: ${form.user_id} is not a member anymore.`);
        continue;
      }
      const formContent = JSON.parse(form.content);
      swatUSersMapZpId.value.set(swatUSersMap.get(form.user_id).zp_id, swatUSersMap.get(form.user_id));
      

      const profileStats = swatUSersMap.has(form.user_id) ? swatUSersMap.get(form.user_id).zp_profile.profile_stats : '';
      
      const formObj = 
        {
          zp_id: swatUSersMap.get(form.user_id).zp_id,
          first_name: swatUSersMap.get(form.user_id).first_name,
          last_name: swatUSersMap.get(form.user_id).last_name,
          genre: swatUSersMap.get(form.user_id).gender,
          zwiftRacingAppRaceRating: swatUSersMap.has(form.user_id) && swatUSersMap.get(form.user_id).zwift_racing_app_profile ? Math.round(swatUSersMap.get(form.user_id).zwift_racing_app_profile.race.rating) : '',
          zwiftRacingAppRaceRatingCat: 0,
          date: formatDate(form.created),
          capInterest: formContent.capInterest,
          comments: formContent.comments,    
          lundi: formContent.lundi,
          mardi: formContent.mardi,
          mercredi: formContent.mercredi,
          jeudi: formContent.jeudi,
          vendredi: formContent.vendredi,
          samedi: formContent.samedi,
          dimanche: formContent.dimanche,
          period: formContent.period,
          frequency: formContent.frequency,
          zpProfileCP20Watts: profileStats.w1200,
          zpProfileCP20wkg: profileStats.wkg1200,
          zpProfileCP5wkg: profileStats.wkg300,
        };
      formObj.zwiftRacingAppRaceRatingCat = getVeloCategory(formObj.zwiftRacingAppRaceRating);
      //formsResultsMapZpId.value.set(swatUSersMap.get(form.user_id).zp_id, formContent);
        
      formsResult.value.push(formObj);
      usersExport.value += `${exportUser(swatUSersMap.get(form.user_id)).value.concat(exportClubLadderFormHeadersForm(formContent).value).toString()}\n`;
    }    
  } catch (err: any) {
    errorAlert.value = `Une erreur est survenue...Detail: ${err}`;
    console.log(`an error occured: ${err} stack: ${err.stack}`);

    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
  }  
}

async function loadDefault() {
  refresh(true);
}

async function exportMembres() {
  const dateNow = new Date().toISOString().split('T')[0];
  const universalBOM = "\uFEFF";
  const file = new File([universalBOM + usersExport.value], `${dateNow} club-ladder-inscriptions-5w4t.csv`, {
    type: 'text/csv',
  })
  const link = document.createElement('a');
  const url = URL.createObjectURL(file);

  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

watch(() => [], refresh);
refresh();

interface TaskType {
    id?: number | any;
    vElo?: number | any;
    name?: string;
    title?: string;
    subtitle?: string;
    assignment?: string;
    availability?: string;
    dsIfRequired?: boolean;
    dsPreference?: boolean;
    cardbg?: string;
    category?: string;
    tasks?: TaskType[];
}

</script>
<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
    <v-row>
    <v-col cols="12">
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="error"
          title="Erreur"
          :text="errorAlert"
          v-if="errorAlert"
        ></v-alert>
    </v-col>
  </v-row>
    <v-col cols="12">      
      <v-card>
        <v-card-text>
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
            <EasyDataTable
                :headers="overallHeaders"
                :items="formsResult.value"
                :search-value="searchValue"
                alternating>
                <template #item-first_name="{ first_name, last_name, id, zp_id }">
                  <a :href="'https://zwiftpower.com/profile.php?z=' + zp_id" target="_blank">{{ first_name }} {{ last_name }}</a>
                </template>
            </EasyDataTable>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
 
    <v-col cols="12">
      <v-btn color="primary" flat @click="exportMembres">Export</v-btn>
    </v-col>
  </v-row>
  <v-row>
      <v-card elevation="10">
      <div class="pa-5">
        <v-row>
          <v-col cols="12">
            <ClubLadderSchedule :swatUSersMapZpId="swatUSersMapZpId" :formsResultsMapZpId="formsResultsMapZpId" v-if="swatUSersMapZpId.value && swatUSersMapZpId.value.size > 0"></ClubLadderSchedule>
          </v-col>       
        </v-row>      
      </div>
    </v-card>
  </v-row>
</template>
