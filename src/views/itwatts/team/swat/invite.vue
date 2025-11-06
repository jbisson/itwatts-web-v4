<script setup lang="ts">
import axios from 'axios';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useUserProfile } from '@/stores/user-profile';

import config from "@/config/config.json";
import security from "@/security";

const { t, locale } = useI18n({ useScope: 'global' });

// theme breadcrumb
const page = ref({ title: t('swatInvite.pageTitle') });
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatInvite.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatInvite.pageTitle'),
    disabled: true,
  },
]);

const formCompleted = ref(false);
const stravaSwatClub = ref(false);
const discordName = ref();
const discordNameOkay = ref();
const validatedDiscord = ref(false);
const step = ref();
const isFormValid = ref();
const myform = ref();
const error = ref();
const loading = ref(false);
const hideForm = ref(false);
const comments = ref('');
const reasonsToJoin = ref('');
const virtualTeam = ref('');
const warningAlert = ref();
const zpID = ref();
const errorAlert = ref();
const knowSwatMember = ref('');
const partOfVirtualTeam = ref('');
const partOfIrlTeam = ref('');
const irlTeam = ref('');
const irlTeamOther = ref('');
const region = ref('');
const regionOther = ref('');
const email = ref('');
const firstName = ref('');
const lastName = ref('');
const wantToParticipeInVirtualActivities = ref('');
const wantToParticipeInSocialRides = ref('');
const wantToParticipeIRLActivities = ref('');
const wantToParticipeInChatting = ref('');
const swatNames = ref([] as any);
const userFormResult = ref([]);
const knowSwatMembersNames = ref([]);

let clubs = [] as any;
let regions = [] as any;
let trainers = [];
let secondarySources = [];
  
