<script setup lang="ts">
//import LogoIcon from '@/assets/images/logos/logoicon.svg';
import LogoIcon from '@/assets/images/itwatts/logos/itwatts_bike only_square.png';
import MadeInCanadaIcon from '@/assets/images/itwatts/logos/made_in_canada.png';

</script>

<template>
    <div class="bg-primary space-p-96 template position-relative overflow-hidden">
        <img src="@/assets/images/front-pages/background/left-widget.png" alt="widget" class="left-widget d-xl-block d-none" />
        <v-container class="max-width-1000">
            <div class="d-flex justify-center">                
                <div class="round-100 d-flex justify-center align-center rounded-md bg-white elevation-4 lh-normal mr-10">
                    <img :src=LogoIcon alt="Logo" width="70" />
                </div>
                <img :src=MadeInCanadaIcon alt="Logo" width="80" />
            </div>
            <h3 class="display-1 font-weight-semibold text-center py-6">Precision Data-Driven Cycling for Athletes Who Ride with Integrity.</h3>
            <div class="max-w-600 mx-auto">
                <p class="text-18 text-center">
                    Whether you're riding on real roads or virtual routes, your power speaks the same truth.
                </p>
            </div>
            <div class="d-flex justify-center">
                <v-btn
                    class="mt-6 px-10 m-btn-full"
                    variant="outlined"
                    target="_blank"
                    href="/auth/register"
                    color="white"
                    size="large"
                    flat
                    >Join now</v-btn
                >
            </div>
        </v-container>
        <img src="@/assets/images/front-pages/background/right-widget.png" alt="widget" class="right-widget d-xl-block d-none" />
    </div>
</template>
