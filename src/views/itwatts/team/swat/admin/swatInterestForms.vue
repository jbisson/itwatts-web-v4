<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from '@/stores/user-profile';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter } from 'vue-router'

import config from "@/config/config.json";
import security from "@/security";
import { exportUser, exportInterestSwatForm } from '@/utils/export';
import { useTeamStore } from '@/stores/apps/teams';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('swatInterestForms.pageTitle') });
const team = ref();

const formsResult = reactive([] as any);

const usersExport = ref('');
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();

let swatUsersMap:any = null;

const searchValue = ref();
const dialog = ref(false);
const dialogTitle = ref();
const dialogFormQuestions = reactive([] as any);

const router = useRouter()
const breadcrumbs = ref([
  {
    text: t('swatInterestForms.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatInterestForms.pageTitle'),
    disabled: true,
  },
]);

const userStoreProfile = useUserProfile();

const overallHeaders: Header[] = reactive([  
  { text: 'Nom', value: "first_name", sortable: true },
  { text: 'Region', value: "region", width: 50, sortable: true },
  { text: 'Genre', value: "genre", width: 50, sortable: true },
  { text: 'Strava', value: "strava_url", width: 50, sortable: true },
  { text: 'Raisons', value: "reasonsToJoin", sortable: true },
  { text: 'Commentaires', value: "comments", sortable: true },
  { text: 'Date', value: "date", sortable: true },
  { text: 'Status', value: "onboarding_flow", sortable: true },
  { text: 'Admi ssion', value: "admissionProcessStatus", width: 20, sortable: true },
  { text: 'Actions', value: "admin_action", width: 120, sortable: true },
]);

formsResult.value = [];

function formatDate(date: any) {
  const dateSplit = date.split('T');
  return dateSplit[0];
}

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
    security.isTokenValid(['SUPER_ADMIN']))) {    
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  errorAlert.value = '';

  try {
    formsResult.value = [];
    
    const formsResponse = await axios.get(`${config.serverApi.publicHostname}/v1/forms?name=interest2024`, {
      withCredentials: true,
    });

    const userIDs = formsResponse.data.data.map((obj: any) => `${obj.user_id}`);
    
    const swatUsersResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users?id=${userIDs}`, {
      withCredentials: true,
    });
    swatUsersMap = new Map(swatUsersResponse.data.data.map((obj: any) => [obj.id, obj]));

    usersExport.value = `${exportInterestSwatForm().headers.concat(exportUser().headers).toString()}\n`;
    for (const form of formsResponse.data.data) {
      const formContent = JSON.parse(form.content);
      //console.log(JSON.stringify(form.flow));

      let actionInfo = '';
      if (form.flow && form.flow.status) {        
        for (let i = 0;i < form.flow.actions.length;i++) {
          const action = form.flow.actions[i];
          actionInfo += `<p>${formatDate(action.date)} ${statusText(action)} par ${action.who}</p>`;
        }        
      }

      if (!swatUsersMap.has(form.user_id)) {
        console.log('User deleted: ' + form.user_id);
        continue;
      }
      
      swatUsersMap.get(form.user_id).form = form;
      const formObj = 
        {
          user_id: form.user_id,
          first_name: formContent.firstName,
          last_name: formContent.lastName,
          genre: swatUsersMap.get(form.user_id).gender,
          zp_id: swatUsersMap.get(form.user_id).zp_id,
          strava_url: swatUsersMap.get(form.user_id).strava_url,
          region: formContent.region,
          know_swat_members: formContent.knowSwatMembersNames,
          email: formContent.email,
          date: formatDate(form.created),
          comments: formContent.comments,
          otherSports: formContent.otherSports,
          reasonsToJoin: formContent.reasonsToJoin,
          status: form.flow ? form.flow.status : '',
          onboarding_flow: form.flow,
          action_info: actionInfo,          
          admissionProcessStatus: team.value.riders.includes(form.user_id) ? '✅' : '❌',
        };
        
      formsResult.value.push(formObj);
      //usersExport.value += `${exportUser(swatUsersMap.get(form.user_id)).value.concat(exportInterestSwatForm(formContent).value).toString()}\n`;
      usersExport.value += `${exportInterestSwatForm(formContent).value.concat(exportUser(swatUsersMap.get(form.user_id)).value).toString()}\n`;
    }    
  } catch (err: any) {
    errorAlert.value = `Oups, une erreur est survenu, detail: ${err}`;
    console.log(`an error occured: ${err} stack: ${err.stack}`);

    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }    
  }  
}

function statusText(onboarding_flow: any) {
  if (!onboarding_flow || !onboarding_flow.status) {
    return 'En attente';
  }
  if (onboarding_flow.status) {
    if (onboarding_flow.status === 'approved') {
      return `Approuvé`;
    } else if (onboarding_flow.status === 'denied') {
      return `Refusé`;
    } else if (onboarding_flow.status === 'recommended') {
      return `Recommandé`;
    } else if (onboarding_flow.status === 'reminder') {
      return `Rappel`;
    } else if (onboarding_flow.status === 'admission_started') {
      return `Processus d'admission commencé`;
    } else {
      return onboarding_flow.status;
    }    
  }

  return '';
}

