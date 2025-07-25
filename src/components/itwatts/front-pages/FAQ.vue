<script setup lang="ts">
//import { FAQData } from '@/_mockApis/front-pages/PagesData';
import type { LeaderType, TemplateType, ThemeFeatures, PackageType, FooterType, Feature } from '@/types/components/front-pages/index';

const FAQData: TemplateType[] = [
    {
        title: 'What is included with my purchase?',
        subtitle:
            'Tailor the dashboard to your exact needs. Customize layouts, color schemes, and widgets effortlessly for a personalized user experience.'
    },
    {
        title: 'Are there any recurring fees?',
        subtitle:
            ' Unlock the true potential of your data with our advanced analytics tools. Gain valuable insights and make data-driven decisions with ease.'
    },
    {
        title: 'Can I use the template on multiple projects?',
        subtitle:
            'Visualize complex data sets beautifully with our interactive graphs and charts. Quickly grasp trends and patterns for smarter analysis.'
    },
    {
        title: 'Can I customize the admin dashboard template to match my brand?',
        subtitle:
            'Visualize complex data sets beautifully with our interactive graphs and charts. Quickly grasp trends and patterns for smarter analysis.'
    },
    {
        title: 'Are there any restrictions on using the template?',
        subtitle:
            'Visualize complex data sets beautifully with our interactive graphs and charts. Quickly grasp trends and patterns for smarter analysis.'
    },
    {
        title: 'How can I get support after purchase?',
        subtitle:
            'Visualize complex data sets beautifully with our interactive graphs and charts. Quickly grasp trends and patterns for smarter analysis.'
    }
];

</script>
<template>
    <div class="space-p-96 lp-faq">
        <v-container class="max-width-800 py-0">
            <div class="text-center mb-8">
                <h3 class="display-2 font-weight-semibold textPrimary">Frequently asked questions</h3>
            </div>
            <v-expansion-panels elevation="0" class="mt-14 d-flex flex-column ga-4">
                <v-expansion-panel elevation="0" class="border" v-for="item in FAQData" :key="item.title">
                    <v-expansion-panel-title collapse-icon="mdi-minus" expand-icon="mdi-plus" class="text-18 font-weight-medium textPrimary py-5">{{
                        item.title
                    }}</v-expansion-panel-title>

                    <v-expansion-panel-text class="text-16 text-textPrimary opacity-80">
                        {{ item.subtitle }}
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
            <div class="d-flex justify-center mt-14">
                <div class="pa-2  border border-dashed rounded-md font-weight-medium text-14  text-textPrimary opacity-80 font-weight-medium d-flex align-center">
                    Still have a question? Send me a message directly on
                    <a
                        
                        href="https://discord.com/users/577332327622115349"
                        target="_blank"
                        class="text-underline text-textPrimary opacity-80 hover-primary underline-btn mx-1"
                        > discord!</a
                    >
                </div>
            </div>
        </v-container>
    </div>
</template>
