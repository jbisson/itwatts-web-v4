<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import axios from 'axios';

// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

import { useUserProfile } from '@/stores/user-profile';
import config from "@/config/config.json";
import security from "@/security";
import { useTeamStore } from '@/stores/apps/teams';
import zrlPhoto from '@/assets/images/itwatts/zrl/zrl_2025__2026_round2_schedule.png';
import { rules } from '@/utils/rules';
const { t, locale } = useI18n({ useScope: 'global' });

// theme breadcrumb
const page = ref({ title: t('swatRegisterZrl20252026Round2.pageTitle') });
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatRegisterZrl20252026Round2.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatRegisterZrl20252026Round2.pageTitle'),
    disabled: true,
  },
]);

const pollSaved = ref(false);
const zrlSaved = ref(false);
const hideZrlForm = ref(false);
const isFormValid = ref();
const isFormPollValid = ref();
const myform = ref();
const myformPool = ref();
const othersTeamPlayerNames = ref('');
const userStatus = ref('');

const comments = ref('');
const capInterest = ref('');
const dsInterest = ref('');
const preferedTime6h00 = ref('');
const preferedTime7h00 = ref('');
const preferedTime8h00 = ref('');
const preferedTime12h00 = ref('');
const preferedTime18h30 = ref('');
const preferedTime19h30 = ref('');
const teamChartAcknowledge = ref('');
const primaryZpTeam = ref('5.W.4.T');
const infoAlert = ref();
const errorAlert = ref();
const warningAlert = ref();
const loading = ref(false);

const catPreference = ref([]);
const experience = ref([]);
const choicesThatApply = ref([]);
const nov4Course = ref([]);
const nov11Course = ref([]);
const nov18Course = ref([]);
const nov25Course = ref([]);
const dec2Course = ref([]);
const dec9Course = ref([]);

const userFormResult = ref([]);
const team = ref();

const satisfactionLevel = ref('');
const swatRecommendation = ref('');
const socialActivitiesQuantity = ref('');
const racesQuantity= ref('');
const workoutsQuantity = ref('');
const clubLadderInterest = ref();
const zrlInterest = ref();
const tttInterest = ref();
const ittInterest = ref();
const frrInterest = ref();
const workoutInterest = ref();
const dirtRacingInterest = ref();
const srcInterest = ref();
const echelonRacingInterest = ref();
const championshipInterest = ref();
const scheduleTime = ref('');
const seriesSugestion = ref('');
const integrationLevel = ref('');
const teamAmbiance = ref('');
const teamSpirit = ref('');
const communicationSatisfaction = ref('');
const organizerComments = ref('');
const newThingsToSee = ref('');
const mostImportantThing = ref('');
const moreSuggestions = ref('');

const formName = 'registerZrl20252026Round2';
const pollFormName = '2025poll';

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

  try {    
    loading.value = true;
{{}}
    if (security.isTokenValid(['SWAT_MEMBER_2024_2025'])) {
      const response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/${pollFormName}`,
      {
        withCredentials: true
      });
      if (response.data) {
        pollSaved.value = true;
      }
    } else {
      pollSaved.value = true;
    }

    if (pollSaved.value) {      
      const response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/${formName}`,
      {
        withCredentials: true
      });      
      if (response.data) {
        zrlSaved.value = true;
        hideZrlForm.value = true;
        userFormResult.value = response.data.content;
        bodyContentToForm(JSON.parse(response.data.content));
      }
    }
  } catch (error: any) {    
     if (error.response && error.response.status === 404) {
      // Normal for the form to receive a 404...      
    }
  } finally {    
    loading.value = false;
  }  

  await syncZpProfile();
}

