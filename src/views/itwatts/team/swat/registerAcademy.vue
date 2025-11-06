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
import banner from '@/assets/images/itwatts/teams/swat/5w4t_academie.png';
import { rules } from '@/utils/rules';
const { t, locale } = useI18n({ useScope: 'global' });

// theme breadcrumb
const page = ref({ title: t('swatRegisterAcademy.pageTitle') });
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatRegisterAcademy.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatRegisterAcademy.pageTitle'),
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

const interests = ref([]);
const comments = ref('');
const racingIqKnowledge = ref('');
const discordIqKnowledge = ref('');
const legitimacyIqKnowledge = ref('');
const monday = ref([]);
const tuesday = ref([]);
const wednesday = ref([]);
const thursday = ref([]);
const friday = ref([]);
const saturday = ref([]);
const sunday = ref([]);

const primaryZpTeam = ref('5.W.4.T');
const infoAlert = ref();
const errorAlert = ref();
const warningAlert = ref();
const loading = ref(false);

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

const formName = 'registerAcademy2025-11';
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
  interests.value = content.interests;
  racingIqKnowledge.value = content.racingIqKnowledge;
  discordIqKnowledge.value = content.discordIqKnowledge;
  legitimacyIqKnowledge.value = content.legitimacyIqKnowledge;
  comments.value = content.comments;
  monday.value = content.monday || [];
  tuesday.value = content.tuesday || [];
  wednesday.value = content.wednesday || [];
  thursday.value = content.thursday || [];
  friday.value = content.friday || [];
  saturday.value = content.saturday || [];
  sunday.value = content.sunday|| [];  
}

