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
import { exportUser, exportWTRLZrlForm } from '@/utils/export';
import Schedule from "@/components/itwatts/WTRLTTTSchedule.vue";
import wtrlClasses from '@/assets/images/itwatts/wtrl/classes.png';
import { formatDateToYYYYMMDD, shortDate } from '@/utils/date';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('wtrlTTTRegistrations.pageTitle') });
const formsResult = reactive([] as any);
const swatUsersMapZpId = reactive(new Map());
const formsResultsMapZpId = reactive(new Map());
const usersExport = ref('');
const errorAlert = ref();
const warningAlert = ref();
const infoAlert = ref();
const showWtrlClassesImg = ref(false);
let wtrlEvents = reactive([] as any);

wtrlEvents.value = [];

 /* {  label: '2024-09-26 #284 The Magnificent 8', value: 'registerWTRLTTT2024-09-26' },
  {  label: '2024-10-03 #285 Richmond UCI Worlds', value: 'registerWTRLTTT2024-10-03' },
  {  label: '2024-10-10 #286 Mayan San Remo', value: 'registerWTRLTTT2024-10-10' },
  {  label: '2024-10-17 #287 Suki\'s Playground', value: 'registerWTRLTTT2024-10-17' },
  {  label: '2024-10-24 #288 Out And Back Again', value: 'registerWTRLTTT2024-10-24' },
  {  label: '2024-10-31 #289 Coast Crusher', value: 'registerWTRLTTT2024-10-31' },
  {  label: '2024-11-07 #290 R.G.V.', value: 'registerWTRLTTT2024-11-07' },
  {  label: '2024-11-14 #291 Beach Island Loop', value: 'registerWTRLTTT2024-11-14' },
  {  label: '2024-11-21 #292 Coast to Coast', value: 'registerWTRLTTT2024-11-21' },*/


const pickedEvent = ref();

const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('wtrlTTTRegistrations.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('wtrlTTTRegistrations.pageTitle'),
    disabled: true,
  },
]);


const overallHeaders: Header[] = reactive([  
  { text: 'Nom', value: "first_name", sortable: true },
  { text: 'ZpID', value: "zp_id", sortable: true },
  { text: 'Discord', value: "discord", sortable: true },
  { text: 'Genre', value: "genre", sortable: true },
  { text: 'Date', value: "date", sortable: true },
  { text: 'Review', value: "rating", sortable: true },
  { text: 'Horaire 12h00', value: "preferredTime12h00", sortable: true },
  { text: 'Horaire 18h30', value: "preferredTime18h30", sortable: true },
  { text: 'Horaire 19h30', value: "preferredTime19h30", sortable: true },
  { text: 'Ds Pref', value: "dsInterest", sortable: true },
  { text: 'Capt Pref', value: "capInterest", sortable: true },
  { text: 'Zp 1 year best3 Avg MaxCp20 watts', value: "zp1Yr3AvgMaxW1200", sortable: true },
  { text: 'Zp 1 year best3 Avg MaxCp20 w/kg', value: "zp1Yr3AvgMaxWkg1200", sortable: true },
  { text: 'Zp CP20 watts', value: "zpProfileCP20Watts", sortable: true },  
  { text: 'Zp CP5 w/kg', value: "zpProfileCP5wkg", sortable: true },
]);

formsResult.value = [];

function formatDate(date: any) {
  const dateSplit = date.split('T');
  return dateSplit[0];
}


function getNextThursday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilNextThursday = (4 - dayOfWeek + 7) % 7 || 7; // 4 is Thursday (0-based index)  
    const nextThursday = new Date(today);
    nextThursday.setTime(today.getTime() + daysUntilNextThursday * 1000 * 60 * 60 * 24);    
    return nextThursday;
}

