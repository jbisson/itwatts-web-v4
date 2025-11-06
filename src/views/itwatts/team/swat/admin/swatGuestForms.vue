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
import { exportUser, exportGuestSwatForm } from '@/utils/export';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('swatGuestForms.pageTitle') });
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
  { text: 'Équipe IRL', value: "irlTeam", width: 50, sortable: true },
  { text: 'Équipe virtuelle', value: "virtualTeam", width: 50, sortable: true },
  
  { text: 'Raisons', value: "reasonsToJoin", sortable: true },
  { text: 'Commentaires', value: "comments", sortable: true },
  { text: 'Date', value: "date", sortable: true },
  { text: 'Actions', value: "admin_action", width: 120, sortable: true },
]);

formsResult.value = [];

function formatDate(date: any) {
  const dateSplit = date.split('T');
  return dateSplit[0];
}

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ADMIN'];
  if (!security.isTokenValid( rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }
  errorAlert.value = '';

  try {
    formsResult.value = [];
    
    const formsResponse = await axios.get(`${config.serverApi.publicHostname}/v1/forms?name=invite2024`, {
      withCredentials: true,
    });

    const userIDs = formsResponse.data.data.map((obj: any) => `${obj.user_id}`);
    
    const swatUsersResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users?id=${userIDs}`, {
      withCredentials: true,
    });
    swatUsersMap = new Map(swatUsersResponse.data.data.map((obj: any) => [obj.id, obj]));

    usersExport.value = `${exportGuestSwatForm().headers.concat(exportUser().headers).toString()}\n`;
    for (const form of formsResponse.data.data) {
      const formContent = JSON.parse(form.content);
      //console.log(JSON.stringify(form.flow));

      let actionInfo = '';

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
          irlTeam: formContent.irlTeam,
          virtualTeam: formContent.virtualTeam,
          action_info: actionInfo,
        };        
        
      formsResult.value.push(formObj);
      //usersExport.value += `${exportUser(swatUsersMap.get(form.user_id)).value.concat(exportInterestSwat2024Form(formContent).value).toString()}\n`;
      usersExport.value += `${exportGuestSwatForm(formContent).value.concat(exportUser(swatUsersMap.get(form.user_id)).value).toString()}\n`;
    }    
  } catch (err: any) {
    errorAlert.value = `Oups, une erreur est survenu, detail: ${err}`;
    console.log(`an error occured: ${err} stack: ${err.stack}`);

    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/team/signin' });
    }    
  }  
}

async function exportAll() {
  const dateNow = new Date().toISOString().split('T')[0];
  const universalBOM = "\uFEFF";
  const file = new File([universalBOM + usersExport.value], `${dateNow} formulaires-invite-5w4t.csv`, {
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

async function viewDialogForm(userID: any) {
  dialogTitle.value = `${swatUsersMap.get(userID).first_name} ${swatUsersMap.get(userID).last_name}`;
  dialogFormQuestions.value = [];
  
  console.log(swatUsersMap.get(userID).form.content);
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
    if (t('swatInvite.formQuestions.' + formProp) !== `swatInvite.formQuestions.${formProp}`) {
      dialogFormQuestions.value.push(
      {
        question: t('swatInvite.formQuestions.' + formProp),
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
                <template #item-admin_action="{ status, user_id, wrongValueQuestions, onboarding_flow, admissionProcessStatus }">
                  <v-btn density="default" @click="viewDialogForm(user_id)" icon="mdi-eye-outline" size="x-small">
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
