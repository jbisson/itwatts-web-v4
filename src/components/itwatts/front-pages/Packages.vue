<script setup lang="ts">
import { ref } from 'vue';
//import { Packages } from '@/_mockApis/front-pages/PagesData';
import { CircleCheckIcon, CircleXIcon } from 'vue-tabler-icons';

import type { PackageType } from '@/types/itwatts/components/index';

const packageType = ref('individual');

const IndividualPackages: PackageType[] = [
      {
        tagtext: false,
        caption: 'Solo Core',
        subtext: 'Use for single end product which end users can be charged for.',
        price: 0,
        period: '',
        buttontext: 'Get it now',
        url: '/',
        disable: false,
        list: [
            {
                listtitle: '<b>6 months</b> of performance data',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Virtual & IRL data analysis',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Strava segment hunter',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Garmin StriveKOM App',
                status: true,
                icon: true,
                disable: false
            },
            {
                listtitle: '',
                status: false,
                icon: true,
                disable: false
            }
        ]
    },
    {
        tagtext: true,
        caption: 'Solo Pro',
        subtext: 'Use in unlimited end products end users can be charged for.',
        price: 0,
        period: 'CAD /year',
        buttontext: 'Subscribe Now',
        disable: false,
        url: '/',
        list: [
            {
                listtitle: '<b>12 months</b> of performance data',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Virtual & IRL data analysis',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Strava segment hunter',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Garmin <b>StriveKOM</b> App',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: '',
                status: false,
                icon: true,
                disable: false
            }
        ]
    },
    {
        tagtext: false,
        caption: 'Solo Ultimate',
        subtext: 'Use in unlimited end products end users can be charged for.',
        price: 0, //50
        period: 'CAD /year',
        buttontext: 'Subscribe Now',
        disable: false,
        url: '/',
        list: [
            {
                listtitle: '<b>Lifetime history</b> performance data',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Virtual & IRL data analysis',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Strava segment hunter',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Garmin <b>StriveKOM</b> App',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Access to BETA features',
                status: false,
                icon: true,
                disable: false
            }
        ]
    }
]
const Packages: PackageType[] = [
    {
        tagtext: false,
        caption: 'Team Virtual',
        subtext: 'Use for single end product which end users can’t be charged for.',
        price: 0,
        period: '',
        buttontext: 'Get it now',
        disable: false,
        url: '/',
        list: [
            {
                listtitle: '<b>Fair E-Racing Alliance <br>Mission</b> access program',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: '<b>6 months</b> of performance data',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Virtual & IRL data analysis',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Strava segment hunter',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Discord integration',
                status: true,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Garmin StriveKOM App',
                status: true,
                icon: true,
                disable: false
            },            
        ]
    },

    {
        tagtext: false,
        caption: 'Team Virtual Pro',
        subtext: 'Use for unlimited end products end users can’t be charged for.',
        price: 0, // 1000
        period: 'CAD /year',
        buttontext: 'Subscribe Now',
        disable: false,
        url: '/',
        list: [
            {
                listtitle: '<b>Fair E-Racing Alliance <br>Mission</b> access program',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: '<b>3 years</b> of performance data',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Virtual & IRL data analysis',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Strava segment hunter',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Discord integration',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Garmin StriveKOM App',
                status: true,
                icon: true,
                disable: false
            },            
        ]
    },
    {
        tagtext: false,
        caption: 'Team IRL',
        subtext: 'Use for unlimited end products end users can’t be charged for.',
        price: 0, // 100
        period: 'CAD /year',
        buttontext: 'Subscribe Now',
        disable: false,
        url: '/',
        list: [
            {
                listtitle: '',
                status: false,
                icon: true,
                disable: false
            },            
            {
                listtitle: '<b>12 months</b> of performance data',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Virtual & IRL data analysis',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Strava segment hunter',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Discord integration',
                status: true,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Garmin StriveKOM App',
                status: false,
                icon: true,
                disable: false
            },
        ]
    },
    {
      tagtext: false,
      caption: 'Team Ultimate',
      subtext: 'Use for unlimited end products end users can’t be charged for.',
      price: 0,// 250
      period: 'CAD /year',
      buttontext: 'Subscribe Now',
      disable: false,
      url: '/',
      list: [
            {
                listtitle: '<b>Fair E-Racing Alliance <br>Mission</b> access program',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: '<b>Lifetime history</b> performance <br>data',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Virtual & IRL data analysis',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Strava segment hunter',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Discord integration',
                status: false,
                icon: true,
                disable: false
            },
            {
                listtitle: 'Garmin StriveKOM App',
                status: false,
                icon: true,
                disable: false
            },  
        ]
    },
];

