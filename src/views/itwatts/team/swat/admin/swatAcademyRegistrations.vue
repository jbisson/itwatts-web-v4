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
import { exportUser } from '@/utils/export';
import Inscriptions from "@/components/itwatts/Inscriptions.vue";
import { useTeamStore } from '@/stores/apps/teams';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('adminSwatAcademyRegistrations.pageTitle') });
const formsResult = reactive([] as any);
const swatUsersMapUserId = reactive([] as any);
const formsResultsMapUserId = reactive([] as any);
const usersExport = ref('');
const searchValue = ref();

const router = useRouter()
const breadcrumbs = ref([
  {
    text: t('adminSwatAcademyRegistrations.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('adminSwatAcademyRegistrations.pageTitle'),
    disabled: true,
  },
]);

const overallHeaders: Header[] = reactive([  
  { text: 'Nom', value: "first_name", sortable: true },
  { text: 'Discord', value: "discord", sortable: true },
  { text: 'Genre', value: "genre", sortable: true },
  { text: 'Date', value: "date", sortable: true },  
  { text: 'Interests', value: "interests", sortable: true },  
  
  { text: 'Lundi', value: "monday", sortable: true },
  { text: 'Mardi', value: "tuesday", sortable: true },
  { text: 'Mercredi', value: "wednesday", sortable: true },
  { text: 'Jeudi', value: "thursday", sortable: true },
  { text: 'Vendredi', value: "friday", sortable: true },
  { text: 'Samedi', value: "saturday", sortable: true },
  { text: 'Dimanche', value: "sunday", sortable: true },  
  { text: 'Commentaires', value: "comments", sortable: true },  
]);

const formName = 'registerAcademy2025-11';
const listName = 'registerAcademy2025-11-list';
const team = ref();
formsResult.value = [];
let forms : any = []
let swatUSersMap = new Map();
let swatUsers: any  = [];
function formatDate(date: any) {
  const dateSplit = date.split('T');
  return dateSplit[0];
}

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_MENTORS'];
  if (!security.isTokenValid( rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  if (useTeamStore().myTeams) {
    team.value = useTeamStore().myTeams.find((team: any) => team.name === 'swat');
  } else if (security.isTokenValid(['SUPER_ADMIN']) && useTeamStore().teams) {
    team.value = useTeamStore().teams.find((team: any) => team.name === 'swat');
  }

  try {
    formsResult.value = [];
    
    const swatUsersResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users?team=swat&additionalFields=zp_profile(profile_stats),zp_profile(bio),zp_profile(processed),zp_profile(last_modified),zp_profile(category),zp_profile(zrs),zp_profile(race_ranking)`, {
      withCredentials: true,
    });
    
    swatUsers = swatUsersResponse.data.data;
    swatUSersMap = new Map(swatUsers.map((obj: any) => [obj.id, obj]));
    swatUsersMapUserId.value = new Map();
    formsResultsMapUserId.value = new Map();

    const formsResponse = await axios.get(`${config.serverApi.publicHostname}/v1/forms?name=${formName}`, {
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
  let usersExport = `${exportUser().headers.toString()}\n`;
  for (const form of forms) {
    const formContent = JSON.parse(form.content);
    if (!userMap.get(form.user_id)) {
      continue;
    }
    swatUsersMapUserId.value.set(form.user_id, userMap.get(form.user_id));    
    
    const formObj = 
      {
        zp_id: userMap.get(form.user_id).zp_id,
        first_name: userMap.get(form.user_id).first_name,
        last_name: userMap.get(form.user_id).last_name,
        genre: userMap.get(form.user_id).gender,
        discord: userMap.get(form.user_id).discord_profile ?
          userMap.get(form.user_id).discord_profile.globalName ||
          userMap.get(form.user_id).discord_profile.displayName: '',
        date: formatDate(form.created),
        comments: formContent.comments,          
        monday: formContent.monday,
        tuesday: formContent.tuesday,
        wednesday: formContent.wednesday,
        thursday: formContent.thursday,
        friday: formContent.friday,
        saturday: formContent.saturday,
        sunday: formContent.sunday,
        interests: formContent.interests,
      };
    
    formsResult.value.push(formObj);
    formsResultsMapUserId.value.set(form.user_id, formContent);

    usersExport += `${exportUser(swatUSersMap.get(form.user_id)).value.toString()}\n`;    
  }
  return usersExport;
}

async function exportForm() {
  const dateNow = new Date().toISOString().split('T')[0];
  const universalBOM = "\uFEFF";
  const file = new File([universalBOM + usersExport.value], `${dateNow} 5w4t-academy.csv`, {
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
  </v-row><br>

  <v-card elevation="10">
    <div class="pa-5">
      <v-row>
        <v-col cols="12">
          <Inscriptions :team="team" :listName="listName" :swatUsersMapUserId="swatUsersMapUserId" :formsResultsMapUserId="formsResultsMapUserId" v-if="swatUsersMapUserId.value && swatUsersMapUserId.value.size > 0"></Inscriptions>
         </v-col>
      </v-row>      
    </div>
  </v-card>
</template>
