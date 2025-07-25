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
import zrlWallBanner from '@/assets/images/itwatts/zrl/2024-2025round2/zrl_2024__2025_round2_schedule.jpg';

const { t, locale } = useI18n({ useScope: 'global' });

// theme breadcrumb
const page = ref({ title: t('swatRegisterZrl.pageTitle') });
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatRegisterZrl.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatRegisterZrl.pageTitle'),
    disabled: true,
  },
]);

const hideForm = ref(false);
const saved = ref();
const isFormValid = ref();
const myform = ref();
const othersTeamPlayerNames = ref([]);

const zpSyncLoading = ref(false);
const savingError = ref(false);
const comments = ref('');
const capInterest = ref('');
const competitiveLevel = ref('');
const dsInterest = ref('');
const preferedTime12h00 = ref('');
const preferedTime18h30 = ref('');
const preferedTime19h30 = ref('');
const teamChartAcknowledge = ref('');
const experienceInZRL = ref('');
const neverDidTTT = ref('');
const errorAlert = ref();
const dontKnowFtsFal = ref('');
const primaryZpTeam = ref('5.W.4.T');
const catPreferences = ref([]);
const nov12Course = ref([]);
const nov19Course = ref([]);
const nov26Course = ref([]);
const dec3Course = ref([]);
const dec10Course = ref([]);
const dec17Course = ref([]);
const userFormResult = ref([]);
const swatNames = ref([] as any);
const formName = 'registerZrl20242025Round2';

