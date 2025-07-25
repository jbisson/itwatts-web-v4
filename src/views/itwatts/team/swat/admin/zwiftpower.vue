<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from "@/stores/user-profile";

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter } from 'vue-router'

import config from "@/config/config.json";
import security from "@/security";

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('adminZwiftpower.pageTitle') });
const usersResult = reactive([] as any);
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('adminZwiftpower.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('adminZwiftpower.pageTitle'),
    disabled: true,
  },
]);
const loading = ref(false);
const errorOccured = ref(false);

const overallHeaders: Header[] = reactive([
  { text: 'zp_id', value: "zp_id", sortable: true },
  { text: 'name', value: "name", sortable: true },
  { text: 'swat_status', value: "swat_status", sortable: true },
  { text: 'first_name', value: "first_name", sortable: true },
  { text: 'last_name', value: "last_name", sortable: true },      
]);

usersResult.value = [];

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ADMIN'];
  if (!security.isTokenValid( rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/team/signin' });
    return;
  }

  loading.value = true;
  errorOccured.value = false;
  try {
    const swatTeamResponse = await axios.get(`${config.serverApi.publicHostname}/v1/zp-team/19126`, {
      withCredentials: true,
    });

    const swatUsersResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users?groups=swat_2023_2024,swat_2024_2025`, {
      withCredentials: true,
    });

    const swatUSersMap = new Map(swatUsersResponse.data.data.map((obj: any) => [obj.zp_id, obj]));
      
    for (const rider of swatTeamResponse.data.data) {
      //console.log(rider);
      
      usersResult.value.push(
        {
          zp_id: rider.zwid,
          name: rider.name,
          swat_status: swatUSersMap.has(rider.zwid) ? 'Member' : 'Not member',
          first_name: swatUSersMap.has(rider.zwid) ? swatUSersMap.get(rider.zwid).first_name : '',
          last_name: swatUSersMap.has(rider.zwid) ? swatUSersMap.get(rider.zwid).last_name : '',
        }
      );
    }    
  } catch (error: any) {
    errorOccured.value = true;
    console.log(`an error occured: ${error}`);

    if (error.response && error.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    console.log('an error occured: ' + error);
  }

  loading.value = false;  
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
    <v-col cols="12" sm="12" lg="8">      
    <v-card>
      <v-card-text>
        <div class="align-center">
          Liste provenant de: <a href="https://zwiftpower.com/team.php?id=19126">https://zwiftpower.com/team.php?id=19126</a>
        </div><br>
        <div class="align-center">
          <v-progress-linear v-if="loading"
              indeterminate
              stream
              color="primary"
            ></v-progress-linear>
          <EasyDataTable
              :headers="overallHeaders"
              :items="usersResult.value"
              alternating>
            <template #item-zp_id="{ zp_id }">
                <a :href="'https://zwiftpower.com/profile.php?z=' + zp_id" target="_blank">{{ zp_id }}</a>
            </template>
          </EasyDataTable>
        </div>
      </v-card-text>
    </v-card>
    </v-col>  
  </v-row>
</template>
