<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import 'v-calendar/dist/style.css';

import UiParentCard from '@/components/shared/UiParentCard.vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useUserProfile } from '@/stores/user-profile';
import config from '@/config/config.json';
import security from '@/security';
import { useTeamStore } from '@/stores/apps/teams';
import { rules } from '@/utils/rules';

const { t } = useI18n({ useScope: 'global' });
const page = ref({ title: t('swatMerch.pageTitle') });
const team = ref();
const usersResult = reactive([] as any);
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatMerch.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatMerch.pageTitle'),
    disabled: true,
  },
]);

const infoAlert = ref();
const errorAlert = ref();
const warningAlert = ref();
const pickupLocation = ref();

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
        :text="infoAlert"
        v-if="infoAlert"
      ></v-alert>    
      <v-alert
        style="white-space: pre-line;"      
        density="compact"
        type="error"
        :text="errorAlert"
        v-if="errorAlert"
      ></v-alert>
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="warning"
        :text="warningAlert"
        v-if="warningAlert"
      ></v-alert>
      <v-progress-linear v-if="loading"
        indeterminate
        stream
        color="primary"
      ></v-progress-linear>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12">      
      <UiParentCard :title="t('swatMerch.pageTitle')">
        <p class="my-4 text-body-1 text-10">
          (L'inscription ZRL 2025 se fera après un petit sondage de satisfaction au sein du 5.W.4.T. On aimerait connaitre votre expérience dans le 5.W.4.T pour l'année dernière, votre feedback est très important au succès de l'équipe.
          <br /><br />Une fois complété, veuillez cliquer sur le bouton sauvegarder en bas de page.              
        </p>

        <div class="text-subtitle-1 text-grey-darken-1 mb-3">
             Dans quelle région désirez-vous ramasser votre marchandise 5.W.4.T ?
        </div>
            <v-row class="align-center">      
              <v-col>
              <v-radio-group hide-details="auto" v-model="pickupLocation" :rules="[rules().required]">
                <v-radio label="Outaouais" color="primary" value="outaouais"></v-radio>
                <v-radio label="MTL" color="primary" value="mtl"></v-radio>
                <v-radio label="Québec" color="primary" value="quebec"></v-radio>
              </v-radio-group>
            </v-col>
          </v-row>

      </UiParentCard>
    </v-col>
  </v-row>
</template>
