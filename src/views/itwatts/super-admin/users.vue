<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from "@/stores/user-profile";

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter } from 'vue-router'

import config from "@/config/config.json";
import security from "@/security";
import { useTeamStore } from '@/stores/apps/teams';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('superAdminUsers.pageTitle') });
const usersResult = reactive([] as any);
const router = useRouter();
const searchValue = ref();
let teamsMap = new Map();

const breadcrumbs = ref([
  {
    text: t('superAdminUsers.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('superAdminUsers.pageTitle'),
    disabled: true,
  },
]);
const overallHeaders: Header[] = reactive([
  { text: t('common.firstName'), value: "first_name", sortable: true },
  { text: t('common.lastName'), value: "last_name", sortable: true },
  { text: t('common.gender'), value: "gender", sortable: true },
  { text: t('common.email'), value: "email", sortable: true },
  { text: t('common.primaryTeam'), value: "primary_team_id", sortable: true },
  { text: t('common.zwiftPowerID'), value: "zp_id", sortable: true },
  { text: t('common.stravaLastLogin'), value: "strava_login", sortable: true },
  { text: t('actions.edit'), value: "edit", sortable: true },
]);
const valid = ref(true);
const dialog = ref(false);

usersResult.value = [];

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN'];
  if (!security.isTokenValid(rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  await useTeamStore().fetchTeams();
  teamsMap = new Map(
    useTeamStore().teams.map((team: any) => [team.id, team])
  );
  try {
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/users`, {
      withCredentials: true,
    });
  
    usersResult.value = response.data.data;

    /*for (const user of usersResult.value) {
      user.primary_team = user.primary_team_id ? useTeamStore().teamsMap.get(user.primary_team_id).displayName : '';
    }*/
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log('an error occured: ' + error);
  }  
}

const genres = ref(['Homme', 'Femme']);

const editedItem = ref({
  first_name: '',
  last_name: '',
  genre: '',
  email: '',
  irl_team: '',
  x_username: '',
  youtube_username: '',
  twitch_username: '',
  ig_username: '',
});

function editItem(item: any) {
  dialog.value = true;
}

function close() {
    dialog.value = false;
    setTimeout(() => {
        
    }, 300);
}
function save() {
  close();
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
                :items="usersResult.value"
                :search-field="['first_name', 'last_name', 'zp_id'] "
                :search-value="searchValue"
                alternating
                >
              <template #item-edit="{ zp_id }">
                <v-btn icon flat @click="editItem(zp_id)">
                  <PencilIcon stroke-width="1.5" size="20" class="text-primary"
                /></v-btn>
              </template>
              <template #item-strava_login="{ strava_login }">
                {{ strava_login ? strava_login.last_login : ''}}
              </template>
              <template #item-primary_team_id="{ primary_team_id }">
                {{ primary_team_id && teamsMap.has(primary_team_id) ? teamsMap.get(primary_team_id).display_name : ''}}
              </template>
            </EasyDataTable>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" class="text-sm-right">
      <v-dialog v-model="dialog" max-width="500">
          <template v-slot:activator="{ props }">
              <v-btn color="primary" v-bind="props" flat class="ml-auto">
                  <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>{{ t('actions.addUser') }}
              </v-btn>
          </template>
          <v-card>
              <v-card-title class="pa-4 bg-secondary">
                  <span class="title text-white">test</span>
              </v-card-title>
              <v-card-text>
                  <v-form ref="form" v-model="valid" lazy-validation>
                      <v-row>
                        <v-col cols="12" sm="6">
                              <v-text-field
                                  variant="outlined"
                                  hide-details
                                  v-model="editedItem.first_name"
                                  label="Prénom"
                              ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-text-field
                                  variant="outlined"
                                  hide-details
                                  v-model="editedItem.last_name"
                                  label="Nom"
                              ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-text-field
                                  variant="outlined"
                                  hide-details
                                  v-model="editedItem.email"
                                  label="email"
                                  type="email"
                              ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-select
                                  variant="outlined"
                                  hide-details
                                  :items="genres"
                                  v-model="editedItem.genre"
                                  label="Genre"
                              ></v-select>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-text-field
                                  variant="outlined"
                                  hide-details
                                  v-model="editedItem.irl_team"
                                  label="irl_team"
                              ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-text-field
                                  variant="outlined"
                                  hide-details
                                  v-model="editedItem.x_username"
                                  label="x_username"
                              ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-text-field
                                  variant="outlined"
                                  hide-details
                                  v-model="editedItem.youtube_username"
                                  label="youtube_username"
                              ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-text-field
                                  variant="outlined"
                                  hide-details
                                  v-model="editedItem.twitch_username"
                                  label="twitch_username"
                              ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-text-field
                                  variant="outlined"
                                  hide-details
                                  v-model="editedItem.ig_username"
                                  label="ig_username"
                              ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <div class="d-flex gap-3 justify-center align-center flex-column flex-sm-row">
                              <v-checkbox-btn color="primary" hide-details v-model="checked" label="Membre 5.W.4.T"></v-checkbox-btn>                                    
                          </div>
                          </v-col>
                          <v-col cols="12" sm="6">
                              <v-text-field variant="outlined" hide-details v-model="editedItem.role" label="Role"></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="12">
                              <v-select
                                  variant="outlined"
                                  hide-details
                                  v-model="editedItem.rolestatus"
                                  label="Role Background"
                              ></v-select>
                          </v-col>
                      </v-row>
                  </v-form>
              </v-card-text>
              <v-card-actions class="pa-4">
                  <v-spacer></v-spacer>
                  <v-btn color="error" @click="close">Cancel</v-btn>
                  <v-btn
                      color="secondary"
                      :disabled="editedItem.userinfo == '' || editedItem.usermail == ''"
                      variant="flat"
                      @click="save"
                      >{{ t('actions.save') }}</v-btn
                  >
              </v-card-actions>
          </v-card>
      </v-dialog>
        </v-col>
  </v-row>
</template>