function bodyContentToForm(content : any) {
  teamChartAcknowledge.value = content.teamChartAcknowledge;
  capInterest.value = content.capInterest;
  dsInterest.value = content.dsInterest;
  othersTeamPlayerNames.value = content.othersTeamPlayerNames;
  comments.value = content.comments;
  preferedTime6h00.value = content.preferedTime6h00;
  preferedTime7h00.value = content.preferedTime7h00;
  preferedTime8h00.value = content.preferedTime8h00;
  preferedTime12h00.value = content.preferedTime12h00;
  preferedTime18h30.value = content.preferedTime18h30;
  preferedTime19h30.value = content.preferedTime19h30;
  catPreference.value = content.catPreference || [];
  experience.value = content.experience || [];
  choicesThatApply.value = content.choicesThatApply || [];
  nov4Course.value = content.nov4Course || [];
  nov11Course.value = content.nov11Course || [];
  nov18Course.value = content.nov18Course || [];
  nov25Course.value = content.nov25Course || [];
  dec2Course.value = content.dec2Course || [];
  dec9Course.value = content.dec9Course || [];
  userStatus.value = content.userStatus || [];  
}

function formToBodyContent() {  
  return {
    teamChartAcknowledge: teamChartAcknowledge.value,
    capInterest: capInterest.value,
    dsInterest: dsInterest.value,
    catPreference: catPreference.value,
    experience: experience.value,
    choicesThatApply: choicesThatApply.value,
    nov4Course: nov4Course.value,
    nov11Course: nov11Course.value,
    nov18Course: nov18Course.value,
    nov25Course: nov25Course.value,
    dec2Course: dec2Course.value,
    dec9Course: dec9Course.value,
    othersTeamPlayerNames: othersTeamPlayerNames.value,
    comments: comments.value,
    userStatus: userStatus.value,
    preferedTime6h00: preferedTime6h00.value,
    preferedTime7h00: preferedTime7h00.value,
    preferedTime8h00: preferedTime8h00.value,
    preferedTime12h00: preferedTime12h00.value,
    preferedTime18h30: preferedTime18h30.value,
    preferedTime19h30: preferedTime19h30.value,
  }
}

function pollFormToBodyContent() {  
  return {
    satisfactionLevel: satisfactionLevel.value,
    swatRecommendation: swatRecommendation.value,
    socialActivitiesQuantity: socialActivitiesQuantity.value,
    racesQuantity: racesQuantity.value,
    workoutsQuantity: workoutsQuantity.value,
    clubLadderInterest: clubLadderInterest.value,
    zrlInterest: zrlInterest.value,
    tttInterest: tttInterest.value,
    ittInterest: ittInterest.value,
    frrInterest: frrInterest.value,
    workoutInterest: workoutInterest.value,
    srcInterest: srcInterest.value,
    echelonRacingInterest: echelonRacingInterest.value,
    championshipInterest: championshipInterest.value,
    scheduleTime: scheduleTime.value,
    seriesSugestion: seriesSugestion.value,
    integrationLevel: integrationLevel.value,
    teamAmbiance: teamAmbiance.value,
    teamSpirit: teamSpirit.value,
    communicationSatisfaction: communicationSatisfaction.value,
    organizerComments: organizerComments.value,
    newThingsToSee: newThingsToSee.value,
    mostImportantThing: mostImportantThing.value,
    moreSuggestions: moreSuggestions.value,
    dirtRacingInterest: dirtRacingInterest.value,
  }
}

async function syncZpProfile() {
  try {
    loading.value = true;
    const response = await axios.post(`${config.serverApi.publicHostname}/v1/sync/zp?zp_id=${useUserProfile().zp_id}`,
    {
      withCredentials: true
    });
    if (response.data) {
      //primaryZpTeam.value = 'test';
      primaryZpTeam.value = response.data.primary_team_name;
    }
  } catch (ex) {    
    console.log('An error occured during sync/zp: ' + ex);
    errorAlert.value = 'An error occured during sync/zp';
  } finally {
    loading.value = false;
  }  
}

