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
import { formatDateToYYYYMMDD, shortDate } from '@/utils/date';

import wtrlWallBanner from '@/assets/images/itwatts/wtrl/5w4t_wtrl_banner.png';

const { t, locale } = useI18n({ useScope: 'global' });

// theme breadcrumb
const page = ref({ title: t('swatRegisterTTT.pageTitle') });
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatRegisterTTT.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatRegisterTTT.pageTitle'),
    disabled: true,
  },
]);

const hideForm = ref(false);
const saved = ref();
const isFormValid = ref();
const myform = ref();

const loading = ref(false);
const comments = ref('');
const capInterest = ref('');
const preferredTeam = ref('');
const windowPeriodClosed = ref(false);
const dsInterest = ref('');
const preferredTime12h00 = ref('');
const preferredTime18h30 = ref('');
const preferredTime19h30 = ref('');
const experienceInTTT = ref('');
const needMentor = ref('');
const canBeMentor = ref('');
const errorAlert = ref();
const catWomenOnly = ref();
const catMixte = ref();
const rating = ref();
const enableReview = ref(false);

const userFormResult = ref([]);
let formName = '';

const rules = ref({
  required: (value: any) => !!value || t('validations.required'),
  email: (value: any) => {
      const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(value) || t('validations.invalidEmail');
    },
});

function getNextThursday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilNextThursday = (4 - dayOfWeek + 7) % 7 || 7; // 4 is Thursday (0-based index)  
    const nextThursday = new Date(today);
    nextThursday.setTime(today.getTime() + daysUntilNextThursday * 1000 * 60 * 60 * 24);    
    return nextThursday;
}

function getPrevThursday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilNextThursday = ((4 - dayOfWeek + 7) % 7 || 7) - 7; // 4 is Thursday (0-based index)  
    const nextThursday = new Date(today);
    nextThursday.setTime(today.getTime() + daysUntilNextThursday * 1000 * 60 * 60 * 24);    
    return nextThursday;
}

async function refresh() {
  const nextTursday = getNextThursday();
  formName = `registerWTRLTTT${formatDateToYYYYMMDD(nextTursday)}`;
  
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
  
  try {
    errorAlert.value = '';
    let response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}?fields=zp_profile(events)`,
    { withCredentials: true });
    const prevThursday = getPrevThursday();
    for (const event of response.data.zp_profile.events) {
      if (event.event_title.includes('WTRL Team Time Trial')) {
        const eventDate = new Date(event.event_date * 1000);
        if (eventDate.getFullYear() === prevThursday.getFullYear() &&
          eventDate.getMonth() === prevThursday.getMonth() &&
          eventDate.getDate() === prevThursday.getDate()
        ) {
          enableReview.value = true;
          break;
        }
      }      
    }
  } catch (err: any) {
    errorAlert.value = `Une erreur est survenue, Detail: ${err}`;
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  }

  try {
    let response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/${formName}`,
    {
      withCredentials: true
    });
    const now = new Date();
    if (response.data) {
      userFormResult.value = response.data.content;
      bodyContentToForm(JSON.parse(response.data.content));
      hideForm.value = true;
      saved.value = true;
    } 
  } catch (err: any) {
    // Can happens if form is not there.
    if (err.response.status === 404) {
      // Check if registration window is closed off.
      const now = new Date();
      if ((now.getDay() === 3 && now.getHours() > 20) || now.getDay() === 4) {
        hideForm.value = true;
        windowPeriodClosed.value = true;
      }
    }
  }  
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
  capInterest.value = content.capInterest;
  dsInterest.value = content.dsInterest;
  comments.value = content.comments;  
  preferredTime12h00.value = content.preferredTime12h00;
  preferredTime18h30.value = content.preferredTime18h30;
  preferredTime19h30.value = content.preferredTime19h30;
  experienceInTTT.value = content.experienceInTTT;
  needMentor.value = content.needMentor;
  canBeMentor.value = content.canBeMentor;
  preferredTeam.value = content.preferredTeam;
  catWomenOnly.value = content.catWomenOnly;
  catMixte.value = content.catMixte;
  rating.value = content.rating;
}

