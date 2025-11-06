<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { watch, ref, onUpdated } from "vue";
import { useUserProfile } from '@/stores/user-profile';
import { useI18n } from 'vue-i18n';
import security from "@/security";
import type { notificationType, profileType, languageType,searchType } from '@/types/HeaderTypes';

const authStore = useAuthStore();
const { t } = useI18n({ useScope: 'global' });

function logout() {
  console.log('logout');
  security.logout();  
  window.location.href = '/';
}

import proUser1 from '@/assets/images/svgs/icon-account.svg';
import profileUser from "@/assets/images/profile/user-1.jpg";

onUpdated(() => {
  profileDD[0].href = `/itwatts/user/profile/${useUserProfile().user_id}`;  
});

const profileDD: profileType[] = [
  {
    title: t('profileDropDown.myProfile'),
    href: '',
    badge: false,
    onClicked: function() {
      
    }
  },
  {
    title: t('profileDropDown.accountSettings'),
    href: '/itwatts/account-settings',
    badge: false,
    onClicked: function() {
      
    }
  },
  {
    title: t('profileDropDown.signOut'),
    href: '',
    badge: false,
    onClicked: function() {
      logout();
    }
  },
];

</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- notifications DD -->
    <!-- ---------------------------------------------- -->
    <v-menu open-on-hover open-on-click  class="profile_popup" v-if="useUserProfile().first_name">
        <template v-slot:activator="{ props }">
            <v-btn variant="text" v-bind="props" icon size="small" color="primary" class="custom-hover-primary ms-md-2">
                <v-avatar size="30">
                    <img :src="useUserProfile().profile_url || profileUser" width="35" :alt="useUserProfile().first_name" />
                </v-avatar>
            </v-btn>
        </template>
        <v-sheet rounded="md" width="350" elevation="10">
            <div class="pb-4">
                <div class="d-flex align-center pa-4">
                    <v-avatar size="50">
                      <img :src="useUserProfile().profile_url || profileUser" width="50" :alt="useUserProfile().first_name" />                        
                    </v-avatar>
                    <div class="ml-3">
                        <h6 class="text-h6  textPrimary font-weight-medium">{{ useUserProfile().first_name }} {{ useUserProfile().last_name }}</h6>
                        <span class="text-12 textSecondary">{{ useUserProfile().email }}</span>
                    </div>
                </div>
                <v-divider></v-divider>
                <perfect-scrollbar style="height: calc(100vh - 180px); max-height: 180px">
                <v-list class="py-0 px-4 theme-list mt-3" lines="one">
                    <v-list-item v-for="item in profileDD" :key="item.title" class="py-0 px-2 rounded-md custom-text-primary" color="primary"  :to="item.href" @click="item.onClicked()">
                        <div class="d-flex gap-3 align-center">
                            <p class="text-subtitle-1 textPrimary hover-primary font-weight-medium">{{ item.title }}</p>
                            <v-chip size="small" color="info" v-if="item.badge">4</v-chip>
                        </div>
                    </v-list-item>
                </v-list>
            </perfect-scrollbar>
            </div>
        </v-sheet>
    </v-menu>
</template>
