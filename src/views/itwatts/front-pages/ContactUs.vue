<script setup lang="ts">
import ContactForm from '@/components/itwatts/front-pages/ContactForm.vue';
//import ContactMap from '@/components/frontpages/ContactUs/ContactMap.vue';
import PurchaseTemplate from '@/components/itwatts/front-pages/PurchaseTemplate.vue';
import TextBannerCard from '@/components/itwatts/front-pages/TextBannerCard.vue';

import DefaultLayout from '@/views/itwatts/front-pages/Layout.vue';
</script>

<template>
    <DefaultLayout>
        <TextBannerCard title="We’d love to hear from you" caption="Contact Us" />
        <ContactMap/>
        <ContactForm/>
        <PurchaseTemplate />
    </DefaultLayout>
</template>
