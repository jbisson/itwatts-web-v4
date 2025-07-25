<script setup lang="ts"></script>
<template>
   <div class="bg-primary py-4 px-4">
    <div class="ga-4 d-sm-flex justify-center align-center">
        <div class="d-flex align-center justify-sm-start justify-center">
            <img src="@/assets/images/profile/user-1.jpg" height="40" class="rounded-circle opacity-50" alt="user">
            <img src="@/assets/images/profile/user-2.jpg" height="44" class="rounded-circle ms-n3" alt="user">
           
        </div>
        <p class="text-16 font-weight-regular text-left text-center py-sm-0 py-2">Is there something you or your team would like that we don’t currently offer? We’re open to hearing from you and discussing it.</p>
        <RouterLink to="/contact-us" class="text-16 text-white font-weight-semibold underline-link d-flex justify-sm-start justify-center">Contact us now</RouterLink>
    </div>
   </div> 
</template>