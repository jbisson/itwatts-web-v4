<script setup lang="ts">
import Packages from '@/components/itwatts/front-pages/Packages.vue';
import PurchaseTemplate from '@/components/itwatts/front-pages/PurchaseTemplate.vue';
import TextBannerCard from '@/components/itwatts/front-pages/TextBannerCard.vue';
import SecurePayment from '@/components/itwatts/front-pages/SecurePayment.vue';

import DefaultLayout from '@/views/itwatts/front-pages/Layout.vue';
</script>

<template>
    <DefaultLayout>
        <TextBannerCard title="Choose Your Package" caption="Packages Page" />
        <Packages />
        <div class="sm:pb-14 pb-8">
            <SecurePayment />
        </div>
        <PurchaseTemplate />
    </DefaultLayout>
</template>