const rules = ref({
  required: (value: any) => !!value || t('validations.required'),
  email: (value: any) => {
      const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(value) || t('validations.invalidEmail');
    },
});

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
  
  try {    
    errorAlert.value = '';
    swatNames.value = [];
    let response = await axios.get(`${config.serverApi.publicHostname}/v1/users?groups=swat_2023_2024,swat_2024_2025&fields=first_name,last_name&sortBy=first_name`,
    { withCredentials: true });
    for (let i = 0;i < response.data.data.length;i++) {
      swatNames.value.push(`${response.data.data[i].first_name} ${response.data.data[i].last_name}`);
    }
  } catch (err: any) {
    errorAlert.value = `Oupss, une erreur est survenue...Detail: ${err}`;
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  }

  try {
    let response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/${formName}`,
    {
      withCredentials: true
    });
    
    if (response.data) {      
      userFormResult.value = response.data.content;
      bodyContentToForm(JSON.parse(response.data.content));

      hideForm.value = true;
      saved.value = true;
    }
  } catch (error) {
    // Can happens if form is not there.
  }  
}

const validateStatus = ref([
  (value: any) => {
    return value.length > 0 || false
  }
]);

const validateCheckbox = ref([
  (value: any) => value.length > 0 || primaryZpTeam.value === '5.W.4.T',
]);

const rulesRequired = ref([
  (value: any) => !!value || 'Ce champ est obligatoire.',
]);

function bodyContentToForm(content : any) {
  teamChartAcknowledge.value = content.teamChartAcknowledge;
  capInterest.value = content.capInterest;
  dsInterest.value = content.dsInterest;
  othersTeamPlayerNames.value = content.othersTeamPlayerNames;
  comments.value = content.comments;  
  preferedTime12h00.value = content.preferedTime12h00;
  preferedTime18h30.value = content.preferedTime18h30;
  preferedTime19h30.value = content.preferedTime19h30;
  experienceInZRL.value = content.experienceInZRL;
  neverDidTTT.value = content.neverDidTTT;
  dontKnowFtsFal.value = content.dontKnowFtsFal;
  competitiveLevel.value = content.competitiveLevel;
  catPreferences.value = content.catPreferences || [];
  nov12Course.value = content.nov12Course || [];
  nov19Course.value = content.nov19Course || [];
  nov26Course.value = content.nov26Course || [];
  dec3Course.value = content.dec3Course || [];
  dec10Course.value = content.dec10Course || [];
  dec17Course.value = content.dec17Course || [];  
}

function formToBodyContent() {  
  return {
    teamChartAcknowledge: teamChartAcknowledge.value,
    capInterest: capInterest.value,
    dsInterest: dsInterest.value,
    catPreferences: catPreferences.value,
    nov12Course: nov12Course.value,
    nov19Course: nov19Course.value,
    nov26Course: nov26Course.value,
    dec3Course: dec3Course.value,
    dec10Course: dec10Course.value,
    dec17Course: dec17Course.value,
    othersTeamPlayerNames: othersTeamPlayerNames.value,
    comments: comments.value,    
    preferedTime12h00: preferedTime12h00.value,
    preferedTime18h30: preferedTime18h30.value,
    preferedTime19h30: preferedTime19h30.value,
    experienceInZRL: experienceInZRL.value,
    neverDidTTT: neverDidTTT.value,
    dontKnowFtsFal: dontKnowFtsFal.value,
    competitiveLevel: competitiveLevel.value,
  }
}

async function submit() {
  myform.value.validate();

  if (isFormValid.value) {
    let response = null;

    zpSyncLoading.value = true;
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
        savingError.value = false;
        saved.value = true;
      } else {
        savingError.value = true;
        saved.value = false;
      }    
    } catch (error: any) {
      console.log(`Error: ${error}`);
      savingError.value = true;
      saved.value = false;
    }
    zpSyncLoading.value = false;
  }
  console.log('validate: ' + isFormValid.value);
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
          <UiParentCard :title="t('swatRegisterZrl.pageTitle')">
            <v-img :src="zrlWallBanner" class="mx-auto"/>
            <p class="my-4 text-body-1 text-10">
              La Zwift Racing League (ZRL) est une série de courses en équipe (généralement <b>composée de 6 coureurs</b>) qui se déroule les mardis a 19h 30 (6 courses au total). Trois types de courses (en fonction de la semaine) est disponible: course à points, scatch race et course en contre-la-montre d'équipe (TTT). Chaque coureur accumule une série de points individuels en fonction de la rapidité et des segments de la course et l'addition des points de chaque coureur donne le résultat d'équipe. C'est une super belle activité d'équipe et surtout, super <b>FUN</b>!

              <br><br>
              Faites-nous connaître votre intérêt pour la participation à la Zwift Racing League (ZRL) <b>débutant le 12 novembre et se terminant le 17 décembre 2024</b>.
            </p>

            <div v-if="saved">
            <p class="my-4 text-body-1 text-10"><br>
              <b>Nous avons bien reçu votre formulaire ZRL 2024-2025. Si vous désirez modifier certaines questions, cliquer sur Modifier.</b>
            </p>
            <v-btn color="primary" flat @click="hideForm = false">Modifier...</v-btn>
          </div>          
          </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Horaire ZRL">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Quelle heure préférez-vous courser les mardis ?
            </div>
            <v-row class="align-center">      
              <v-col cols="12" sm="2">
                <b>Midi (12:00)</b>
              </v-col>
              <v-col>
              <v-radio-group inline hide-details="auto" v-model="preferedTime12h00" :rules="[rules.required]">
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
              <v-radio-group inline hide-details="auto" v-model="preferedTime18h30" :rules="[rules.required]">
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
              <v-radio-group inline hide-details="auto" v-model="preferedTime19h30" :rules="[rules.required]">
                <v-radio label="Impossible" color="primary" value="impossible"></v-radio>
                <v-radio label="Possible" color="primary" value="possible"></v-radio>
                <v-radio label="De préférence" color="primary" value="de_preference"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>       
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Ma préférence de catégorie">          
          <v-checkbox label="Catégorie A" hide-details="auto" value="catA" v-model="catPreferences" :rules="validateCheckbox"></v-checkbox>
          <v-checkbox label="Catégorie B, disponible pour A si nécessaire" hide-details="auto" value="cat_b_and_cat_a" v-model="catPreferences" :rules="validateCheckbox"></v-checkbox>
          <v-checkbox label="Catégorie B uniquement" hide-details="auto" value="cat_b" v-model="catPreferences" :rules="validateCheckbox"></v-checkbox>
          <v-checkbox label="Catégorie C, disponible pour B si nécessaire" hide-details="auto" value="cat_c_and_cat_b" v-model="catPreferences" :rules="validateCheckbox"></v-checkbox>
          <v-checkbox label="Catégorie C uniquement" hide-details="auto" value="cat_c" v-model="catPreferences" :rules="validateCheckbox"></v-checkbox>
          <v-checkbox label="Je ne connais pas ma catégorie..." hide-details="auto" value="dont_know_my_category" v-model="catPreferences" :rules="validateCheckbox"></v-checkbox>          
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Quelle est votre expérience dans les courses ZRL?">          
            <v-checkbox label="J'ai participé à au moins une saison ZRL" hide-details="auto" value="true" v-model="experienceInZRL"></v-checkbox>
            <v-checkbox label="Je n'ai jamais fait de Team Time Trial (TTT)" hide-details="auto" value="true" v-model="neverDidTTT"></v-checkbox>
            <v-checkbox label="Je n'ai jamais fait de courses avec segment(s) FTS ou FAL. (à cochez si vous ne connaissez pas ces fameux FTS et FAL)" hide-details="auto" value="true" v-model="dontKnowFtsFal"></v-checkbox>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Niveau de compétitivité">          
          <v-radio-group inline hide-details="auto" v-model="competitiveLevel" :rules="rulesRequired">
              <v-radio label="Je suis très compétitif(ve) et j'aimerais être dans une équipe division 1 avec des coureurs de même attitude, si possible" color="primary" value="reallyCompetitive"></v-radio>
              <v-radio label="Je préfère être dans une équipe de division inférieur afin d'avoir moin de pression" color="primary" value="notCompetitive"></v-radio>              
            </v-radio-group>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Veuillez indiquer votre niveau d'intérêt pour chaque rôle de l'équipe? (aucune expérience requise)">          
          <p class="my-4 text-body-1 text-10">
          <b>Capitaine d'équipe</b>: Favorise la cohésion entre les membres de son équipe lors de courses de la ZRL et s’assure que tous les coureurs sont prêts à la ligne de départ (inscription WTRL, choix de vélo, chandail d’équipe, rôle spécifique de chaque coureur, etc.).
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

      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Vos disponibilités">
          <p class="my-4 text-body-1 text-10">
            Inscrivez vos disponibilités au mieux de vos connaissances.
          <br>
          <br>
          Notez qu'on aimerait bien avoir un/une directeur sportif / directrice sportive à chaque course pour nos équipes les plus compétitives de chaque catégorie.
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
            <b>12 novembre</b><br>TTT
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="available" v-model="nov12Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="not_available" v-model="nov12Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="dont_know" v-model="nov12Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="ds_if_necessary" v-model="nov12Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="ds_preference" v-model="nov12Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>19 novembre</b><br>Course à points
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="available" v-model="nov19Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="not_available" v-model="nov19Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="dont_know" v-model="nov19Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="ds_if_necessary" v-model="nov19Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="ds_preference" v-model="nov19Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>26 novembre</b><br>Course sans segments
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="available" v-model="nov26Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="not_available" v-model="nov26Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="dont_know" v-model="nov26Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="ds_if_necessary" v-model="nov26Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="ds_preference" v-model="nov26Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>3 décembre</b><br>TTT
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="available" v-model="dec3Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="not_available" v-model="dec3Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="dont_know" v-model="dec3Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="ds_if_necessary" v-model="dec3Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="ds_preference" v-model="dec3Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>10 décembre</b><br>Course à points
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="available" v-model="dec10Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="not_available" v-model="dec10Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="dont_know" v-model="dec10Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="ds_if_necessary" v-model="dec10Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="ds_preference" v-model="dec10Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>17 décembre</b><br>Course sans segments
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="available" v-model="dec17Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="not_available" v-model="dec17Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="dont_know" v-model="dec17Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="ds_if_necessary" v-model="dec17Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="auto" value="ds_preference" v-model="dec17Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
        </v-row>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Coureurs que vous souhaitez avoir dans votre équipe">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Inscrire les noms des coureurs que vous souhaitez avoir dans votre équipe pour la prochaine saison. Veuillez laisser cet espace vide si vous voulez faire partie d'une équipe de division 1.
            </div>
            <v-autocomplete
              v-model="othersTeamPlayerNames"
              :items="swatNames"
              variant="outlined"
              color="primary"
              label="Noms"
              multiple
              hide-details
              closable-chips
              >
              <template v-slot:chip>
                <v-chip label color="primary" size="large" class="mb-1 text-subtitle-1 font-weight-regular"></v-chip>
              </template>
          </v-autocomplete>            
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <UiParentCard title="Autres commentaires">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Si vous avez des idées, intérêts, suggestions ou commentaires concernant le 5.W.4.T et/ou de la prochaine saison, nous aimerions les connaître. On est  à l'écoute et ouvert à améliorer l'expérience de l'équipe et de nos membres.
            </div>
            <v-textarea label="Autres commentaires" hide-details="auto" v-model="comments"></v-textarea>
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="error"
          title="Erreur"
          text="Une erreur est survenue lors de la sauvegarde."
          v-if="savingError"
        ></v-alert>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="info"
          title="Succès"
          text="Nous avons bien reçu le tout. Nous allons former les équipes prochainement...!"
          v-if="saved"
        ></v-alert>
      </v-col>
      <v-col cols="12" v-if="!hideForm">
        <v-btn color="primary" flat @click="submit" :disabled="!isFormValid || zpSyncLoading" v-if="!saved">Sauvegarder</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

