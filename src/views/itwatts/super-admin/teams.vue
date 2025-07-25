<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from '@/stores/user-profile';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router'
import config from "@/config/config.json";
import security from "@/security";

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('superAdminTeams.pageTitle') });
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('superAdminTeams.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('superAdminTeams.pageTitle'),
    disabled: true,
  },
]);
const userStoreProfile = useUserProfile();

const teamsHeaders = ref([
  { title: t('common.id'), key: 'id', align: 'start' },
  { title: t('common.name'), key: 'name', sortable: true },
  { title: t('common.displayName'), key: 'display_name', sortable: false }, 
  
  { title: t('actions.actions'), key: 'actions', sortable: false },
]);

const invitesHeaders = ref([
  { title: t('common.code'), key: 'code', align: 'start' },
  { title: t('common.email'), key: 'email', align: 'start' },
  { title: t('common.date'), key: 'created', sortable: true },  
  { title: 'Accepted Date', key: 'accepted_date', sortable: true },
  { title: t('common.status'), key: 'status', sortable: true },
]);

const teams = ref([]);
const isTeamFormValid = ref();
const teamDialog = ref(false);
const teamDialogItem = ref();
const teamDialogManagerEmail = ref();
const deleteTeamDialog = ref();
const loading = ref(false);
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();
let allValidUsers = [];

const defaultTeam = {
  id: '',
  name: '',
  display_name: '',
  zwiftpower_team_id: 0,
  link: '',
}

function applyDefaultTeam() {
  setTimeout(() => {    
    teamDialogItem.value = Object.assign({}, defaultTeam);
  });
}
applyDefaultTeam();

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN'];
  if (!security.isTokenValid(rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/super-admin/teams' });
    return;
  }

  try {
    teams.value = [];
    allValidUsers = [];

    loading.value = true;
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/teams`,
    {
      withCredentials: true
    });
    if (response.data.data) {
      teams.value = response.data.data;
    }

    const allValidUsersResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users?strava_login=NOT NULL&fields=id,first_name,last_name`,
    {
      withCredentials: true
    });
    if (allValidUsersResponse.data.data) {
      for (const user of allValidUsersResponse.data.data) {
        allValidUsers.push({
          title: `${user.first_name} ${user.last_name}`,
          value: user.id,
        });
      }      
    }

    // console.log(`Response from /v1/user: ${JSON.stringify(user.data)}`);
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  } finally {
    loading.value = false;
  }
}

function closeTeamDialog() {
  teamDialog.value = false;
  applyDefaultTeam();
}

function closeDeleteTeamDialog() {
  deleteTeamDialog.value = false;
}

async function confirmDeleteTeamDialog(id: any) {
  try {
    const team = await axios.delete(`${config.serverApi.publicHostname}/v1/teams/${teamDialogItem.value.id}`,
    {
      withCredentials: true
    });
    teams.value = teams.value.filter((team: any) => team.id !== id);
  } catch (err: any) {
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`Error: ${err} stack: ${err.stack}`);
  } finally {
    applyDefaultTeam();
    loading.value = false;
    deleteTeamDialog.value = false;
  }  
}

function deleteTeam(item: any) {
  teamDialogItem.value = Object.assign({}, item);
  deleteTeamDialog.value = true;
}

async function editTeam(item: any) {
  teamDialogItem.value = Object.assign({}, 
    teams.value.find((trainer: any) => trainer.id === item.id)
  );
  teamDialog.value = true;
}

async function saveTeam() {
  errorAlert.value = '';
  try {
    loading.value = true;
    
    if (teamDialogItem.value.id) {
      // modify
      const team = await axios.patch(`${config.serverApi.publicHostname}/v1/teams/${teamDialogItem.value.id}`,
        teamDialogItem.value, {
        withCredentials: true
      });
      teams.value = teams.value.filter((team) => (team.id !== teamDialogItem.value.id));
      teams.value.push(teamDialogItem.value);
    } else {
      // new
      const team = await axios.post(`${config.serverApi.publicHostname}/v1/teams`,
      teamDialogItem.value, {
        withCredentials: true
      });
      teamDialogItem.value.id = team.data.id;
      teams.value.push(teamDialogItem.value);
    }
  } catch (err: any) {
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`Error: ${err} stack: ${err.stack}`);
  } finally {
    applyDefaultTeam();
    loading.value = false;
    teamDialog.value = false;
  }
}