async function refresh() {
  if (!security.isLoggedIn() && !useUserProfile().user_id) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  if (security.isTokenValid(['SWAT_GUEST_2024_2025'])) {
    step.value = 4;
    return;
  }

  error.value = '';  
  try {    
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/invite2024`,
    {
      withCredentials: true
    });
    if (response.data) {      
      userFormResult.value = response.data.content;
      bodyContentToForm(JSON.parse(response.data.content));
      formCompleted.value = true;
      
      const responseUser = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
      {
        withCredentials: true
      });
      if (responseUser.data) {
        // console.log(`Response from /v1/user: ${JSON.stringify(responseUser.data)}`);
        const userObj = responseUser.data;

        await checkStravaCompliance(userObj);
        await checkDiscordCompliance(userObj);
        if (!validatedDiscord.value || discordNameOkay.value !== 'yes') {
          step.value = 2;
          return;          
        }        
        if (!stravaSwatClub.value) {
          step.value = 3;
          return;
        }
        step.value = 4;
      }
    }
  } catch (error: any) {
    if (error.response && error.response.status !== 404) {
      // Normal for the form to receive a 404...
      console.log(`Error: ${error} stack: ${error.stack}`);
      error.value = `Oupss, une erreur est survenue...\nDetail: ${error}`;
    }    
  }

  if (!formCompleted.value) {    
    try {
      let response = await axios.get(`${config.serverApi.publicHostname}/v1/users?groups=swat_2023_2024,swat_2024_2025&fields=first_name,last_name&sortBy=first_name`,
      { withCredentials: true });
      for (let i = 0;i < response.data.data.length;i++) {
        swatNames.value.push(`${response.data.data[i].first_name} ${response.data.data[i].last_name}`);
      }

      response = await axios.get(`${config.serverApi.publicHostname}/v1/lookups/clubs`,
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
      regions.sort((region1: any, region2: any) => { return region1.text.localeCompare(region2.text) });
      firstName.value = useUserProfile().first_name;
      lastName.value = useUserProfile().last_name;        
    } catch (error: any) {
      console.log(`Error: ${error} stack: ${error.stack}`);
      error.value = `Oupss, une erreur est survenue...\nDetail: ${error}`;
    }
  }
}

const validateCheckbox = ref([
  (value: any) => value.length > 0,
]);

const validateMultiChoices = ref([
  (value: any) => value.length > 0,
]);

const validateStatus = ref([
  (value: any) => {
    return value.length > 0 || false
  }
]);

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
  knowSwatMember.value = content.knowSwatMember;
  knowSwatMembersNames.value = content.knowSwatMembersNames || [];
  partOfVirtualTeam.value = content.partOfVirtualTeam;
  zpID.value = content.zpID;
  virtualTeam.value = content.virtualTeam;
  partOfIrlTeam.value = content.partOfIrlTeam;
  irlTeam.value = content.irlTeam;
  irlTeamOther.value = content.irlTeamOther;
  comments.value = content.comments;
  reasonsToJoin.value = content.reasonsToJoin;
  region.value = content.region;
  regionOther.value = content.regionOther;
  firstName.value = content.firstName;
  lastName.value = content.lastName;
  wantToParticipeInVirtualActivities.value = content.wantToParticipeInVirtualActivities;
  wantToParticipeInSocialRides.value = content.wantToParticipeInSocialRides;
  wantToParticipeIRLActivities.value = content.wantToParticipeIRLActivities;
  wantToParticipeInChatting.value = content.wantToParticipeInChatting;
}

function formToBodyContent() {  
  return {
    email: email.value,
    knowSwatMember: knowSwatMember.value,
    knowSwatMembersNames: knowSwatMembersNames.value,
    partOfVirtualTeam: partOfVirtualTeam.value,
    virtualTeam: virtualTeam.value,
    zpID: zpID.value,
    partOfIrlTeam: partOfIrlTeam.value,
    irlTeam: irlTeam.value,
    irlTeamOther: irlTeamOther.value,
    comments: comments.value,
    reasonsToJoin: reasonsToJoin.value,
    region: region.value,
    regionOther: regionOther.value,
    firstName: firstName.value,
    lastName: lastName.value,
    wantToParticipeInVirtualActivities: wantToParticipeInVirtualActivities.value,
    wantToParticipeInSocialRides: wantToParticipeInSocialRides.value,
    wantToParticipeIRLActivities: wantToParticipeIRLActivities.value,
    wantToParticipeInChatting: wantToParticipeInChatting.value,
  }
}

async function saveForm() {
  myform.value.validate();

  if (isFormValid.value) {
    let response = null;

    loading.value = true;
    try {    
      let response;

      const body = {
        name: 'invite2024',
        user_id: useUserProfile().user_id,
        content: JSON.stringify(formToBodyContent())
      }

      if (userFormResult.value.length !== 0) {
        response = await axios.put(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/invite2024`,
          body, {
            withCredentials: true,
          });
      } else {
        response = await axios.post(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/invite2024`,
          body, {
            withCredentials: true,
          });
      }      
      
      if (response.status === 200 || response.status === 201) {
        error.value = '';
        next();
      } else {
        error.value = 'Une erreur est survenue lors de la sauvegarde, veuillez contacter Jonathan Bisson.';        
      }
    } catch (error: any) {
      console.log(`Error: ${error}`);
      error.value = 'Une erreur est survenue lors de la sauvegarde, veuillez contacter Jonathan Bisson.';      
    } finally {
      loading.value = false;
    }
  }  
}

function next() {
  step.value += 1;  
}

function prev() {
  step.value -= 1;
  // console.log('prev: ' + step.value);  
}

async function checkStravaCompliance(user: any) {
  if (user.strava_login && user.strava_login.scope.includes('read_all')) {
    await fetchStravaUser();  
  } else {
    errorAlert.value = `Oupss, vous devez donner accèss à ITWatts afin qu'il puisse valider si vous avez joins l'équipe ` +
      `5.W.4.T. Veuillez vous déconnecter et reconnecter. Lors de la reconnection à strava, assurez-vous de cocher ` +
      `"Consulter l'intégralité de votre profile Stava" afin de continuer.`;
  }  
}

async function checkDiscordCompliance(user: any) {  
  validatedDiscord.value = false;
  
  if (user.discord_login && user.discord_login.scope) {
    validatedDiscord.value = true;
    await fetchDiscordUser();
  }
}

async function fetchDiscordUser() {
  try {
    errorAlert.value = '';
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/discord/me/1035641462324465697/member`,
    {
      withCredentials: true
    });
    if (response.data) {
      discordName.value = response.data.nick || response.data.user.global_name || response.data.user.username;
    }    
  } catch (error: any) {
    errorAlert.value = `Oupss, une erreur est survenue...Detail: fetchDiscordUser ${error}`;
    console.log(`Cannot get discord: ${error}`);
  }
}

