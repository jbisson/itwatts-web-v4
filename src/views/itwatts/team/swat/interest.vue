<script setup lang="ts">
import axios from 'axios';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import DatePicker from '@/components/forms/form-elements/datetime/DatePicker.vue';

import { useUserProfile } from '@/stores/user-profile';
import config from "@/config/config.json";
import security from "@/security";

const { t, locale } = useI18n({ useScope: 'global' });

// theme breadcrumb
const page = ref({ title: t('swatInterest.pageTitle') });
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatInterest.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatInterest.pageTitle'),
    disabled: true,
  },
]);

const saved = ref();
const isFormValid = ref();
const myform = ref();
const error = ref();
const errorOccured = ref(false);
const loading = ref(false);
const hideForm = ref(false);
const comments = ref('');
const birthday = ref('');
const height = ref('');
const weight = ref('');
const zpID = ref('');
const otherSports = ref('');
const reasonsToJoin = ref('');
const virtualTeam = ref('');
const trainerModel = ref('');
const trainerModelOther = ref('');
const knowSwatMember = ref('');
const teamChartAcknowledge = ref('');
const club = ref('');
const partOfVirtualTeam = ref('');
const partOfIrlTeam = ref('');
const secondaryPowerSourceModel = ref('');
const secondaryPowerSourceModelOther = ref('');
const irlTeam = ref('');
const irlTeamOther = ref('');
const region = ref('');
const regionOther = ref('');
const hoursWorkoutWinter = ref('');
const hoursWorkoutSummer = ref('');
const secondaryPowerSource = ref('');
const email = ref('');
const firstName = ref('');
const lastName = ref('');
const topSwatValue = ref('');
const teamCapitain = ref('');
const organizeCourseSerie = ref('');
const helpShareKnowledge= ref('');
const testingTechTools = ref('');
const swatNames = ref([] as any);
const userFormResult = ref([]);
const preferedEvents = ref([]);
const knowSwatMembersNames = ref([]);
const virtualRacesNotInterested = ref([]);
const virtualRacesParticipation = ref([]);
const virtualRacesNeverParticated = ref([]);
const workoutsInterest = ref([]);
const socialRidesInterest = ref([]);
const tttInterest = ref([]);
const zrlInterest = ref([]);
const stageRacesInterest = ref([]);
const clubLadderInterest = ref([]);
const otherPlatformInterest = ref([]);
const racesOrEvents = ref('');
const integrityValuesAuthenticPerformances = ref([]);
const integrityValuesLowInterestPerformanceValidation = ref([]);
const respectValuesBadLooser = ref([]);
const engagementValuesInvested = ref([]);
const engagementValuesTeamMembershipInterest = ref([]);
const engagementValuesLowEngagementOnly = ref([]);

let clubs = [] as any;
let regions = [] as any;
let trainers = [] as any;
let secondarySources = [] as any;
  