</script>


<template>
    <div class="pt-96 bg-surface">
        <v-container class="max-width-1218 package py-0" id="pricing">
            <div class="pb-12 text-center">
               
                    <h2 class="display-1 font-weight-semibold textPrimary">Our Thanks to You: Free for Early Supporters</h2>
                    <p class="text-textPrimary opacity-80 pt-4 text-17 lh-32">From solo riders to pro teams — there's a tier built for every type of cyclist.</p>
               
            </div>
            <v-row>
                <v-col cols="12">
                  <v-radio-group v-model="packageType" inline class="d-flex justify-center text-h3">
                    <v-radio value="individual" color="primary">
                      <template v-slot:label><div class="font-weight-medium mr-9">Individual Rider</div></template>
                    </v-radio>
                    <v-radio value="team" color="primary">
                      <template v-slot:label><div class="font-weight-medium">Team</div></template>
                    </v-radio>
                    </v-radio-group>
                </v-col>
            </v-row>
            <v-row class="d-flex justify-center">
                <v-col cols="12" lg="3" sm="6" v-for="card in packageType == 'individual' ? IndividualPackages : Packages" :key="card.caption">
                    <v-card elevation="0" class="rounded-16 pa-6 border">
                        <div class="pb-4">
                            <div class="d-flex ga-2 align-center">
                                <h4 class="text-20 font-weight-semibold textPrimary mb-4" v-text="card.caption"></h4>
                                <v-chip v-if="card.tagtext" size="small" class="mt-sm-n4 font-weight-bold" rounded="md" color="primary"
                                    >Recommended</v-chip
                                >
                            </div>
                            <p class="text-14 text-textPrimary opacity-80 ">{{ card.subtext }}</p>
                        </div>


                        <div class="d-flex align-center mt-3">
                            <h2 class="display-2 text-primary font-weight-semibold">${{ card.price }}</h2>
                            <span class="text-textPrimary opacity-80 mt-4 ms-2 text-16">{{ card.period }}</span>
                        </div>
                        <v-list class="mb-0 pl-0 bg-transparent pt-5">
                            <v-list-item class="pa-0" v-for="desc in card.list" :key="desc.listtitle">
                                <v-list-item-title
                                    v-if="desc.status"
                                    :class="{ 'opacity-80': desc.disable }"
                                    class="text-14 d-flex align-center font-weight-medium text-break"
                                >
                                    <CircleXIcon v-if="desc.icon" stroke-width="1.5" size="20" class="mr-2 text-error " />
                                    <span v-html="desc.listtitle"></span>
                                </v-list-item-title>
                                <v-list-item-title
                                    v-else-if="desc.listtitle"
                                    :class="{ 'opacity-50': desc.disable }"
                                    class="text-14 d-flex align-center font-weight-medium text-break"
                                >
                                    <CircleCheckIcon v-if="desc.icon" stroke-width="1.5" size="20" class="mr-2 text-primary" />
                                    <span v-html="desc.listtitle"></span>
                                </v-list-item-title>
                            </v-list-item>
                        </v-list>
                        <v-btn color="primary" size="large" class="mt-4 font-weight-medium"  href="card.url" target="_blank" flat block :disabled="card.disable">{{
                            card.buttontext
                        }}</v-btn>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
