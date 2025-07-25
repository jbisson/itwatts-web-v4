<script setup lang="ts">
import { ref } from 'vue';
import discord from '@/assets/images/itwatts/companies/discord_grayscale.png';
import fera from '@/assets/images/itwatts/companies/fera_grayscale.png';
import garmin from '@/assets/images/itwatts/companies/garmin_grayscale.png';
import mywhoosh from '@/assets/images/itwatts/companies/mywhoosh_grayscale.png';
import strava from '@/assets/images/itwatts/companies/strava_grayscale.png';
import zwift from '@/assets/images/itwatts/companies/zwift_grayscale.png';
import zwift_power from '@/assets/images/itwatts/companies/zwift_power_grayscale.png';

import comp1 from '@/assets/images/front-pages/componies/intel.svg';
import comp2 from '@/assets/images/front-pages/componies/oracle.svg';
import comp3 from '@/assets/images/front-pages/componies/dell.svg';
import comp4 from '@/assets/images/front-pages/componies/samsung.svg';
import comp5 from '@/assets/images/front-pages/componies/infosys.svg';
import comp6 from '@/assets/images/front-pages/componies/capgemini.svg';
const companies = [
    {
        img: strava
    },
    {
        img: fera
    },
    {
        img: zwift
    },
    {
        img: mywhoosh
    },
    {
        img: garmin
    },
    {
        img: discord
    },
];
</script>
<template>
    <div class="bg-surface">
        <v-container class="max-width-1218 py-0">
            <div class="d-flex flex-wrap justify-md-space-between justify-center align-center gap-4 pt-lg-14 pt-7  border-t">
                <div v-for="item in companies" :key="item.img">
                    <img :src="item.img" alt="company" height="25" />
                </div>
            </div>
        </v-container>
    </div>
</template>
