<script setup lang="ts">
import { ref, watch, reactive, onUpdated } from 'vue';

import { useRegionStore } from '@/stores/apps/regions';
import { useClubStore } from '@/stores/apps/clubs';
import { BrandStravaIcon } from 'vue-tabler-icons';
const props = defineProps({ user: Object });
const region = ref();
const club = ref();
const country = ref();
const state = ref();
const city = ref();

async function refresh() {
}

onUpdated(() => {
  region.value = useRegionStore().regionsMap.get(props.user?.region);
  club.value = useClubStore().clubsMap.get(props.user?.irl_team);
  country.value = props.user?.country;
  state.value = props.user?.state;
  city.value = props.user?.city;
});

watch(() => [], refresh);
refresh();

</script>
<template>
  <v-row>
    <v-col>
      <v-card elevation="10">
        <v-card-item>
          <h4 class="text-h4">Introduction</h4>
          <p class="my-5 text-subtitle-1 lh-md">              
          </p>          
          <div class="d-flex gap-3 mb-5" v-if="city">
            <MapPinIcon size="21" />
            <a class="text-decoration-none text-primary" :href="'https://www.google.com/maps/place/' + city + ' ' + state" target="_blank"><span class="text-h6" v-text="country + ' - ' + state + ', ' + city"></span></a>
          </div>
          <div class="d-flex gap-3 mb-5" v-if="club">
            <UsersGroupIcon size="21" />
            <a class="text-decoration-none" :href="club.social_link" target="_blank"><span class="text-h6" v-text="club.displayName"></span></a>
          </div>
          <div class="d-flex gap-3 mb-5" v-if="user?.strava_url">
            <BrandStravaIcon size="21" />
            <a class="text-decoration-none brand-strava" :href="user?.strava_url" target="_blank"><span class="text-h6" v-text="'Strava'"></span></a>
          </div>
          <div class="d-flex gap-3 mb-5" v-if="user?.discord_id">
            <BrandDiscordIcon size="21" />
            <a class="text-decoration-none brand-discord" :href="'https://discordapp.com/users/' + user?.discord_id" target="_blank"><span class="text-h6" v-text="'Discord'"></span></a>
          </div>
          <div class="d-flex gap-3 mb-5" v-if="user?.zp_id">
            <BrandZwiftIcon size="21" />
            <a class="text-decoration-none brand-zwiftpower" :href="'https://zwiftpower.com/profile.php?z=' + user?.zp_id" target="_blank"><span class="text-h6" v-text="'ZwiftPower'"></span></a>
          </div>
          <div class="d-flex gap-3 mb-5" v-if="user?.zp_id">
            <v-avatar class="rounded-md bg-lightprimary text-primary" size="21">
              <img src="@/assets/images/itwatts/logos/zwiftracing.png" />
            </v-avatar>
            <a class="text-decoration-none brand-zwiftracing" :href="'https://www.zwiftracing.app/riders/' + user?.zp_id" target="_blank"><span class="text-h6" v-text="'ZwiftRacing'"></span></a>
          </div>
          <div class="d-flex gap-3 mb-5" v-if="user?.zwift_id">
            <BrandZwiftIcon size="21" />
            <a class="text-decoration-none brand-zwift" :href="'https://www.zwift.com/ca/athlete/' + user?.zwift_id" target="_blank"><span class="text-h6" v-text="'Zwift'"></span></a>
          </div>
          <div class="d-flex gap-3 mb-5" v-if="user?.twitch_username">
            <BrandTwitchIcon size="21" />
            <a class="text-decoration-none brand-twitch" :href="'https://www.twitch.tv/' + user?.twitch_username" target="_blank"><span class="text-h6" v-text="'Twitch'"></span></a>
          </div>
          <div class="d-flex gap-3 mb-5" v-if="user?.x_username">
            <v-avatar class="rounded-md bg-lightprimary text-primary" size="21">
              <img src="@/assets/images/itwatts/logos/brand-x.svg" height="21"/>
            </v-avatar>
            <a class="text-decoration-none brand-x" :href="'https://www.x.com/' + user?.x_username" target="_blank"><span class="text-h6" v-text="'X'"></span></a>
          </div>
          <div class="d-flex gap-3 mb-5" v-if="user?.ig_username">
            <BrandInstagramIcon size="21" />
            <a class="text-decoration-none brand-instagram" :href="'https://www.instagram.com/' + user?.ig_username" target="_blank"><span class="text-h6" v-text="'Instagram'"></span></a>
          </div>
          <div class="d-flex gap-3 mb-5" v-if="user?.youtube_username">
            <BrandYoutubeIcon size="21" />
            <a class="text-decoration-none brand-youtube" :href="'https://www.youtube.com/@' + user?.youtube_username" target="_blank"><span class="text-h6" v-text="'YouTube'"></span></a>
          </div>
          <div class="d-flex gap-3 mb-5" v-if="user?.fb_username">
            <BrandFacebookIcon size="21" />
            <a class="text-decoration-none brand-facebook" :href="parseInt(user?.fb_username) ? 'https://www.facebook.com/profile.php?id=' + user?.fb_username : 'https://www.facebook.com/' + user?.fb_username" target="_blank"><span class="text-h6" v-text="'Facebook'"></span></a>
          </div>
          <div class="d-flex gap-3 mb-5" v-if="user?.mywhoosh_id">            
            <v-avatar class="rounded-md bg-lightprimary text-primary" size="21">
              <img src="@/assets/images/itwatts/logos/mywhoosh_black.png" height="18"/>
            </v-avatar>
            <a class="text-decoration-none brand-mywhoosh" :href="'https://mywhooshinfo.com/riders/rider/' + user?.mywhoosh_id" target="_blank"><span class="text-h6" v-text="'MyWhoosh'"></span></a>
          </div>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>
</template>