function formToBodyContent() {  
  return {
    interests: interests.value,
    racingIqKnowledge: racingIqKnowledge.value,
    discordIqKnowledge: discordIqKnowledge.value,
    legitimacyIqKnowledge: legitimacyIqKnowledge.value,
    comments: comments.value,
    monday: monday.value,
    tuesday: tuesday.value,
    wednesday: wednesday.value,
    thursday: thursday.value,
    friday: friday.value,
    saturday: saturday.value,
    sunday: sunday.value,
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
          <UiParentCard :title="t('swatRegisterAcademy.pageTitle')">
            <h2 class="text-h2">Sondage 2025</h2>
            <p class="my-4 text-body-1 text-10">
              (L'inscription 5.W.4.T Académie se fera après un petit sondage de satisfaction au sein du 5.W.4.T. On aimerait connaitre votre expérience dans le 5.W.4.T pour l'année dernière, votre feedback est très important au succès de l'équipe.
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
          <UiParentCard :title="t('swatRegisterAcademy.pageTitle')">
            <h2 class="text-h2">5.W.4.T Académie</h2>
            <p class="my-4 text-body-1 text-10">
              L’Académie 5.W.4.T est un espace d’apprentissage où nos mentors expérimentés accompagnent les membres de l’équipe pour améliorer leurs compétences en cyclisme virtuel. Que ce soit pour développer votre Racing IQ, maîtriser le Dual Recording ou perfectionner vos techniques de streaming, chaque coureur reçoit des conseils personnalisés pour progresser et maximiser ses performances.
           
              <br /><br />Une fois complété, veuillez cliquer sur le bouton sauvegarder en bas de page.</br>
            </p>
            <v-img :src="banner"></v-img>
            <div v-if="zrlSaved">
              <p class="my-4 text-body-1 text-10"><br>
                <b>Nous avons bien reçu votre inscription. Si vous désirez modifier l'inscription, cliquer sur Modifier.</b>
              </p>
              <v-btn color="primary" flat @click="hideZrlForm = false">Modifier...</v-btn>
          </div>
          </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <UiParentCard title="Veuillez indiquer votre niveau de connaissances sur ces sujets">
          <v-row class="align-center">
            <v-col cols="12" sm="2">
              <b>Racing IQ<br/>(PowerUps, Concept de Draft, Segments FAL/FTS)</b>
            </v-col>
            <v-col>
              <v-radio-group inline hide-details="auto" v-model="racingIqKnowledge" :rules="[rules().required]">
                <v-radio label="Débutant(e)" color="primary" value="beginner"></v-radio>
                <v-radio label="Intermédiaire" color="primary" value="intermediate"></v-radio>
                <v-radio label="Avancé(e)" color="primary" value="advanced"></v-radio>        
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">
            <v-col cols="12" sm="2">
              <b>Discord IQ<br/>(Oû trouver les infos, concept de Rôles, Notifications)</b>
            </v-col>
            <v-col>
              <v-radio-group inline hide-details="auto" v-model="discordIqKnowledge" :rules="[rules().required]">
                <v-radio label="Débutant(e)" color="primary" value="beginner"></v-radio>
                <v-radio label="Intermédiaire" color="primary" value="intermediate"></v-radio>
                <v-radio label="Avancé(e)" color="primary" value="advanced"></v-radio>        
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">
            <v-col cols="12" sm="2">
              <b>Légitimité des performances<br>(poids vs puissance, dual recording)</b>
            </v-col>
            <v-col>
              <v-radio-group inline hide-details="auto" v-model="legitimacyIqKnowledge" :rules="[rules().required]">
                <v-radio label="Débutant(e)" color="primary" value="beginner"></v-radio>
                <v-radio label="Intermédiaire" color="primary" value="intermediate"></v-radio>
                <v-radio label="Avancé(e)" color="primary" value="advanced"></v-radio>        
              </v-radio-group>
            </v-col>
          </v-row>
        </UiParentCard>
      </v-col>

      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <UiParentCard title="Quels sont les sujets que vous aimeriez le plus approfondir ? (Veuillez en sélectionner au maximum 2 ou 3)">
          <v-checkbox label="Racing IQ théorique (PowerUps, Concept de Draft, Segments FAL/FTS)" hide-details value="racing_iq_theorical" v-model="interests" :rules="[rules().required]"></v-checkbox>
          <v-checkbox label="Racing IQ pratique (Participer à une course avec un mentor dans l’oreillette pour coaching)" hide-details value="racing_iq_practical" v-model="interests" :rules="[rules().required]"></v-checkbox>
          <v-checkbox label="Dual Recording" hide-details value="dual_recording" v-model="interests" :rules="[rules().required]"></v-checkbox>
          <v-checkbox label="Streaming (Comment streamer une course sur Twitch)" hide-details value="streaming" v-model="interests" :rules="[rules().required]"></v-checkbox>
          <v-checkbox label="Plateforme MyWhoosh" hide-details value="mywhoosh" v-model="interests" :rules="[rules().required]"></v-checkbox>
          <v-checkbox label="Nutrition" hide-details value="nutrition" v-model="interests" :rules="[rules().required]"></v-checkbox>
          <v-checkbox label="Coaching avec entraîneur privé" hide-details value="coaching" v-model="interests" :rules="[rules().required]"></v-checkbox>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <UiParentCard title="Vos disponibilités">
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
          </v-col>
          <v-col cols="2">
            AM (6-7h)
          </v-col>
          <v-col cols="2">
            AM (8h-9h)
          </v-col>
          <v-col cols="2">
            L'heure du midi
          </v-col>
          <v-col cols="2">
            Après-midi (14-15h)
          </v-col>
          <v-col cols="2">
            Soirée (18h-19h)
          </v-col>          
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>lundi</b><br>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="6h_7h" v-model="monday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="8h_9h" v-model="monday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="12h" v-model="monday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="14h_15h" v-model="monday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="18h_19h" v-model="monday"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>mardi</b><br>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="6h_7h" v-model="tuesday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="8h_9h" v-model="tuesday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="12h" v-model="tuesday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="14h_15h" v-model="tuesday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="18h_19h" v-model="tuesday"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>mercredi</b><br>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="6h_7h" v-model="wednesday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="8h_9h" v-model="wednesday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="12h" v-model="wednesday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="14h_15h" v-model="wednesday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="18h_19h" v-model="wednesday"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>jeudi</b><br>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="6h_7h" v-model="thursday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="8h_9h" v-model="thursday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="12h" v-model="thursday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="14h_15h" v-model="thursday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="18h_19h" v-model="thursday"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>vendredi</b><br>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="6h_7h" v-model="friday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="8h_9h" v-model="friday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="12h" v-model="friday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="14h_15h" v-model="friday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="18h_19h" v-model="friday"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>samedi</b><br>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="6h_7h" v-model="saturday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="8h_9h" v-model="saturday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="12h" v-model="saturday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="14h_15h" v-model="saturday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="18h_19h" v-model="saturday"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>dimanche</b><br>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="6h_7h" v-model="sunday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="8h_9h" v-model="sunday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="12h" v-model="sunday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="14h_15h" v-model="sunday"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details value="18h_19h" v-model="sunday"></v-checkbox>
          </v-col>
        </v-row>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="pollSaved && !hideZrlForm">
        <UiParentCard title="Autres commentaires">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Si vous êtes intéressé(e)s par d’autres types de mentorat ou par d’autres commentaires, veuillez nous en faire part.
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

