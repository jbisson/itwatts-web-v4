<script setup lang="ts">
import { ref,onMounted } from 'vue';
import visa from '@/assets/images/front-pages/payments/visa.svg';
import master from '@/assets/images/front-pages/payments/master.svg';
import ae from '@/assets/images/front-pages/payments/american-exp.svg';
import discover from '@/assets/images/front-pages/payments/discover.svg';
import paypalImg from '@/assets/images/front-pages/payments/paypal.svg';
import maestro from '@/assets/images/front-pages/payments/maesro.svg';
import jcb from '@/assets/images/front-pages/payments/jcb.svg';
import dinner from '@/assets/images/front-pages/payments/dinners-clb.svg';
const icons = ref([
    {
        img: visa
    },
    {
        img: master
    },
    {
        img: ae
    },
    {
        img: paypalImg
    },
]);

onMounted(() => {
  /*console.log(paypal);
  paypal.Buttons({
      style: {
          shape: 'pill',
          color: 'blue',
          layout: 'vertical',
          label: 'paypal'
      },
      createSubscription: function(data, actions) {
        return actions.subscription.create({
          /* Creates the subscription */
          /*plan_id: 'P-2WV8523921567771HNBQAG4Y'
        });
      },
      onApprove: function(data, actions) {
        alert(data.subscriptionID); // You can add optional success message for the subscriber here
      }
  }).render('#paypal-button-container-P-2WV8523921567771HNBQAG4Y'); // Renders the PayPal button*/
})


</script>
<template>
    <v-container class="max-width-1218 pt-12">
        <h6 class="text-16 text-muted text-center pb-8 font-weight-medium">Secured payment with PayPal</h6>
        <div class="d-flex flex-wrap align-center ga-sm-12 ga-6 justify-center">
            <div v-for="item in icons" :key="item.img">
                <img :src="item.img" alt="icon" />
            </div>
        </div>
<div id="paypal-button-container-P-2WV8523921567771HNBQAG4Y"></div>
    </v-container>
</template>
