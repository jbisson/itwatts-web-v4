<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from '@/stores/user-profile';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter } from 'vue-router';

import config from "@/config/config.json";
import security from "@/security";
import { exportUser } from '@/utils/export';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('adminSwatGuests.pageTitle') });

const guessUsersResult = reactive([] as any);
const usersExport = ref('');
const loading = ref(false);
const searchValue = ref();

const errorAlert = ref();
const warningAlert = ref();
const infoAlert = ref();
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('adminSwatGuests.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('adminSwatGuests.pageTitle'),
    disabled: true,
  },
]);

const userStoreProfile = useUserProfile();


const overallHeaders: Header[] = reactive([
  { text: 'Nom', width: 150, value: "name", sortable: true },
  { text: 'Genre', value: "gender", sortable: true },
  { text: 'Courriel', value: "email", sortable: true },
  { text: 'Region', value: "region", sortable: true },
  { text: 'Roles', value: "rolesText", sortable: true },
  { text: 'Zwift name', value: "zwift_name", sortable: true },      
  { text: 'Discord name', value: "discord_info", sortable: true },
]);

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ADMIN'];

  if (!security.isTokenValid(rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  guessUsersResult.value = [];

  if (security.isTokenValid(['SUPER_ADMIN', 'SWAT_ADMIN'])) {
    overallHeaders.push({ text: 'ZP last synced', value: "zp_last_synced", sortable: true });
    overallHeaders.push({ text: 'Zwift 5.W.4.T club status', value: "zwift_status", sortable: true });
    overallHeaders.push({ text: 'Zwift last synced', value: "zwift_last_synced", sortable: true });
    overallHeaders.push({ text: 'ZP primary team', value: "zp_primary_team_name", sortable: true });    
  }
  // overallHeaders.push({ text: '1 Yr cp20', value: "zp_1yr_cp20", sortable: true });
  // overallHeaders.push({ text: '1 Yr cp1', value: "zp_1yr_cp1", sortable: true });
  // overallHeaders.push({ text: '1 Yr cp5', value: "zp_1yr_cp5", sortable: true });
  
  interface ResponseData {
    data: any,
  }

  loading.value = true;
  errorAlert.value = '';
  try {    
    const response = await axios.get<ResponseData>(`${config.serverApi.publicHostname}/v1/users?groups=swat_guest_2024_2025&additionalFields=zp_profile&excludedFields=zp_profile(events)&sortBy=first_name,last_name`,
    {
      withCredentials: true
    });
    
    usersExport.value = `${exportUser().headers.toString()}\n`;

    for (const user of response.data.data) {
      user.name = `${user.first_name} ${user.last_name}`;

      if (user.roles && user.roles.length > 0) {        
        user.rolesText = user.roles.toString();
      }

      if (user.zwift_profile) {
        user.zwift_name = `${user.zwift_profile.firstName} ${user.zwift_profile.lastName}`;
        user.zwift_status = user.zwift_profile.clubs ? user.zwift_profile.clubs[0].status : '';
        user.zwift_last_synced = new Date(user.zwift_profile.lastSynced).toLocaleDateString();        
      }

      if (user.zp_profile) {
        user.zp_primary_team_name = user.zp_profile.primary_team_name;
        user.zp_last_synced = new Date(user.zp_profile.last_modified).toLocaleDateString();
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

      guessUsersResult.value.push(user);
      usersExport.value += `${exportUser(user).value.toString()}\n`;
    }
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    errorAlert.value = `Oups, une erreur est survenu, detail: ${err}`;
    console.log('an error occured: ' + err);    
  }
  loading.value = false;
}

async function exportMembres() {
  const dateNow = new Date().toISOString().split('T')[0];
  const universalBOM = "\uFEFF";
  const file = new File([universalBOM + usersExport.value], `${dateNow} invites-5w4t.csv`, {
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
    <v-col cols="12" sm="12" lg="12">
      <v-card>
        <v-card-text>
          <div class="d-flex align-center mb-4">
            <h2 class="text-h5">{{ $t('adminSwatGuests.pageTitle') }}</h2>
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
            <v-progress-linear v-if="loading"
              indeterminate
              stream
              color="primary"
            ></v-progress-linear>
            <EasyDataTable
                :search-field="['name', 'zp_id']"
                :search-value="searchValue"
                :headers="overallHeaders"
                :items="guessUsersResult.value"
                alternating>
                <template #item-name="{ name, id, zp_id }">
                   <a :href="'/itwatts/user/profile/' + id">{{ name }}</a>
                  <!--<a :href="'https://zwiftpower.com/profile.php?z=' + zp_id" target="_blank">{{ first_name }} {{ last_name }}</a>-->
                </template>
            </EasyDataTable>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12">
      <v-btn color="primary" flat @click="exportMembres">Export</v-btn>
    </v-col>
  </v-row>
</template>
