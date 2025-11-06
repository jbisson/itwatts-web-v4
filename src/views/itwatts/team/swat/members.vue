<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from '@/stores/user-profile';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter } from 'vue-router';
import config from "@/config/config.json";
import security from "@/security";
import { useTeamStore } from '@/stores/apps/teams';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('swatMembers.pageTitle') });
const team = ref();
const usersResult = reactive([] as any);
const searchValue = ref();

const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatMembers.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatMembers.pageTitle'),
    disabled: true,
  },
]);

const overallHeaders: Header[] = reactive([
  { text: 'Nom', width: 150, value: "name", sortable: true },
  { text: 'Genre', value: "gender", sortable: true },
  { text: 'Zwift name', value: "zwift_name", sortable: true },      
  { text: 'Discord name', value: "discord_info", sortable: true },
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
    team.value.riders.includes(useUserProfile().user_id) || security.isTokenValid(['SUPER_ADMIN']))) {    
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  if (security.isTokenValid(['SUPER_ADMIN'])) {
    /*overallHeaders.push({ text: 'ZP last synced', value: "zp_last_synced", sortable: true });
    overallHeaders.push({ text: 'Zwift 5.W.4.T club status', value: "zwift_status", sortable: true });
    overallHeaders.push({ text: 'Zwift last synced', value: "zwift_last_synced", sortable: true });
    overallHeaders.push({ text: 'ZP primary team', value: "zp_primary_team_name", sortable: true });
    overallHeaders.push({ text: 'Discord roles', value: "discord_roles", sortable: true });*/
  }

  
  interface ResponseData {
    data: any,
  }

  usersResult.value = [];

  try {
    const allUsers = await axios.get<ResponseData>(`${config.serverApi.publicHostname}/v1/users?groups=swat_2024_2025&sortBy=first_name,last_name`,
    {
      withCredentials: true
    });
    for (const user of allUsers.data.data) {
      user.name = `${user.first_name} ${user.last_name}`;

      if (user.roles && user.roles.length > 0) {
        const roles = [];
        for (const role of user.roles) {
          if (role !== 'SUPER_ADMIN') {
            roles.push(t(`lists.roles.${role}`));
          }          
        }
        user.rolesText = roles;
      }

      if (user.zwift_profile) {
        user.zwift_name = `${user.zwift_profile.firstName} ${user.zwift_profile.lastName}`;
        user.zwift_status = user.zwift_profile.clubs ? user.zwift_profile.clubs[0].status : '';
        user.zwift_last_synced = new Date(user.zwift_profile.lastSynced).toLocaleDateString();        
      }

      if (user.discord_profile) {
        user.discord_info = user.discord_profile.globalName ? user.discord_profile.globalName : user.discord_profile.username;
        user.discord_roles = '';
        for (const role of user.discord_profile.roles) {
          if (role.name !== '@everyone') {
            user.discord_roles += `${role.name}, `;
          }
        }
      }     
      
      usersResult.value.push(user);
    }    
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log(`an error occured: ${err} stack: ${err.stack}`);
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
    <v-col cols="12" sm="12" lg="12">      
      <v-card>
        <v-card-text>
          <div class="d-flex align-center mb-4">
            <h2 class="text-h5">{{ $t('swatMembers.pageTitle') }}</h2>
          </div>
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
                :search-field="['name', 'zp_id'] "
                :search-value="searchValue"
                :headers="overallHeaders"
                :items="usersResult.value"
                alternating>
                <template #item-name="{ name, id, zp_id }">
                  <a :href="'/itwatts/user/profile/' + id">{{ name }}</a>
                  <!--<a :href="'https://zwiftpower.com/profile.php?z=' + zp_id" target="_blank">{{ name }}</a>-->
                </template>
            </EasyDataTable>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
