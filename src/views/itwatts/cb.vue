<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n'
import { useCookies } from "vue3-cookies";
import { useRouter } from 'vue-router';
import axios from 'axios';

import { useUserProfile } from '@/stores/user-profile';
import { useTeamStore } from '@/stores/apps/teams';
import config from '@/config/config.json';
import { decodeBase64 } from '@/utils/string';

const router = useRouter();
const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('cb.pageTitle') });

const token = reactive([] as any);

const breadcrumbs = ref([
  {
    text: t('cb.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('cb.pageTitle'),
    disabled: true,
  },
]);

async function refresh() {
  const { cookies } = useCookies();
  const userCookie = cookies.get('user');
  let path = '/itwatts/signin';
  let query = {};
  if (userCookie) {
    token.value = JSON.parse(decodeBase64(userCookie.split('.')[1]).toString());
    // console.log(`Token: ${JSON.stringify(token.value)}`);
    
    if (token.value.id && 
      !token.value.id.startsWith('facebook') &&
      !token.value.id.startsWith('google') &&
      !token.value.id.startsWith('strava')) {
      /*const profile = {
        user_id: token.value.id,
        zp_id: token.value.zp_id,
        first_name: token.value.first_name,
        last_name: token.value.last_name,
        roles: token.value.roles,
        profile_url: token.value.profile_url,
        email: token.value.email,
      };
      console.log('Setting profile now...' + token.value.zp_id);*/

      //useUserProfile().setProfile(profile);      
      useUserProfile().user_id = token.value.id;
      useUserProfile().profile_url = token.value.profile_url;
      await useUserProfile().fetchUserProfile();
      await useTeamStore().fetchMyTeams(true);
      useUserProfile().setPrimaryTeam(useTeamStore().myTeams);      

      if (useUserProfile().login_post_back_page) {
        path =  useUserProfile().login_post_back_page;
        query = useUserProfile().login_post_back_page_query;
        useUserProfile().login_post_back_page = '';        
      }
      else if (useUserProfile().primary_team) {
        path =  `/itwatts/team/${useUserProfile().primary_team.name}/info`;
      } else {
        path =  `/itwatts/user/profile/${useUserProfile().user_id}`;
      }
    }
  }

  router.push({ path: path, query: query });
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
    </v-col>  
  </v-row>
</template>
