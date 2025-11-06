<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from "@/stores/user-profile";

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter } from 'vue-router'

import config from "@/config/config.json";
import security from "@/security";
import { exportUser, exportZrl20252026Round2Form } from '@/utils/export';
import ZrlSchedule from "@/components/itwatts/ZrlSchedule.vue";

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('adminZrl20252026Round2Registrations.pageTitle') });
const formsResult = reactive([] as any);
const swatUSersMapZpId = reactive([] as any);
const formsResultsMapZpId = reactive([] as any);
const usersExport = ref('');
const searchValue = ref();

const router = useRouter()
const breadcrumbs = ref([
  {
    text: t('adminZrl20252026Round2Registrations.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('adminZrl20252026Round2Registrations.pageTitle'),
    disabled: true,
  },
]);

const overallHeaders: Header[] = reactive([  
  { text: 'Nom', value: "first_name", sortable: true },
  { text: 'Discord', value: "discord", sortable: true },
  { text: 'Genre', value: "genre", sortable: true },
  { text: 'Date', value: "date", sortable: true },
  { text: 'Catégorie', value: "catPreferences", width: 100, sortable: true },
  { text: 'Horaire 6h00', value: "preferedTime6h00", sortable: true },
  { text: 'Horaire 7h00', value: "preferedTime7h00", sortable: true },
  { text: 'Horaire 8h00', value: "preferedTime8h00", sortable: true },
  { text: 'Horaire 12h00', value: "preferedTime12h00", sortable: true },
  { text: 'Horaire 18h30', value: "preferedTime18h30", sortable: true },
  { text: 'Horaire 19h30', value: "preferedTime19h30", sortable: true },
  { text: 'Ds Pref', value: "dsInterest", sortable: true },
  { text: 'Capt Pref', value: "capInterest", sortable: true },    
  { text: 'Zp CP20 watts', value: "zpProfileCP20Watts", sortable: true },
  { text: 'Zp CP20 w/kg', value: "zpProfileCP20wkg", sortable: true },
  { text: 'Zp CP5 w/kg', value: "zpProfileCP5wkg", sortable: true },
]);

formsResult.value = [];
let forms : any = []
let swatUSersMap = new Map();
let swatUsers: any  = [];
function formatDate(date: any) {
  const dateSplit = date.split('T');
  return dateSplit[0];
}

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ZRL_ADMIN'];
  if (!security.isTokenValid( rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  try {
    formsResult.value = [];
    
    const swatUsersResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users?team=swat&additionalFields=zp_profile(profile_stats),zp_profile(bio),zp_profile(processed),zp_profile(last_modified),zp_profile(category),zp_profile(zrs),zp_profile(race_ranking)`, {
      withCredentials: true,
    });
    
    swatUsers = swatUsersResponse.data.data;
    swatUSersMap = new Map(swatUsers.map((obj: any) => [obj.id, obj]));
    swatUSersMapZpId.value = new Map();
    formsResultsMapZpId.value = new Map();

    const formsResponse = await axios.get(`${config.serverApi.publicHostname}/v1/forms?name=registerZrl20252026Round2`, {
      withCredentials: true,
    });
    forms = formsResponse.data.data;

    usersExport.value = buildExport(swatUSersMap);
  } catch (error: any) {
    console.log(`an error occured: ${error} stack: ${error.stack}`);

    if (error.response && error.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log('an error occured: ' + error);
  }  
}

function buildExport(userMap: any) {
  let usersExport = `${exportUser().headers.concat(exportZrl20252026Round2Form(null).headers).toString()}\n`;
  for (const form of forms) {
    const formContent = JSON.parse(form.content);
    if (!userMap.get(form.user_id)) {
      continue;
    }
    swatUSersMapZpId.value.set(userMap.get(form.user_id).zp_id, userMap.get(form.user_id));
    const profileStats = userMap.has(form.user_id) ? userMap.get(form.user_id).zp_profile.profile_stats : '';
    
    const formObj = 
      {
        zp_id: userMap.get(form.user_id).zp_id,
        first_name: userMap.get(form.user_id).first_name,
        last_name: userMap.get(form.user_id).last_name,
        genre: userMap.get(form.user_id).gender,
        discord: userMap.get(form.user_id).discord_profile ?
          userMap.get(form.user_id).discord_profile.globalName ||
          userMap.get(form.user_id).discord_profile.displayName: '',
        zwiftRacingAppRaceRating: userMap.has(formContent.user_id) && userMap.get(form.user_id).zwift_racing_app_profile ? Math.round(userMap.get(form.user_id).zwift_racing_app_profile.race.rating) : '',
        zpProfileCP20Watts: profileStats.w1200,
        zpProfileCP20wkg: profileStats.wkg1200,
        zpProfileCP5wkg: profileStats.wkg300,
        date: formatDate(form.created),
        catPreferences: formContent.catPreferences ? formContent.catPreferences.join(' ') : formContent.catPreference,
        timeInterest: formContent.timeInterest,
        dsInterest: formContent.dsInterest,
        capInterest: formContent.capInterest,
        comments: formContent.comments,          
        othersTeamPlayerNames: formContent.othersTeamPlayerNames,
        preferedTime6h00: formContent.preferedTime6h00,
        preferedTime7h00: formContent.preferedTime7h00,
        preferedTime8h00: formContent.preferedTime8h00,
        preferedTime12h00: formContent.preferedTime12h00,
        preferedTime18h30: formContent.preferedTime18h30,
        preferedTime19h30: formContent.preferedTime19h30,
      };
    
    formsResult.value.push(formObj);
    formsResultsMapZpId.value.set(swatUSersMap.get(form.user_id).zp_id, formContent);

    usersExport += `${exportUser(swatUSersMap.get(form.user_id)).value.concat(exportZrl20252026Round2Form(formContent).value).toString()}\n`;    
  }
  return usersExport;
}

async function exportForm() {
  const dateNow = new Date().toISOString().split('T')[0];
  const universalBOM = "\uFEFF";
  const file = new File([universalBOM + usersExport.value], `${dateNow} zrl-2025-2026-ronde2-5w4t.csv`, {
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

function onExportTeam(team: any) {
  const riderMap = new Map();
  const teamRidersIds = team.riders.map((rider: any) => rider.id);

  const swatUserZpMap = new Map(swatUsers.filter((user)=> teamRidersIds.includes(user.zp_id)).map((obj: any) => [obj.id, obj]));
  const exports = buildExport(swatUserZpMap);

  const dateNow = new Date().toISOString().split('T')[0];
  const universalBOM = "\uFEFF";
  const file = new File([universalBOM + exports], `${dateNow} zrl-2025-2026-ronde2-5w4t ${team.name}.csv`, {
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

</script>
<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
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
      <v-btn color="primary" flat @click="exportForm()">Export</v-btn>
    </v-col>
  </v-row><br>

  <v-card elevation="10">
    <div class="pa-5">
      <v-row>
        <v-col cols="12">
          <ZrlSchedule :swatUSersMapZpId="swatUSersMapZpId" :formsResultsMapZpId="formsResultsMapZpId" v-if="swatUSersMapZpId.value && swatUSersMapZpId.value.size > 0" @exportTeam="onExportTeam"></ZrlSchedule>
         </v-col>       
      </v-row>      
    </div>
  </v-card>
</template>
