<script setup lang="ts">
import leader1 from '@/assets/images/itwatts/logos/fera.png';
import type { LeaderType, TemplateType, ThemeFeatures, PackageType, FooterType, Feature } from '@/types/components/front-pages/index';

</script>

<template>
    <div class="bg-background py-lg-14 py-7">
        <v-container class="max-width-1218">
            <v-row class="d-flex">
                <v-col cols="12" lg="7" class="text-align-start">
                    <h1 class="text-50 textPrimary font-weight-regular">
                        <span class="font-weight-semibold">What is FERA?</span>
                    </h1>
                    <div class="d-sm-flex d-block gap-4 justify-md-start justify-center align-center mt-6">
                    </div>
                    <v-col cols="12" md="8" sm="8">
                    <div class="position-relative rounded-16 team">
                        <img :src="leader1" alt="fera" class="w-100" />
                    </div>
                    </v-col>
                </v-col>
                <v-col cols="12" lg="5" >
                    <p class="text-16 text-textPrimary opacity-80 lh-32  pt-3 text-align-start">
                    <b><a href="https://www.f-e-r-a.org/" target="blank">FERA</a></b> (Fair E-Racing Alliance Mission) is an alliance of community cycling teams dedicated to fair racing on Zwift. The alliance was founded at the end of the year 2022 and intends to develop basic tools that enable participating teams and their leaders to recognize anomalies in data amongst their own riders and determine whether faulty equipment or disingenuous behavior is the cause.
                      
                    </p>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
