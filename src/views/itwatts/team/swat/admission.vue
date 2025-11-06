<script setup lang="ts">
import axios from 'axios';
import { ref, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

import { useUserProfile } from '@/stores/user-profile';
import { useRemembered } from '@/stores/remembered';

import config from "@/config/config.json";
import security from "@/security";
import { useTeamStore } from '@/stores/apps/teams';

const { t, locale } = useI18n({ useScope: 'global' });

// theme breadcrumb
const page = ref({ title: t('swatAdmission.pageTitle') });
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatAdmission.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatAdmission.pageTitle'),
    disabled: true,
  },
]);

const isFormValid = ref();
const warningAlert = ref();
const loading = ref();
const errorAlert = ref();
const infoAlert = ref();
const step = ref();
const email = ref();
const disabledStravaAcceptButton = ref();
const zwiftpowerBioLogo = ref();
const zwiftPowerDualRecordingWillDo = ref();
const discordNameOkay = ref();
const validatedDiscord = ref(false);
const stepVisible = ref(false);
const discordName = ref();
const stravaSwatClub = ref(false);
const emailValidated = ref(false);
const validZwiftPowerLink = ref(false);
const zwiftPowerStravaLink = ref(false);
const zwiftPowerSwatPrimaryTeam = ref(false);
const zwiftPowerJoinedSwatTeam = ref(false);
const zwiftpowerSwatPrimaryTeamExample = ref(false);
const zwiftpowerBioExample = ref(false);
const zwiftProfileExample = ref(false);
const zwiftpowerBioUiExample = ref(false);
const zwiftpowerDualRecordingExample = ref(false);
const zwiftpowerStravaLinkExample = ref(false);
const zwiftPowerValidBio = ref(false);
const zwiftPowerDualRecordingValid = ref(false);
const zwiftPowerDualRecordingRequired = ref(false);
const zwiftpowerJoinSwatExample = ref(false);
const validZwiftCompanionClub = ref(false);
const validZwiftCompanionName = ref(false);
const validZwiftCompanionWeight = ref(false);
const zwiftpowerBioWithClubLogoAndClub = ref();
const zwiftpowerBioWithoutLogo = ref();
const validInterestForm = ref(false);
const emailCode = ref('');
const team = ref();
let zpID = ref();
let formData: any;

const validateZwiftPowerIDRules = ref([
    (v: string) => !!v || t('interest.validation.zwiftPowerIDRequired'),
    (v: string) =>
      (v && !isNaN(parseFloat(v))) || t('interest.validation.zwiftPowerIDNumber'),
    (v: string) =>
      (v && v.length <= 8) || t('interest.validation.zwiftPowerIDLowerThan8'),
  ]);

async function refresh() {
  if (!security.isLoggedIn() && !useUserProfile().user_id) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  if (useTeamStore().myTeams) {
    team.value = useTeamStore().myTeams.find((team: any) => team.name === 'swat');
  } else if (security.isTokenValid(['SUPER_ADMIN']) && useTeamStore().teams) {
    team.value = useTeamStore().teams.find((team: any) => team.name === 'swat');
  }
  
  if (security.isTokenValid([]) && team.value) {
    stepVisible.value = true;
    validInterestForm.value = true;
    step.value = 6;
    return;
  }

  if (useRemembered().admission.started) {
    console.log('useRemembered est déjà started...');
    stepVisible.value = true;
  }

  if (useRemembered().admission.step > 1) {
    discordNameOkay.value = 'yes';
  }
  if (useRemembered().admission.step > 4) {
    zwiftPowerDualRecordingWillDo.value = 'yes';
  }
  step.value = useRemembered().admission.step;
  
  try {
    warningAlert.value = '';
    errorAlert.value = '';

    const response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/interest2024`,
    {
      withCredentials: true
    });
    formData = response.data;
    if (!formData.flow || formData.flow.status !== 'approved') {
      warningAlert.value = `Votre demande suite à votre formulaire d'intérêt n'a pas été encore traité, veuillez ré-esseyer plus tard.`;      
      return;
    }
    validInterestForm.value = true;
  } catch (error: any) {
    console.log('Error forms/interest2024: '+ error);
    errorAlert.value = `Oups, une erreur est survenu, avez-vous remplis le formulaire d'intérèt du 5.W.4.T ? Sinon allez à https://interet.5w4t.com pour le faire.`;    
    return;
  }  finally {
    loading.value = false;
  }
  
  try {
    loading.value = true;
    errorAlert.value = '';
    
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}?additionalFields=zp_profile(processed),zp_profile(dual_recording)`,
    //const response = await axios.get(`${config.serverApi.publicHostname}/v1/users/007368b4-e8ee-428a-84ab-da8bf10dcef6`,
    {
      withCredentials: true
    });
    if (response.data) {
      // console.log(`Response from /v1/user: ${JSON.stringify(response.data.strava_login)}`);
      const userObj = response.data;
      email.value = userObj.email;

      if (team.value) {
        stepVisible.value = true;
        validInterestForm.value = true;
        step.value = 6;
        return;
      }

      if (!userObj.strava_login || !userObj.strava_login.scope.includes('read_all')) {
        useUserProfile().login_post_back_page = router.currentRoute.value.path;
        const scope = 'read,read_all,profile:read_all,profile:write,activity:read_all';
        router.push({ path: '/itwatts/signin', query: { scope: scope } });
      }      

      await checkDiscordCompliance(userObj);
      await checkEmailCompliance(userObj);      
      if (!emailValidated.value) {
        return;
      }
      await checkStravaCompliance(userObj);
      if (!stravaSwatClub.value) {
        return;
      }
      await checkZwiftPowerCompliance(userObj);
      if (!validZwiftPowerLink.value || !zwiftPowerJoinedSwatTeam.value || !zwiftPowerSwatPrimaryTeam.value ||
        !zwiftPowerStravaLink.value || !zwiftPowerValidBio.value) {
        return;
      }
      
      await checkZwiftCompanionCompliance(userObj);
    }    
  } catch (error: any) {
    errorAlert.value = `Oupss, une erreur est survenue...Detail refresh: ${error}`;
    console.log(`Error: ${error} stack: ${error.stack}`);
  }  finally {
    loading.value = false;
  }
}

async function checkDiscordCompliance(user: any) {  
  validatedDiscord.value = false;
  
  if (user.discord_login && user.discord_login.scope) {
    validatedDiscord.value = true;
    await fetchDiscordUser();
  }
}

async function checkZwiftPowerCompliance(user: any) {
  if (user.zp_id) {
    validZwiftPowerLink.value = true;
  }

  try {
    loading.value = true;
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/zp-team/19126`, {
      withCredentials: true,
    });
    zwiftPowerJoinedSwatTeam.value = response.data.data.find((profile: any) => profile.zwid === user.zp_id) ? true : false;
    await checkZwiftPowerProfileCompliance(user);
    await getZpBio(user);
  } catch (error: any) {
    errorAlert.value = `Oupss, une erreur est survenue...Detail checkZwiftPowerCompliance: ${error}`;
    console.log(`Error: ${error}`);
  }  finally {
    loading.value = false;
  }
}