async function acceptStravaClub() {
  try {
    loading.value = true;
    errorAlert.value = '';
    const response = await axios.post(`${config.serverApi.publicHostname}/v1/strava/clubs/1098468/user/${useUserProfile().user_id}/accept`,
    {
    },
    {
      withCredentials: true
    });
    if (response.data) {
      await fetchStravaUser();
    }    
  } catch (error: any) {
    errorAlert.value = `Oupss, une erreur est survenue...Detail: acceptStravaClub ${error}`;
    console.log(`Cannot get strava: ${error}`);
  } finally {
    loading.value = false;
  }
}

async function fetchStravaUser() {
  try {
    errorAlert.value = '';
    //loading.value = true;
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/strava/me`,
    {
      withCredentials: true
    });
    if (response.data) {
      console.log(JSON.stringify(response.data));
      if (response.data.clubs && response.data.clubs.find((club: any) => club.id === 1098468)) {        
        stravaSwatClub.value = true;
      } else {
        errorAlert.value = `ITWatts ne parvient pas à valider que vous avez joint l'équipe 5.W.4.T, veuillez ré-esseyer à nouveau.`;
      }
    }    
  } catch (error: any) {
    errorAlert.value = `Oupss, une erreur est survenue...Detail: fetchStravaUser ${error}`;
    console.log(`Cannot get strava: ${error}`);
  } finally {
    //loading.value = false;
  }
}

