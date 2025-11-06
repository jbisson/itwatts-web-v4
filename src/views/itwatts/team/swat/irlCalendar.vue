<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import 'v-calendar/dist/style.css';
import FullCalendar from './fullCalendar.vue';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useUserProfile } from '@/stores/user-profile';
import config from '@/config/config.json';
import security from '@/security';
import { decodeBase64 } from '@/utils/string';
import { useTeamStore } from '@/stores/apps/teams';

const { t } = useI18n({ useScope: 'global' });
const page = ref({ title: t('swatIrlCalendar.pageTitle') });
const team = ref();
const usersResult = reactive([] as any);
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatIrlCalendar.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatIrlCalendar.pageTitle'),
    disabled: true,
  },
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
    <v-col cols="10" sm="10" lg="10">
      <v-card>
        <v-card-text>          
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <div class="align-center">
            <FullCalendar />
          </div>
        </v-card-text>
      </v-card>  
    </v-col>
  </v-row>
</template>
