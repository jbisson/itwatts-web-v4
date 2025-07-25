<script setup>
import { computed } from 'vue';
import ItWattsLogoLight from './ItWattsLogoLight.vue';
import { useCustomizerStore } from '@/stores/customizer';

const customizer = useCustomizerStore();
</script>
<template>
    <ItWattsLogoLight/>
</template>