async function submit() {
  myform.value.validate();

  if (isFormValid.value) {
    let response = null;

    loading.value = true;
    try {    
      let response;

      const body = {
        name: formName,
        user_id: useUserProfile().user_id,
        content: JSON.stringify(formToBodyContent())
      }

      if (zrlSaved.value) {
        response = await axios.put(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/${formName}`,
          body, {
            withCredentials: true,
          });
      } else {
        response = await axios.post(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/${formName}`,
          body, {
            withCredentials: true,
        });
      }  
      
      if (response.status === 200 || response.status === 201) {
        infoAlert.value = 'Nous avons bien reçu le tout. Nous allons former les équipes prochainement...!';
        zrlSaved.value = true;
        hideZrlForm.value = true;
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } else {
        errorAlert.value = t('errors.errorOccured');
        zrlSaved.value = false;
      }    
    } catch (error: any) {
      console.log(`Error: ${error}`);
      errorAlert.value = t('errors.errorOccured', [error]);
      zrlSaved.value = false;
    }
    loading.value = false;
  }
  console.log('validate: ' + isFormValid.value);
}

async function submitPoll() {  
  myformPool.value.validate();

  if (isFormPollValid.value) {
    let response = null;

    try {    
      let response;

      const body = {
        name: pollFormName,
        user_id: useUserProfile().user_id,
        content: JSON.stringify(pollFormToBodyContent())
      }

      if (pollSaved.value) {
        response = await axios.put(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/${pollFormName}`,
          body, {
            withCredentials: true,
          });
      } else {
        response = await axios.post(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/${pollFormName}`,
          body, {
            withCredentials: true,
          });
      }
      
      if (response.status === 200 || response.status === 201) {        
        pollSaved.value = true;
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } else {
        errorAlert.value = t('errors.errorOccured');
        pollSaved.value = false;
      }    
    } catch (error: any) {
      console.log(`Error: ${error}`);
      errorAlert.value = t('errors.errorOccured', [error]);
      pollSaved.value = false;
    }
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
    <v-col cols="12">
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
  <v-form ref="myformPool" v-model="isFormPollValid" v-if="!pollSaved">
    <v-row>
      <v-col cols="12">      
          <UiParentCard :title="t('swatRegisterZrl20252026Round2.pageTitle')">
            <h2 class="text-h2">Sondage 2025</h2>
            <p class="my-4 text-body-1 text-10">
              (L'inscription ZRL 2025 se fera après un petit sondage de satisfaction au sein du 5.W.4.T. On aimerait connaitre votre expérience dans le 5.W.4.T pour l'année dernière, votre feedback est très important au succès de l'équipe.
              <br /><br />Une fois complété, veuillez cliquer sur le bouton sauvegarder en bas de page.              
            </p>
          </UiParentCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <UiParentCard title="Expérience générale">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Sur une échelle de 1 à 10, à quel point êtes-vous satisfait(e) de votre expérience globale au sein du 5.W.4.T ?
            </div>
            <v-slider model="satisfactionLevel" :ticks="['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']" :max="10" step="1" color="primary" show-ticks="always" tick-size="1" thumb-label></v-slider>
            <br /><br />
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Recommanderiez-vous l’équipe à d'autres cyclistes ?
            </div>
            <v-radio-group class="mt-4" v-model="swatRecommendation" :rules="[rules().required]">
              <v-radio label="Oui" color="primary" value="yes" ></v-radio>
              <v-radio label="Non" color="primary" value="no" ></v-radio>
              <v-radio label="Peut-être" color="primary" value="maybe" ></v-radio>              
            </v-radio-group>  
        </UiParentCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <UiParentCard title=" Proposition d’événements">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Êtes-vous satisfait(e) de la quantité des activités sociales proposées ?
            </div>
            <v-radio-group class="mt-4" v-model="socialActivitiesQuantity" :rules="[rules().required]">
              <v-radio label="J’aimerais en avoir plus" color="primary" value="more" ></v-radio>
              <v-radio label="Bonne équilibre" color="primary" value="okay" ></v-radio>
              <v-radio label="Un peu trop à mon goût" color="primary" value="tooMuch" ></v-radio>              
            </v-radio-group> 

            <br /><br />
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Êtes-vous satisfait(e) de la quantité des activités de course proposées ?
            </div>
            <v-radio-group class="mt-4" v-model="racesQuantity" :rules="[rules().required]">
              <v-radio label="J’aimerais en avoir plus" color="primary" value="more" ></v-radio>
              <v-radio label="Bonne équilibre" color="primary" value="okay" ></v-radio>
              <v-radio label="Un peu trop à mon goût" color="primary" value="tooMuch" ></v-radio>              
            </v-radio-group>

            <br /><br />
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Êtes-vous satisfait(e) de la quantité des activités de workout proposées ?
            </div>
            <v-radio-group class="mt-4" v-model="workoutsQuantity" :rules="[rules().required]">
              <v-radio label="J’aimerais en avoir plus" color="primary" value="more" ></v-radio>
              <v-radio label="Bonne équilibre" color="primary" value="okay" ></v-radio>
              <v-radio label="Un peu trop à mon goût" color="primary" value="tooMuch" ></v-radio>              
            </v-radio-group>

            <br /><br />
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Quel est votre intérêt pour participer aux événements suggérés et/ou encadrés par l’équipe ? 
            </div>
          <v-row class="align-center">    
          <v-col cols="12" sm="4">
          </v-col>
          <v-col cols="2">
            <b>Pas du tout</b>
          </v-col>
          <v-col cols="2">
            <b>Un peu</b>
          </v-col>
          <v-col cols="2">
            <b>Moyen</b>
          </v-col>
          <v-col cols="2">
            <b>Beaucoup</b>
          </v-col>
        </v-row>
        <v-row class="align-center">          
          <v-col cols="12" sm="4">
            <b>Club Ladder </b><br>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="clubLadderInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="no"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="clubLadderInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="little"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="clubLadderInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="medium"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="clubLadderInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="a_lot"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row class="align-center">
          <v-col cols="12" sm="4">
            <b>Zwift Racing League (ZRL)</b><br>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="zrlInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="no"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="zrlInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="little"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="zrlInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="medium"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="zrlInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="a_lot"></v-radio>
            </v-radio-group>
          </v-col>        
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="4">
            <b>WTRL Team Time Trial (Course contre la montre d'équipe)</b><br>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="tttInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="no"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="tttInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="little"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="tttInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="medium"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="tttInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="a_lot"></v-radio>
            </v-radio-group>
          </v-col>         
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="4">
            <b>ITT (Course contre la montre individuelle)</b><br>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="ittInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="no"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="ittInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="little"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="ittInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="medium"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="ittInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="a_lot"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="4">
            <b>Flamme Rouge Racing (FRR)</b><br>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="frrInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="no"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="frrInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="little"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="frrInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="medium"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="frrInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="a_lot"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="4">
            <b>Workout 5.W.4.T (Printemps 2025)</b><br>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="workoutInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="no"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="workoutInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="little"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="workoutInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="medium"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="workoutInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="a_lot"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="4">
            <b>Dirt Racing (Printemps 2025)</b><br>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="dirtRacingInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="no"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="dirtRacingInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="little"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="dirtRacingInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="medium"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="dirtRacingInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="a_lot"></v-radio>
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="4">
            <b>Sunday Race Club (MyWhoosh)</b><br>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="srcInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="no"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="srcInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="little"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="srcInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="medium"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="srcInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="a_lot"></v-radio>
            </v-radio-group>
          </v-col>       
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="4">
            <b>Echelon Racing (MyWhoosh)</b><br>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="echelonRacingInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="no"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="echelonRacingInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="little"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="echelonRacingInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="medium"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="echelonRacingInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="a_lot"></v-radio>
            </v-radio-group>
          </v-col>        
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="4">
            <b>Championnat Canadien E-cyclisme (MyWhoosh)</b><br>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="championshipInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="no"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="championshipInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="little"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="championshipInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="medium"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="2">
            <v-radio-group hide-details="auto" v-model="championshipInterest" :rules="[rules().required]">
              <v-radio label="" hide-details value="a_lot"></v-radio>
            </v-radio-group>
          </v-col>        
        </v-row>

        <br /><br />
        <div class="text-subtitle-1 text-grey-darken-1 mb-3">
           Les horaires des événements sont-ils adaptés à votre emploi du temps ?
        </div>
        <v-radio-group class="mt-4" v-model="scheduleTime" :rules="[rules().required]">
          <v-radio label="Oui" color="primary" value="yes" ></v-radio>
          <v-radio label="Non" color="primary" value="no" ></v-radio>
        </v-radio-group>

        <br /><br />
        <div class="text-subtitle-1 text-grey-darken-1 mb-3">
           Avez-vous des suggestions de séries/événements?
        </div>
        <v-textarea label="commentaires" hide-details v-model="seriesSugestion"></v-textarea>
        </UiParentCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <UiParentCard title="Communauté et ambiance">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Vous sentez-vous bien intégré(e) au sein de l’équipe ?
            </div>
            <v-radio-group class="mt-4" v-model="integrationLevel" :rules="[rules().required]">
              <v-radio label="Pas du tout" color="primary" value="not_at_all" ></v-radio>
              <v-radio label="Peu" color="primary" value="little" ></v-radio>
              <v-radio label="Moyennement" color="primary" value="medium" ></v-radio>
              <v-radio label="Bien" color="primary" value="good" ></v-radio>
              <v-radio label="Très bien" color="primary" value="very_good" ></v-radio>
            </v-radio-group>  

            <br /><br />
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Comment qualifieriez-vous l’ambiance générale lors des sorties ou discussions en ligne ?
            </div>
            <v-textarea label="commentaires" hide-details v-model="teamAmbiance"></v-textarea>

            <br /><br />
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Avez-vous des suggestions pour renforcer l’esprit de communauté ?
            </div>
            <v-textarea label="commentaires" hide-details v-model="teamSpirit"></v-textarea>
        </UiParentCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <UiParentCard title="Communication et animation">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Êtes-vous satisfait(e) de la communication de l’équipe (emails, réseaux sociaux, serveur Discord, etc.) ?
            </div>
           <v-textarea label="commentaires" hide-details v-model="communicationSatisfaction"></v-textarea> 

            <br /><br />
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Que pensez-vous de l’implication des animateurs/organisateurs ?
            </div>
            <v-textarea label="commentaires" hide-details v-model="organizerComments"></v-textarea>
        </UiParentCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <UiParentCard title="Améliorations et attentes">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
             Qu’aimeriez-vous voir de nouveau dans l’équipe (ex. : challenges, classements, formations, coaching, événements IRL) ?
            </div>
            <v-textarea label="commentaires" hide-details v-model="newThingsToSee"></v-textarea> 

            <br /><br />
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Quel aspect est le plus important à vos yeux afin d’améliorer votre expérience au sein de l’équipe ?
            </div>
            <v-textarea label="commentaires" hide-details v-model="mostImportantThing"></v-textarea>

            <br /><br />
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Avez-vous des suggestions pour améliorer votre expérience au sein de l’équipe ?
            </div>
            <v-textarea label="commentaires" hide-details v-model="moreSuggestions"></v-textarea>
        </UiParentCard>
      </v-col>
    </v-row>
    <v-col cols="12">
      <v-btn color="primary" flat @click="submitPoll" :disabled="!isFormPollValid || loading">Sauvegarder</v-btn>
    </v-col>
  </v-form>
  <v-form ref="myform" v-model="isFormValid" v-if="pollSaved">
    <v-row>
      <v-col cols="12">      
          <UiParentCard :title="t('swatRegisterZrl20252026Round2.pageTitle')">
            <h2 class="text-h2">Zwift Racing League (ZRL)</h2>
            <p class="my-4 text-body-1 text-10">
              La Zwift Racing League (ZRL) est une série de courses en équipe (généralement composée de 6 à 8 coureurs) qui se déroule les mardis à 19h 30 (6 courses au total). La durée du parcours est généralement d'une heure environ. Deux types de courses (en fonction de la semaine) est disponible: course à points et course en contre-la-montre d'équipe (TTT). Chaque coureur accumule une série de points individuels en fonction de la rapidité et des segments de la course et l'addition des points de chaque coureur donne le résultat d'équipe. C'est une super belle activité d'équipe et surtout, super FUN!

              <br><br>
              Faites-nous connaître votre intérêt pour la participation à la Zwift Racing League (ZRL) débutant le 4 novembre et se terminant le 9 décembre 2025 (6 courses total).
              
              <br /><br />Une fois complété, veuillez cliquer sur le bouton sauvegarder en bas de page.</br>
            </p>
            <v-img :src="zrlPhoto"></v-img>
            <div v-if="zrlSaved">
              <p class="my-4 text-body-1 text-10"><br>
                <b>Nous avons bien reçu votre inscription. Si vous désirez modifier l'inscription ZRL, cliquer sur Modifier.</b>
              </p>
              <v-btn color="primary" flat @click="hideZrlForm = false">Modifier...</v-btn>
          </div>
          </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <UiParentCard title="Avez-vous pris connaissance de la charte d'équipe?">
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              La charte de l'équipe 5.W.4.T est disponible: <a href="https://charte.5w4t.com" target="_blank">charte d'équipe 5.W.4.T</a>
            </div>
            <v-radio-group class="mt-4" v-model="teamChartAcknowledge" :rules="[rules().required]">
              <v-radio label="Oui et j'ai pris connaissance de la charte d'équipe" color="primary" value="1" ></v-radio>
            </v-radio-group>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <UiParentCard title="Horaire ZRL">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Quelle heure préférez-vous courser les mardis ?
            </div>
            <v-row class="align-center">      
              <v-col cols="12" sm="2">
                <b>6h 00</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="preferedTime6h00" :rules="[rules().required]">
                <v-radio label="Impossible" color="primary" value="impossible"></v-radio>
                <v-radio label="Possible" color="primary" value="possible"></v-radio>
                <v-radio label="De préférence" color="primary" value="de_preference"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">      
              <v-col cols="12" sm="2">
                <b>7h 00</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="preferedTime7h00" :rules="[rules().required]">
                <v-radio label="Impossible" color="primary" value="impossible"></v-radio>
                <v-radio label="Possible" color="primary" value="possible"></v-radio>
                <v-radio label="De préférence" color="primary" value="de_preference"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">      
              <v-col cols="12" sm="2">
                <b>8h 00</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="preferedTime8h00" :rules="[rules().required]">
                <v-radio label="Impossible" color="primary" value="impossible"></v-radio>
                <v-radio label="Possible" color="primary" value="possible"></v-radio>
                <v-radio label="De préférence" color="primary" value="de_preference"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
            <v-row class="align-center">      
              <v-col cols="12" sm="2">
                <b>Midi (12:00)</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="preferedTime12h00" :rules="[rules().required]">
                <v-radio label="Impossible" color="primary" value="impossible"></v-radio>
                <v-radio label="Possible" color="primary" value="possible"></v-radio>
                <v-radio label="De préférence" color="primary" value="de_preference"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">      
              <v-col cols="12" sm="2">
                <b>18h 30</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="preferedTime18h30" :rules="[rules().required]">
                <v-radio label="Impossible" color="primary" value="impossible"></v-radio>
                <v-radio label="Possible" color="primary" value="possible"></v-radio>
                <v-radio label="De préférence" color="primary" value="de_preference"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">      
              <v-col cols="12" sm="2">
                <b>19h 30</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="preferedTime19h30" :rules="[rules().required]">
                <v-radio label="Impossible" color="primary" value="impossible"></v-radio>
                <v-radio label="Possible" color="primary" value="possible"></v-radio>
                <v-radio label="De préférence" color="primary" value="de_preference"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>       
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="primaryZpTeam !== '5.W.4.T' && pollSaved && !hideZrlForm">
        <UiParentCard title="Status Membre vs Invité">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              <v-icon class="text-24">mdi-alert-outline</v-icon>
              Ton équipe primaire "{{ primaryZpTeam }}" ZwiftPower n'est présentement pas associée à l'équipe 5.W.4.T. Ceci est une exigence pour être membre du 5.W.4.T,
              veuillez le changer afin de bénificier de tous les avantages du membres 5.W.4.T.<br><br>
              Veuillez vous référer à la <a href="https://charte.5w4t.com" target="_blank">charte d'équipe 5.W.4.T</a> afin de connaitre les différences entre status membres vs invité.
              <br><br><v-img src="@/assets/images/itwatts/zwiftpower/make_5w4t_primary_team.png"></v-img>                  
            </div>
            <v-checkbox label="J'accepte le fait que je n'aurrai pas le Jersey du 5.W.4.T ainsi que tous les autres avantages du membres 5.W.4.T et désire m'inscrire en tant qu'invité seulement." hide-details value="guest" v-model="userStatus"></v-checkbox>
            <v-btn color="primary" flat @click="syncZpProfile()" :disabled="loading">Vérifier mon équipe ZwiftPower à nouveau...</v-btn>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <UiParentCard title="Ma préférence de catégorie">
           <v-radio-group hide-details="auto" v-model="catPreference" :rules="[rules().required]">
            <v-radio label="Catégorie A uniquement" hide-details value="cat_a" v-if="useUserProfile().gender !== 'F'"></v-radio>
            <v-radio label="Catégorie B, disponible pour A si nécessaire" hide-details value="cat_b_and_cat_a" v-if="useUserProfile().gender !== 'F'"></v-radio>
            <v-radio label="Catégorie B uniquement" hide-details value="cat_b" v-if="useUserProfile().gender !== 'F'"></v-radio>
            <v-radio label="Catégorie C, disponible pour B si nécessaire" hide-details value="cat_c_and_cat_b" v-if="useUserProfile().gender !== 'F'"></v-radio>            
            <v-radio label="Catégorie C uniquement" hide-details value="cat_c" v-if="useUserProfile().gender !== 'F'"></v-radio>

            <v-radio label="Catégorie A féminin uniquement" hide-details value="cat_af" v-if="useUserProfile().gender === 'F'"></v-radio>
            <v-radio label="Catégorie A féminin, disponible pour B mixte" hide-details value="cat_af_and_cat_b" v-if="useUserProfile().gender === 'F'"></v-radio>
            <v-radio label="Catégorie B féminin uniquement" hide-details value="cat_bf" v-if="useUserProfile().gender === 'F'"></v-radio>
            <v-radio label="Catégorie B féminin, disponible pour C mixte" hide-details value="cat_bf_and_cat_c" v-if="useUserProfile().gender === 'F'"></v-radio>
            <v-radio label="Catégorie C féminin" hide-details value="cat_cf" v-if="useUserProfile().gender === 'F'"></v-radio>
            <v-radio label="Je ne connais pas ma catégorie..." hide-details value="dont_know_my_category"></v-radio>          
           </v-radio-group>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <UiParentCard title="Quelle est votre expérience dans les courses ZRL?">
          <v-checkbox label="J'ai participé à plus de deux saisons ZRL" hide-details value="two_seasons_and_plus" v-model="experience" :rules="[rules().required]"></v-checkbox>
          <v-checkbox label="J'ai participé à au moins une saison ZRL" hide-details value="less_than_one_season" v-model="experience" :rules="[rules().required]"></v-checkbox>
          <v-checkbox label="Je n'ai jamais fait de course ZRL" hide-details value="never_done_zrl_races" v-model="experience" :rules="[rules().required]"></v-checkbox>        
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <UiParentCard title="Cochez tous les choix qui s'appliquent à votre situation">
          <v-checkbox label="Je n'ai jamais fait de Team Time Trial (TTT)" hide-details value="never_did_ttt" v-model="choicesThatApply"></v-checkbox>
          <v-checkbox label="Je n'ai jamais fait de courses avec segment(s) FTS ou FAL. (à cochez si vous ne connaissez pas ces fameux FTS et FAL)" hide-details value="dont_know_fts_fal" v-model="choicesThatApply"></v-checkbox>        
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <UiParentCard title="Veuillez indiquer votre niveau d'intérêt pour chaque rôle de l'équipe? (aucune expérience requise)">
          <p class="my-4 text-body-1 text-10">
          <b>Capitaine d'équipe</b>: Favorise la cohésion entre les membres de son équipe lors de courses de la ZRL et s’assure que tous les coureurs sont prêts à la ligne de départ (inscription WTRL, choix de vélo, chandail d’équipe, rôle spécifique de chaque coureur, etc.).
          <br>
          <br>
          <b>Directeur sportif / Directrice sportive</b>: Participe à la course uniquement sous discord avec les autres coureurs de l'équipe dans le but de donner des conseils techniques, rappels des différents défis et technicalités d'un parcours donné et encourage les différents membres de l'équipe. Il/elle est la personne ressource lors de la course.
        </p>
        <v-row class="align-center">      
          <v-col cols="12" sm="2">
            <b>Capitaine d'équipe</b>
          </v-col>
          <v-col>
            <v-radio-group inline hide-details="auto" v-model="capInterest" :rules="[rules().required]">
              <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
              <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
              <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>        
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row class="align-center">      
          <v-col cols="12" sm="2">
            <b>Directeur sportif</b>
          </v-col>
          <v-col>
            <v-radio-group inline hide-details="auto" v-model="dsInterest" :rules="[rules().required]">
              <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
              <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
              <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>        
            </v-radio-group>
          </v-col>
          </v-row>     
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <UiParentCard title="Vos disponibilités">
          <p class="my-4 text-body-1 text-10">
            Inscrivez vos disponibilités au mieux de vos connaissances.
          <br>
          <br>
          Notez qu'on aimerait bien avoir un/une directeur sportif / directrice sportive à chaque course pour nos équipes les plus fortes de chaque catégorie.
        </p>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
          </v-col>
          <v-col cols="2">
            Disponible
          </v-col>
          <v-col cols="2">
            Non Disponible
          </v-col>
          <v-col cols="2">
            Je ne sais pas
          </v-col>
          <v-col cols="2">
            DS, si nécessaire
          </v-col>
          <v-col cols="2">
            DS, de préférence
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>4 novembre</b><br>TTT
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="available" v-model="nov4Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="not_available" v-model="nov4Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="dont_know" v-model="nov4Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="ds_if_necessary" v-model="nov4Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="ds_preference" v-model="nov4Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>11 novembre</b><br>Course à points
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="available" v-model="nov11Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="not_available" v-model="nov11Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="dont_know" v-model="nov11Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="ds_if_necessary" v-model="nov11Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="ds_preference" v-model="nov11Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>18 novembre</b><br>Course sans segments
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="available" v-model="nov18Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="not_available" v-model="nov18Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="dont_know" v-model="nov18Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="ds_if_necessary" v-model="nov18Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="ds_preference" v-model="nov18Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>25 novembre</b><br>TTT
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="available" v-model="nov25Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="not_available" v-model="nov25Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="dont_know" v-model="nov25Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="ds_if_necessary" v-model="nov25Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="ds_preference" v-model="nov25Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>2 décembre</b><br>Course à points
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="available" v-model="dec2Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="not_available" v-model="dec2Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="dont_know" v-model="dec2Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="ds_if_necessary" v-model="dec2Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="ds_preference" v-model="dec2Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>9 décembre</b><br>Course sans segments
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="available" v-model="dec9Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="not_available" v-model="dec9Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="dont_know" v-model="dec9Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="ds_if_necessary" v-model="dec9Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="ds_preference" v-model="dec9Course" :rules="[rules().required]"></v-checkbox>
          </v-col>
        </v-row>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <UiParentCard title="Coureurs que vous souhaitez avoir dans votre équipe">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              SVP inscrire les noms des coureurs que vous souhaitez avoir dans votre équipe pour la prochaine saison. Veuillez laisser cet espace vide si aucune préférence.
            </div>
            <v-text-field label="Entrez les nom des coureurs" hide-details variant="underlined" v-model="othersTeamPlayerNames"></v-text-field>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <UiParentCard title="Autres commentaires">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Si vous avez des idées, intérêts, suggestions ou commentaires concernant le 5.W.4.T et/ou de la prochaine saison, nous aimerions les connaître. On est  à l'écoute et ouvert à améliorer l'expérience de l'équipe et de nos membres.
            </div>
            <v-textarea label="Autres commentaires" hide-details v-model="comments"></v-textarea>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <v-btn color="primary" flat @click="submit" :disabled="!isFormValid || loading">Sauvegarder</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

