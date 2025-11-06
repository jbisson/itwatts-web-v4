<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { HeartIcon, PhotoIcon, UserCircleIcon, UsersIcon } from 'vue-tabler-icons';
import profileBg from '@/assets/images/backgrounds/profilebg.jpg';

import userM from '@/assets/images/profile/user-1.jpg';
import userF from '@/assets/images/profile/user-3.jpg';

import Profile from '@/components/itwatts/Profile.vue'
import { useUserProfile } from '@/stores/user-profile';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();

const { t, locale } = useI18n({ useScope: 'global' });

const tab = ref(null);

const items = shallowRef([
    { tab: 'Profile', icon: UserCircleIcon, href: '' },
    { tab: 'Strava', icon: HeartIcon, href: '' },
    { tab: 'ZwiftPower', icon: UsersIcon, href: '' },
    { tab: 'Zwift Racing App', icon: PhotoIcon, href: '' }
]);
const props = defineProps({
  user: Object });

const profileDialogVisible = ref(false);
const profileUrl = ref();
let profileDialog = {};

function editProfile() {
  //profileDialogVisible.value = true;
  router.push({ path: '/itwatts/account-settings' });
}

async function refresh() {
  if (props.user && props.user.profile_url) {
    profileUrl.value = props.user.profile_url;
  } else if (props.user) {
    profileUrl.value = props.user.gender === 'F' ? userF : userM;
  } else {
    profileUrl.value = userM;
  }
}

refresh();

watch(() => props.user ? props.user.profile_url : props.user, (newValue, oldValue) => {
  refresh();
});


</script>

<template>
  <v-card elevation="10" class="overflow-hidden">
    <img :src="user?.primary_team_banner_url || profileBg" alt="profile" class="w-100" />
    <div>
      <v-row class="mt-1">
        <v-col cols="12" lg="4" sm="12" class="order-sm-second">
          <div class="px-4 py-1"><!--
            <v-row class="justify-center">
              <v-col cols="4" class="text-center">
                <FileDescriptionIcon size="20" />
                <h4 class="text-h4">x</h4>
                <h6 class="text-h6 font-weight-regular">Courses</h6>
              </v-col>
              <v-col cols="4" class="text-center">
                <h4 class="text-h4"></h4>
                <h6 class="text-h6 font-weight-regular"></h6>
              </v-col>
              <v-col cols="4" class="text-center">
                <UserCheckIcon size="20" />
                <h4 class="text-h4">x</h4>
                <h6 class="text-h6 font-weight-regular">Activités</h6>
              </v-col>
            </v-row>-->
          </div>
        </v-col>
        <v-col cols="12" lg="4" sm="12" class="d-flex justify-center order-sml-first">
          <div class="text-center top-spacer">
            <div class="avatar-border">
              <v-avatar size="100" class="userImage">
                <!--<img :src="user?.strava_login.profile_url || UserImage" width="100" :alt="user?.first_name" />-->
                <img :src="profileUrl" width="100" :alt="user?.first_name" />
              </v-avatar>
            </div>
              <h5 class="text-h5 mt-3" v-text="user?.first_name + ' ' + user?.last_name"></h5>
              <span class="text-h6 font-weight-regular">{{ user?.primary_team ? user?.primary_team.display_name : '' }}</span>
          </div>
        </v-col>
        <v-col cols="12" lg="4" class="d-flex align-center justify-center justify-lg-end order-sm-third">
            <div class="d-flex align-center justify-space-between px-10 py-1 gap-3"><!--
                <v-btn icon variant="flat" size="x-small"  class="btn-brand-strava" v-if="user?.strava_url"
                  :href="user?.strava_url" target="_blank">
                  <BrandStravaIcon size="16"/>
                </v-btn>
                <v-btn icon variant="flat" size="x-small" class="btn-brand-zwiftpower" v-if="user?.zp_id"
                  :href="'https://zwiftpower.com/profile.php?z=' + user?.zp_id" target="_blank">
                  <BrandZwiftIcon size="16"/>
                </v-btn>
                <v-btn icon variant="flat" size="x-small" class="btn-brand-zwift" v-if="user?.zwift_id"
                  :href="'https://www.zwift.com/ca/athlete/' + user?.zwift_id" target="_blank">
                  <BrandZwiftIcon size="16"/>
                </v-btn>
                <v-btn icon variant="flat" size="x-small" class="btn-brand-discord" v-if="user?.discord_id"
                  :href="'https://discordapp.com/users/' + user?.discord_id" target="_blank">
                  <BrandDiscordIcon size="16"/>
                </v-btn>                      
                <v-btn icon variant="flat" size="x-small"  class="btn-brand-facebook" v-if="user?.fb_profile_url"
                  :href="user?.fb_profile_url" target="_blank"
                    ><BrandFacebookIcon size="16"
                /></v-btn>
                <v-btn icon variant="flat" size="x-small"  class="btn-brand-twitter" v-if="user?.x_username"
                  :href="user?.x_username" target="_blank"
                    ><BrandTwitterIcon size="16"
                /></v-btn>
                <v-btn icon variant="flat" size="x-small"  class="btn-brand-twitch" v-if="user?.twitch_username"
                  :href="user?.twitch_username" target="_blank"
                    ><BrandTwitchIcon size="16"
                /></v-btn>                      
                <v-btn icon variant="flat" size="x-small"  class="btn-brand-instagram" v-if="user?.ig_username"
                  :href="user?.ig_username" target="_blank"
                    ><BrandInstagramIcon size="16"
                /></v-btn>
                <v-btn icon variant="flat" size="x-small"  class="btn-brand-youtube" v-if="user?.youtube_username"
                  :href="user?.youtube_username" target="_blank"
                    ><BrandYoutubeIcon size="16"
                /></v-btn>    -->                                        
                <v-btn variant="flat" color="primary" @click="editProfile()" v-if="user?.id === useUserProfile().user_id">{{ t('profileBannerComponent.modifyMyProfile') }}</v-btn>
            </div>
        </v-col>
        <v-col md="12" class="order-sm-last">
          <v-tabs v-model="tab" color="primary" dark class="profiletab bg-grey100">
            <v-tab v-for="item in items" :key="item.tab" :to="item.href">
                <component :is="item.icon" size="18" stroke-width="1.5" class="mr-2"></component>
                {{ item.tab }}
            </v-tab>
          </v-tabs>
        </v-col>
      </v-row>
    </div>
  </v-card>
  <Profile :visible="profileDialogVisible" :user="user" @handledialog="profileDialogVisible = false" @onImageChange=""></Profile>