function formToBodyContent() {  
  return {    
    capInterest: capInterest.value,
    dsInterest: dsInterest.value,
    comments: comments.value,    
    preferredTime12h00: preferredTime12h00.value,
    preferredTime18h30: preferredTime18h30.value,
    preferredTime19h30: preferredTime19h30.value,
    experienceInTTT: experienceInTTT.value,
    needMentor: needMentor.value,
    canBeMentor: canBeMentor.value,
    preferredTeam: preferredTeam.value,
    catWomenOnly: catWomenOnly.value,
    catMixte: catMixte.value,
    rating: rating.value,
  }
}

async function submit() {
  myform.value.validate();

  if (isFormValid.value) {
    let response = null;

    loading.value = true;
    errorAlert.value = '';
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
        errorAlert.value = `Une erreur est survenue lors de la sauvegarde`;
        saved.value = false;
      }    
    } catch (err: any) {
      console.log(`An error has occured: ${err} stack: ${err.stack}`);
      errorAlert.value = `Une erreur est survenue lors de la sauvegarde, Detail: ${err}`;
      saved.value = false;
    }
    loading.value = false;
  }
}

async function removeRegistration() {
  loading.value = true;
  try {
    const response = await axios.delete(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/${formName}`,
      {
        withCredentials: true,
      });
  } catch (err: any) {
    console.log(`An error has occured: ${err} stack: ${err.stack}`);
    errorAlert.value = `Une erreur est survenue lors de la sauvegarde, Detail: ${err}`;
    saved.value = false;
  }
  loading.value = false;  
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
          <UiParentCard :title="t('swatRegisterTTT.pageTitle') + ' - ' + shortDate(getNextThursday())">
            <v-img :src="wtrlWallBanner" class="mx-auto"/>
              
            <p class="my-4 text-body-1 text-10">
              La WTRL Team Time Trial (TTT) est une courses contre la montre en équipe (composée de 3 à 8 coureurs) qui se déroule les jeudi.
              La durée du parcours est généralement de 45 minutes. Les inscriptions se font à chaque semaine en fonction de la disponibilité de tous et les équipes seront formées en fonction des forces de chacun.
              <br><br>
              La date limite pour les inscriptions est fixée à <b>20h le mercredi</b>. La formation des équipes seront annoncée le jeudi matin. 
              C'est une super belle activité d'équipe et surtout, super FUN!

              <br><br>
              Faites-nous connaître votre intérêt pour la participation à la WTRL TTT du <b>{{ shortDate(getNextThursday()) }}</b>.
            </p>
            
            <div v-if="saved && !windowPeriodClosed">
              <p class="my-4 text-body-1 text-10"><br>
                <b>Vous êtes bien inscrit! Si vous désirez modifier certaines questions, cliquer sur Modifier.</b>
              </p>
              <v-btn color="primary" flat @click="hideForm = false;saved = false">Modifier...</v-btn>&nbsp;&nbsp;
              <v-btn color="primary" flat @click="removeRegistration">Je ne suis plus dispo</v-btn>
            </div>
            <div v-if="hideForm && windowPeriodClosed">
              <p class="my-4 text-body-1 text-10"><br>
                <b>La prériode d'inscription pour le TTT de cette semaine est maintenant fermé. Les inscriptions pour le prochain TTT ouvrira à partir de vendredi.</b>
              </p>
            </div>
          </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Horaire ZRL">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Quelle heure préférez-vous courser ce {{ shortDate(getNextThursday()) }} ?
            </div>
            <v-row class="align-center">
              <v-col cols="12" sm="2">
                <b>Midi (12:00)</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="preferredTime12h00" :rules="[rules.required]">
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
              <v-radio-group inline hide-details="auto" v-model="preferredTime18h30" :rules="[rules.required]">
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
              <v-radio-group inline hide-details="auto" v-model="preferredTime19h30" :rules="[rules.required]">
                <v-radio label="Impossible" color="primary" value="impossible"></v-radio>
                <v-radio label="Possible" color="primary" value="possible"></v-radio>
                <v-radio label="De préférence" color="primary" value="de_preference"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>       
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="false">
        <UiParentCard title="Ma préférence de catégorie">          
          <v-checkbox label="Je préfère courser dans une équipe mixte de préférence" hide-details="auto" value="mixte" v-model="catMixte"></v-checkbox>
          <v-checkbox label="Je préfère courser dans une équipe fille seulement de préférence" hide-details="auto" value="women" v-model="catWomenOnly"></v-checkbox>          
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Quelle est votre expérience dans les course contre la montre en équipe?">
            <v-checkbox label="J'ai participé à au moins une course TTT" hide-details="auto" value="true" v-model="experienceInTTT"></v-checkbox>
            <v-checkbox label="J'aimerais avoir un mentor avant ma première course afin de me guider un peu" hide-details="auto" value="true" v-model="needMentor"></v-checkbox>
            <v-checkbox label="Je me prète disponible pour être mentor d'un membre 5.W.4.T pour une course de TTT, si nécessaire" hide-details="auto" value="true" v-model="canBeMentor"></v-checkbox>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Préférence d'équipe">
          <v-radio-group inline hide-details="auto" v-model="preferredTeam" :rules="rulesRequired">
            <v-radio label="Je préfère être dans une équipe de même niveau que moi (ou moin) afin de pouvoir aider mon équipe d'avantage." color="primary" value="low"></v-radio>  
            <v-radio label="Je préfère être dans une équipe de même niveau que moi (ou plus) et je suis prèt à me sacrifier pour l'équipe si nécessaire." color="primary" value="high"></v-radio>              
          </v-radio-group>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Veuillez indiquer votre niveau d'intérêt pour certains rôles de l'équipe?">          
          <p class="my-4 text-body-1 text-10">
          Si vous avez de l'intérêt mais n'avez pas d'expérience, pas de soucis, nous allons s'assurer de vous donner toute l'information afin de vous donner tous les outils avant la course.<br><br>
          <b>Capitaine d'équipe</b>: Favorise la cohésion entre les membres de son équipe lors de courses et s’assure que tous les coureurs sont prêts à la ligne de départ (inscription WTRL, choix de vélo, technicalité du parcour, répondre aux questions, etc.).
          <br>
          <br>
          <b>Directeur sportif / Directrice sportive</b>: Participe à la course uniquement sous discord avec les autres coureurs de l'équipe dans le but de donner des conseils techniques, rappels des différents défis et technicalités d'un parcours donné et encourage les différents membres de l'équipe. Il/elle est la personne ressource lors de la course.
        </p>
        <v-row class="align-center">      
          <v-col cols="12" sm="2" v-if="!hideForm">
            <b>Capitaine d'équipe</b>
          </v-col>
          <v-col>
            <v-radio-group inline hide-details="auto" v-model="capInterest" :rules="rulesRequired">
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
            <v-radio-group inline hide-details="auto" v-model="dsInterest" :rules="rulesRequired">
              <v-radio label="Aucun / Peu" color="primary" value="litle"></v-radio>
              <v-radio label="Moyennement" color="primary" value="medium"></v-radio>
              <v-radio label="Beaucoup" color="primary" value="a_lot"></v-radio>        
            </v-radio-group>
          </v-col>
          </v-row>     
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="enableReview && !hideForm">
        <UiParentCard title="Votre expérience lors du votre dernier TTT avec le 5.W.4.T ?">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Comment avez-vous aimé votre expérience lors de votre dernier TTT ? (Utilisez la boite de commentaire ci-bas pour expliaction s'il y a lieu)
            </div>
            <v-validation v-slot="{ validate, errorMessages, isValid }" v-model="rating" :rules="rulesRequired">
              <v-rating
              v-model="rating"
              class="ma-2"
              :item-labels="['boff', '', '','','super ++']"
              item-label-position="top"
              color="warning" density="comfortable"
              hover
              length="5"
              @update:modelValue="validate()"
          ></v-rating>
          </v-validation>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Autres commentaires">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Si vous avez des questions, suggestions ou commentaires concernant les courses ladder, nous aimerions les connaître. On est  à l'écoute et ouvert à améliorer l'expérience de course de l'équipe et de nos membres.
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
          text="Nous avons bien reçu le tout. Nous allons annoncer les équipes jeudi matin sur Discord dans le salon #wtrl-ttt"
          v-if="saved"
        ></v-alert>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <v-btn color="primary" flat @click="submit" :disabled="!isFormValid || loading" v-if="!saved">Sauvegarder</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>