function addLabels() {
  let date = new Date(2024, 8, 26, 5);
  const now = new Date();
  const nextThursday = getNextThursday();
  wtrlEvents.value = [];
  let tttWeekNumber = 284;
  while (date <= nextThursday) {
    console.log(date);
    const dateFormat = formatDateToYYYYMMDD(date);
    wtrlEvents.value.push({  label: `${dateFormat} #${tttWeekNumber}`, value: `registerWTRLTTT${dateFormat}` });
    tttWeekNumber++;

    date.setTime(date.getTime() + 7 * 1000 * 60 * 60 * 24);    
  }
  pickedEvent.value = wtrlEvents.value[wtrlEvents.value.length - 1].value;
}
addLabels();

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ADMIN', 'SWAT_WTRL_TTT_ADMIN'];
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
    // console.log(JSON.stringify(swatUsersResponse.data));

    const swatUSersMap: any = new Map(swatUsersResponse.data.data.map((obj: any) => [obj.id, obj]));
    swatUsersMapZpId.clear();
    formsResultsMapZpId.clear();

    console.log('avant');
    const formsResponse = await axios.get(`${config.serverApi.publicHostname}/v1/forms?name=${pickedEvent.value}`, {
      withCredentials: true,
    });
    console.log('apres');

    // console.log(JSON.stringify(formsResponse.data));
    usersExport.value = `${exportUser().headers.concat(exportWTRLZrlForm().headers).toString()}\n`;
    for (const form of formsResponse.data.data) {
      
      const formContent = JSON.parse(form.content);      
      if (!swatUSersMap.get(form.user_id)) {
        console.log(`userID: ${form.user_id} not included in users call.`);
        continue;
      }
      swatUsersMapZpId.set(swatUSersMap.get(form.user_id).zp_id, swatUSersMap.get(form.user_id));
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
          zp1Yr3AvgMaxW1200: swatUSersMap.get(form.user_id).zp_profile.processed.zp1Yr3AvgMaxW1200,
          zp1Yr3AvgMaxWkg1200: swatUSersMap.get(form.user_id).zp_profile.processed.zp1Yr3AvgMaxWkg1200,
          date: formatDate(form.created),
          timeInterest: formContent.timeInterest,
          dsInterest: formContent.dsInterest,
          capInterest: formContent.capInterest,
          comments: formContent.comments,
          raceInterest: formContent.raceInterest,
          preferredTime12h00: formContent.preferredTime12h00,
          preferredTime18h30: formContent.preferredTime18h30,
          preferredTime19h30: formContent.preferredTime19h30,
          rating: formContent.rating,
        };
      
      formsResult.value.push(formObj);
      formsResultsMapZpId.set(swatUSersMap.get(form.user_id).zp_id, formContent);

      usersExport.value += `${exportUser(swatUSersMap.get(form.user_id)).value.concat(exportWTRLZrlForm(formContent).value).toString()}\n`;
    }
    //swatUsersMapZpId.value = swatUsersMapZpIdTest;
    //formsResultsMapZpId.value = formsResultsMapZpIdTest;
  } catch (err: any) {
    errorAlert.value = `Oups, une erreur est survenu, detail: ${err}`;
    console.log(`an error occured: ${err} stack: ${err.stack}`);

    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
  }  
}

async function exportForm() {
  const dateNow = new Date().toISOString().split('T')[0];
  const universalBOM = "\uFEFF";
  const file = new File([universalBOM + usersExport.value], `${dateNow} inscriptions-wtrl-zrl${pickedEvent.value}.csv`, {
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
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="info"
        title="Succès"
        :text="infoAlert"
        v-if="infoAlert"
      ></v-alert>
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="error"
        title="Erreur"
        :text="errorAlert"
        v-if="errorAlert"
      ></v-alert>
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="warning"
        title="Attention"
        :text="warningAlert"
        v-if="warningAlert"
      ></v-alert>
    </v-col>      
  </v-row>
  <v-row>
    <v-col cols="12">      
      <v-card>
        <v-card-text>
          <div class="align-center">
            <v-radio-group v-model="pickedEvent">
              <v-radio v-on:change="refresh()" v-for="(event, index) in wtrlEvents.value" :label="event.label" :value="event.value" :key="event.value" :disabled="event.disabled"></v-radio>
            </v-radio-group>
            <EasyDataTable
                :headers="overallHeaders"
                :items="formsResult.value"
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
      <v-btn color="primary" flat @click="exportForm()">Export</v-btn>&nbsp;&nbsp;
      <a href="" v-on:click="showWtrlClassesImg = !showWtrlClassesImg" v-on:click.prevent="">Voir classe WTRL</a>
      <br><br>
      <v-img :src="wtrlClasses" v-if="showWtrlClassesImg"></v-img>
    </v-col>
  </v-row><br>

  <v-card elevation="10">
    <div class="pa-5">
      <v-row>
        <v-col cols="12">
          <Schedule :swatUsersMapZpId="swatUsersMapZpId" :formsResultsMapZpId="formsResultsMapZpId" :eventName="pickedEvent"></Schedule>
         </v-col>       
      </v-row>      
    </div>
  </v-card>
</template>
