<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";
import ITWattsBike from '@/assets/images/itwatts/logos/itwatts_bike_only_white.svg';
import ITWattsLogo from '@/assets/images/itwatts/logos/itwatts_only_white.svg';

</script>
<template>
    <div class="px-2 d-flex align-center">
      <RouterLink to="/">
          <img :src="ITWattsBike" alt="home" height="20" class="me-3"/>
          <img :src="ITWattsLogo" alt="home" height="20"/>
      </RouterLink>      
    </div>

    <!--
    <div class="d-sm-flex d-none align-center" v-if="useRoute().path.includes('swat') && false">
      <RouterLink to="/itwatts/team/swat/itt/info">
        <img src="@/assets/images/itwatts/itt/chronos_itt_watts_logo.png" height="50" />&nbsp;
      </RouterLink>      
    </div>

    <div class="px-4 d-sm-flex d-none align-center">
      <RouterLink to="/itwatts/gcqc/info">
        <img src="@/assets/images/itwatts/gcqc/logo.png" height="40" />        
      </RouterLink>      
    </div>
    <div class="d-sm-flex d-none align-center">
      <RouterLink to="/itwatts/atomas/info">
        <img src="@/assets/images/itwatts/atomas/logo.png" height="50" />
      </RouterLink>      
    </div>
    
    <div class="d-sm-flex d-none align-center" v-if="useRoute().path.includes('swat') && false">
      <img src='@/assets/images/itwatts/swat/logo 5.w.4.t gear with text - black.png' height="50"/>
    </div>    -->
  </template>
