<script setup lang="ts">
import { RouterLink } from 'vue-router';
//import Logo from '@/layouts/full/logo/LogoLight.vue';
import Logo from '@/layouts/blank/logo/ItWattsLogoLight.vue';
import LogoIcon from '@/layouts/blank/logo/ItWattsLogoIcon.vue';
//import LogoIcon from '@/layouts/full/logo/LogoIcon.vue';
import type { LeaderType, TemplateType, ThemeFeatures, PackageType, FooterType, Feature } from '@/types/components/front-pages/index';

// Footer Menu Links
const FooterMenu1: FooterType[] = [
];
const FooterMenu2: FooterType[] = [
    {
        menu: 'Treeview',
        link: '/pages/treeview'
    },
    {
        menu: 'Banners',
        link: '/widgets/banners'
    },
    {
        menu: 'Charts',
        link: '/widgets/charts'
    },
    {
        menu: 'Gallery Lightbox',
        link: '/pages/gallery-lightbox'
    },
    {
        menu: 'Social Contacts',
        link: '/pages/social-media-contacts'
    }
];
const FooterMenu3: FooterType[] = [
    {
        menu: 'Form Layout',
        link: '/forms/form-layouts'
    },
    {
        menu: 'Tables',
        link: '/tables/basic'
    },
    {
        menu: 'Stepper',
        link: '/forms/form-elements/stepper'
    },
    {
        menu: 'Datatables',
        link: '/datatables/basic'
    },
    {
        menu: 'Validation',
        link: '/forms/form-validation'
    }
];
const FooterMenu4: FooterType[] = [
    {
        menu: 'ITWatts Support',
        link: '/forms/form-layouts'
    },
];

</script>

<template>
    <div class="front-dark bg-textPrimary">
        <v-container class="max-width-1218 py-0">
            <div class="space-p-96">
                <v-row>
                    <v-col cols="12" lg="3" sm="6">
                        <div class="mb-sm-8 mb-6">
                            <Logo />
                        </div>
                        <div class="d-flex flex-column ga-4 mt-lg-n1">
                            <div v-for="item in FooterMenu1" :key="item.menu">
                                <RouterLink
                                    :to="item.link"
                                    target="_blank"
                                    class="text-white text-14 opacity-80 font-weight-regular hover-primary text-decoration-none"
                                >
                                    {{ item.menu }}
                                </RouterLink>
                            </div>
                        </div>
                    </v-col>
                    <v-col cols="12" lg="3" sm="6">
                        <h5 class="text-17 mb-sm-8 mb-6  text-white">About</h5>
                        <div class="d-flex flex-column ga-4">
                            <div v-for="item in FooterMenu2" :key="item.menu">
                                <RouterLink
                                    :to="item.link"
                                    target="_blank"
                                    class="text-white text-14 opacity-80 font-weight-regular hover-primary text-decoration-none"
                                >
                                    {{ item.menu }}
                                </RouterLink>
                            </div>
                        </div>
                    </v-col>
                    <v-col cols="12" lg="3" sm="6">
                        <h5 class="text-17 mb-sm-8 mb-6  text-white">Links</h5>
                        <div class="d-flex flex-column ga-4">
                            <div v-for="item in FooterMenu3" :key="item.menu">
                                <RouterLink
                                    :to="item.link"
                                    target="_blank"
                                    class="text-white text-14 opacity-80 font-weight-regular hover-primary text-decoration-none"
                                >
                                    {{ item.menu }}
                                </RouterLink>
                            </div>
                        </div>
                    </v-col>
                    <v-col cols="12" lg="3" sm="6">
                        <h5 class="text-17 mb-sm-8 mb-6  text-white">Help</h5>
                            <div class="d-flex flex-column ga-4">
                            <div v-for="item in FooterMenu4" :key="item.menu">
                                <RouterLink
                                    :to="item.link"
                                    target="_blank"
                                    class="text-white text-14 opacity-80 font-weight-regular hover-primary text-decoration-none"
                                >
                                    {{ item.menu }}
                                </RouterLink>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </div>
            <v-divider class="opacity-30"></v-divider>
            <div class="py-sm-10 py-6">
                <div class="d-sm-flex justify-space-between">
                    <div class="d-flex ga-2  justify-sm-start justify-center">
                        <LogoIcon/>
                        <span class="
                        text-white text-15 opacity-80">All rights reserved by ITWatts.</span>   
                    </div>
                    <p class="text-white text-15  d-flex align-center justify-sm-end justify-center pt-sm-0 pt-2">
                        <span class="opacity-50">Produced by</span>
                        <a

                            href="https://dappsolution.com/"
                            target="_blank"
                            class="text-white text-decoration-none hover-primary text-15 ms-1"
                        >
                        Dapp Solution.</a
                        >
                    </p>
                </div>
            </div>
        </v-container>
    </div>
</template>
