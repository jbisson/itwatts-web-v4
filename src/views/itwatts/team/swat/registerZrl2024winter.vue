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

const { t, locale } = useI18n({ useScope: 'global' });

// theme breadcrumb
const page = ref({ title: t('swatRegisterZrl2024winter.pageTitle') });
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatRegisterZrl2024winter.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatRegisterZrl2024winter.pageTitle'),
    disabled: true,
  },
]);

const saved = ref();
const isFormValid = ref();
const myform = ref();
const othersTeamPlayerNames = ref('');
const userStatus = ref('');

const zpSyncLoading = ref(false);
const savingError = ref(false);
const comments = ref('');
const capInterest = ref('');
const dsInterest = ref('');
const timeInterest = ref('');
const teamChartAcknowledge = ref('');
const primaryZpTeam = ref('5.W.4.T');
const raceInterest  = ref('');

const catPreferences = ref([]);
const experience = ref([]);
const choicesThatApply = ref([]);
const jan23Course = ref([]);
const jan30Course = ref([]);
const feb6Course = ref([]);
const feb13Course = ref([]);
const feb20Course = ref([]);
const feb27Course = ref([]);
const userFormResult = ref([]);

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ADMIN'];
  if (!security.isTokenValid(rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  try {
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/registerZrl2024winter`,
    {
      withCredentials: true
    });
    if (response.data) {
      userFormResult.value = response.data.content;
      bodyContentToForm(JSON.parse(response.data.content));
    }
  } catch (ex) {
    
  }

  await syncZpProfile();
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
  raceInterest.value = content.raceInterest;
  timeInterest.value = content.timeInterest;
  catPreferences.value = content.catPreferences || [];
  experience.value = content.experience || [];
  choicesThatApply.value = content.choicesThatApply || [];
  jan23Course.value = content.jan23Course || [];
  jan30Course.value = content.jan30Course || [];
  feb6Course.value = content.feb6Course || [];
  feb13Course.value = content.feb13Course || [];
  feb20Course.value = content.feb20Course || [];
  feb27Course.value = content.feb27Course || [];
  userStatus.value = content.userStatus || [];  
}

function formToBodyContent() {  
  return {
    teamChartAcknowledge: teamChartAcknowledge.value,
    capInterest: capInterest.value,
    dsInterest: dsInterest.value,
    catPreferences: catPreferences.value,
    experience: experience.value,
    choicesThatApply: choicesThatApply.value,
    jan23Course: jan23Course.value,
    jan30Course: jan30Course.value,
    feb6Course: feb6Course.value,
    feb13Course: feb13Course.value,
    feb20Course: feb20Course.value,
    feb27Course: feb27Course.value,
    othersTeamPlayerNames: othersTeamPlayerNames.value,
    comments: comments.value,
    userStatus: userStatus.value,
    raceInterest: raceInterest.value,
    timeInterest: timeInterest.value,
  }
}

async function syncZpProfile() {
  zpSyncLoading.value = true;
  try {    
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
    savingError.value = true;
  }
  zpSyncLoading.value = false;
}

async function submit() {
  myform.value.validate();

  if (isFormValid.value) {
    let response = null;

    zpSyncLoading.value = true;
    try {    
      let response;

      const body = {
        name: 'registerZrl2024winter',
        user_id: useUserProfile().user_id,
        content: JSON.stringify(formToBodyContent())
      }

      if (userFormResult.value.length !== 0) {
        response = await axios.put(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/registerZrl2024winter`,
          body, {
            withCredentials: true,
          });
      } else {
        response = await axios.post(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}/forms/registerZrl2024winter`,
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
  <v-form ref="myform" v-model="isFormValid">
    <v-row>
      <v-col cols="12">      
          <UiParentCard :title="t('swatRegisterZrl2024winter.pageTitle')">
            <h2 class="text-h2">Zwift Racing League (ZRL)</h2>
            <p class="my-4 text-body-1 text-10">
              La Zwift Racing League (ZRL) est une série de courses en équipe (généralement composée de 6 à 8 coureurs) qui se déroule les mardis à 19h 30 (6 courses au total). La durée du parcours est généralement d'une heure environ. Deux types de courses (en fonction de la semaine) est disponible: course à points et course en contre-la-montre d'équipe (TTT). Chaque coureur accumule une série de points individuels en fonction de la rapidité et des segments de la course et l'addition des points de chaque coureur donne le résultat d'équipe. C'est une super belle activité d'équipe et surtout, super FUN!

              <br><br>
              Faites-nous connaître votre intérêt pour la participation à la Zwift Racing League (ZRL) débutant le 23 janvier et se terminant le 27 février 2024.
            </p>
            <v-img src="@/assets/images/itwatts/zrl/2024round3/zrl_2024_round3_schedule.png"></v-img>
          </UiParentCard>
      </v-col>
      <v-col cols="12">
        <UiParentCard title="Avez-vous pris connaissance de la charte d'équipe?">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              La charte de l'équipe 5.W.4.T est disponible: <a href="https://drive.google.com/file/d/10cgcNkG5TZkElZRO1EzDCTznwAnE1RXS/view?usp=sharing" target="_blank">charte d'équipe 5.W.4.T</a>
            </div>
            <v-radio-group class="mt-4" v-model="teamChartAcknowledge" :rules="rulesRequired">
              <v-radio label="Oui et j'ai pris connaissance de la charte d'équipe" color="primary" value="1" ></v-radio>
            </v-radio-group>          
        </UiParentCard>
      </v-col>
      <v-col cols="12">
        <UiParentCard title="Intérêt de course">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Nous aimerons connaitre votre intérèt principal.
            </div>
            <v-radio-group class="mt-4" v-model="raceInterest" :rules="rulesRequired">
              <v-radio label="J'ai un gros intérèt pour continuer à courser dans la ZRL." color="primary" value="high_interest_zrl" ></v-radio>
              <v-radio label="J'aimerais esseyer d'autres série de courses EN PLUS de la ZRL" color="primary" value="zrl_and_other_races" ></v-radio>
              <v-radio label="J'aimerais esseyer d'autres série de courses afin de remplacer la ZRL" color="primary" value="other_races_without_zrl" ></v-radio>
              <v-radio label="Je préfèrais faire des entrainements structurés à place de courses" color="primary" value="workout" ></v-radio>
              <v-radio label="Autres...(Veuillez l'inscrire dans 'autres commentaires' au bas de la page)" color="primary" value="other" ></v-radio>
            </v-radio-group>          
        </UiParentCard>
      </v-col>
      <v-col cols="12">
        <UiParentCard title="Horaire ZRL">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Quelle heure préférez-vous courser les mardis soir?
            </div>
            <v-radio-group class="mt-4" v-model="timeInterest" :rules="rulesRequired">
              <v-radio label="12h 00." color="primary" value="12h00" ></v-radio>
              <v-radio label="18h 30." color="primary" value="18h30" ></v-radio>
              <v-radio label="19h 30." color="primary" value="19h30" ></v-radio>              
            </v-radio-group>          
        </UiParentCard>
      </v-col>
      <v-col cols="12" v-if="primaryZpTeam !== '5.W.4.T'">
        <UiParentCard title="Status Membre vs Invité">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              <v-icon class="text-24">mdi-alert-outline</v-icon>
              Ton équipe primaire "{{ primaryZpTeam }}" ZwiftPower n'est présentement pas associée à l'équipe 5.W.4.T. Ceci est une exigence pour être membre du 5.W.4.T,
              veuillez le changer afin de bénificier de tous les avantages du membres 5.W.4.T.<br><br>
              Veuillez vous référer à la <a href="https://drive.google.com/file/d/10cgcNkG5TZkElZRO1EzDCTznwAnE1RXS/view?usp=sharing" target="_blank">charte d'équipe 5.W.4.T</a> afin de connaitre les différences entre status membres vs invité.
              <br><br><v-img src="@/assets/images/itwatts/zwiftpower/make_5w4t_primary_team.png"></v-img>                  
            </div>
            <v-checkbox label="J'accepte le fait que je n'aurrai pas le Jersey du 5.W.4.T ainsi que tous les autres avantages du membres 5.W.4.T et désire m'inscrire en tant qu'invité seulement." hide-details="true" value="guest" v-model="userStatus" :rules="validateStatus"></v-checkbox>
            <v-btn color="primary" flat @click="syncZpProfile()" :disabled="zpSyncLoading">Vérifier mon équipe ZwiftPower à nouveau...</v-btn>
        </UiParentCard>
      </v-col>
      <v-col cols="12">
        <UiParentCard title="Ma préférence de catégorie">          
          <v-checkbox label="Catégorie A" hide-details="true" value="catA" v-model="catPreferences" :rules="validateCheckbox"></v-checkbox>
          <v-checkbox label="Catégorie B, disponible pour A si nécessaire" hide-details="true" value="cat_b_and_cat_a" v-model="catPreferences" :rules="validateCheckbox"></v-checkbox>
          <v-checkbox label="Catégorie B uniquement" hide-details="true" value="cat_b" v-model="catPreferences" :rules="validateCheckbox"></v-checkbox>
          <v-checkbox label="Catégorie C, disponible pour B si nécessaire" hide-details="true" value="cat_c_and_cat_b" v-model="catPreferences" :rules="validateCheckbox"></v-checkbox>
          <v-checkbox label="Catégorie C uniquement" hide-details="true" value="cat_c" v-model="catPreferences" :rules="validateCheckbox"></v-checkbox>
          <v-checkbox label="Je ne connais pas ma catégorie..." hide-details="true" value="dont_know_my_category" v-model="catPreferences" :rules="validateCheckbox"></v-checkbox>          
        </UiParentCard>
      </v-col>
      <v-col cols="12">
        <UiParentCard title="Quelle est votre expérience dans les courses ZRL?">          
          <v-checkbox label="J'ai participé à plus de deux saisons ZRL" hide-details="true" value="two_seasons_and_plus" v-model="experience" :rules="validateCheckbox"></v-checkbox>
          <v-checkbox label="J'ai participé à au moins une saison ZRL" hide-details="true" value="less_than_one_season" v-model="experience" :rules="validateCheckbox"></v-checkbox>
          <v-checkbox label="Je n'ai jamais fait de course ZRL" hide-details="true" value="never_done_zrl_races" v-model="experience" :rules="validateCheckbox"></v-checkbox>        
        </UiParentCard>
      </v-col>
      <v-col cols="12">
        <UiParentCard title="Cochez tous les choix qui s'appliquent à votre situation">          
          <v-checkbox label="Je n'ai jamais fait de Team Time Trial (TTT)" hide-details="true" value="never_did_ttt" v-model="choicesThatApply"></v-checkbox>
          <v-checkbox label="Je n'ai jamais fait de courses avec segment(s) FTS ou FAL. (à cochez si vous ne connaissez pas ces fameux FTS et FAL)" hide-details="true" value="dont_know_fts_fal" v-model="choicesThatApply"></v-checkbox>        
        </UiParentCard>
      </v-col>
      <v-col cols="12">
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

      <v-col cols="12">
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
            <b>23 janvier</b><br>Course sans segments
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="available" v-model="jan23Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="not_available" v-model="jan23Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="dont_know" v-model="jan23Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="ds_if_necessary" v-model="jan23Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="ds_preference" v-model="jan23Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>30 janvier</b><br>Course à points
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="available" v-model="jan30Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="not_available" v-model="jan30Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="dont_know" v-model="jan30Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="ds_if_necessary" v-model="jan30Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="ds_preference" v-model="jan30Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>6 février</b><br>TTT
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="available" v-model="feb6Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="not_available" v-model="feb6Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="dont_know" v-model="feb6Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="ds_if_necessary" v-model="feb6Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="ds_preference" v-model="feb6Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>13 février</b><br>Course sans segments
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="available" v-model="feb13Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="not_available" v-model="feb13Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="dont_know" v-model="feb13Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="ds_if_necessary" v-model="feb13Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="ds_preference" v-model="feb13Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>20 février</b><br>Course à points
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="available" v-model="feb20Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="not_available" v-model="feb20Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="dont_know" v-model="feb20Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="ds_if_necessary" v-model="feb20Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="ds_preference" v-model="feb20Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
        </v-row>
        <v-row class="align-center">    
          <v-col cols="12" sm="2">
            <b>27 février</b><br>TTT
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="available" v-model="feb27Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="not_available" v-model="feb27Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="dont_know" v-model="feb27Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="ds_if_necessary" v-model="feb27Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
          <v-col cols="2">
            <v-checkbox label="" hide-details="true" value="ds_preference" v-model="feb27Course" :rules="validateCheckbox"></v-checkbox>
          </v-col>
        </v-row>
        </UiParentCard>
      </v-col>
      <v-col cols="12">
        <UiParentCard title="Coureurs que vous souhaitez avoir dans votre équipe">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              SVP inscrire les noms des coureurs que vous souhaitez avoir dans votre équipe pour la prochaine saison. Veuillez laisser cet espace vide si aucune préférence.
            </div>
            <v-text-field label="Entrez les nom des coureurs" hide-details="auto" variant="underlined" v-model="othersTeamPlayerNames"></v-text-field>
        </UiParentCard>
      </v-col>
      <v-col cols="12">
        <UiParentCard title="Autres commentaires">                      
            <div class="text-subtitle-1 text-grey-darken-1 mb-3">
              Si vous avez des idées, intérêts, suggestions ou commentaires concernant le 5.W.4.T et/ou de la prochaine saison, nous aimerions les connaître. On est  à l'écoute et ouvert à améliorer l'expérience de l'équipe et de nos membres.
            </div>
            <v-textarea label="Autres commentaires" hide-details="auto" v-model="comments"></v-textarea>
        </UiParentCard>
      </v-col>
      <v-col cols="12">
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="error"
          title="Erreur"
          text="Une erreur est survenue lors de la sauvegarde."
          v-if="savingError"
        ></v-alert>
      </v-col>
      <v-col cols="12">
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="info"
          title="Succès"
          text="Nous avons bien reçu le tout. Nous allons former les équipes dans les prochains jours...!"
          v-if="saved"
        ></v-alert>
      </v-col>
      <v-col cols="12">
        <v-btn color="primary" flat @click="submit" :disabled="!isFormValid || zpSyncLoading">Sauvegarder</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

