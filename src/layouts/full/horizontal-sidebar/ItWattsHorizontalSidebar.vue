<script setup lang="ts">
/*import { ref, shallowRef, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useCustomizerStore } from '@/stores/customizer';
import security from "@/security";
import HorizontalItems from './itwattsHorizontalItems';
import NavItem from './NavItem/ItWattsIndex.vue';
import NavCollapse from './NavCollapse/ItWattsIndex.vue';
import VerticalSidebar from '../vertical-sidebar/ItWattsVerticalSidebar.vue';*/

import { ref, shallowRef, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { useI18n } from 'vue-i18n';
import security from "@/security";
import { useUserProfile } from '@/stores/user-profile';
import { useCustomizerStore } from '@/stores/customizer';
//import HorizontalItems from './horizontalItems';
import HorizontalItems from './itwattsHorizontalItems';
//import NavItem from './NavItem/Index.vue';
import NavItem from './NavItem/ItWattsIndex.vue';
import NavCollapse from './NavCollapse/ItWattsIndex.vue';
//import VerticalSidebar from '../vertical-sidebar/VerticalSidebar.vue';
import VerticalSidebar from '../vertical-sidebar/ItWattsVerticalSidebar.vue';

import config from '@/config/config.json';

import { useTeamStore } from '@/stores/apps/teams';
const customizer = useCustomizerStore();
const sidebarMenu = shallowRef();
const { mdAndUp } = useDisplay();
const { t } = useI18n({ useScope: 'global' });
// function subIsActive(input: any) {
//     const paths = Array.isArray(input) ? input : [input];
//     return paths.some((path) => {
//         return; //$route.path.indexOf(path) === 0; // current path starts with this path string
//     });
// }

async function populateTeams() {
  sidebarMenu.value = [...HorizontalItems];  

  if (useTeamStore().myTeams.length > 0) {  
    const teamMenu = {
      title: t('menu.teams.myTeams'),
      children: [] as any,
    };
    let primaryTeamMenu;
    for (const team of useTeamStore().myTeams) {    
      if (team.managers.includes(useUserProfile().user_id) ||
        team.riders.includes(useUserProfile().user_id)) {      
        teamMenu.children.push({
          title: team.display_name,
          to: `/itwatts/team/${team.name}/info-team`
        });        
      }

      if (team.id === useUserProfile().primary_team_id) {
        primaryTeamMenu = 
          {
            title: team.display_name,
            children: [
              {
                title: t('menu.primaryTeam.info'),
                to: `/itwatts/team/${team.name}/info`,
              },
              {
                title: t('menu.primaryTeam.strava'),
                to: `/itwatts/team/${team.name}/strava`,
              },
              {
                title: t('menu.primaryTeam.powerStats'),
                to: `/itwatts/team/${team.name}/power-stats`,
              },
            ],
          };
        if (team.managers.includes(useUserProfile().user_id)) {
          primaryTeamMenu.children.push(
            {
              title: t('menu.primaryTeam.manage'),
              to: `/itwatts/team/${team.name}/manage`,
            },
          );
        }      
      }

    }
    sidebarMenu.value.push(teamMenu);
    if (primaryTeamMenu) {
      sidebarMenu.value.push(primaryTeamMenu);
    }
  }
}
populateTeams();

watch(() => useTeamStore().myTeams, (newValue, oldValue) => {
  populateTeams();
});

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

</script>

<template>
    <template v-if="mdAndUp">
      <div class="horizontalMenu  border-bottom bg-surface position-relative">
        <div :class="customizer.boxed ? 'maxWidth' : 'px-6'">
          <ul class="gap-3 horizontal-navbar mx-lg-0 mx-3">
            <!---Menu Loop -->
            <template v-for="(item, i) in sidebarMenu" :key="i">
              <li class="navItem" v-if="showMenu(item)">
                <!---If Has Child -->
                <NavCollapse :item="item" :level="0" v-if="item.children" />
                <!---Single Item-->
                <NavItem :item="item" v-else />
                <!---End Single Item-->
              </li>
            </template>              
          </ul>
        </div>
      </div>
    </template>
    <div v-else class="mobile-menu">
      <VerticalSidebar />
    </div>
</template>
<style lang="scss"></style>