</template>
<style lang="scss">
.avatar-border {
    background-image: linear-gradient(rgb(80, 178, 252), rgb(244, 76, 102));
    border-radius: 50%;
    width: 110px;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    .userImage {
        border: 4px solid rgb(255, 255, 255);
    }
}

.top-spacer {
    margin-top: -95px;
}

.profiletab .v-slide-group__content {
    justify-content: end;
    .v-btn--variant-text .v-btn__overlay {
        background: transparent;
    }
}

@media (max-width: 1023px) {
    .order-sm-second {
        order: 2;
    }
    .order-sml-first {
        order: 1;
    }
    .order-sm-third {
        order: 3;
    }
    .order-sm-last {
        order: 4;
    }
}

.btn-brand-facebook {
    background-color: rgb(24, 119, 242) !important;
    color: rgb(var(--v-theme-surface)) ;
}
.btn-brand-x {
    background-color: rgb(0, 0, 0) !important;
    color: rgb(var(--v-theme-surface)) ;
}
.btn-brand-dribbble {
    background-color: rgb(234, 76, 137) !important;
    color: rgb(var(--v-theme-surface)) ;
}
.btn-brand-youtube {
    background-color: rgb(205, 32, 31) !important;
    color: rgb(var(--v-theme-surface)) ;
}
.btn-brand-discord {
    background-color: rgb(88, 101, 242) !important;
    color: rgb(var(--v-theme-surface)) ;
}
.btn-brand-twitch {
    background-color: rgb(145, 71, 255) !important;
    color: rgb(var(--v-theme-surface)) ;
}
.btn-brand-instagram {
    background-color: rgb(192, 48, 207) !important;
    color: rgb(var(--v-theme-surface)) ;
}
.btn-brand-zwift {
    background-color: rgb(251, 100, 24) !important;
    color: rgb(var(--v-theme-surface)) ;
}
.btn-brand-strava {
    background-color: rgb(252, 82, 0) !important;
    color: rgb(var(--v-theme-surface)) ;
}
.btn-brand-zwiftpower {
    background-color: rgb(2, 35, 78) !important;
    color: rgb(var(--v-theme-surface)) ;
}
.btn-brand-zwiftracing {
    background-color: rgb(33, 150, 243) !important;
    color: rgb(var(--v-theme-surface)) ;
}
.btn-brand-mywhoosh {
    background-color: rgb(250, 184, 29) !important;
    color: rgb(var(--v-theme-surface)) ;
}
.brand-youtube {
    color: rgb(205, 32, 31) !important;
}
.brand-discord {
    color: rgb(88, 101, 242) !important;    
}
.brand-twitch {
    color: rgb(145, 71, 255) !important;
}
.brand-instagram {
    color: rgb(192, 48, 207) !important;
}
.brand-zwift {
    color: rgb(251, 100, 24) !important;
}
.brand-strava {
    color: rgb(252, 82, 0) !important;
}
.brand-zwiftpower {
    color: rgb(2, 35, 78) !important;
}
.brand-zwiftracing {
    color: rgb(33, 150, 243) !important;
}
.brand-mywhoosh {
    color: rgb(250, 184, 29) !important;
}
.brand-x {
    color: rgb(0, 0, 0) !important;
}
</style>
