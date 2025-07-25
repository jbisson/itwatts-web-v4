<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch, computed } from "vue";
import { useUserProfile } from '@/stores/user-profile';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';

import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter } from 'vue-router';

import config from "@/config/config.json";
import security from "@/security";
import { exportUser } from '@/utils/export';
import user1 from '@/assets/images/profile/user-1.jpg';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('adminSwatMembers.pageTitle') });

const usersResult = reactive([] as any);
const members = reactive([] as any);
const usersExport = ref('');
const loading = ref(false);

const searchValue = ref();

const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();

const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('adminSwatMembers.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('adminSwatMembers.pageTitle'),
    disabled: true,
  },
]);

const userStoreProfile = useUserProfile();

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ADMIN', 'SWAT_MEMBER_2024_2025'];
  if (!security.isTokenValid(rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
  }
  
  interface ResponseData {
    data: any,
  }

  loading.value = true;
  errorAlert.value = '';
  usersResult.value = [];
  members.value = [];

  try {
    const profileImagesResponse = await axios.get<ResponseData>(`${config.serverApi.publicHostname}/v1/images?name=profile&sortBy=first_name,last_name`,
    {
      withCredentials: true
    });
    const profileImagesUsers = new Map(profileImagesResponse.data.data.map(i => [i.user_id, `/user-image/${i.file_name}`]));

    const response = await axios.get<ResponseData>(`${config.serverApi.publicHostname}/v1/users?groups=swat_2024_2025&sortBy=first_name,last_name`,
    {
      withCredentials: true
    });
    
    for (const user of response.data.data) {
      if (!profileImagesUsers.has(user.id)) {
        continue;
      }
      //user.name = `${user.first_name} ${user.last_name}`;
      user.name = `${user.first_name}`;
      members.value.push(
      {
          id: '#1Followers_Barney',
          avatar: profileImagesUsers.get(user.id),
          name: `${user.name}`,
          location: user.region,
          follow: 1
      });
    }
  } catch (err: any) {
    errorAlert.value = `Une erreur est survenue...Detail: ${err}`;
    console.log(`an error occured: ${err} stack: ${err.stack}`);
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
  } finally {
    loading.value = false;
  }  
}

watch(() => [], refresh);
refresh();

</script>
<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
    <v-row>
      <v-col cols="12">
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="info"
          title="Succès"
          :text="infoAlert"
          v-if="infoAlert"
        ></v-alert>
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="error"
          title="Erreur"
          :text="errorAlert"
          v-if="errorAlert"
        ></v-alert>
        <v-alert
          style="white-space: pre-line;"
          density="compact"
          type="warning"
          title="Attention"
          :text="warningAlert"
          v-if="warningAlert"
        ></v-alert><br>
      </v-col>      
    </v-row>
    <v-col cols="12" sm="12" lg="12">
      <div class="d-flex align-center mb-4">
            <h2 class="text-h5">{{ $t('adminSwatMembers.pageTitle') }}</h2>
            <!--<p style="font-family: NFLpackers;">Ceci est un test</p>
            <p style="font-family: ZwiftSprint;">Ceci est un test</p>
            <p style="font-family: FreestyleScript;">Ceci est un test</p>-->
          </div>
          <div class="align-center">
            <v-progress-linear v-if="loading"
              indeterminate
              stream
              color="primary"
            ></v-progress-linear>
          </div>
          <p class="container">
            <p>
              <br><br><br><br><br><br><br><br><br>
          <v-row style="margin: 0px">            
                <v-col cols="12" md="4" sm="6" v-for="(card, i) in members.value" :key="i">                  
                    <v-card flat style="background-color: white;">
                        <v-card-text class="text-center" >
                            <div class="align-center" >
                              <p style="font-family: NFLpackers;color: #000000;letter-spacing: 3px;font-size:4rem;">{{ card.name }}</p>
                              <br><br>
                              <img :src="card.avatar" :alt="card.avatar" width="250" />                                
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
          </p>
          </p>
    </v-col>    
  </v-row>
</template>

<style lang="scss">
.container {
    background: url('@/assets/images/itwatts/blue-bg.png');
}


</style>