async function exportAll() {
  const dateNow = new Date().toISOString().split('T')[0];
  const universalBOM = "\uFEFF";
  const file = new File([universalBOM + usersExport.value], `${dateNow} formulaires-interest-2024-5w4t.csv`, {
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

async function changedStatusForm(userID: any, status: string) {
  try {
    let flow = {};
    if (status !== 'clear') {
      const action = 
      {
          date: new Date(),
          status: status,
          who: `${useUserProfile().first_name} ${useUserProfile().last_name}`,            
      };

      let actions = [];
      if (swatUsersMap.get(userID).form.flow && swatUsersMap.get(userID).form.flow.actions) {
        actions = swatUsersMap.get(userID).form.flow.actions;        
      }
      actions.push(action);
      flow = {
        status: status === 'reminder' ? swatUsersMap.get(userID).form.flow.status : status,
        actions: actions,
      }      
    }    

    const swatUsersResponse = await axios.patch(`${config.serverApi.publicHostname}/v1/users/${userID}/forms/interest2024`,
    {
      flow: flow
    },
    {
      withCredentials: true
    });
    window.location.reload();

  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    errorAlert.value = `Oups, une erreur est survenu, detail: ${err}`;

    console.log(`an error occured: ${err} stack: ${err.stack}`);
  }
}

async function viewDialogForm(userID: any) {
  dialogTitle.value = `${swatUsersMap.get(userID).first_name} ${swatUsersMap.get(userID).last_name}`;
  dialogFormQuestions.value = [];
  
  const content = JSON.parse(swatUsersMap.get(userID).form.content);

  dialogFormQuestions.value.push({
    question: 'UserID',
    answer: userID,
  });

  dialogFormQuestions.value.push({
    question: 'Zwift Power',
    answer: `https://zwiftpower.com/profile.php?z=${swatUsersMap.get(userID).zp_id}`,
  });

  for (const formProp in content) {
    if (t('swatInterest.formQuestions.' + formProp) !== `swatInterest.formQuestions.${formProp}`) {
      dialogFormQuestions.value.push(
      {
        question: t('swatInterest.formQuestions.' + formProp),
        answer: content[formProp]
      }
    );  
    }    
  }
  
  dialog.value = true;
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
          <v-col cols="3" sm="3" lg="3">
            <v-text-field
              v-model="searchValue"
              variant="outlined"
              append-inner-icon="mdi-magnify"
              placeholder="Recherche"
              hide-details
              density="compact"
            ></v-text-field>
          </v-col>
          <div class="align-center">
            <EasyDataTable
                :headers="overallHeaders"
                :items="formsResult.value"
                search-field="first_name"
                :search-value="searchValue"
                alternating>
                <template #item-first_name="{ first_name, last_name, id, zp_id }">
                  <a :href="'https://zwiftpower.com/profile.php?z=' + zp_id" target="_blank">{{ first_name }} {{ last_name }}</a>
                </template>                
                <template #item-strava_url="{ strava_url }">
                  <a :href="'' + strava_url" target="_blank">Lien</a>
                </template>
                <template #item-onboarding_flow="{ onboarding_flow, action_info }">
                  {{ statusText(onboarding_flow) }}
                  <v-tooltip
                    v-if="action_info"
                    activator="parent"
                  ><span v-html=action_info></span></v-tooltip>
                </template>
                <template #item-admin_action="{ status, user_id, onboarding_flow, admissionProcessStatus }">
                  <v-btn density="default" @click="viewDialogForm(user_id)" icon="mdi-eye-outline" size="x-small">
                  </v-btn>
                  <v-btn density="default" v-if="!status" @click="changedStatusForm(user_id, 'recommended')" icon="mdi-check" size="x-small">
                    <v-icon color="grey-lighten-1">mdi-check</v-icon>
                    <v-tooltip activator="parent">Recommander</v-tooltip>
                  </v-btn>
                  <v-btn density="default" v-if="status === 'recommended'" @click="changedStatusForm(user_id, 'approved')" icon="mdi-check-all" size="x-small">
                    <v-icon color="grey-lighten-1">mdi-check-all</v-icon>
                    <v-tooltip activator="parent">Approuver</v-tooltip>
                  </v-btn>
                  <v-btn density="default" v-if="!status" @click="changedStatusForm(user_id, 'denied')" icon="mdi-close-box-outline" size="x-small">
                    <v-icon color="grey-lighten-1">mdi-close-box-outline</v-icon>
                    <v-tooltip activator="parent">Refuser</v-tooltip>
                  </v-btn>
                  <v-btn density="default" v-if="status === 'approved' && admissionProcessStatus === '❌'" @click="changedStatusForm(user_id, 'reminder')" icon="mdi-close-box-outline" size="x-small">
                    <v-icon color="grey-lighten-1">mdi-reminder</v-icon>
                    <v-tooltip activator="parent">Rappel</v-tooltip>
                  </v-btn>
                  <!--<v-btn color="error" @click="changedStatusForm(user_id, 'clear')" size="x-small">Effacer tous</v-btn>-->
                </template>                
            </EasyDataTable>
            <v-dialog v-model="dialog" max-width="1000">
              <v-card>
                <v-form ref="myform">   
                  <v-card-text>
                    <h4 class="text-h3 mb-4">{{ dialogTitle }}</h4>
                    <p>
                      <span
                        v-for="(question, lineNumber) of dialogFormQuestions.value" 
                        v-bind:key="lineNumber" >
                        <b>{{ question.question }}</b> {{ question.answer }} <br/><br/>
                      </span><br>
                    </p>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" @click="dialog = false">Fermer</v-btn>
                  </v-card-actions>
                </v-form>
              </v-card>
            </v-dialog>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
 
    <v-col cols="12">
      <v-btn color="primary" flat @click="exportAll">Export</v-btn>
    </v-col>
  </v-row><br>
</template>