async function getZpBio(user: any) {
  try {    
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${user.id}/bio`, {
      withCredentials: true,
    });
    zwiftpowerBioWithClubLogoAndClub.value = response.data.withClub;    
    zwiftpowerBioWithoutLogo.value = response.data.withoutClub;

    console.log(`Response from getZpBio: ${JSON.stringify(response.data)}`);
  } catch (error: any) {    
    errorAlert.value = `Oupss, une erreur est survenue...Detail getZpBio: ${error}`;
    console.log(`Error: ${error}`);
  }  finally {
  }
}

async function checkZwiftPowerProfileCompliance(user: any) {
  zwiftPowerDualRecordingValid.value = false;

  if (!user.zp_id || !user.zp_profile) {
    return;
  }

  if ((user.gender === 'F' && user.zp_profile.processed.zp1Yr3AvgMaxCp20 >= 3.8) || 
    (user.gender === 'M' && user.zp_profile.processed.zp1Yr3AvgMaxCp20 >= 4.4)
  ) {
    zwiftPowerDualRecordingRequired.value = true;

    if (user.zp_profile.dual_recordings && user.zp_profile.dual_recordings.length > 0) {
      const dualDays = Math.round(
            (new Date().getTime() - new Date(user.zp_profile.dual_recordings[user.zp_profile.dual_recordings.length - 1].date * 1000).getTime()) / (1000 * 3600 * 24));  
      console.log('nb weight days: ' + dualDays);
      
      zwiftPowerDualRecordingValid.value = dualDays < 180;
    }
  }
  try {    
    const response = await axios.post(`${config.serverApi.publicHostname}/v1/sync/zp?zp_id=${user.zp_id}&forceRefresh=true`,
    {
    },
    {
      withCredentials: true,
    });
    console.log(`Response from sync/zp: ${JSON.stringify(response.data)}`);
    if (response.data.strava_profile_url) {
      zwiftPowerStravaLink.value = true;
    }
    if (response.data.primary_team_name === '5.W.4.T') {
      zwiftPowerSwatPrimaryTeam.value = true;
    }

    if (response.data.bio.includes('Primary') ||
      response.data.bio.includes('Power source') || 
      response.data.bio.includes('Zwift Setup')) {
        zwiftPowerValidBio.value = true;
    }
  } catch (error: any) {
    errorAlert.value = `Oupss, une erreur est survenue...Detail checkZwiftPowerProfileCompliance: ${error}`;
    console.log(`Error: ${error} stack: ${error.stack}`);
  }
}

async function checkEmailCompliance(user: any) {  
  emailValidated.value = user.email_validated_date ? true : false;
}

async function checkStravaCompliance(user: any) {
  if (user.strava_login && user.strava_login.scope.includes('read_all')) {
    await fetchStravaUser();  
  } else {
    disabledStravaAcceptButton.value = true;
    errorAlert.value = `Oupss, vous devez donner accèss à ITWatts afin qu'il puisse valider si vous avez joins l'équipe ` +
      `5.W.4.T. Veuillez vous déconnecter et reconnecter. Lors de la reconnection à strava, assurez-vous de cocher ` +
      `"Consulter l'intégralité de votre profile Stava" afin de continuer.`;
  }  
}

async function checkZwiftCompanionCompliance(user: any) {
  const zpNbDaysLastUpdatedWeight = 
      Math.round((new Date().getTime() -
      new Date(user.zp_profile.processed.date_last_updated_weight).getTime()) / (1000 * 3600 * 24));
  validZwiftCompanionWeight.value = zpNbDaysLastUpdatedWeight < 360;
  if (user.zwift_profile && user.zwift_profile.firstName &&
    (user.zwift_profile.firstName.includes('5.W.4.T') || user.zwift_profile.lastName.includes('5.W.4.T'))) {
    validZwiftCompanionName.value = true;
  }
  checkZwiftClubCompliance(user.zwift_profile);
}

function checkZwiftClubCompliance(zwiftProfile) {  
  if (zwiftProfile && zwiftProfile.clubs && 
    zwiftProfile.clubs.length > 0 && zwiftProfile.clubs[0].clubId === '29068f3d-089c-4a38-842e-f67e8a4d52ef'
    && zwiftProfile.clubs[0].status === 'MEMBER'
  ) {
      validZwiftCompanionClub.value = true;
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

async function acceptZwiftClub() {
  try {
    errorAlert.value = '';
    const response = await axios.post(`${config.serverApi.publicHostname}/v1/zwift/clubs/29068f3d-089c-4a38-842e-f67e8a4d52ef/user/${useUserProfile().zp_id}/accept`,
    {
    },
    {
      withCredentials: true
    });
    if (response.data) {
      await syncZwiftProfile();
    }      
  } catch (error: any) {
    errorAlert.value = `Oupss, une erreur est survenue...Detail: acceptZwiftClub ${error}`;
    console.log(`Cannot acceptZwiftClub(): ${error}`);
  }
}

async function syncZwiftProfile() {
  try {
    loading.value = true;
    errorAlert.value = '';
    const response = await axios.post(`${config.serverApi.publicHostname}/v1/sync/zwift-to-users?user_id=${useUserProfile().user_id}`,
      {
      },
      {
        withCredentials: true
      });

    if (response.data.data.length === 1) {
      if (response.data.data[0].firstName.includes('5.W.4.T') || response.data.data[0].lastName.includes('5.W.4.T')) {
        validZwiftCompanionName.value = true;
      }
      checkZwiftClubCompliance(response.data.data[0])
    }       
  } catch (error: any) {
    errorAlert.value = `Oupss, une erreur est survenue...Detail: syncZwiftProfile ${error}`;
    console.log(`Cannot acceptZwiftClub(): ${error}`);
  } finally {
    loading.value = false;
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

function linkDiscordAccount() {
  window.location.href = `${config.serverApi.publicHostname}/v1/discord/linkAccount?redirect_uri=${config.serverWeb.hostname}/itwatts/team/swat-old/admission`;
}

function next() {
  step.value += 1;

  useRemembered().admission.step = step.value;  
  // console.log('next: ' + step.value);
  
}
function prev() {
  step.value -= 1;
  // console.log('prev: ' + step.value);  
}

async function linkZwiftPowerAccount() {
  console.log('Linking zwift power account now.');
  try {
    await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
    {
      zp_id: zpID.value
    },
    {
      withCredentials: true
    });
    useUserProfile().zp_id = zpID.value;
    validZwiftPowerLink.value = true;
    await refresh();
  } catch (error: any) {
    console.log(`Error while saving user. ${error} ${error.stack}`);
    errorAlert.value = `Oupss, une erreur est survenue...Detail: linkZwiftPowerAccount ${error}`;
  }
}

async function fetchZwiftPowerAccount() {
  console.log('Fetching zwift power account now.');
  loading.value = true;
  errorAlert.value = '';
  warningAlert.value = '';
  try {
    let response = await axios.post(`${config.serverApi.publicHostname}/v1/sync/zp?zp_id=${zpID.value}&forceRefresh=true`, 
    {
    },
    {
      withCredentials: true,
    });
    
    if (response.status === 200) {
      try {
        response = await axios.get(`${config.serverApi.publicHostname}/v1/users?zp_id=${zpID.value}`,
        {
          withCredentials: true
        });
        if (response.data.data.length === 0) {
          await linkZwiftPowerAccount();
        } else {
          errorAlert.value = `Oupss, une erreur est survenue.`;
        }
      } catch (error: any) {
        console.log(`Error while fetching user. ${error} ${error.stack}`);
        errorAlert.value = `Oupss, une erreur est survenue...Detail: fetchZwiftPowerAccount ${error}`;
      }
    }
  } catch (error: any) {
    console.log('Invalid zp_id: ' + error);
    // invalid zp id
    warningAlert.value = `L'identifiant ZwiftPower que vous avez saisi n'est pas valide.`;
    //loading.value = false;
  } finally {
    loading.value = false;
  }
}

async function acceptSwatMemberOnZwiftPower() {
  try {
    loading.value = true;
    errorAlert.value = '';
    let response = await axios.post(`${config.serverApi.publicHostname}/v1/zp-team/19126/member/${useUserProfile().zp_id}/accept`,
    {
    },
    {
      withCredentials: true,
    });
    await refresh();
  } catch (error: any) {
    console.log(`Error while accepting user to ZwiftPower. ${error} ${error.stack}`);
    errorAlert.value = `Oupss, une erreur est survenue...Detail: acceptSwat ${error}`;
  } finally {
    loading.value = false;
  }
}

async function sendEmailLink() {
  try {
    await axios.post(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/sendEmailValidation`,
    {      
    },
    {
      withCredentials: true
    });
    infoAlert.value = 'Un code vous a été envoyé par courriel.';    
  } catch (err: any) {
    console.log(`Error while send email validation. ${err} ${err.stack}`);
    errorAlert.value = `Oupss, une erreur est survenue...Detail: sendEmailLink ${err}`;
  }
}