async function completeSwatGuestOnboarding() {
  errorAlert.value = '';
  try {
    await axios.post(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/completeSwatGuestOnboarding`,
    {      
    },
    {
      withCredentials: true
    });

    security.logout();
    next();
  } catch (error: any) {
    console.log(`Error on completeSwatGuestOnboarding. ${error} ${error.stack}`);
    errorAlert.value = `Oupss, une erreur est survenue...Detail: completeSwatGuestOnboarding ${error}`;
  }
}

function linkDiscordAccount() {
  window.location.href = `${config.serverApi.publicHostname}/v1/discord/linkAccount?redirect_uri=${config.serverWeb.hostname}/itwatts/swat/invite`;  
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
      <v-col cols="12">        
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
      <v-col cols="12" sm="12" lg="8">
        <v-progress-linear
            v-if="loading"
            indeterminate
            stream
            color="primary"            
          ></v-progress-linear>
          <v-stepper            
            v-model="step"
            :items="['Informations', 'Discord', 'Strava', 'Terminer']"
            hide-actions
          >
          <template v-slot:item.1>
            <v-card>
              <img src="@/assets/images/itwatts/5w4t_banner.png" style="width: 100%" /><br><br>
              <div>
                L'attitude 5.W.4.T <b>"Intégrité - Respect - Engagement"</b> reflète les valeurs qui définissent notre équipe et orientent nos actions.
                Notre mission est de favoriser la cohésion d'équipe, de développer les compétences techniques,
                physiques et psychologiques de nos membres, ainsi que de promouvoir ces valeurs dans tout ce que nous entreprenons.
                <br><br>
                En remplissant ce formulaire, vous aurez l'opportunité de devenir un invité 5.W.4.T. Nous vous invitons à lire notre
                <a href="https://charte.5w4t.com" target="_blank">charte d’équipe</a> afin de comprendre notre philosophie d’équipe.                
              </div>

              <div v-if="!security.isLoggedIn() || !useUserProfile().user_id">
                <p class="my-4 text-body-1 text-10"><br>
                  <b>Veuillez vous authentifier avec strava afin de poursuivre. (Un compte Strava est requis)</b>
                </p>
                <v-card-text>
                  <a :href="config.serverApi.publicHostname + '/auth/strava'" class="social-button" id="strava-connect"> <span>{{ $t('signin.withStrava') }}</span></a>
                </v-card-text>
              </div>
              <div v-if="security.isLoggedIn() && useUserProfile().user_id && !formCompleted">
                <br>          
                <h3>Informations personnelles</h3>              
                <div class="text-subtitle-1 text-grey-darken-1 my-3">
                    {{ t('swatInvite.formQuestions.firstName') }}
                </div>
                <v-text-field label="Prénom" hide-details="auto" v-model="firstName" :rules="[rules.required]"></v-text-field>
                <div class="text-subtitle-1 text-grey-darken-1 my-3">              
                  {{ t('swatInvite.formQuestions.lastName') }}            
                </div>
                <v-text-field label="Nom" hide-details="auto" v-model="lastName" :rules="[rules.required]"></v-text-field>
                <div class="text-subtitle-1 text-grey-darken-1 my-3">
                  {{ t('swatInvite.formQuestions.email') }}
                </div>
                <v-text-field label="Courriel" hide-details="auto" v-model="email" :rules="[rules.required, rules.email]"></v-text-field>
                <div class="text-subtitle-1 text-grey-darken-1 my-3">
                  {{ t('swatInvite.formQuestions.region') }}
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
                  v-if="region === 'other'"
                  :rules="[(value: any) => !!value && region === 'other']"
                  ></v-text-field>
                  <div class="text-subtitle-1 text-grey-darken-1 my-3">
                    {{ t('swatInvite.formQuestions.partOfIrlTeam') }}
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
                    <v-radio label="oui" color="primary" value="yes" ></v-radio>
                    <v-radio label="non" color="primary" value="no" ></v-radio>
                  </v-radio-group>
                  <v-text-field
                    label="Nom de votre équipe virtuelle présentement ?"
                    hide-details="auto"
                    v-model="virtualTeam"
                    v-if="partOfVirtualTeam && partOfVirtualTeam !== 'no'"
                    :rules="[(value: any) => !!value && partOfVirtualTeam !== 'no']"
                    ></v-text-field>
                <div class="text-subtitle-1 text-grey-darken-1 my-3">
                  {{ t('swatInvite.formQuestions.knowSwatMember') }}
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
                    </v-autocomplete><br>
                    <div class="text-subtitle-1 text-grey-darken-1 mb-3">
                    {{ t('swatInvite.formQuestions.reasonsToJoin') }}
                  </div>
                  <v-checkbox :label="t('swatInvite.formQuestions.wantToParticipeInVirtualActivities')" hide-details="auto" value="yes" v-model="wantToParticipeInVirtualActivities"></v-checkbox>
                  <v-checkbox :label="t('swatInvite.formQuestions.wantToParticipeInSocialRides')" hide-details="auto" value="yes" v-model="wantToParticipeInSocialRides"></v-checkbox>
                  <v-checkbox :label="t('swatInvite.formQuestions.wantToParticipeIRLActivities')" hide-details="auto" value="yes" v-model="wantToParticipeIRLActivities"></v-checkbox>
                  <v-checkbox :label="t('swatInvite.formQuestions.wantToParticipeInChatting')" hide-details="auto" value="yes" v-model="wantToParticipeInChatting"></v-checkbox>
              
                  <v-card-actions class="justify-end">                
                      <!--<v-btn flat @click="next">Suivant</v-btn>-->
                      <v-btn flat @click="saveForm()" :disabled="loading">Suivant</v-btn>
                  </v-card-actions>
                </div>
              </v-card>
          </template>
          <template v-slot:item.2>
            <v-card>
              <div class="d-flex justify-center">
                <img src='@/assets/images/itwatts/admission/discord_logo.svg' height="80"/><br><br><br><br>
              </div>
              <h3 class="mb-1">{{ validatedDiscord ? '✅' : '❌' }} 1 - Lier compte Discord</h3>
              <h3 class="mb-1">{{ discordNameOkay === 'yes' ? '✅' : '❌' }} 2 - Identifiant Discord significatif</h3>
              <div class="text-subtitle-1 text-grey-darken-1 mb-3"><br>
                Afin de facilité la coordination et l’atteinte de sa mission, l’équipe 5.W.4.T préconise que la plateforme Discord soit utilisée lors de toutes les communications écrites et vocales en lien direct avec les activités e-sport de l’équipe.
                <br><br>
                On vous encourage à télécharger la version mobile afin de ne rien manquer. Vous serez invité(e) à creer votre compte après le téléchargement de l'application.
                    (La version PC se retrouve ici: <a href="https://discord.com/">https://discord.com/</a>)<br><br>
                    <a href="https://play.google.com/store/apps/details?id=com.discord" target="_blank">
                      <img src='@/assets/images/itwatts/admission/google_play.svg' height="40"/>
                    </a><br>
                    <a href="https://apps.apple.com/us/app/discord-talk-play-hang-out/id985746746" target="_blank">
                      <img src='@/assets/images/itwatts/admission/apple_store.svg' height="40"/>
                    </a><br><br>
              </div>
              <div v-if="!validatedDiscord">
                Une fois que vous avez téléchargé et créer votre compte Discord, cliquer sur <v-btn color="primary" flat @click="linkDiscordAccount()" :disabled="loading">Joindre le serveur Discord 5.W.4.T</v-btn>
              </div>
                <div v-if="validatedDiscord">
                  <p class="my-4 text-body-1 text-10">
                    Il est important d'utiliser un nom significatif, éviter les pseudos farfelus! Une bonne pratique est d’utiliser un nom qui permet aux membres de vous identifier.
                    Noter qu'il est possible d'avoir un identifiant discord différent pour chaque serveur.

                    <v-radio-group hide-details="auto" v-model="discordNameOkay" :rules="[rules.required]">
                      <v-radio :label="'Oui, je juge que mon identifiant discord <' + discordName + '> est significatif'" color="primary" value="yes"></v-radio>
                      <v-radio label="Non, j'aimerais le changer (montrez moi comment svp)" color="primary" value="no"></v-radio>
                    </v-radio-group>
                    <img v-if="discordNameOkay === 'no'" src='@/assets/images/itwatts/admission/discord_how_to_change_nickname.png' width="100%"/>
                  </p>    
                </div>
              <v-card-actions class="justify-space-between">
                <v-btn flat @click="prev" :disabled="false">Précédent</v-btn>
                <!-- <v-btn flat @click="next">Suivant</v-btn>-->
                <v-btn flat @click="next" :disabled="loading || discordNameOkay !== 'yes'">Suivant</v-btn>
              </v-card-actions>
            </v-card>
          </template>
          <template v-slot:item.3>
            <v-card>
              <div class="d-flex justify-center">
                <img src='@/assets/images/itwatts/admission/strava_banner.png' height="60"/><br><br><br><br>
              </div>
              <h3 class="mb-1">{{ stravaSwatClub ? '✅' : '❌'}} Joindre l'équipe 5.W.4.T sur Strava</h3><br>
              <div v-if="stravaSwatClub">
                <b>Félicitations, vous avez bien joint l'équipe 5.W.4.T avec succès.</b><br><br>
                  Cliquer sur suivant afin de finaliser le tout.<br><br>
                  <img src='@/assets/images/itwatts/very_nice_great_success.png' height="250"/>
              </div>
              <div v-else>
                Veuillez joindre l'équipe 5.W.4.T à l'addresse suivante: <a href="https://www.strava.com/clubs/1098468" target="_blank">https://www.strava.com/clubs/1098468</a> (Bouton Request to join).
                <br>Une fois complété, cliquer sur <v-btn color="primary" flat @click="refresh()" :disabled="loading">J'ai joint l'équipe 5.W.4.T sur strava</v-btn>
              </div>
              <v-card-actions class="justify-space-between">
                <v-btn flat @click="prev" :disabled="false">Précédent</v-btn>
                <!-- <v-btn flat @click="next">Suivant</v-btn>-->
                <v-btn flat @click="completeSwatGuestOnboarding()" :disabled="loading || !stravaSwatClub">Suivant</v-btn>
              </v-card-actions>
            </v-card>
          </template>
          <template v-slot:item.4>
            <v-card>
              <div class="d-flex justify-center">
                <img src='@/assets/images/itwatts/congrats.gif' height="300"/><br><br><br><br>
              </div>
              <p class="my-4 text-body-1 text-10">
                <b>Félicitations, vous êtes maintenant un(e) invité(e) 5.W.4.T officiel !!!</b><br><br>
                  On t'invite maintenant à te présenter dans le serveur Discord dans le salon <a href="https://discord.com/channels/1035641462324465697/1271461522341761054" target="_blank">#introduction-présentation</a>.

                  <br><br><b>Autres liens intéressants:</b><br>
                  <a href="https://facebook.5w4t.com">Suivez l'équipe 5.W.4.T sur Facebook!</a><br>
                  <a href="https://instagram.5w4t.com">Suivez l'équipe 5.W.4.T sur Instagram!</a><br>                  
                  <a href="https://charte.5w4t.com">Charte d'équipe</a><br>
              </p>
              <v-card-actions class="justify-space-between">
                <!--<v-btn flat @click="prev">Précédent</v-btn>-->
              </v-card-actions>
            </v-card>
          </template>
        </v-stepper>        
      </v-col>
    </v-row>
  </v-form>
</template>

