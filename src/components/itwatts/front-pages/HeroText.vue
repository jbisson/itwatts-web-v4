<script setup lang="ts">
import leader1 from '@/assets/images/front-pages/leaders/leader1.png';
import type { LeaderType, TemplateType, ThemeFeatures, PackageType, FooterType, Feature } from '@/types/components/front-pages/index';

const OurLeaders: LeaderType[] = [
    {
        img: leader1,
        name: 'Jonathan Bisson',
        position: 'Founder'
    },
];

</script>

<template>
    <div class="bg-background py-lg-14 py-7">
        <v-container class="max-width-1218">
            <v-row class="d-flex">
                <v-col cols="12" lg="7" class="text-align-start">
                    <h1 class="text-50 textPrimary font-weight-regular">
                        <span class="font-weight-semibold">Get to know Jonathan</span> Founder of ITWatts
                    </h1>
                    <div class="d-sm-flex d-block gap-4 justify-md-start justify-center align-center mt-6">
                    </div>
                    <v-col cols="12" md="8" sm="8">
                    <div class="position-relative rounded-16 team">
                        <img :src="OurLeaders[0].img" alt="leader" class="w-100" />
                        <div class="bg-surface position-absolute py-4 px-3 text-center rounded-md intro">
                            <h5 class="text-h5 textPrimary">{{ OurLeaders[0].name }}</h5>
                            <p class="text-14 text-textSecondary opacity-80">{{ OurLeaders[0].position }}</p>
                        </div>
                    </div>
                    </v-col>
                </v-col>
                <v-col cols="12" lg="5" >
                    <p class="text-16 text-textPrimary opacity-80 lh-32  pt-3 text-align-start">
                    <b>Jonathan</b> is a Canadian and has always lived an active lifestyle — from playing hockey to competitive bodybuilding. During the pandemic, he discovered virtual cycling and quickly began taking it more seriously. As a data enthusiast, he was fascinated by the sheer volume of performance metrics available and soon found himself diving deep into analyzing every detail.
                      Jonathan joined a local "In-Real-Life" cycling team in his region, Les Rouleurs Polo-Vélo, and in 2024, he co-founded a new virtual team, 5.W.4.T, with his good friend Hugues Joannis.

Through his own journey as an athlete, Jonathan noticed a few key challenges:<br><br>

1. <b>Power accuracy</b> remains a common issue, both in indoor and outdoor cycling — especially in the virtual world.<br>
2. <b>Access to reliable performance data</b> was crucial in helping him improve his own fitness and training.<br>
3. There was a noticeable lack of <b>tools to support team managers</b> and race organizers in managing teams and events effectively.<br><br>

These insights led to the creation of <b>ITWatts</b> — a platform built from passion, driven by engineering. Jonathan’s values are rooted in <b>integrity</b>, and his mission is to support athletes, team managers, and race organizers with meaningful, data-driven tools that make a real difference.
                      
                    </p>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
