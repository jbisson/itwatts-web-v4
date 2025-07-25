<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import Logo from '@/layouts/full/logo/Logo.vue';
import { useUserProfile } from "@/stores/user-profile";

import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n({ useScope: 'global' });
const route = useRoute(); // Get current route

const navigation = ref([
    {
        menu: t('menu.home.title'),
        href: '/',
        badge: false
    },
    {
        menu: 'FERA',
        href: '/fera',
        badge: true
    },
    {
        menu: 'StriveKOM',
        href: '/strive-kom',
        badge: false
    },
    {
        menu: 'About Us',
        href: '/about-us',
        badge: false
    },
    {
        menu: 'Packages',
        href: '/packages',
        badge: false
    },
    {
        menu: 'Contact',
        href: '/contact-us',
        badge: false
    },
    {
        menu: '',
        href: '',
        badge: false
    },
        {
        menu: '',
        href: '',
        badge: false
    },
    {
        menu: '',
        href: '',
        badge: false
    },
    {
        menu: t('common.switchLang'),
        href: '',
        onClick: changeLanguage,
        badge: false
    }
]);

function changeLanguage() {
  locale.value = locale.value === 'fr' ? 'en' : 'fr';
  useUserProfile().lang = locale.value;
  location.reload();
}

// Function to check if the menu is active
const isActive = (href: string) => route.path === href;
</script>

<template>
    <div class="d-flex flex-lg-row flex-column align-lg-center justify-space-between w-100 ga-lg-6 ga-4 pa-lg-0 pa-6">
        <div class="d-lg-none d-block mb-4">
            <Logo />
        </div>

        <div v-for="(item, i) in navigation" :key="i">
            <div class="d-flex align-center">
                <RouterLink
                    @click="item.onClick? item.onClick() : ''"
                    :to="item.href"
                    :class="[
                        'text-15 font-weight-semibold text-decoration-none text-hover-primary d-flex align-center ga-2 px-3 py-lg-1 py-2 lg-w-auto w-100',
                        isActive(item.href) ? 'text-primary light-primary rounded-pill' : ''
                    ]"
                >
                    {{ item.menu }}
                    <v-chip v-if="item.badge" class="font-weight-semibold h-23" color="primary" size="small" rounded="pill" label> New </v-chip>
                </RouterLink>
               
            </div>
        </div>

        <v-btn class="d-md-none d-flex w-full text-white h-43 px-5 transform-none" color="primary"  href="/auth/login" target="_blank">
            <span class="text-white">Log in</span>
        </v-btn>
    </div>
</template>
