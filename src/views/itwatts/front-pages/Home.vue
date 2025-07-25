<script setup lang="ts">

import PurchaseTemplate from '@/components/itwatts/front-pages/PurchaseTemplate.vue';
import DefaultLayout from '@/views/itwatts/front-pages/Layout.vue';

import Packages from '@/components/itwatts/front-pages/Packages.vue';
import ClientReviews from '@/components/itwatts/front-pages/ClientReviews.vue';
import Companies from '@/components/itwatts/front-pages/Companies.vue';
import SecurePayment from '@/components/itwatts/front-pages/SecurePayment.vue';
import Highlights from '@/components/itwatts/front-pages/Highlights.vue';
import FeatureTabs from '@/components/itwatts/front-pages/FeatureTabs.vue';
import FAQ from '@/components/itwatts/front-pages/FAQ.vue';
import ContactBar from '@/components/itwatts/front-pages/ContactBar.vue';

import Mainbanner from '@/components/frontpages/Homepage/Mainbanner.vue';
import OurClients from '@/components/frontpages/Homepage/OurClients.vue';


</script>

<template>
    <DefaultLayout>
        <FeatureTabs />
        <ContactBar/>
        <ClientReviews/>
        <Companies/>
        <Highlights/>
        <Packages/>
        <SecurePayment/>
        <FAQ/>
        <PurchaseTemplate/>
    </DefaultLayout>
</template>
