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
import { exportUser, exportZrl20242025Round3Form } from '@/utils/export';
import ZrlSchedule from "@/components/itwatts/ZrlSchedule.vue";

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('adminZrl20242025Round3Registrations.pageTitle') });
const formsResult = reactive([] as any);
const swatUSersMapZpId = reactive([] as any);
const formsResultsMapZpId = reactive([] as any);
const usersExport = ref('');
const searchValue = ref();

const router = useRouter()
const breadcrumbs = ref([
  {
    text: t('adminZrl20242025Round3Registrations.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('adminZrl20242025Round3Registrations.pageTitle'),
    disabled: true,
  },
]);

const overallHeaders: Header[] = reactive([  
  { text: 'Nom', value: "first_name", sortable: true },
  { text: 'Discord', value: "discord", sortable: true },
  { text: 'Genre', value: "genre", sortable: true },
  { text: 'Date', value: "date", sortable: true },
  { text: 'Catégorie', value: "catPreferences", width: 100, sortable: true },
  { text: 'Horaire 12h00', value: "preferedTime12h00", sortable: true },
  { text: 'Horaire 18h30', value: "preferedTime18h30", sortable: true },
  { text: 'Horaire 19h30', value: "preferedTime19h30", sortable: true },
  { text: 'Ds Pref', value: "dsInterest", sortable: true },
  { text: 'Capt Pref', value: "capInterest", sortable: true },
  { text: 'Intérêts courses', value: "raceInterest", sortable: true },
  { text: 'Zp Team', value: "zpProfilePrimaryTeam", sortable: true },  
  { text: 'ZwiftRacingApp vELO', value: "zwiftRacingAppRaceRating", sortable: true },
  { text: 'Zp CP20 watts', value: "zpProfileCP20Watts", sortable: true },
  { text: 'Zp CP20 w/kg', value: "zpProfileCP20wkg", sortable: true },
  { text: 'Zp CP5 w/kg', value: "zpProfileCP5wkg", sortable: true },
]);

formsResult.value = [];

function formatDate(date: any) {
  const dateSplit = date.split('T');
  return dateSplit[0];
}

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ADMIN', 'SWAT_ZRL_ADMIN'];
  if (!security.isTokenValid( rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  try {
    formsResult.value = [];
    
    const swatUsersResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users?groups=swat_2024_2025&additionalFields=zp_profile(profile_stats),zp_profile(bio),zp_profile(processed),zp_profile(last_modified),zp_profile(category),zp_profile(zrs),zp_profile(race_ranking)`, {
      withCredentials: true,
    });
    
    const swatUSersMap: any = new Map(swatUsersResponse.data.data.map((obj: any) => [obj.id, obj]));
    swatUSersMapZpId.value = new Map();
    formsResultsMapZpId.value = new Map();

    const formsResponse = await axios.get(`${config.serverApi.publicHostname}/v1/forms?name=registerZrl20242025Round3`, {
      withCredentials: true,
    });

    usersExport.value = `${exportUser().headers.concat(exportZrl20242025Round3Form().headers).toString()}\n`;
    for (const form of formsResponse.data.data) {
      const formContent = JSON.parse(form.content);
      if (!swatUSersMap.get(form.user_id)) {
        continue;
      }
      swatUSersMapZpId.value.set(swatUSersMap.get(form.user_id).zp_id, swatUSersMap.get(form.user_id));
      const profileStats = swatUSersMap.has(form.user_id) ? swatUSersMap.get(form.user_id).zp_profile.profile_stats : '';
      
      const formObj = 
        {
          zp_id: swatUSersMap.get(form.user_id).zp_id,
          first_name: swatUSersMap.get(form.user_id).first_name,
          last_name: swatUSersMap.get(form.user_id).last_name,
          genre: swatUSersMap.get(form.user_id).gender,
          discord: swatUSersMap.get(form.user_id).discord_profile.globalName,
          zpProfilePrimaryTeam: swatUSersMap.get(form.user_id).zp_profile.primary_team_name,
          zwiftRacingAppRaceRating: swatUSersMap.has(formContent.user_id) && swatUSersMap.get(form.user_id).zwift_racing_app_profile ? Math.round(swatUSersMap.get(form.user_id).zwift_racing_app_profile.race.rating) : '',
          zpProfileCP20Watts: profileStats.w1200,
          zpProfileCP20wkg: profileStats.wkg1200,
          zpProfileCP5wkg: profileStats.wkg300,
          date: formatDate(form.created),
          catPreferences: formContent.catPreferences.join(' '),
          timeInterest: formContent.timeInterest,
          dsInterest: formContent.dsInterest,
          capInterest: formContent.capInterest,
          comments: formContent.comments,
          raceInterest: formContent.raceInterest,
          othersTeamPlayerNames: formContent.othersTeamPlayerNames,
          preferedTime12h00: formContent.preferedTime12h00,
          preferedTime18h30: formContent.preferedTime18h30,
          preferedTime19h30: formContent.preferedTime19h30,
        };
      
      formsResult.value.push(formObj);
      formsResultsMapZpId.value.set(swatUSersMap.get(form.user_id).zp_id, formContent);

      usersExport.value += `${exportUser(swatUSersMap.get(form.user_id)).value.concat(exportZrl20242025Round3Form(formContent).value).toString()}\n`;
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
  const file = new File([universalBOM + usersExport.value], `${dateNow} zrl-2024-2025-ronde3-5w4t.csv`, {
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

  <v-card elevation="10" v-if="security.isTokenValid(['SUPER_ADMIN', 'SWAT_ADMIN'])">
    <div class="pa-5">
      <v-row>
        <v-col cols="12">
          <ZrlSchedule :swatUSersMapZpId="swatUSersMapZpId" :formsResultsMapZpId="formsResultsMapZpId" v-if="swatUSersMapZpId.value && swatUSersMapZpId.value.size > 0"></ZrlSchedule>
         </v-col>       
      </v-row>      
    </div>
  </v-card>
</template>
