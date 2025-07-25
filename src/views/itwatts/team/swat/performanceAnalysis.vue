<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from '@/stores/user-profile';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument, FilterOption } from "vue3-easy-data-table";
import { useRouter } from 'vue-router';

import config from "@/config/config.json";
import security from "@/security";

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('swatPerformanceAnalysis.pageTitle') });
const usersResult = reactive([] as any);
const itemsSelected = ref<Item[]>([]);
const zpPreferencesList = reactive([] as any);
const filterOptions = reactive([] as any);
const dialogUsers = reactive([] as any);
const searchValue = ref();
const dialog = ref(false);
const dialogConfirmDeleteList = ref(false);
const isFormValid = ref();
const chip = ref(true);
const dialogListName = ref();
const filterSelection = ref();

const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatPerformanceAnalysis.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatPerformanceAnalysis.pageTitle'),
    disabled: true,
  },
]);

const overallHeaders: Header[] = reactive([
  { text: 'Nom', width: 150, value: "name", sortable: true },
  { text: 'ZP ID', width: 150, value: "zp_id", sortable: true },
  { text: 'Genre', value: "gender", sortable: true },
  { text: 'Poids(kg)', value: "zp_profile.processed.newest_event_weight", sortable: true },
  { text: 'Grandeur (cm)', value: "zp_profile.processed.newest_event_height", sortable: true },
  { text: '15s (w)', value: "zp_profile.profile_stats.w15", sortable: true },
  { text: '15s (w/kg)', value: "zp_profile.profile_stats.wkg15", sortable: true },  
  { text: '1min (w)', value: "zp_profile.profile_stats.w60", sortable: true },
  { text: '1min (w/kg)', value: "zp_profile.profile_stats.wkg60", sortable: true },  
  { text: '5min (w)', value: "zp_profile.profile_stats.w300", sortable: true },
  { text: '5min (w/kg)', value: "zp_profile.profile_stats.wkg300", sortable: true },  
  { text: '20min (w)', value: "zp_profile.profile_stats.w1200", sortable: true },
  { text: '20min (w/kg)', value: "zp_profile.profile_stats.wkg1200", sortable: true }, 
  { text: '1Yr 3Avg MaxCp20', value: "zp_profile.processed.zp1Yr3AvgMaxCp20", sortable: true }, 
  
]);

const rulesRequired = ref([
  (value: any) => !!value || 'Ce champ est obligatoire.',
]);

usersResult.value = [];

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ADMIN', 'SWAT_MEMBER_2024_2025'];
  if (!security.isTokenValid(rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  if (security.isTokenValid(['SUPER_ADMIN', 'SWAT_ADMIN'])) {

  }
  
  interface ResponseData {
    data: any,
  }

  usersResult.value = [];
  zpPreferencesList.value = [];

  try {
    const response = await axios.get<ResponseData>(`${config.serverApi.publicHostname}/v1/users?groups=swat_2024_2025&additionalFields=zp_profile&sortBy=first_name,last_name`,
    {
      withCredentials: true
    });
    for (const user of response.data.data) {
      user.name = `${user.first_name} ${user.last_name}`;

      usersResult.value.push(user);
      
      if (user.zp_preferences && user.id === useUserProfile().user_id) {
        zpPreferencesList.value = user.zp_preferences.my_lists;
      }      

    }    
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  }
}

function openNewListDialog() {
  dialogUsers.value = itemsSelected;
  dialog.value = true;
}

async function save() {
  const zp_ids = dialogUsers.value.map((user) => user.zp_id);
  
  zpPreferencesList.value.push({
    name: dialogListName.value,
    zp_ids: zp_ids
  });

  await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
  {
    zp_preferences: {
      my_lists: zpPreferencesList.value
    }
  },
  {
    withCredentials: true
  });
  dialog.value = false;
}

function showDialogRemoveList(list) {
  dialogListName.value = list.name;
  dialogConfirmDeleteList.value = true;
}

