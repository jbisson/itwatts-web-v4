<script setup lang="ts">
import type { notificationType, profileType, languageType,searchType } from '@/types/HeaderTypes';
import { MailIcon } from "vue-tabler-icons";
import { watch, ref, onUpdated } from "vue";
//import { profileDD } from "@/_mockApis/ItWattsHeaderData";
//import { profileDD } from "@/_mockApis/HeaderData";
import { useUserProfile } from '@/stores/user-profile';
import { useI18n } from 'vue-i18n';
import security from "@/security";

const { t } = useI18n({ useScope: 'global' });
//const userID = ref(useUserProfile().user_id);
function logout() {
  console.log('logout');
  security.logout();  
  window.location.href = '/';
}

import proUser1 from '@/assets/images/svgs/icon-account.svg';
import profileUser from "@/assets/images/profile/user-1.jpg";

const profileDD: profileType[] = [
    {
        avatar: proUser1,
        title: t('userProfile.myProfile'),
        subtitle: t('userProfile.accountSettings'),
        href: '',
    },
];

onUpdated(() => {  
  profileDD[0].href = `/itwatts/user/profile/${useUserProfile().user_id}`;  
});
</script>

<template>
  <!-- ---------------------------------------------- -->
  <!-- notifications DD -->
  <!-- ---------------------------------------------- -->
  <v-menu :close-on-content-click="false" v-if="useUserProfile().first_name">
    <template v-slot:activator="{ props }">
      <v-btn class="custom-hover-primary" variant="text" v-bind="props" icon>
        <v-avatar size="35">
          <img :src="useUserProfile().profile_url || profileUser" width="35" :alt="useUserProfile().first_name" />
        </v-avatar>
      </v-btn>
    </template>
    <v-sheet rounded="md" width="360" elevation="10">
      <div class="px-8 pt-6">
        <h6 class="text-h5 font-weight-medium">{{ t('userProfile.title') }}</h6>
        <div class="d-flex align-center mt-4 pb-6">
          <v-avatar size="80">
            <img :src="useUserProfile().profile_url || profileUser" width="80"/>
          </v-avatar>
          <div class="ml-3">
            <h6 class="text-h6 mb-n1">{{ useUserProfile().first_name }} {{ useUserProfile().last_name }}</h6>
            <span class="text-subtitle-1 font-weight-regular textSecondary"
              ></span
            >
            <div class="d-flex align-center mt-1">
              <MailIcon size="18" stroke-width="1.5" />
              <span
                class="text-subtitle-1 font-weight-regular textSecondary ml-2"
                >{{ useUserProfile().email }}</span
              >
            </div>
          </div>
        </div>
        <v-divider></v-divider>
      </div>
      <perfect-scrollbar style="height: calc(100vh - 240px); max-height: 100px">
        <v-list class="py-0 theme-list" lines="two">
          <v-list-item
            v-for="item in profileDD"
            :key="item.title"
            class="py-4 px-8 custom-text-primary"
            :to="item.href"
          >
            <template v-slot:prepend>
              <v-avatar
                size="48"
                color="lightprimary"
                class="mr-3"
                rounded="md"
              >
                <v-img
                  :src="item.avatar"
                  width="24"
                  height="24"
                  :alt="item.avatar"
                />
              </v-avatar>
            </template>
            <div>
              <h6 class="text-subtitle-1 font-weight-semibold mb-2 custom-title">
                {{ item.title }}
              </h6>
            </div>
            <p class="text-subtitle-1 font-weight-regular textSecondary">
              {{ item.subtitle }}
            </p>
          </v-list-item>
        </v-list>
      </perfect-scrollbar>
      <div class="pt-4 pb-6 px-8 text-center">
        <v-btn color="primary" variant="outlined" block @click="logout()"
          >{{ t('userProfile.logoutBtn') }}</v-btn
        >
      </div>
    </v-sheet>
  </v-menu>
  
</template>
