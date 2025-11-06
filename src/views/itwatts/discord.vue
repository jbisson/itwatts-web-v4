<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import 'v-calendar/dist/style.css';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
//import BaseCard from "@/components/BaseCard.vue";
import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter } from 'vue-router';
import { useCookies } from "vue3-cookies";
import { storeToRefs } from 'pinia'

import { useUserProfile } from '@/stores/user-profile';
import config from '@/config/config.json';
import security from '@/security';
import { decodeBase64 } from '@/utils/string';
import { useTeamStore } from '@/stores/apps/teams';

const team = ref();
const { t } = useI18n({ useScope: 'global' });
const page = ref({ title: t('swatDiscord.pageTitle') });
const usersResult = reactive([] as any);
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatDiscord.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatDiscord.pageTitle'),
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

  window.location.href = `https://discord.com/oauth2/authorize?client_id=1163909617928110092&response_type=code&redirect_uri=${config.serverApi.publicHostname}%2Fv1%2Fdiscord%2Fcb&scope=identify+guilds+guilds.join+openid+guilds.members.read`;
    return;  

  try {
    const response = await axios.get(`${config.serverApi.publicHostname}/v1/discord/me`,
    {
      withCredentials: true
    });

  
  } catch (error: any) {
    window.location.href = `https://discord.com/oauth2/authorize?client_id=1163909617928110092&response_type=code&redirect_uri=${config.serverApi.publicHostname}%2Fv1%2Fdiscord%2Fcb&scope=identify+guilds+guilds.join+openid`;
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
            
          </div>
        </v-card-text>
      </v-card>  
    </v-col>
  </v-row>
</template>
