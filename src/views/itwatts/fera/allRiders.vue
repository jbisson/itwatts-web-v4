<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch, nextTick } from 'vue';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useI18n } from 'vue-i18n';
import security from "@/security";
import { useRouter } from 'vue-router';
import { useUserProfile } from '@/stores/user-profile';
import { useTrainerStore } from '@/stores/apps/trainers';
import { usePowerSourceStore } from '@/stores/apps/power-sources';
import { useTeamStore } from '@/stores/apps/teams';
import { uuid } from 'vue-uuid';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';
import { Cropper, Preview, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

import config from "@/config/config.json";
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { AlertSmallIcon } from 'vue-tabler-icons';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('feraAllRiders.pageTitle') });
const router = useRouter();
const searchValue = ref();
const allRiders = reactive([] as any);
allRiders.value = [];

const breadcrumbs = ref([
  {
    text: t('feraAllRiders.pageCategory'),
    disabled: false,
    to: '#'
  },
  {
    text: t('feraAllRiders.pageTitle'),
    disabled: true
  }
]);

const overallHeaders: Header[] = reactive([
  { text: t('common.name'), width: 150, value: "name", sortable: true },
  { text: t('common.team'), value: "primary_team_name", sortable: true },
  { text: t('common.gender'), value: "gender", sortable: true },
  { text: t('common.primaryTrainer'), value: "primary_trainer", sortable: true },      
  { text: t('common.powerMeterDualRecording'), value: "power_meter_dual_recording", sortable: true },
  { text: t('common.lastWeightChangeZwift'), value: "last_weight_change_zwift", sortable: true },
  //{ text: t('common.lastWeightChangeMyWhoosh'), value: "last_weight_change_my_whoosh", sortable: true },
  { text: t('common.validatedRaces'), value: "validated_races_nb", sortable: true },
  { text: t('common.validatedPowerProfile'), value: "validated_power_profile_nb", sortable: true },
]);

const now = new Date();
const tab = ref();
const loading = ref(false);
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();

async function refresh() {
  if (!security.isTokenValid([])) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }

  await useTrainerStore().fetchTrainers();
  await usePowerSourceStore().fetchPowerSources();
  await useTeamStore().fetchTeams();

  const now = new Date();
  errorAlert.value = '';
  try {
    const allUsers = await axios.get(`${config.serverApi.publicHostname}/v1/users?fera_privacy(consent)=yes&additionalFields=zp_profile(processed)&sortBy=first_name,last_name`,
    {
      withCredentials: true
    });
    for (const user of allUsers.data.data) {
      // console.log(JSON.stringify(user.zp_profile));
      const primaryTrainer = user.trainers.find((trainer: any) => trainer.primary);
      const powerMeterDualRecording = user.power_meters.find((power_meter: any) => power_meter.dual_recording);

      const nbLastWeightChangedZwift = user.zp_profile ? Math.round((now.getTime() -
        new Date(user.zp_profile.processed.date_last_updated_weight).getTime()) / (1000 * 3600 * 24)) : '';

      let validatedRacesInfo = '';
      if (user.zp_profile.processed && user.zp_profile.processed.validated_races) {
        for (let i = 0;i < user.zp_profile.processed.validated_races.length;i++) {
          validatedRacesInfo += `<p>${user.zp_profile.processed.validated_races[i].date} ${user.zp_profile.processed.validated_races[i].name}</p>\n`;
        }        
      }
      
      allRiders.value.push({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        zp_id: user.zp_id,
        gender: user.gender,
        primary_team_name: user.primary_team_id ? useTeamStore().teamsMap.get(user.primary_team_id).display_name : '',
        primary_trainer: primaryTrainer ? useTrainerStore().trainers.find((trainer: any) => trainer.value == primaryTrainer.model).text : '',
        power_meter_dual_recording: powerMeterDualRecording ? usePowerSourceStore().powerSources.find((powerSource: any) => powerSource.value == powerMeterDualRecording.model).text : '',
        last_weight_change_zwift: nbLastWeightChangedZwift,
        last_weight_change_my_whoosh: '',
        validated_races_nb: user.zp_profile && user.zp_profile.processed && user.zp_profile.processed.validated_races ? 
          user.zp_profile.processed.validated_races.length : 0,
        validated_races_info: validatedRacesInfo,
        validated_power_profile_nb: 0
      });
    }
    
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });      
    }
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  }
}

const rules = ref({
  required: (value: any) => !!value || t('validations.required'),
  email: (value: any) => {
      const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(value) || t('validations.invalidEmail');
    },
});

watch(() => [], refresh);
refresh();
</script>

<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
    <v-col>
      <v-progress-linear
          v-if="loading"
          indeterminate
          stream
          color="primary"            
        ></v-progress-linear>
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
    <v-col cols="12" sm="12" lg="12">
      <v-card>
        <v-card-text>
          <div class="d-flex align-center mb-4">
            <h2 class="text-h5">{{ $t('feraAllRiders.pageTitle') }}</h2>
          </div>
          <v-col cols="3" sm="3" lg="3">
            <v-text-field
              v-model="searchValue"
              variant="outlined"
              append-inner-icon="mdi-magnify"
              :placeholder="t('actions.search')"
              hide-details
              density="compact"
            ></v-text-field>
          </v-col>
          <div class="align-center">
            <EasyDataTable
                :search-field="['name', 'zp_id'] "
                :search-value="searchValue"
                :headers="overallHeaders"
                :items="allRiders.value"
                alternating>
                <template #item-name="{ name, id, zp_id }">
                  <!--<a :href="'https://zwiftpower.com/profile.php?z=' + zp_id" target="_blank">{{ name }}</a>-->
                  <a :href="'/itwatts/user/profile/' + id">{{ name }}</a>
                </template>
                <template #item-validated_races_nb="{ validated_races_nb, validated_races_info }">
                  {{ validated_races_nb }}
                  <v-tooltip
                    v-if="validated_races_info"
                    activator="parent"
                  ><span v-html=validated_races_info></span></v-tooltip>
                </template>
            </EasyDataTable>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

