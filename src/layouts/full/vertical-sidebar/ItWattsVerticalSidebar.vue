<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import { useCustomizerStore } from '@/stores/customizer';
import sidebarItems from './ItwattsSidebarItem';

import NavGroup from './NavGroup/ItWattsIndex.vue';
import NavItem from './NavItem/index.vue';
import NavCollapse from './NavCollapse/NavCollapse.vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import { PowerIcon } from 'vue-tabler-icons';
const customizer = useCustomizerStore();
const sidebarMenu = shallowRef();
const authStore = useAuthStore();
import { useUserProfile } from '@/stores/user-profile';
import { useTeamStore } from '@/stores/apps/teams';

import security from "@/security";
import config from '@/config/config.json';

const { t } = useI18n({ useScope: 'global' });

function logout() {
  console.log('logout');
  security.logout();  
  window.location.href = '/';
}

function showMenu(item: any) {
  let tokenValid = false;
  if (item && (item.security || item.hideOnLoggedInUser)) {
    if (item.security && item.security[0] === 'DEV_ONLY') {
      return config.ui.showAllMenus === 'true';
    }

    if (item.security && item.security[0] === 'DEV_ONLY') {
      tokenValid = false;
    } else {
      tokenValid = security.isTokenValid(item.security);
    }
    
    return item.hideOnLoggedInUser ? !security.isLoggedIn() : tokenValid; 
  } else {
    return true;
  }
}

async function populateTeams() {
  console.log('populateTeams');
  sidebarMenu.value = [...sidebarItems];
  const teamMenu = {
    header: t('menu.teams.myTeams'),
    security: [],
  };
  sidebarMenu.value.push(teamMenu);
  let primaryTeamMenus = [] as any;
  for (const team of useTeamStore().myTeams) {
    if (team.managers.includes(useUserProfile().user_id) || 
      team.riders.includes(useUserProfile().user_id)) {
      const teamItem = {
        title: team.display_name,
        to: `/itwatts/team/${team.name}/info`,
        security: [],
      };
      
      sidebarMenu.value.push(teamItem);
    }
    if (team.id === useUserProfile().primary_team_id) {
      primaryTeamMenus = [
        {
          header: team.display_name,
          security: [],
        },
        {
          title: t('menu.primaryTeam.info'),
          to: `/itwatts/team/${team.name}/info`,
          security: [],
        },
        {
          title: t('menu.primaryTeam.strava'),
          to: `/itwatts/team/${team.name}/strava`,
          security: [],
        },
        {
          title: t('menu.primaryTeam.powerStats'),
          to: `/itwatts/team/${team.name}/power-stats`,
          security: [],
        },
      ];
      if (team.managers.includes(useUserProfile().user_id)) {
        primaryTeamMenus.push(
          {
            title: t('menu.primaryTeam.manage'),
            to: `/itwatts/team/${team.name}/manage`,
            security: [],
          },
        );
      }      
    }
  }

  for (const primaryTeamMenu of primaryTeamMenus) {
    sidebarMenu.value.push(primaryTeamMenu);
  }
}
populateTeams();

watch(() => useTeamStore().myTeams, (newValue, oldValue) => {
  populateTeams();
});

</script>

<template>
  <v-navigation-drawer left v-model="customizer.Sidebar_drawer" elevation="0" rail-width="75" 
    app class="leftSidebar" :rail="customizer.mini_sidebar" expand-on-hover width="256">

    <!-- ---------------------------------------------- -->
    <!---Navigation -->
    <!-- ---------------------------------------------- -->
    <perfect-scrollbar class="scrollnavbar">
      <div class="profile">
        <div class="profile-pic profile-pic py-7 px-3">
          <v-avatar size="45">
            <!--<img src="@/assets/images/profile/user2.jpg" width="50" alt="Julia" />-->
          </v-avatar>
        </div>
        <div class="profile-name d-flex align-center px-3">
          <h5 class="text-white font-weight-medium">{{ useUserProfile().first_name }} {{ useUserProfile().last_name }}</h5>
          <div class="ml-auto profile-logout">
            <v-btn variant="text" icon rounded="md" color="white" @click="logout()">
              <PowerIcon size="22"/>
              <v-tooltip activator="parent" location="top">Logout</v-tooltip>
            </v-btn>
          </div>
        </div>
      </div>
      <v-list class="py-6 px-4">
        <!---Menu Loop -->
        <template v-for="(item, i) in sidebarMenu">
          <!---Item Sub Header -->
          <NavGroup :item="item" v-if="item.header && showMenu(item)" :key="item.title" />
          <!---If Has Child -->
          <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children && showMenu(item)" />
          <!---Single Item-->
          <NavItem :item="item" v-else-if="showMenu(item)" class="leftPadding" />
          <!---End Single Item-->
        </template>
      </v-list>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>
