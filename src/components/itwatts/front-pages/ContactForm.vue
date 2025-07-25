<script setup lang="ts">
import { ref } from 'vue';
const select = ref('General Enquiry');
const items = ref(['General Enquiry', 'option 2', 'option 3', 'option 4']);

const firstName = ref();
const lastName = ref();
const email = ref();
const message = ref();

function sendEmail() {
  return `mailto:info@itwatts.com?subject=${encodeURIComponent('ITWatts question')}&body=${encodeURIComponent(`FROM: ${firstName.value} ${lastName.value}\n\n${message.value}`)}`;
}
</script>
<template>
    <div class="pt-3 bg-background pb-14">
        <v-container class="max-width-1218">
            <v-row>
                <v-col cols="12" lg="4">
                    <div class="bg-primary rounded-lg pa-7 position-relative overflow-hidden mt-md-0 mt-6 position-relative">
                        <img src="@/assets/images/front-pages/background/contact-icon.png" class="position-absolute end-0 top-0 rtlImg" />
                        <h4 class="text-18 font-weight-bold mb-4">Want to reach me directly?</h4>
                        <p class="text-16 font-weight-regular position-relative z-1">Send me a message through <a
                        
                        href="https://discord.com/users/577332327622115349"
                        target="_blank"
                        class="text-underline text-white opacity-80 hover-white underline-btn mx-1"
                        >discord.</a>
                        </p>
                    </div>
                </v-col>
                <v-col cols="12" lg="8">
                    <v-card elevation="10">
                        <v-card-item>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-label class="mb-2 font-weight-medium">First Name *</v-label>
                                    <v-text-field v-model="firstName" hide-details variant="outlined" placeholder="Name" color="primary"></v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-label class="mb-2 font-weight-medium">Last Name *</v-label>
                                    <v-text-field v-model="lastName" hide-details variant="outlined" placeholder="Last Name" color="primary"></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-label class="mb-2 font-weight-medium">Message</v-label>
                                    <v-textarea v-model="message" label="Write your message here..." variant="outlined" hide-details></v-textarea>
                                </v-col>
                                <v-col cols="12" class="text-md-end">
                                    <v-btn color="primary" class="px-5 " size="large" flat :href="sendEmail()" target="_blank">Send Message</v-btn>
                                </v-col>
                            </v-row>
                        </v-card-item>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
