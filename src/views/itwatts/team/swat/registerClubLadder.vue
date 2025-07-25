<script setup lang="ts">
import axios from 'axios';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

import { useUserProfile } from '@/stores/user-profile';
import config from "@/config/config.json";
import security from "@/security";
import clubLadderBanner from '@/assets/images/itwatts/clubladder/clubLadderBanner.png';

const { t, locale } = useI18n({ useScope: 'global' });

// theme breadcrumb
const page = ref({ title: t('swatRegisterClubLadder.pageTitle') });
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatRegisterClubLadder.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatRegisterClubLadder.pageTitle'),
    disabled: true,
  },
]);

const frequency = ref();
const saved = ref();
const isFormValid = ref();
const myform = ref();
const comments = ref('');
const capInterest = ref('');
const lundi = ref([]);
const mardi = ref([]);
const mercredi = ref([]);
const jeudi = ref([]);
const vendredi = ref([]);
const samedi = ref([]);
const dimanche = ref([]);
const userFormResult = ref([]);
const loading = ref(false);
const hideForm = ref(false);
const errorAlert = ref();
const formName = 'registerClubLadder2024-09';

async function refresh() {
  if (!security.isTokenValid([])) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ADMIN', 'SWAT_MEMBER_2024_2025'];  
  if (!security.isTokenValid(rolesRequired)) {
    errorAlert.value = `Cette page est exclusivement réservés aux membres 5.W.4.T 2024-2025. Avez-vous complété votre formulaire d'admission ?`;
    hideForm.value = true;
    return;
  }
  
  loading.value = true;
  try {
    let response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}?fields=zwift_racing_app_profile`,
    {
      withCredentials: true
    });

    if (!response.data.zwift_racing_app_profile || !response.data.zwift_racing_app_profile.race ||
      !response.data.zwift_racing_app_profile.race.rating
    ) {
      errorAlert.value = `Vous n'êtes pas éligible pour vous inscrire à cette série, car vous n'avez pas de course récentes. Vous devez avoir 3 courses dans les 90 derniers jours dans votre profile ZwiftPower.`;
      hideForm.value = true;
      return;
    } else {
      response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/${formName}`,
      {
        withCredentials: true
      });
      if (response.data) {      
        userFormResult.value = response.data.content;
        bodyContentToForm(JSON.parse(response.data.content));
        hideForm.value = true;
        saved.value = true;
      }
    }    
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      // Normal for the form to receive a 404...
      return;
    }
    errorAlert.value = `Oupss, une erreur est survenue...`;
    console.log(`An error occured: ${err} stack: ${err.stack}`);
  }
  loading.value = false;
}

const validateStatus = ref([
  (value: any) => {
    return value.length > 0 || false
  }
]);

const validateCheckbox = ref([
  (value: any) => value.length > 0,
]);

const rulesRequired = ref([
  (value: any) => !!value || 'Ce champ est obligatoire.',
]);

function bodyContentToForm(content : any) {
  frequency.value = content.frequency;
  capInterest.value = content.capInterest;
  lundi.value = content.lundi || [];
  mardi.value = content.mardi || [];
  mercredi.value = content.mercredi || [];
  jeudi.value = content.jeudi || [];
  vendredi.value = content.vendredi || [];
  samedi.value = content.samedi || [];
  dimanche.value = content.dimanche || [];  
  comments.value = content.comments || [];  
}