async function verifyEmailLink() {
  try {
    infoAlert.value = '';
    errorAlert.value = '';
    await axios.post(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/validateEmail?code=${emailCode.value}`,
    {      
    },
    {
      withCredentials: true
    });
    emailValidated.value = true;    
  } catch (err: any) {
    if (err.response && err.response.status === 400) {
      errorAlert.value = `Le code n'a pu être valider, veuillez recommencer.`;
      return;
    }
    console.log(`Error while send email validation. ${err} ${err.stack}`);
    errorAlert.value = `Oupss, une erreur est survenue...Detail: sendEmailLink ${err}`;
  }
}

async function completeSwatMemberOnboarding() {  
  try {
    await axios.post(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/completeSwatMemberOnboarding`,
    {
      
    },
    {
      withCredentials: true
    });
    security.logout();
    next();
  } catch (error: any) {
    console.log(`Error on completeSwatMemberOnboarding. ${error} ${error.stack}`);
    errorAlert.value = `Oupss, une erreur est survenue...Detail: completeSwatMemberOnboarding ${error}`;
  }
}

async function onStartedBtnClick() {  
  try {
    errorAlert.value = '';
    if (!formData.flow.actions.find((action: any) => action.status === 'admission_started')) {
      const flow = formData.flow;
      flow.actions.push({
        who: `${useUserProfile().first_name} ${useUserProfile().last_name}`,
        date: new Date(),
        status: 'admission_started'
      });
      console.log('Saving action...');
      const response = await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/interest2024`,
      {
        user_id: useUserProfile().user_id,
        flow: flow
      },
      {
        withCredentials: true
      });
    }    
    
    stepVisible.value = true;
    useRemembered().admission.started = true;
  } catch (error: any) {
    console.log(`Error onStartedBtnClick. ${error} ${error.stack}`);
    errorAlert.value = `Oupss, une erreur est survenue...Detail: onStartedBtnClick ${error}`;
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
      <v-col cols="12" sm="12" lg="12">
        <UiParentCard :title="t('swatAdmission.pageTitle')" v-if="validInterestForm && !stepVisible">
          <p class="my-4 text-body-1 text-10">
            Excellent <b>{{ useUserProfile().first_name }}</b>, votre candidature a été retenue, votre profil s’aligne parfaitement avec les valeurs du 5.W.4.T.
            Félicitations et bienvenue chez 5.W.4.T!
            <br><br>
            Afin de complèter votre enrôlement au sein du 5.W.4.T et avoir votre status officiel de membre 5.W.4.T, il est nécessaire de complèter ce processus.
            ITWatts vous guidera à travers les différentes étapes. Cliquer sur "Commencer maintenant" pour commencer le processus.
            <br><br>
            A la fin du processus, vous receverez votre status officiel <b>"Membres 5.W.4.T 2025-2026"</b> et tous les privilèges associés.
          </p><br><br>
          <div v-if="!security.isLoggedIn() || !useUserProfile().user_id">
            <p class="my-4 text-body-1 text-10"><br>
              <b>Veuillez vous authentifier avec strava afin de poursuivre.</b>
            </p>
            <v-card-text>
              <a :href="config.serverApi.publicHostname + '/auth/strava'" class="social-button" id="strava-connect"> <span>{{ $t('signin.withStrava') }}</span></a>
            </v-card-text>
          </div>
          <div v-else>
            <v-btn color="primary" flat @click="onStartedBtnClick()">Commencer maintenant</v-btn>
          </div>
        </UiParentCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="12" lg="12">
        <v-progress-linear
            v-if="loading"
            indeterminate
            stream
            color="primary"            
          ></v-progress-linear>
          <v-stepper
            v-if="validInterestForm && stepVisible"
            v-model="step"
            :items="['Discord', 'Courriel', 'Strava', 'ZwiftPower', 'Zwift Companion', 'Terminer']"
            hide-actions
          >
          <template v-slot:item.1>
            <v-card>
              <div class="d-flex  justify-center">
                <img src='@/assets/images/itwatts/admission/discord_logo.svg' height="80"/>
              </div>
              <br>
              <h3 class="mb-1">{{ validatedDiscord ? '✅' : '❌' }} 1 - Lier compte Discord</h3>
              <h3 class="mb-1">{{ discordNameOkay === 'yes' ? '✅' : '❌' }} 2 - Identifiant Discord significatif</h3>

              <div v-if="validatedDiscord && discordNameOkay === 'yes'">
                <br>
                <b>Félicitations, vous avez bien lier votre compte avec succès.</b><br>
                <img src='@/assets/images/itwatts/bravo.gif' height="160"/><br><br>

                  Cliquer sur suivant afin de passer à la prochaine étape.
              </div>
              <div v-else>
                Afin de facilité la coordination et l’atteinte de sa mission, l’équipe 5.W.4.T préconise que la plateforme Discord soit utilisée lors de toutes les communications écrites et vocales en lien direct avec les activités e-sport de l’équipe.
                <br>
                Il est normal que vous vous sentez un peu "dépayser" pour les premières fois avec l'outil; pas de panique, vous allez l'apprendre, nos membres les plus expérimentés vont pouvoir vous aider !<br><br>
                On vous encourage à télécharger la version mobile afin de ne rien manquer. Vous serez invité(e) à creer votre compte après le téléchargement de l'application.
                (La version PC se retrouve ici: <a href="https://discord.com/">https://discord.com/</a>)<br>
                <a href="https://play.google.com/store/apps/details?id=com.discord" target="_blank">
                  <img src='@/assets/images/itwatts/admission/google_play.svg' height="40"/>
                </a><br>
                <a href="https://apps.apple.com/us/app/discord-talk-play-hang-out/id985746746" target="_blank">
                  <img src='@/assets/images/itwatts/admission/apple_store.svg' height="40"/>
                </a><br><br>
                 <br>
              </div>
              <div v-if="!validatedDiscord">
                Une fois que vous avez téléchargé et créer votre compte Discord, cliquer sur <v-btn color="primary" flat @click="linkDiscordAccount()" :disabled="loading">Joindre le serveur Discord 5.W.4.T</v-btn>
              </div>
                <div v-if="validatedDiscord && discordNameOkay !== 'yes'">
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
              
              <v-card-actions class="justify-end">
                <!--<v-btn flat @click="next">Suivant</v-btn>-->
                <v-btn flat @click="next" :disabled="loading || !validatedDiscord || discordNameOkay !== 'yes'">Suivant</v-btn>
              </v-card-actions>
            </v-card>
          </template>
          <template v-slot:item.2>
            <v-card>
              <div class="d-flex justify-center">
                <img src='@/assets/images/itwatts/admission/email_validation.png' height="150"/>
              </div><br>
              <h3 class="mb-1">{{ emailValidated ? '✅' : '❌'}} Validation courriel</h3>
              <p class="my-4 text-body-1 text-10">
                <div v-if="emailValidated">
                  <b>Félicitations, vous avez bien valider votre courriel avec succès.</b><br><br>
                  Cliquer sur suivant afin de passer à la prochaine étape.<br><br>
                  <img src='@/assets/images/itwatts/youpi.png' height="250"/>
                </div>
                <div v-else>                  
                  Votre courriel n'est pas validé présentement. Cliquer sur <a href="#" @click="sendEmailLink()" :disabled="loading">M'envoyer un lien </a> afin de recevoir un code à votre addresse courriel: <b>{{ email }}</b>.
                  <v-otp-input v-model="emailCode"></v-otp-input>
                  <div class="d-flex justify-center">
                  <v-btn color="primary" flat @click="verifyEmailLink()" :disabled="loading">Vérifier code</v-btn>
                  </div>                  
                </div>
              </p>
              <v-card-actions class="justify-space-between">
                <v-btn flat @click="prev" :disabled="true">Précédent</v-btn>
                <v-btn flat @click="next" :disabled="loading || !emailValidated">Suivant</v-btn>
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
                  Cliquer sur suivant afin de passer à la prochaine étape.<br><br>
                  <img src='@/assets/images/itwatts/very_nice_great_success.png' height="250"/>
              </div>
              <div v-else>
                Veuillez joindre l'équipe 5.W.4.T à l'addresse suivante: <a href="https://www.strava.com/clubs/1098468" target="_blank">https://www.strava.com/clubs/1098468</a> (Bouton Request to join).
                <br>Une fois complété, cliquer sur <v-btn color="primary" flat @click="acceptStravaClub()" :disabled="loading || disabledStravaAcceptButton">J'ai joint l'équipe 5.W.4.T sur strava</v-btn>
              </div>
              <v-card-actions class="justify-space-between">
                <v-btn flat @click="prev" :disabled="true">Précédent</v-btn>
                <!-- <v-btn flat @click="next">Suivant</v-btn>-->
                <v-btn flat @click="next" :disabled="loading || !stravaSwatClub">Suivant</v-btn>
              </v-card-actions>
            </v-card>
          </template>
          <template v-slot:item.4>
            <v-card>
              <div class="d-flex  justify-center">
                <img src='@/assets/images/itwatts/admission/zwiftpower_logo.png' height="120"/>
              </div>
              <br>
              <h3 class="mb-1">{{ validZwiftPowerLink ? '✅' : '❌' }} 1 - Lier compte ZwiftPower</h3>
              <h3 class="mb-1">{{ zwiftPowerJoinedSwatTeam ? '✅' : '❌' }} 2 - Joindre équipe 5.W.4.T</h3>
              <h3 class="mb-1">{{ zwiftPowerSwatPrimaryTeam ? '✅' : '❌' }} 3 - Équipe primaire 5.W.4.T</h3>
              <h3 class="mb-1">{{ zwiftPowerStravaLink ? '✅' : '❌' }} 4 - Lien Strava</h3>
              <h3 class="mb-1">{{ zwiftPowerValidBio ? '✅' : '❌' }} 5 - Bio</h3>              
              <h3 class="mb-1" v-if="zwiftPowerDualRecordingRequired">{{ zwiftPowerDualRecordingValid ? '✅' : '❌' }} 6 - Dual Recording</h3>
              
              <p v-if="validZwiftPowerLink && zwiftPowerJoinedSwatTeam && zwiftPowerSwatPrimaryTeam && zwiftPowerStravaLink && zwiftPowerValidBio && (!zwiftPowerDualRecordingRequired || (zwiftPowerDualRecordingRequired && !zwiftPowerDualRecordingValid && zwiftPowerDualRecordingWillDo === 'yes'))" class="my-4 text-body-1 text-10">
                <b>Félicitations, vous avez bien travaillé, le plus gros est fait!</b><br><br>
                  Cliquer sur suivant afin de passer à la prochaine étape.<br><br>
                  <img src='@/assets/images/itwatts/good_job.png' height="250"/>
              </p>
              <p v-else>
                <br>ZwiftPower est un outil d'analyse de performance lorsque vous faite des courses sur Zwift. <br>Veuillez tout d'abord créer votre compte à l'addresse suivante si ce n'est pas déjà fait: 
                <a href="https://zwiftpower.com/" target="_blank">https://zwiftpower.com/</a>.<br><br>
              </p>

              <p v-if="!validZwiftPowerLink" class="my-4 text-body-1 text-10">
                <div class="d-flex justify-center">
                  <h2 class="mb-1">1 - Lier compte ZwiftPower</h2><br><br>
                </div>
                <br>Veuillez indiquer votre identifiant ZwiftPower.
                Cliquez sur votre photo de profil (en haut à droite) et sélectionnez « Profil ZwiftPower ». Regardez le lien web dans la barre, le numéro après le z= est votre identifiant : par exemple : https://zwiftpower.com/profile.php?z=[IDENTIFIANT ZWIFTPOWER]

                <v-row>
                  <v-col cols="5"><br>
                    <v-text-field 
                      :rules="validateZwiftPowerIDRules"
                      v-model="zpID" label="ZwiftPower ID (ie: 1241072)" variant="outlined" required>
                    </v-text-field><br>
                  </v-col>
                </v-row>

                <b>Une fois complété, cliquer sur</b> <v-btn color="primary" flat @click="fetchZwiftPowerAccount()" :disabled="!zpID || !isFormValid || loading">Lier mon compte ZwiftPower maintenant</v-btn>
              </p>
              <p v-if="validZwiftPowerLink && !zwiftPowerJoinedSwatTeam" class="my-4 text-body-1 text-10">
                <div class="d-flex justify-center">
                  <h2 class="mb-1">2 - Joindre équipe 5.W.4.T</h2><br><br>
                </div>

                Joindre le l'équipe 5.W.4.T sur ZwiftPower ici: <a href="https://zwiftpower.com/team.php?id=19126" target="_blank">https://zwiftpower.com/team.php?id=19126</a> (Bouton Join5.W.4.T en haut à droite en vert) 
                <a href="" v-on:click="zwiftpowerJoinSwatExample = !zwiftpowerJoinSwatExample" v-on:click.prevent="">Aide supplémentaire</a>                
                <br><br>

                <b>Une fois complété, cliquer sur</b> <v-btn color="primary" flat @click="acceptSwatMemberOnZwiftPower()" :disabled="loading">J'ai joint l'équipe 5.W.4.T sur ZwiftPower</v-btn>
                <br>
                
                <img v-if="zwiftpowerJoinSwatExample" src='@/assets/images/itwatts/admission/zwiftpower_join_swat.png'/><br><br><br><br>
              </p>
              <p v-if="validZwiftPowerLink && zwiftPowerJoinedSwatTeam && !zwiftPowerSwatPrimaryTeam" class="my-4 text-body-1 text-10">
                <div class="d-flex justify-center">
                  <h2 class="mb-1">3 - Équipe primaire 5.W.4.T</h2><br><br>
                </div>
                
                Modifier l'équipe 5.W.4.T comme équipe primaire sur ZwiftPower ici: <a href="https://zwiftpower.com/team.php?id=19126" target="_blank">https://zwiftpower.com/team.php?id=19126</a> (Cliquer sur "My Teams" et le boutton "Make 5.W.4.T my Primary team".) 
                <a href="" v-on:click="zwiftpowerSwatPrimaryTeamExample = !zwiftpowerSwatPrimaryTeamExample" v-on:click.prevent="">Aide supplémentaire</a>
                <br><br>

                Une fois complété, cliquer sur <v-btn color="primary" flat @click="refresh()" :disabled="loading">J'ai modifié l'équipe 5.W.4.T comme équipe primaire</v-btn>
                <br><br>                
                <img v-if="zwiftpowerSwatPrimaryTeamExample" src='@/assets/images/itwatts/admission/zwiftpower_make_swat_primary_team.png' width="100%"/><br><br><br><br>
              </p>
              <p v-if="validZwiftPowerLink && zwiftPowerJoinedSwatTeam && zwiftPowerSwatPrimaryTeam && !zwiftPowerStravaLink" class="my-4 text-body-1 text-10">
                <div class="d-flex justify-center">
                  <h2 class="mb-1">4 - Lien Strava</h2><br><br>
                </div>
                
                Ajouter votre lien Strava à votre profile ZwiftPower ici: <a href="https://zwiftpower.com/" target="_blank">https://zwiftpower.com</a> (Cliquez sur votre photo de profil (en haut à droite), sélectionnez « ZwiftPower Profile » et cliquer sur l'onglet "Settings".) 
                <a href="" v-on:click="zwiftpowerStravaLinkExample = !zwiftpowerStravaLinkExample" v-on:click.prevent="">Aide supplémentaire</a>                
                <br><br>

                <b>Une fois complété, cliquer sur</b> <v-btn color="primary" flat @click="refresh()" :disabled="loading">J'ai lié mon Strava à mon profile ZwiftPower</v-btn>
                <br><br>                
                <img v-if="zwiftpowerStravaLinkExample" src='@/assets/images/itwatts/admission/zwiftpower_strava_link.png' width="100%"/><br><br><br><br>
              </p>
              <p v-if="validZwiftPowerLink && zwiftPowerJoinedSwatTeam && zwiftPowerSwatPrimaryTeam && zwiftPowerStravaLink && !zwiftPowerValidBio" class="my-4 text-body-1 text-10">
                <div class="d-flex justify-center">
                  <h2 class="mb-1">5 - Bio</h2><br><br>
                </div>                
                Choisir le type de Bio que vous aimeriez avoir:
                <br><br>
                <v-radio-group hide-details="auto" v-model="zwiftpowerBioLogo" :rules="[rules.required]">
                  <v-radio label="Profile avec logo 5.W.4.T" color="primary" value="withClubLogoAndClub" v-if="zwiftpowerBioWithClubLogoAndClub"></v-radio>
                  <v-radio label="Profile sans logo 5.W.4.T" color="primary" value="withoutLogo"></v-radio>
                </v-radio-group>
                <br><a href="" v-on:click="zwiftpowerBioUiExample = !zwiftpowerBioUiExample" v-on:click.prevent="" v-if="zwiftpowerBioLogo">Voir un exemple visuel de cette option</a><br><br>
                <img src='@/assets/images/itwatts/admission/zwiftpower_jo_irl.png' v-if="zwiftpowerBioUiExample && zwiftpowerBioLogo === 'withClubLogoAndClub'"/>
                <img src='@/assets/images/itwatts/admission/zwiftpower_jo_primary.png' v-if="zwiftpowerBioUiExample && zwiftpowerBioLogo === 'withoutLogo'"/>
                <br>
                Ajouter une bio à votre profile ZwiftPower: <a href="https://zwiftpower.com/" target="_blank">https://zwiftpower.com</a> (Cliquez sur votre photo de profil (en haut à droite), sélectionnez « ZwiftPower Profile » et cliquer sur l'onglet "Settings".) 
                Coper tout le text (incluant les codes) ci-bas tel quel.
                <a href="" v-on:click="zwiftpowerBioExample = !zwiftpowerBioExample" v-on:click.prevent="">Aide supplémentaire</a>
                <v-col cols="8">
                  <v-textarea rows="15" outlined v-if="zwiftpowerBioLogo === 'withClubLogoAndClub'" v-model="zwiftpowerBioWithClubLogoAndClub"></v-textarea>
                  <v-textarea rows="15" outlined v-if="zwiftpowerBioLogo === 'withoutLogo'" v-model="zwiftpowerBioWithoutLogo"></v-textarea>
                </v-col>
                <br><br>
                <b>Une fois complété, cliquer sur</b> <v-btn color="primary" flat @click="refresh()" :disabled="loading">J'ai ajouté une bio à mon profile ZwiftPower</v-btn>
                <br><br>                
                <img v-if="zwiftpowerBioExample" src='@/assets/images/itwatts/admission/zwiftpower_bio.png' width="100%"/><br><br><br><br>
              </p>
              <p v-if="validZwiftPowerLink && zwiftPowerJoinedSwatTeam && zwiftPowerSwatPrimaryTeam && zwiftPowerStravaLink && zwiftPowerValidBio && zwiftPowerDualRecordingRequired && !zwiftPowerDualRecordingValid && zwiftPowerDualRecordingWillDo !== 'yes'" class="my-4 text-body-1 text-10">
                <div class="d-flex justify-center">
                  <h2 class="mb-1">6 - Dual Recording</h2><br><br>
                </div>
                Votre profile ZwiftPower n'affiche aucun Dual Recording depuis 6 mois.<br> Il est exigé à nos coureurs
                de catégorie 2 et plus selon la charte de puissance critique proposée par Any Coggan. 
                Ceci correspond à un CP20 de 4.4wkg (FTP de 4.18wkg) pour un homme et un CP20 de 3.8wkg (FTP de 3.64wkg) pour une femme. 
                Référence: <a href= "https://zwiftinsider.com/rider-categorization-based-on-ftp-how-do-you-rank/" target="_blank">https://zwiftinsider.com/rider-categorization-based-on-ftp-how-do-you-rank/</a>)<br><br>

                Si vous n'avez jamais fait de dual recording, pas de panique ! Nous avons un guide qui explique étape par étape. 
                Veuillez cliquer sur le <a href="https://docs.google.com/document/d/1_h1dis-YMGAJI85AX3axfxsrakC3JK5P22UDp_C8VYU/edit?usp=sharing" target="_blank">Guide sur comment effectuer un Dual Recording</a>
                
                <br><br>
                <v-radio-group hide-details="auto" v-model="zwiftPowerDualRecordingWillDo" :rules="[rules.required]">
                  <v-radio label="Oui, je m'engage à en faire un dans les plus brefs délais" color="primary" value="yes"></v-radio>
                  <v-radio label="Non, il ne sera pas possible pour moi." color="primary" value="no"></v-radio>
                </v-radio-group>
                <br>
                Une vois votre dual recording effectué, ajouter votre dual recording à votre profile ZwiftPower ici: <a href="https://zwiftpower.com/" target="_blank">https://zwiftpower.com</a> (Cliquez sur votre photo de profil (en haut à droite), sélectionnez « ZwiftPower Profile » et cliquer sur l'onglet "Analysis".) 
                <a href="" v-on:click="zwiftpowerDualRecordingExample = !zwiftpowerDualRecordingExample" v-on:click.prevent="">Aide supplémentaire</a>
                <br><br>
                <br><br>                
                <img v-if="zwiftpowerDualRecordingExample" src='@/assets/images/itwatts/admission/zwiftpower_dual_recording.png' width="100%"/><br><br><br><br>
              </p>              
              <v-card-actions class="justify-space-between">
                <v-btn flat @click="prev" :disabled="true">Précédent</v-btn>
                <!-- <v-btn flat @click="next">Suivant</v-btn>-->
                <v-btn flat @click="next" :disabled="loading || !validZwiftPowerLink || !zwiftPowerJoinedSwatTeam || !zwiftPowerSwatPrimaryTeam || !zwiftPowerStravaLink || !zwiftPowerValidBio || (zwiftPowerDualRecordingRequired && !zwiftPowerDualRecordingValid && zwiftPowerDualRecordingWillDo !== 'yes')">Suivant</v-btn>
              </v-card-actions>
            </v-card>
          </template>          
          <template v-slot:item.5>
            <v-card>
              <div class="d-flex justify-center">
                <img src='@/assets/images/itwatts/admission/zwift_companion_logo.png' height="250"/><br><br><br><br>
              </div>
              <h3 class="mb-1">{{ validZwiftCompanionClub ? '✅' : '❌' }} 1 - Joindre club "5.W.4.T"</h3>
              <h3 class="mb-1">{{ validZwiftCompanionName ? '✅' : '❌' }} 2 - Identifiant Zwift</h3>
              <h3 class="mb-1">{{ validZwiftCompanionWeight ? '✅' : '❌' }} 3 - Poids</h3>

              <p v-if="validZwiftCompanionClub && validZwiftCompanionName && validZwiftCompanionWeight" class="my-4 text-body-1 text-10">
                <b>Félicitations, vous êtes seulement à un click de devenir un membre 5.W.4.T officiel....!</b><br><br>
                Cliquer sur suivant afin de complèter ton adhésion.<br><br>
                  <img src='@/assets/images/itwatts/drummer.gif' height="250"/>
              </p>
              <p v-else>
                L'application mobile Zwift Companion transforme ton appareil mobile en télécommande pour Zwift et te permet de zwifter de façon plus amusante et plus sociale.
               Entre autres avantages, l'application Zwift Companion, utilisée avec Zwift, te permet de voir les cartes et de discuter, de faire des demi-tours et d'interagir avec des Zwifters.
                <br>
                <a href="https://play.google.com/store/apps/details?id=com.zwift.android.prod" target="_blank">
                  <img src='@/assets/images/itwatts/admission/google_play.svg' height="40"/>
                </a><br>
                <a href="https://apps.apple.com/us/app/zwift-companion/id934083691" target="_blank">
                  <img src='@/assets/images/itwatts/admission/apple_store.svg' height="40"/>
                </a><br><br>
              </p>
              <p v-if="!validZwiftCompanionClub" class="my-4 text-body-1 text-10">
                <div class="d-flex justify-center">
                  <h2 class="mb-1">1 - Joindre club "5.W.4.T"</h2><br><br>
                </div>
                Vous n'avez pas encore joins l'équipe 5.W.4.T sur zwift companion. Il est possible d'y parvenir à l'aide du lien suivant:
                <a href="https://zwift.5w4t.com" target="_blank">https://zwift.5w4t.com</a> (Cliquer sur "Apply")<br>
                <b>Une fois complété, cliquer sur</b> <v-btn color="primary" flat @click="acceptZwiftClub()" :disabled="loading">J'ai joint l'équipe 5.W.4.T sur zwift</v-btn>
              </p>
              <p v-if="validZwiftCompanionClub && !validZwiftCompanionName" class="my-4 text-body-1 text-10">
                <div class="d-flex justify-center">
                  <h2 class="mb-1">2 - Identifiant Zwift</h2><br><br>
                </div>
                <b>Ajouter "[5.W.4.T]" à votre Identifiant Zwift.</b> Pour ce faire, aller sur votre profile Zwift <a href="https://www.zwift.com/ca/settings/profile" target="_blank">https://www.zwift.com/ca/settings/profile</a>
                <br><a href="" v-on:click="zwiftProfileExample = !zwiftProfileExample" v-on:click.prevent="">Aide supplémentaire</a><br><br>
                <img v-if="zwiftProfileExample" src='@/assets/images/itwatts/admission/zwift_profile.png' height="1000"/>
                L’inscription du « In-game Team Tag » avec syntaxe exacte à la fin du nom. La syntaxe exacte est : Prénom [5.W.4.T].<br>Exemple : Jo [5.W.4.T]<br><br> Tout ce qui précède le « In-game Team Tag » exigé est à l’entière discrétion du membre; il peut inclure un second « Team tag », une appartenance à une équipe/club IRL, etc…<br>Exemple : Jo [RPV] [5.W.4.T]
                <br><br>
                <b>Une fois complété, cliquer sur</b> <v-btn color="primary" flat @click="syncZwiftProfile()" :disabled="loading">J'ai modifié mon identifiant dans mon profile Zwift</v-btn>
              </p>
              <p v-if="validZwiftCompanionClub && validZwiftCompanionName && !validZwiftCompanionWeight" class="my-4 text-body-1 text-10">
                  <h2 class="mb-1">3 - Poids</h2><br><br>                
                Votre poids n'a pas été modifié de plus de 6 mois. <b>Veuillez modifier votre poids dans votre profile Zwift.</b>
                (Si votre poids n'a pas changé, veuillez forcer une légère modification (ex: 0.1kg)) afin que ITWatts puisse détecter les changements.
                <br><br>
                Votre poids a un impact énorme sur l’algorithme de Zwift et donc, de vos performances. C'est donc essentiel de le mettre 
                à jour au minimum une fois par saison (i.e. automne et hiver)). La pesé devrait se faire au temps où que vous zwifter le plus souvent afin de refléter votre poids réel lors des activités e-sports.
                Pour ce faire, aller sur votre profile Zwift <a href="https://www.zwift.com/ca/settings/profile" target="_blank">https://www.zwift.com/ca/settings/profile</a>
                <br><a href="" v-on:click="zwiftProfileExample = !zwiftProfileExample" v-on:click.prevent="">Aide supplémentaire</a><br><br>
                <img v-if="zwiftProfileExample" src='@/assets/images/itwatts/admission/zwift_profile.png' height="1000"/>
                <b>Une fois complété, cliquer sur</b> <v-btn color="primary" flat @click="validZwiftCompanionWeight = true" :disabled="loading">J'ai modifié mon poids dans mon profile Zwift</v-btn>
                
              </p>              
              <v-card-actions class="justify-space-between">
                <v-btn flat @click="prev" :disabled="true">Précédent</v-btn>
                <v-btn flat @click="completeSwatMemberOnboarding()" :disabled="!validZwiftCompanionClub || !validZwiftCompanionName || !validZwiftCompanionWeight || loading">Suivant</v-btn>
              </v-card-actions>
            </v-card>
          </template>
          <template v-slot:item.6>
            <v-card>
              <div class="d-flex justify-center">
                <img src='@/assets/images/itwatts/congrats.gif' height="300"/><br><br><br><br>
              </div>
              <p class="my-4 text-body-1 text-10">
                <b>Félicitations, vous êtes maintenant un membre 5.W.4.T officiel !!!</b><br><br>
                  On t'invite maintenant à te présenter dans le serveur Discord dans le salon <a href="https://discord.com/channels/1035641462324465697/1271461522341761054" target="_blank">#introduction-présentation</a>.

                  <br><br><b>Autres liens intéressants:</b><br>
                  <a href="https://facebook.5w4t.com">Suivez l'équipe 5.W.4.T sur Facebook!</a><br>
                  <a href="https://instagram.5w4t.com">Suivez l'équipe 5.W.4.T sur Instagram!</a><br>
                  <a href="https://xert.5w4t.com">Suivez l'équipe 5.W.4.T sur Xert!</a><br>
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

