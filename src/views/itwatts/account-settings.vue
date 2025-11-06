<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch, onBeforeUpdate } from 'vue';
import axios from 'axios';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';
import { useUserProfile } from '@/stores/user-profile';
import Account from '@/components/itwatts/Account.vue';
import Preferences from '@/components/itwatts/Preferences.vue';
import VirtualPlatforms from '@/components/itwatts/VirtualPlatforms.vue';
import Connections from '@/components/itwatts/Connections.vue';
import Teams from '@/components/itwatts/Teams.vue';
import config from "@/config/config.json";
import { useRouter, useRoute } from 'vue-router';

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('accountSettings.pageTitle') });
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('accountSettings.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: `${useUserProfile().first_name} ${useUserProfile().last_name}`,
    disabled: true,
  },
]);
const tab = ref('account');
const profileDialogVisible = ref(true);
const user = ref({});
const errorAlert = ref();
const warningAlert = ref();
const infoAlert = ref();
const loading = ref();
const onWindowChanged = ref(0);

async function refresh() {
  try {
    loading.value = true;
    const userResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
    {
      withCredentials: true
    });      
    user.value = userResponse.data;
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      useUserProfile().login_post_back_page = router.currentRoute.value.path;
      router.push({ path: '/itwatts/signin' });
    }
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`an error occured: ${err} ${err.stack}`);
  } finally {
    loading.value = false;
  }  
}

function onWindowChange() {
  // Hacky way to trigger a props change...
  onWindowChanged.value = onWindowChanged.value+1;
}

//watch(() => [], refresh);
refresh();

</script>

<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" sm="12" lg="8">
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="info"
        :text="infoAlert"
        v-if="infoAlert"
      ></v-alert>    
      <v-alert
        style="white-space: pre-line;"      
        density="compact"
        type="error"
        :text="errorAlert"
        v-if="errorAlert"
      ></v-alert>
      <v-alert
        style="white-space: pre-line;"
        density="compact"
        type="warning"
        :text="warningAlert"
        v-if="warningAlert"
      ></v-alert>
      <v-progress-linear v-if="loading"
        indeterminate
        stream
        color="primary"
      ></v-progress-linear>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12">
      <v-card>
        <v-tabs v-model="tab" bg-color="transparent" min-height="70" height="70" color="primary" @update:modelValue="onWindowChange()">
          <v-tab value="account" class="" ><UserCircleIcon class="mr-2" size="20"/>{{ t('accountSettings.account') }}</v-tab>        
          <!--<v-tab value="preferences"  class=""><BellIcon class="mr-2" size="20"/>{{ t('accountSetting.preferences') }}</v-tab>-->
          <v-tab value="team"  class=""><ArticleIcon class="mr-2" size="20"/>{{ t('common.teams') }}</v-tab>
          <v-tab value="virtualPlatform"  class=""><ArticleIcon class="mr-2" size="20"/>{{ t('accountSettings.virtualPlatform') }}</v-tab>
          <v-tab value="connections"  class=""><ArticleIcon class="mr-2" size="20"/>{{ t('accountSettings.connections') }}</v-tab>
      </v-tabs>
      <v-card-text class="pa-sm-6 pa-3 pb-sm-6 pb-6">
          <v-window v-model="tab">
              <v-window-item value="account">
                <Account :user="user" @handledialog="profileDialogVisible = false" :onWindowChanged="onWindowChanged"></Account>
              </v-window-item>
              <v-window-item value="preferences">
                <Preferences :user="user" @handledialog="profileDialogVisible = false" :onWindowChanged="onWindowChanged"></Preferences>
              </v-window-item>
              <v-window-item value="virtualPlatform">
                <VirtualPlatforms :user="user" @handledialog="profileDialogVisible = false" :onWindowChanged="onWindowChanged"></VirtualPlatforms>
              </v-window-item>
              <v-window-item value="connections">
                <Connections :user="user" @handledialog="profileDialogVisible = false" :onWindowChanged="onWindowChanged"></Connections>
              </v-window-item>
              <v-window-item value="team">
                <Teams :user="user" @handledialog="profileDialogVisible = false" :onWindowChanged="onWindowChanged"></Teams>
              </v-window-item>
          </v-window>
      </v-card-text>
      </v-card>      
    </v-col>  
  </v-row>
</template>