function formToBodyContent() {  
  return {
    capInterest: capInterest.value,
    lundi: lundi.value,
    mardi: mardi.value,
    mercredi: mercredi.value,
    jeudi: jeudi.value,
    vendredi: vendredi.value,
    samedi: samedi.value,
    dimanche: dimanche.value,
    comments: comments.value,
    frequency: frequency.value,
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

      if (userFormResult.value.length !== 0) {
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
        saved.value = true;
      } else {
        errorAlert.value = `Une erreur est survenue lors de la sauvegarde, veuillez contacter Jonathan Bisson.`;
        saved.value = false;
      }    
    } catch (err: any) {
      console.log(`An error has occured: ${err} stack: ${err.stack}`);
      errorAlert.value = `Une erreur est survenue lors de la sauvegarde, veuillez contacter Jonathan Bisson.`;
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
    </v-col>
  </v-row>
  <v-form ref="myform" v-model="isFormValid">
    <v-row>
      <v-col cols="12">      
          <UiParentCard :title="t('swatRegisterClubLadder.pageTitle')">
            <v-img :src="clubLadderBanner"></v-img>
            <p class="my-4 text-body-1 text-10">
              <br>
              Faites-nous connaître votre intérêt pour la participation au Club Ladder.
            </p>            
            <div v-if="saved">
              <p class="my-4 text-body-1 text-10"><br>
                <b>Vous êtes bien inscrit! Si vous désirez modifier certaines questions, cliquer sur Modifier.</b>
              </p>
              <v-btn color="primary" flat @click="hideForm = false">Modifier...</v-btn>
            </div>
          </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Fréquence de course">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Veuillez indiquer à quelle fréquence croyez-vous faire les évènements de type Ladder.
            </div>
            <v-radio-group class="mt-4" v-model="frequency" :rules="rulesRequired">
              <v-radio label="2 à 3 fois semaine" color="primary" value="2_3_times_a_week" ></v-radio>
              <v-radio label="1 fois semaine" color="primary" value="1_every_week" ></v-radio>
              <v-radio label="1 fois aux 2-3 semaines" color="primary" value="1_every_2_3_weeks" ></v-radio>
            </v-radio-group>          
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Vos disponibilités">
          <p class="my-4 text-body-1 text-10">
            Inscrivez vos disponibilités au mieux de vos connaissances.
          <br>          
        </p>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
          </v-col>
          <v-col cols="2">
            7:00
          </v-col>
          <v-col cols="2">
            9:00
          </v-col>
          <v-col cols="2">
            midi
          </v-col>
          <v-col cols="2">
            17:00 - 18:00
          </v-col>
          <v-col cols="2">
            19:00 - 20:00
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>lundi</b>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="7h" v-model="lundi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="9h" v-model="lundi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="midi" v-model="lundi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="17h-18h" v-model="lundi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="19h-20h" v-model="lundi"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>mardi</b>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="7h" v-model="mardi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="9h" v-model="mardi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="midi" v-model="mardi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="17h-18h" v-model="mardi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="19h-20h" v-model="mardi"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>mercredi</b>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="7h" v-model="mercredi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="9h" v-model="mercredi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="midi" v-model="mercredi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="17h-18h" v-model="mercredi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="19h-20h" v-model="mercredi"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>jeudi</b>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="7h" v-model="jeudi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="9h" v-model="jeudi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="midi" v-model="jeudi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="17h-18h" v-model="jeudi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="19h-20h" v-model="jeudi"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>vendredi</b>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="7h" v-model="vendredi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="9h" v-model="vendredi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="midi" v-model="vendredi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="17h-18h" v-model="vendredi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="19h-20h" v-model="vendredi"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>samedi</b>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="7h" v-model="samedi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="9h" v-model="samedi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="midi" v-model="samedi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="17h-18h" v-model="samedi"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="19h-20h" v-model="samedi"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>dimanche</b>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="7h" v-model="dimanche"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="9h" v-model="dimanche"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="midi" v-model="dimanche"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="17h-18h" v-model="dimanche"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="19h-20h" v-model="dimanche"></v-checkbox>
          </v-col>
        </v-row>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Intérêt de capitaine">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              J'ai de l'intérêt pour agir à titre de capitaine (Le rôle du capitaine est de coordonner les ''Challenges'' avec les capitaines des équipes adverses)
            </div>
            <v-radio-group class="mt-4" v-model="capInterest" :rules="rulesRequired">
              <v-radio label="Oui" color="primary" value="yes" ></v-radio>
              <v-radio label="Non" color="primary" value="no" ></v-radio>
            </v-radio-group>          
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Autres commentaires">                      
          <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Si vous avez des questions, suggestions ou commentaires concernant les courses WTRL TTT, nous aimerions les connaître. On est  à l'écoute et ouvert à améliorer l'expérience de course de l'équipe et de nos membres.
            </div>
            <v-textarea label="Autres commentaires" hide-details="auto" v-model="comments"></v-textarea>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="info"
          title="Succès"
          text="Nous avons bien reçu le tout. Vous allez être contacté prochainement!"
          v-if="saved"
        ></v-alert>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <v-btn color="primary" flat @click="submit" :disabled="!isFormValid && !loading">Sauvegarder</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