async function deleteList() {
  zpPreferencesList.value = zpPreferencesList.value.filter((list) => list.name !== dialogListName.value);
  await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
  {
    zp_preferences: {
      my_lists: zpPreferencesList.value
    }
  },
  {
    withCredentials: true
  });
  dialogConfirmDeleteList.value = false;
}

function filterDataTable() {  
  if (filterSelection.value) {
    filterOptions.value = [{
      field: 'zp_id',
      comparison: 'in',
      criteria: filterSelection.value.zp_ids
      }];
  } else {
    filterOptions.value = [];
    itemsSelected.value = [];
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
            <h2 class="text-h5">{{ $t('swatPerformanceAnalysis.pageTitle') }}</h2>
          </div>          
          <h3 class="text-h5">Mes listes:</h3>
          <v-chip-group
            v-model="filterSelection"
            selected-class="text-primary"
            @update:modelValue="filterDataTable"
            column>
            <v-chip  
              variant="outlined"            
              v-for="list in zpPreferencesList.value"
              :key="list"
              :value="list"
              filter
              >
              {{ list.name }}
              <template #close>
                <v-icon icon="mdi-close-circle" @click.stop="showDialogRemoveList(list)" />
              </template>
            </v-chip>
          </v-chip-group>
          <v-row>
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
            <v-col cols="9" sm="9" lg="9" class="text-sm-right">
              <v-btn v-if="itemsSelected.length > 0" color="primary" @click="openNewListDialog()"><v-icon class="mr-2">mdi-account-multiple-plus</v-icon>Ajouter une liste</v-btn>
            </v-col>
          </v-row>
          <div class="align-center"><br>
            <EasyDataTable
                v-model:items-selected="itemsSelected"
                :search-field="['name', 'zp_id'] "
                :search-value="searchValue"
                :headers="overallHeaders"
                :items="usersResult.value"
                :filter-options="filterOptions.value"
                alternating
                :theme-color="'#1E88E5'"
                >
                <template #item-name="{ name, id, zp_id }">
                  <!-- <a :href="'/itwatts/user/profile/' + id">{{ first_name }} {{ last_name }}</a>-->
                  <a :href="'https://zwiftpower.com/profile.php?z=' + zp_id" target="_blank">{{ name }}</a>
                </template>
            </EasyDataTable>
            <v-dialog v-model="dialog" max-width="500">
              <v-card>
                <v-form ref="myform" v-model="isFormValid">   
                  <v-card-text>
                    <h4 class="text-h3 mb-4">Ajouter une nouvelle liste</h4>
                    <p>
                      <v-text-field
                        v-model="dialogListName"
                        variant="outlined"
                        placeholder="Nom de la liste..."
                        hide-details
                        density="compact"
                        :rules="rulesRequired"
                      ></v-text-field>
                    </p><br>
                    <h4 class="text-h6 mb-4">Coureurs:</h4>
                    <div class="my-5 text-subtitle-1 lh-md">
                      <span
                        v-for="(user,lineNumber) of dialogUsers.value" 
                        v-bind:key="lineNumber" >
                        - {{ user.first_name }} {{ user.last_name }}<br/>
                      </span><br>
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn color="primary" @click="save" :disabled="!isFormValid">Sauvegarder</v-btn>
                    <v-btn color="primary" @click="dialog = false">Annuler</v-btn>
                  </v-card-actions>
                </v-form>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogConfirmDeleteList" max-width="500">
              <v-card>
                <v-card-text class="mb-4">
                  <h4 class="text-h4 mb-5">Confirmer</h4>
                  Etes-vous sure de supprimer votre liste: {{ dialogListName }} ?
                </v-card-text>                
                <v-card-actions>
                    <v-btn color="primary" @click="deleteList()">Oui</v-btn>
                    <v-btn color="primary" @click="dialogConfirmDeleteList = false">Annuler</v-btn>
                  </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