async function refresh() {
  if (!security.isLoggedIn() && !useUserProfile().user_id) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  error.value = '';
  try {
    let response = await axios.get(`${config.serverApi.publicHostname}/v1/lookups/clubs`,
    { withCredentials: true });
    clubs = response.data.data.map((club: any) => {
      return {
        text: club.displayName,
        value: club.name
      };
    });
    clubs.sort((club1: any, club2: any) => { return club1.text.localeCompare(club2.text) });

    response = await axios.get(`${config.serverApi.publicHostname}/v1/lookups/power-sources`,
    { withCredentials: true });
    secondarySources = response.data.data.map((source: any) => {
      return {
        text: source.displayName,
        value: source.name
      };
    });
    secondarySources.sort((secondarySource1: any, secondarySource2: any) => { return secondarySource1.text.localeCompare(secondarySource2.text) });

    response = await axios.get(`${config.serverApi.publicHostname}/v1/lookups/trainers`,
    { withCredentials: true });
    trainers = response.data.data.map((trainer: any) => {
      return {
        text: trainer.displayName,
        value: trainer.name
      };
    });
    trainers.sort((trainer1: any, trainer2: any) => { return trainer1.text.localeCompare(trainer2.text) });

    response = await axios.get(`${config.serverApi.publicHostname}/v1/lookups/regions`,
    { withCredentials: true });
    regions = response.data.data.map((region: any) => {
      return {
        text: region.displayName,
        value: region.name
      };
    });
    regions.sort((region1: any, region2 : any) => { return region1.text.localeCompare(region2.text) });
  } catch (error: any) {
    console.log(`Error on refresh(). ${error} ${error.stack}`);
    error.value = `Oupss, une erreur est survenue...\nDetail: ${error}`;
  }
  

  firstName.value = useUserProfile().first_name;
  lastName.value = useUserProfile().last_name;
  
  swatNames.value = [];
  try {    
    let response = await axios.get(`${config.serverApi.publicHostname}/v1/users?team=swat&fields=first_name,last_name&sortBy=first_name`,
    { withCredentials: true });
    for (let i = 0;i < response.data.data.length;i++) {
      swatNames.value.push(`${response.data.data[i].first_name} ${response.data.data[i].last_name}`);
    }

    response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/interest2024`,
    {
      withCredentials: true
    });
    if (response.data) {      
      userFormResult.value = response.data.content;
      bodyContentToForm(JSON.parse(response.data.content));
      
      hideForm.value = true;
    }    
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      // Normal for the form to receive a 404...
      return;
    }

    console.log(`Error: ${error}`);
    errorOccured.value = true;    
  }
}

const rules = ref({
  required: (value: any) => !!value || t('validations.required'),
  email: (value: any) => {
      const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(value) || t('validations.invalidEmail');
    },
});

function bodyContentToForm(content : any) {
  email.value = content.email;
  preferedEvents.value = content.preferedEvents || [];  
  knowSwatMember.value = content.knowSwatMember;
  knowSwatMembersNames.value = content.knowSwatMembersNames || [];
  virtualRacesNotInterested.value = content.virtualRacesNotInterested || [];
  workoutsInterest.value = content.workoutsInterest || [];
  tttInterest.value = content.tttInterest || [];
  socialRidesInterest.value = content.socialRidesInterest || [];
  zrlInterest.value = content.zrlInterest || [];
  stageRacesInterest.value = content.stageRacesInterest || [];
  clubLadderInterest.value = content.clubLadderInterest || [];
  otherPlatformInterest.value = content.otherPlatformInterest || [];  
  integrityValuesAuthenticPerformances.value = content.integrityValuesAuthenticPerformances || [];
  integrityValuesLowInterestPerformanceValidation.value = content.integrityValuesLowInterestPerformanceValidation || [];  
  respectValuesBadLooser.value = content.respectValuesBadLooser || [];  
  engagementValuesInvested.value = content.engagementValuesInvested || [];
  engagementValuesTeamMembershipInterest.value = content.engagementValuesTeamMembershipInterest || [];  
  engagementValuesLowEngagementOnly.value = content.engagementValuesLowEngagementOnly || [];  
  partOfVirtualTeam.value = content.partOfVirtualTeam;
  virtualTeam.value = content.virtualTeam;
  partOfIrlTeam.value = content.partOfIrlTeam;
  zpID.value = content.zpID;
  irlTeam.value = content.irlTeam;
  irlTeamOther.value = content.irlTeamOther;
  hoursWorkoutWinter.value = content.hoursWorkoutWinter;
  hoursWorkoutSummer.value = content.hoursWorkoutSummer;
  trainerModel.value = content.trainerModel;
  trainerModelOther.value = content.trainerModelOther;
  secondaryPowerSource.value = content.secondaryPowerSource;
  secondaryPowerSourceModel.value = content.secondaryPowerSourceModel;
  secondaryPowerSourceModelOther.value = content.secondaryPowerSourceModelOther;
  comments.value = content.comments;
  birthday.value = content.birthday;
  height.value = content.height;
  weight.value = content.weight;
  otherSports.value = content.otherSports;  
  reasonsToJoin.value = content.reasonsToJoin;
  region.value = content.region;
  regionOther.value = content.regionOther;
  racesOrEvents.value = content.racesOrEvents;
  firstName.value = content.firstName;
  lastName.value = content.lastName;
  topSwatValue.value = content.topSwatValue;
  teamCapitain.value = content.teamCapitain;
  organizeCourseSerie.value = content.organizeCourseSerie;
  helpShareKnowledge.value = content.helpShareKnowledge;
  testingTechTools.value = content.testingTechTools;
  virtualRacesParticipation.value = content.virtualRacesParticipation;
  virtualRacesNeverParticated.value = content.virtualRacesNeverParticated;  
}

function formToBodyContent() {  
  return {
    teamChartAcknowledge: teamChartAcknowledge.value,    
    email: email.value,
    preferedEvents: preferedEvents.value,
    knowSwatMember: knowSwatMember.value,
    knowSwatMembersNames: knowSwatMembersNames.value,
    virtualRacesNotInterested: virtualRacesNotInterested.value,
    tttInterest: tttInterest.value,
    socialRidesInterest: socialRidesInterest.value,
    zrlInterest: zrlInterest.value,
    stageRacesInterest: stageRacesInterest.value,
    clubLadderInterest: clubLadderInterest.value,
    otherPlatformInterest: otherPlatformInterest.value,    
    workoutsInterest: workoutsInterest.value,
    partOfVirtualTeam: partOfVirtualTeam.value,
    virtualTeam: virtualTeam.value,
    partOfIrlTeam: partOfIrlTeam.value,
    zpID: zpID.value,
    irlTeam: irlTeam.value,
    irlTeamOther: irlTeamOther.value,
    hoursWorkoutWinter: hoursWorkoutWinter.value,
    hoursWorkoutSummer: hoursWorkoutSummer.value,
    trainerModel: trainerModel.value,
    trainerModelOther: trainerModelOther.value,
    secondaryPowerSource: secondaryPowerSource.value,
    secondaryPowerSourceModel: secondaryPowerSourceModel.value,
    secondaryPowerSourceModelOther: secondaryPowerSourceModelOther.value,
    comments: comments.value,
    birthday: birthday.value,
    height: height.value,
    weight: weight.value,
    otherSports: otherSports.value,
    reasonsToJoin: reasonsToJoin.value,
    region: region.value,
    regionOther: regionOther.value,
    racesOrEvents: racesOrEvents.value,
    firstName: firstName.value,
    lastName: lastName.value,    
    topSwatValue: topSwatValue.value,
    teamCapitain: teamCapitain.value,
    organizeCourseSerie: organizeCourseSerie.value,
    helpShareKnowledge: helpShareKnowledge.value,
    testingTechTools: testingTechTools.value,
    virtualRacesParticipation: virtualRacesParticipation.value,
    virtualRacesNeverParticated: virtualRacesNeverParticated.value,
    integrityValuesAuthenticPerformances: integrityValuesAuthenticPerformances.value,
    integrityValuesLowInterestPerformanceValidation: integrityValuesLowInterestPerformanceValidation.value,    
    respectValuesBadLooser: respectValuesBadLooser.value,
    engagementValuesInvested: engagementValuesInvested.value,
    engagementValuesTeamMembershipInterest: engagementValuesTeamMembershipInterest.value,    
    engagementValuesLowEngagementOnly: engagementValuesLowEngagementOnly.value,
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
        name: 'interest2024',
        user_id: useUserProfile().user_id,
        content: JSON.stringify(formToBodyContent())
      }

      if (userFormResult.value.length !== 0) {
        response = await axios.put(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/interest2024`,
          body, {
            withCredentials: true,
          });
      } else {
        response = await axios.post(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/interest2024`,
          body, {
            withCredentials: true,
          });
      }      
      
      if (response.status === 200 || response.status === 201) {
        error.value = '';
        saved.value = true;
      } else {
        error.value = 'Une erreur est survenue lors de la sauvegarde, veuillez contacter Jonathan Bisson.';
        saved.value = false;
      }
    } catch (error: any) {
      console.log(`Error: ${error}`);
      error.value = 'Une erreur est survenue lors de la sauvegarde, veuillez contacter Jonathan Bisson.';
      saved.value = false;
    }
    loading.value = false;
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
  <v-form ref="myform" v-model="isFormValid">
    <v-row>
      <v-col cols="12" sm="12" lg="8">
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="error"
          title="Erreur"
          text="Oupss, une erreur est survenue..."
          v-if="errorOccured"
        ></v-alert>
      </v-col>
      <v-col cols="12" sm="12" lg="8">
        <UiParentCard :title="t('swatInterest.pageTitle')">
          <img src="@/assets/images/itwatts/5w4t_banner.png" style="width: 100%" />
          <p class="my-4 text-body-1 text-10">
            L'attitude 5.W.4.T <b>"Intégrité - Respect - Engagement"</b> reflète les valeurs qui définissent notre équipe et orientent nos actions.
            Notre mission est de favoriser la cohésion d'équipe, de développer les compétences techniques,
            physiques et psychologiques de nos membres, ainsi que de promouvoir ces valeurs dans tout ce que nous entreprenons.
            <br><br>
            Ce formulaire nous permet de repérer les sportifs qui partagent notre passion pour l’e-sport et notre éthique sportive.
            Nous recherchons des membres qui valorisent l'humilité et l'esprit d'équipe.
            <br><br>
            En remplissant ce formulaire, vous nous aiderez à voir comment votre profil s'aligne avec notre vision et
            comment nous pouvons vous soutenir dans vos ambitions sportives. Nous vous invitons donc à lire notre
            <a href="https://charte.5w4t.com" target="_blank">charte d’équipe</a> afin de voir si vos intérêts et vos ambitions sportives correspondent à notre philosophie d’équipe.
            <br><br>
            Veuillez noter que seuls les profils retenus seront contactés.
          </p>

          <div v-if="!security.isLoggedIn() || !useUserProfile().user_id">
            <p class="my-4 text-body-1 text-10"><br>
              <b>Veuillez vous authentifier avec strava afin de poursuivre. (Un compte Strava est requis)</b>
            </p>
            <v-card-text>
              <a :href="config.serverApi.publicHostname + '/auth/strava_team'" class="social-button" id="strava-connect"> <span>{{ $t('signin.withStrava') }}</span></a>
            </v-card-text>
          </div>

          <div v-if="hideForm">
            <p class="my-4 text-body-1 text-10"><br>
              <b>Nous avons bien reçu votre demande. Si vous désirez modifier le formulaire, cliquer sur Modifier.</b>
            </p>
            <v-btn color="primary" flat @click="hideForm = false">Modifier...</v-btn>
          </div>
        </UiParentCard>
      </v-col>
    </v-row>
    <v-row v-if="security.isLoggedIn() && useUserProfile().user_id && !hideForm">
      <v-col cols="12" sm="12" lg="8">
        <UiParentCard title="Informations personnelles">
          <div class="text-subtitle-1 text-grey-darken-1 my-3">
              {{ t('swatInterest.formQuestions.firstName') }}
          </div>
          <v-text-field label="Prénom" hide-details="auto" v-model="firstName" :rules="[rules.required]"></v-text-field>
          <div class="text-subtitle-1 text-grey-darken-1 my-3">              
            {{ t('swatInterest.formQuestions.lastName') }}            
          </div>
          <v-text-field label="Nom" hide-details="auto" v-model="lastName" :rules="[rules.required]"></v-text-field>
          <div class="text-subtitle-1 text-grey-darken-1 my-3">
            {{ t('swatInterest.formQuestions.email') }}
          </div>
          <v-text-field label="Courriel" hide-details="auto" v-model="email" :rules="[rules.required, rules.email]"></v-text-field>
          <div class="text-subtitle-1 text-grey-darken-1 my-3">
            {{ t('swatInterest.formQuestions.region') }}
          </div>
          <v-autocomplete            
            v-model="region"
            label="Région"
            :items="regions"
            :item-title="'text'"
            :item-value="'value'"
            variant="outlined"
            :rules="[rules.required]"
          ></v-autocomplete>
          <v-text-field
            label="Laquelle?"
            hide-details="auto"
            v-model="regionOther"
            v-if="region === 'others'"
            :rules="[(value: any) => !!value && region === 'others']"
            ></v-text-field>          
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">
            {{ t('swatInterest.formQuestions.birthday') }}
          </div>
          <DatePicker hide-details="auto" v-model="birthday" :rules="[rules.required]"/>
          <div class="text-subtitle-1 text-grey-darken-1 my-3">
            {{ t('swatInterest.formQuestions.height') }}
          </div>
          <v-text-field label="Grandeur" hide-details="auto" v-model="height" :rules="[rules.required]" type="number"></v-text-field>
          <div class="text-subtitle-1 text-grey-darken-1 my-3">
            {{ t('swatInterest.formQuestions.weight') }}
          </div>
          <v-text-field label="Poids" hide-details="auto" v-model="weight" :rules="[rules.required]" type="number"></v-text-field>
          <div class="text-subtitle-1 text-grey-darken-1 my-3">
            {{ t('swatInterest.formQuestions.partOfIrlTeam') }}
          </div>
            <v-radio-group class="mt-4" v-model="partOfIrlTeam" :rules="[rules.required]">
              <v-radio label="oui" color="primary" value="yes" ></v-radio>
              <v-radio label="non" color="primary" value="no" ></v-radio>              
            </v-radio-group>      
            <v-autocomplete
              v-model="irlTeam"  
              v-if="partOfIrlTeam === 'yes'"              
              label="Lequel?"
              :items="clubs"
              :item-title="'text'"
              :item-value="'value'"
              variant="outlined"
              :rules="[(value: any) => value.length > 0 && partOfIrlTeam === 'yes']"
            ></v-autocomplete>
            <v-text-field
              label="Lequel?"
              hide-details="auto"
              v-model="irlTeamOther"
              v-if="irlTeam === 'others'"
              :rules="[(value: any) => !!value && partOfIrlTeam === 'yes']"
              ></v-text-field>
          <div class="text-subtitle-1 text-grey-darken-1 my-3">
            {{ t('swatInterest.formQuestions.zpID') }}
          </div>
          <v-text-field label="Identifiant ZwiftPower" hide-details="auto" v-model="zpID" :rules="[rules.required]" type="number"></v-text-field>
          <div class="text-subtitle-1 text-grey-darken-1 my-3">
            {{ t('swatInterest.formQuestions.partOfVirtualTeam') }}              
          </div>
            <v-radio-group class="mt-4" v-model="partOfVirtualTeam" :rules="[rules.required]">
              <v-radio label="Non, je suis libre comme l’air!" color="primary" value="no" ></v-radio>
              <v-radio label="Oui, mais je compte me désinscrire de cette équipe si le 5.W.4.T veut de moi" color="primary" value="yes_but_will_quit_other_team" ></v-radio>              
            </v-radio-group>
            <v-text-field
              label="Nom de votre équipe virtuelle présentement ?"
              hide-details="auto"
              v-model="virtualTeam"
              v-if="partOfVirtualTeam && partOfVirtualTeam !== 'no'"
              :rules="[(value: any) => !!value && partOfVirtualTeam !== 'no']"
              ></v-text-field>
          <div class="text-subtitle-1 text-grey-darken-1 my-3">
            {{ t('swatInterest.formQuestions.knowSwatMember') }}
          </div>
            <v-radio-group class="mt-4" v-model="knowSwatMember" :rules="[rules.required]">
              <v-radio label="oui" color="primary" value="yes" ></v-radio>
              <v-radio label="non" color="primary" value="no" ></v-radio>              
            </v-radio-group>  
            <v-autocomplete
              v-model="knowSwatMembersNames"
              v-if="knowSwatMember === 'yes'"
              :items="swatNames"
              variant="outlined"
              color="primary"
              label="Noms"
              multiple
              hide-details
              closable-chips
              :rules="[(value: any) => value.length > 0 && knowSwatMember === 'yes']"
              >
              <template v-slot:chip>
                <v-chip label color="primary" size="large" class="mb-1 text-subtitle-1 font-weight-regular"></v-chip>
              </template>
          </v-autocomplete>
        </UiParentCard>
      </v-col>
      <v-col cols="12" sm="12" lg="8">
        <UiParentCard title="Équipements">            
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              {{ t('swatInterest.formQuestions.partOfIrlTeam') }}
              Quel est le modèle de votre base d'entrainement (Tacx Flux, Tacx Neo, Saris H3, Wahoo Kickr, Elite Drivo, etc…) ?
            </div>
            <v-autocomplete            
              v-model="trainerModel"
              label="Lequel?"
              :items="trainers"
              :item-title="'text'"
              :item-value="'value'"
              variant="outlined"
              :rules="[rules.required]"
            ></v-autocomplete>
            <v-text-field
              label="Lequel?"
              hide-details="auto"
              v-model="trainerModelOther"
              v-if="trainerModel === 'others'"
              :rules="[(value: any) => !!value && trainerModel === 'others']"
              ></v-text-field>
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              {{ t('swatInterest.formQuestions.secondaryPowerSource') }}              
            </div>
            <v-radio-group class="mt-4" v-model="secondaryPowerSource" :rules="[rules.required]">
              <v-radio label="oui" color="primary" value="yes" ></v-radio>
              <v-radio label="non" color="primary" value="no" ></v-radio>              
            </v-radio-group>
            <v-autocomplete
              v-model="secondaryPowerSourceModel"
              v-if="secondaryPowerSource === 'yes'"
              label="Lequel?"
              :items="secondarySources"
              :item-title="'text'"
              :item-value="'value'"
              variant="outlined"
              :rules="[(value: any) => !!value && secondaryPowerSource === 'yes']"
            ></v-autocomplete>
            <v-text-field
              label="Lequel?"
              hide-details="auto"
              v-model="secondaryPowerSourceModelOther"
              v-if="secondaryPowerSourceModel === 'others' && secondaryPowerSource === 'yes'"
              :rules="[(value: any) => !!value && secondaryPowerSourceModel === 'others']"
              ></v-text-field>
        </UiParentCard>
      </v-col>
      <v-col cols="12" sm="12" lg="8">
        <UiParentCard title="Objectifs personnels et motivation">
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              {{ t('swatInterest.formQuestions.otherSports') }}
            </div>
            <v-textarea label="Autre sports..." hide-details="auto" v-model="otherSports" :rules="[rules.required]"></v-textarea>
            <div class="text-subtitle-1 text-grey-darken-1 my-3">
              {{ t('swatInterest.formQuestions.reasonsToJoin') }}
            </div>
            <v-textarea label="Raisons..." hide-details="auto" v-model="reasonsToJoin" :rules="[rules.required]"></v-textarea>
        </UiParentCard>
      </v-col>
      <v-col cols="12" sm="12" lg="8">
        <UiParentCard title="Vélo virtuel">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              {{ t('swatInterest.formQuestions.hoursWorkoutSummer') }}
            </div>
            <v-radio-group class="mt-4" v-model="hoursWorkoutSummer" :rules="[rules.required]">
              <v-radio label="Entre 0 et 3 heures" color="primary" value="0_3" ></v-radio>
              <v-radio label="Entre 3 et 6 heures" color="primary" value="3_6" ></v-radio>
              <v-radio label="Entre 6 et 10 heures" color="primary" value="6_10" ></v-radio>
              <v-radio label="Entre 10 et 15 heures" color="primary" value="10_15" ></v-radio>
              <v-radio label="Plus de 15 heures" color="primary" value="15_and_plus" ></v-radio>
            </v-radio-group>
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Courses virtuelles
            </div>
            <v-checkbox :label="t('swatInterest.formQuestions.virtualRacesParticipation')" hide-details="auto" value="yes" v-model="virtualRacesParticipation"></v-checkbox>
            <v-checkbox :label="t('swatInterest.formQuestions.virtualRacesNeverParticated')" hide-details="auto" value="yes" v-model="virtualRacesNeverParticated"></v-checkbox>
            <v-checkbox :label="t('swatInterest.formQuestions.virtualRacesNotInterested')" hide-details="auto" value="yes" v-model="virtualRacesNotInterested"></v-checkbox>          
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              {{ t('swatInterest.formQuestions.racesOrEvents') }}
            </div>
            <v-textarea label="Courses et événements..." hide-details="auto" v-model="racesOrEvents"></v-textarea>
            <div class="text-subtitle-1 text-grey-darken-1 my-3">
              Veuillez indiquer ton niveau d'intérèt
            </div>
            <v-row class="align-center">      
              <v-col cols="12" sm="5">
                <b>{{ t('swatInterest.formQuestions.workoutsInterest') }}</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="workoutsInterest" :rules="[rules.required]">
                <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
                <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
                <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">      
              <v-col cols="12" sm="5">
                <b>{{ t('swatInterest.formQuestions.socialRidesInterest') }}</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="socialRidesInterest" :rules="[rules.required]">
                <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
                <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
                <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">      
              <v-col cols="12" sm="5">
                <b>{{ t('swatInterest.formQuestions.tttInterest') }}</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="tttInterest" :rules="[rules.required]">
                <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
                <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
                <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">      
              <v-col cols="12" sm="5">
                <b>{{ t('swatInterest.formQuestions.zrlInterest') }}</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="zrlInterest" :rules="[rules.required]">
                <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
                <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
                <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">      
              <v-col cols="12" sm="5">
                <b>{{ t('swatInterest.formQuestions.stageRacesInterest') }}</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="stageRacesInterest" :rules="[rules.required]">
                <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
                <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
                <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">      
              <v-col cols="12" sm="5">
                <b>{{ t('swatInterest.formQuestions.clubLadderInterest') }}</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="clubLadderInterest" :rules="[rules.required]">
                <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
                <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
                <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">      
              <v-col cols="12" sm="5">
                <b>{{ t('swatInterest.formQuestions.otherPlatformInterest') }}</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="otherPlatformInterest" :rules="[rules.required]">
                <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
                <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
                <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
        </UiParentCard>
      </v-col>
      <v-col cols="12" sm="12" lg="8">
        <UiParentCard title="Heures d'entrainements saison estivale">
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              {{ t('swatInterest.formQuestions.hoursWorkoutWinter') }}
            </div>
            <v-radio-group class="mt-4" v-model="hoursWorkoutWinter" :rules="[rules.required]">
              <v-radio label="Entre 0 et 3 heures" color="primary" value="0_3" ></v-radio>
              <v-radio label="Entre 3 et 6 heures" color="primary" value="3_6" ></v-radio>
              <v-radio label="Entre 6 et 10 heures" color="primary" value="6_10" ></v-radio>
              <v-radio label="Entre 10 et 15 heures" color="primary" value="10_15" ></v-radio>
              <v-radio label="Plus de 15 heures" color="primary" value="15_and_plus" ></v-radio>
            </v-radio-group>
        </UiParentCard>
      </v-col>
      <v-col cols="12" sm="12" lg="8">
        <UiParentCard title="L’intégrité, le respect et l’engagement">
            <div class="text-h6 mb-3">
              Valeur d’intégrité :
            </div>
            <v-checkbox :label="t('swatInterest.formQuestions.integrityValuesAuthenticPerformances')" hide-details="auto" value="yes" v-model="integrityValuesAuthenticPerformances"></v-checkbox>
            <v-checkbox :label="t('swatInterest.formQuestions.integrityValuesLowInterestPerformanceValidation')" hide-details="auto" value="yes" v-model="integrityValuesLowInterestPerformanceValidation"></v-checkbox>
            <div class="text-h6 my-3">
              Valeur de respect :
            </div>
            <v-checkbox :label="t('swatInterest.formQuestions.respectValuesBadLooser')" hide-details="auto" value="yes" v-model="respectValuesBadLooser"></v-checkbox>            
            <div class="text-h6 my-3">
              Valeur d’engagement :
            </div>
            <v-checkbox :label="t('swatInterest.formQuestions.engagementValuesInvested')" hide-details="auto" value="yes" v-model="engagementValuesInvested"></v-checkbox>
            <v-checkbox :label="t('swatInterest.formQuestions.engagementValuesTeamMembershipInterest')" hide-details="auto" value="yes" v-model="engagementValuesTeamMembershipInterest"></v-checkbox>            
            <v-checkbox :label="t('swatInterest.formQuestions.engagementValuesLowEngagementOnly')" hide-details="auto" value="yes" v-model="engagementValuesLowEngagementOnly"></v-checkbox>
        </UiParentCard>
      </v-col>
      <v-col cols="12" sm="12" lg="8">
        <UiParentCard title="L'attitude 5.W.4.T">
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              {{ t('swatInterest.formQuestions.topSwatValue') }}
            </div>
            <v-radio-group class="mt-4" v-model="topSwatValue" :rules="[rules.required]">
              <v-radio label="Intégrité" color="primary" value="integrite" ></v-radio>
              <v-radio label="Transparence" color="primary" value="transparence" ></v-radio>
              <v-radio label="Esprit sportif" color="primary" value="esprit_sportif" ></v-radio>
              <v-radio label="Engagement et détermination" color="primary" value="engagement_et_determination" ></v-radio>
              <v-radio label="Humilité " color="primary" value="humilite" ></v-radio>
              <v-radio label="Esprit d’équipe" color="primary" value="esprit_equipe" ></v-radio>
            </v-radio-group>
        </UiParentCard>
      </v-col>
      <v-col cols="12" sm="12" lg="8">
        <UiParentCard title="Implication 5.W.4.T">
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              
            <i>Veuillez noter que nous sommes présentement à la recherche de membres désirant s'impliquer au niveau de l'organisation du 5.W.4.T</i>
            <br><br>
            <img src="@/assets/images/itwatts/structure_organisationnelle_2024.jpg" style="width: 100%" />
            Le succès du 5.W.4.T repose sur la collaboration de tous, veuillez indiquer votre intérêts parmis les rôles ci-bas ou utiliser dans la boite de commentaires à la section suivante.
              <br><br>
            </div>
            <v-row class="align-center">      
              <v-col cols="12" sm="5">
                <b>{{ t('swatInterest.formQuestions.teamCapitain') }}</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="teamCapitain" :rules="[rules.required]">
                <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
                <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
                <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">      
              <v-col cols="12" sm="5">
                <b>{{ t('swatInterest.formQuestions.organizeCourseSerie') }}</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="organizeCourseSerie" :rules="[rules.required]">
                <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
                <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
                <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">      
            <v-col cols="12" sm="5">
              <b>{{ t('swatInterest.formQuestions.helpShareKnowledge') }}</b>
            </v-col>
            <v-col>
            <v-radio-group inline hide-details="auto" v-model="helpShareKnowledge" :rules="[rules.required]">
              <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
              <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
              <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>
            </v-radio-group>
            </v-col>
          </v-row>
          <v-row class="align-center">      
            <v-col cols="12" sm="5">
              <b>{{ t('swatInterest.formQuestions.testingTechTools') }}</b>
            </v-col>
            <v-col>
            <v-radio-group inline hide-details="auto" v-model="testingTechTools" :rules="[rules.required]">
              <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
              <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
              <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>
            </v-radio-group>
          </v-col>
          </v-row>
        </UiParentCard>
      </v-col>
      <v-col cols="12" sm="12" lg="8">
        <UiParentCard title="Autres commentaires">
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              {{ t('swatInterest.formQuestions.comments') }}
            </div>
            <v-textarea label="Autres commentaires..." hide-details="auto" v-model="comments"></v-textarea>
        </UiParentCard>
      </v-col>
      <v-col cols="12" sm="12" lg="8">
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="error"
          title="Erreur"
          :text="error"
          v-if="error"
        ></v-alert>
      </v-col>
      <v-col cols="12" sm="12" lg="8">
        <v-alert
          density="compact"
          type="info"
          title="Succès"
          text="Nous avons bien reçu votre demande! Seules les candidatures retenues seront contactées!"
          v-if="saved"
        ></v-alert>
      </v-col>
      <v-col cols="12" sm="12" lg="8">
        <v-btn color="primary" flat @click="submit" :disabled="!isFormValid || loading">Soumettre</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

