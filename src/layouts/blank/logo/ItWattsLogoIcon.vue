<script setup lang="ts">
import { RouterLink } from 'vue-router';
import ITWattsBike from '@/assets/images/itwatts/logos/itwatts_bike_only_white.svg';
import ITWattsLogo from '@/assets/images/itwatts/logos/itwatts_only_dark.svg';

</script>
<template>
    <div class="logo">
        <RouterLink to="/home">          
          <img :src="ITWattsBike" alt="home" height="20" class="me-3"/>
        </RouterLink>
    </div>
</template>