async function sendTeamManagerInvite() {
  try {
    const response = await axios.post(`${config.serverApi.publicHostname}/v1/teams/${teamDialogItem.value.id}/manager-invite`, {
      email: teamDialogManagerEmail.value,
    }, {
      withCredentials: true
    });
    teamDialogManagerEmail.value = '';
    teamDialogItem.value.manager_invites.push(
      response.data
    );
  }  catch (err: any) {
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`Error: ${err} stack: ${err.stack}`);
  } finally {
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
    <v-col cols="12" sm="12" lg="8">      
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
        type="warning"
        :text="warningAlert"
        v-if="warningAlert"
      ></v-alert>
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="error"
        :text="errorAlert"
        v-if="errorAlert"
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
    <v-card>
      <v-card-text>
        <v-form v-model="isTeamFormValid">
          <v-data-table class="border rounded-md" :headers="teamsHeaders" :items="teams"
            :sort-by="[{ key: 'model', order: 'asc' }]" hide-default-footer>                    
            <template v-slot:top>
              <v-toolbar class="bg-lightsecondary" flat>
                <v-toolbar-title>Teams</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-dialog v-model="teamDialog" max-width="900px">
                  <template v-slot:activator="{ props }">
                    <v-btn color="primary" variant="flat" dark v-bind="props">{{ t('actions.add') }}</v-btn>
                  </template>
                  <v-card>
                    <v-card-title class="d-flex justify-space-between align-center bg-primary">
                      <div class="text-h3">Team</div>               
                      <v-btn
                        icon="mdi-close"
                        variant="text"
                        @click="closeTeamDialog()">
                      </v-btn>
                    </v-card-title>
                    <v-card-text>                              
                      <v-container class="px-0">
                        <v-row>
                          <v-col cols="12" sm="9">
                            <v-text-field
                            :label="t('common.id')"
                            hide-details="auto"
                            v-model="teamDialogItem.id"
                            readonly
                            ></v-text-field>
                          </v-col>
                        </v-row>                                
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                            :label="t('common.name')"
                            hide-details="auto"
                            v-model="teamDialogItem.name"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                            :label="t('common.displayName')"
                            hide-details="auto"
                            v-model="teamDialogItem.display_name"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                            label="Zwiftpower Team ID"
                            hide-details="auto"
                            v-model="teamDialogItem.zwiftpower_team_id"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                            :label="t('common.teamLink')"
                            hide-details="auto"
                            v-model="teamDialogItem.link"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-autocomplete
                              chips
                              label="Managers"
                              :items="allValidUsers"
                              multiple
                              variant="solo-filled"
                              v-model="teamDialogItem.managers"
                            ></v-autocomplete>
                          </v-col>
                        </v-row>
                        <v-row v-if="teamDialogItem.id">
                          <v-col>
                            <div class="text-h3">Team manager invites</div>
                          </v-col>
                        </v-row>
                        <v-row v-if="teamDialogItem.id">
                          <v-col>
                            <v-text-field
                              label="email"
                              hide-details="auto"
                              v-model="teamDialogManagerEmail"
                            ></v-text-field>
                            </v-col>
                            <v-col>
                              <v-btn color="primary" @click="sendTeamManagerInvite()">New invite</v-btn>                            
                          </v-col>
                        </v-row>
                        <v-row v-if="teamDialogItem.id">
                          <v-col>
                            <v-data-table class="border rounded-md" :headers="invitesHeaders" :items="teamDialogItem.manager_invites"
                            :sort-by="[{ key: 'model', order: 'asc' }]" hide-default-footer>                            
                              <template v-slot:item.created="{ value }">
                                {{ new Date(value).toString().split('GMT')[0] }}
                              </template>
                              <template v-slot:item.accepted_date="{ value }">
                                {{ value ? new Date(value).toString().split('GMT')[0] : '' }}
                              </template>
                          </v-data-table>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn variant="tonal"  color="error" @click="closeTeamDialog()">{{ t('actions.cancel') }}</v-btn>
                      <v-btn variant="tonal"  color="primary" dark @click="saveTeam()" :disabled="!isTeamFormValid || loading">{{ t('actions.save') }}</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
                <v-dialog v-model="deleteTeamDialog" max-width="600px">
                  <v-card>
                    <v-card-title class="text-h5 text-center py-6">
                      {{ t('dialogs.areYouSure',
                        [teamDialogItem.name])
                      }}</v-card-title>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn variant="tonal" color="error" @click="closeDeleteTeamDialog">{{ t('actions.cancel') }}</v-btn>
                      <v-btn variant="tonal" color="primary" dark @click="confirmDeleteTeamDialog(teamDialogItem.id)">{{ t('actions.ok') }}</v-btn>
                      <v-spacer></v-spacer>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-toolbar>
            </template>            
            <template v-slot:item.created="{ value }">
              {{ value.split('T')[0] }}
            </template>
            <template v-slot:item.name="{ value }">
              <a :href="'/itwatts/team/' + value + '/info'">{{ value }}</a>
            </template>
            <template v-slot:item.primary="{ value }">
              <v-checkbox hide-details color="primary" disabled :model-value="value">
              </v-checkbox>
            </template>
            <template v-slot:item.actions="{ item }">
              <div class="d-flex align-center">
                <v-tooltip :text="t('actions.edit')">
                  <template v-slot:activator="{ props }">
                    <v-btn icon flat @click="editTeam(item)" v-bind="props">
                      <PencilIcon stroke-width="1.5" size="20" class="text-primary"/></v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip :text="t('actions.delete')">
                  <template v-slot:activator="{ props }">
                    <v-btn icon flat @click="deleteTeam(item)" v-bind="props">
                      <TrashIcon stroke-width="1.5" size="20" class="text-error"/>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-data-table>
        </v-form>
      </v-card-text>
    </v-card>
    </v-col>  
  </v-row>
</template>
