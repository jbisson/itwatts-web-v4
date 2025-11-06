<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from "@/stores/user-profile";

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import CategoryColumn from '@/components/itwatts/CategoryColumnZrl.vue'

import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter } from 'vue-router'

import config from "@/config/config.json";
import security from "@/security";
import { exportUser, export2025PollForm } from '@/utils/export';
import { useTeamStore } from '@/stores/apps/teams';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('admin2025PollRegistrations.pageTitle') });
const team = ref();

const formsResult = reactive([] as any);
const swatUSersMapZpId = reactive([] as any);
const formsResultsMapZpId = reactive([] as any);
const usersExport = ref('');
const searchValue = ref();

const router = useRouter()
const breadcrumbs = ref([
  {
    text: t('admin2025PollRegistrations.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('admin2025PollRegistrations.pageTitle'),
    disabled: true,
  },
]);

const overallHeaders: Header[] = reactive([  
  { text: 'Nom', value: "first_name", sortable: true },
  { text: 'Discord', value: "discord", sortable: true },
  { text: 'Genre', value: "genre", sortable: true },
  { text: 'Date', value: "date", sortable: true }, 
]);

formsResult.value = [];

function formatDate(date: any) {
  const dateSplit = date.split('T');
  return dateSplit[0];
}

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
    security.isTokenValid(['SUPER_ADMIN']))) {    
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  try {
    formsResult.value = [];
    
    const swatUsersResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users?team=swat&additionalFields=zp_profile(profile_stats),zp_profile(bio),zp_profile(processed),zp_profile(last_modified),zp_profile(category),zp_profile(zrs),zp_profile(race_ranking)`, {
      withCredentials: true,
    });
    
    const swatUSersMap: any = new Map(swatUsersResponse.data.data.map((obj: any) => [obj.id, obj]));
    swatUSersMapZpId.value = new Map();
    formsResultsMapZpId.value = new Map();

    const formsResponse = await axios.get(`${config.serverApi.publicHostname}/v1/forms?name=2025poll`, {
      withCredentials: true,
    });

    usersExport.value = `${exportUser().headers.concat(export2025PollForm(null).headers).toString()}\n`;
    for (const form of formsResponse.data.data) {
      const formContent = JSON.parse(form.content);
      if (!swatUSersMap.get(form.user_id)) {
        continue;
      }
      swatUSersMapZpId.value.set(swatUSersMap.get(form.user_id).zp_id, swatUSersMap.get(form.user_id));
            
      const formObj = 
        {
          zp_id: swatUSersMap.get(form.user_id).zp_id,
          first_name: swatUSersMap.get(form.user_id).first_name,
          last_name: swatUSersMap.get(form.user_id).last_name,
          genre: swatUSersMap.get(form.user_id).gender,
          discord: swatUSersMap.get(form.user_id).discord_profile ?
            swatUSersMap.get(form.user_id).discord_profile.globalName ||
            swatUSersMap.get(form.user_id).discord_profile.displayName : '',
          zpProfilePrimaryTeam: swatUSersMap.get(form.user_id).zp_profile.primary_team_name,
          zwiftRacingAppRaceRating: swatUSersMap.has(formContent.user_id) && swatUSersMap.get(form.user_id).zwift_racing_app_profile ? Math.round(swatUSersMap.get(form.user_id).zwift_racing_app_profile.race.rating) : '',
          date: formatDate(form.created),
        };
      
      formsResult.value.push(formObj);
      formsResultsMapZpId.value.set(swatUSersMap.get(form.user_id).zp_id, formContent);

      usersExport.value += `${exportUser(swatUSersMap.get(form.user_id)).value.concat(export2025PollForm(formContent).value).toString()}\n`;
    }    
  } catch (error: any) {
    console.log(`an error occured: ${error} stack: ${error.stack}`);

    if (error.response && error.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log('an error occured: ' + error);
  }  
}

async function exportForm() {
  const dateNow = new Date().toISOString().split('T')[0];
  const universalBOM = "\uFEFF";
  const file = new File([universalBOM + usersExport.value], `${dateNow} sondage 2025-5w4t.csv`, {
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
</template>
