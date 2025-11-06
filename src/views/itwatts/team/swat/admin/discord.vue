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
import { useTeamStore } from '@/stores/apps/teams';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('adminDiscord.pageTitle') });
const team = ref();

const usersResult = reactive([] as any);
const errorOccured = ref(false);
const searchValue = ref();

const router = useRouter()
const breadcrumbs = ref([
  {
    text: t('adminDiscord.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('adminDiscord.pageTitle'),
    disabled: true,
  },
]);
const userStoreProfile = useUserProfile();

const overallHeaders: Header[] = reactive([
  { text: 'displayName', value: "displayName", sortable: true },      
  { text: 'username', value: "username", sortable: true },      
  { text: 'roles', value: "rolesFormatted", sortable: true },
  { text: 'nom', value: "nameMember", sortable: true },
  { text: 'Membre 5.W.4.T', value: "swatMember", sortable: true },
]);

usersResult.value = [];

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

  errorOccured.value = false;
  try {
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/discord/users?serverID=1035641462324465697`, {
      withCredentials: true,
    });

    const swatUsersResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users?team=swat`,
    {
      withCredentials: true
    });
    const swatUsersMap = new Map(swatUsersResponse.data.data.map((obj: any) => [obj.discord_id, obj]));
  
    for (const user of response.data.data) {      
      user.rolesFormatted = '';
      for (const role of user.roles) {
        if (role.name !== '@everyone') {
          user.rolesFormatted += `${role.name}, `;
        }
      }

      if (swatUsersMap.has(user.id)) {
        user.nameMember = `${swatUsersMap.get(user.id).first_name} ${swatUsersMap.get(user.id).last_name}`;
        user.swatMember = swatUsersMap.get(user.id).groups.includes('swat_2024_2025') ? 'Membre 2024-2025' : 'Invité(e) 2024-2025'
      } else {
        user.swatMember = 'Non Membre'
      }      
      usersResult.value.push(user);
    }    
  } catch (error: any) {
    errorOccured.value = true;
    if (error.response && error.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log('an error occured: ' + error);
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
        type="error"
        title="Erreur"
        text="Oupss, une erreur est survenue..."
        v-if="errorOccured"
      ></v-alert>
    </v-col>
    <v-col cols="12" sm="12" lg="8">      
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
              alternating
              :search-field="['displayName', 'username'] "
              :search-value="searchValue"
          >
            <template #item-displayName="{ id, displayName }">
              <a :href="'https://discordapp.com/users/' + id">{{ displayName }}</a>
            </template>
          </EasyDataTable>
        </div>
      </v-card-text>
    </v-card>
    </v-col> 
  </v-row>
</template>
