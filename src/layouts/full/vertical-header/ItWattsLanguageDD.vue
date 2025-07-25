<script setup lang="ts">
import { ref } from 'vue';
import { languageDD } from '@/_mockApis/headerData';
import en from '@/assets/images/itwatts/languages/en.png';
import fr from '@/assets/images/itwatts/languages/fr.png';
import flag1 from '@/assets/images/flag/icon-flag-en.svg';
import flag2 from '@/assets/images/flag/icon-flag-ro.svg';
import flag3 from '@/assets/images/flag/icon-flag-zh.svg';
import flag4 from '@/assets/images/flag/icon-flag-fr.svg';

import { useI18n } from 'vue-i18n';
import { useUserProfile } from "@/stores/user-profile";

const { locale, availableLocales } = useI18n({ useScope: 'global' });

function changeLanguage(lang: any) {
  if (useUserProfile().lang !== lang) {
    locale.value = lang;
    useUserProfile().lang = lang;
  }  
}

async function refresh() {  
  if (useUserProfile().lang) {
    locale.value = useUserProfile().lang;
  } else if (navigator.language) {
    const navLanguage = navigator.language.split('-');
    if (navLanguage.length === 2 && availableLocales.includes(navLanguage[0])) {
      locale.value = navLanguage[0];
    }    
  }
}

refresh();

</script>
<template>
    <!-- ---------------------------------------------- -->
    <!-- language DD -->
    <!-- ---------------------------------------------- -->
    <v-menu open-on-hover open-on-click location="bottom">
        <template v-slot:activator="{ props }">
            <v-btn icon variant="text" color="primary" v-bind="props" size="small" class="custom-hover-primary" >
                <v-avatar  rounded="md">
                    <img v-if="$i18n.locale === 'en'" :src="en" :alt="$i18n.locale" width="22" height="22" class="obj-cover" />
                    <img v-if="$i18n.locale === 'fr'" :src="fr" :alt="$i18n.locale" width="22" height="22" class="obj-cover" />
                    <img v-if="$i18n.locale === 'ro'" :src="flag2" :alt="$i18n.locale" width="22" height="15" class="obj-cover" />
                    <img v-if="$i18n.locale === 'zh'" :src="flag3" :alt="$i18n.locale" width="22" height="15" class="obj-cover" />
                </v-avatar>
            </v-btn>
        </template>
        <v-sheet rounded="md" width="200" elevation="10">
            <v-list class="theme-list">
                <v-list-item
                    v-for="(item, index) in languageDD"
                    :key="index"
                    color="primary"
                    :active="$i18n.locale == item.value"
                    class="d-flex align-center"
                    @click="() => changeLanguage(item.value)"
                >
                    <template v-slot:prepend>
                        <v-avatar  rounded="md">
                            <img :src="item.avatar" :alt="item.avatar" width="22" height="22" class="obj-cover" />
                        </v-avatar>
                    </template>
                    <v-list-item-title class="text-subtitle-1 font-weight-regular">
                        {{ item.title }}
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-sheet>
    </v-menu>
</template>
