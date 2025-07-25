<script setup lang="ts">
import AnnounceBar from '@/components/itwatts/front-pages/AnnounceBar.vue';
import Footer from '@/components/itwatts/front-pages/Footer.vue';
import Header from '@/components/itwatts/front-pages/Header.vue';

</script>
<template>
    <div class="front-wraper bg-surface">
      <AnnounceBar/>  
      <Header />
      <main>
        <slot></slot> <!-- This slot will be replaced with page-specific content -->
      </main>
      <Footer />
    </div>
  </template>