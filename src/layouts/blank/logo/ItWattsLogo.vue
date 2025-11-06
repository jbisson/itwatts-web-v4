<script setup lang="ts">
import { RouterLink } from 'vue-router';
import ITWattsBike from '@/assets/images/itwatts/logos/itwatts_bike_only_dark.svg';
import ITWattsLogo from '@/assets/images/itwatts/logos/itwatts_only_dark.svg';
import ItWattsBikeLogo from '@/assets/images/itwatts/logos/Itwatts_bike_only_white.svg';

</script>
<template>
    <div class="logo">
        <RouterLink to="/">          
          <img :src="ITWattsBike" alt="home" height="20" class="me-3"/>
          <img :src="ITWattsLogo" alt="home" height="20"/>
        </RouterLink>
    </div>
</template>
