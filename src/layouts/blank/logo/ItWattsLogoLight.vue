<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Darklogo from '@/assets/images/itwatts/logos/Itwatts_only_white.svg';
import ItWattsBikeLogo from '@/assets/images/itwatts/logos/Itwatts_bike_only_white.svg';

</script>
<template>
    <div class="logo">
        <RouterLink to="/">          
          <img :src="Darklogo" alt="home" height="20"/>
        </RouterLink>
    </div>
</template>
