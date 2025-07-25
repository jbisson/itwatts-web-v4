<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import 'v-calendar/dist/style.css';
import FullCalendar from './fullCalendar.vue';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { useUserProfile } from '@/stores/user-profile';
import config from '@/config/config.json';
import security from '@/security';
import { decodeBase64 } from '@/utils/string';

const { t } = useI18n({ useScope: 'global' });
const page = ref({ title: t('swatIrlCalendar.pageTitle') });
const usersResult = reactive([] as any);
const router = useRouter();
const breadcrumbs = ref([
  {
    text: t('swatIrlCalendar.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatIrlCalendar.pageTitle'),
    disabled: true,
  },
]);

usersResult.value = [];

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ADMIN', 'SWAT_MEMBER_2024_2025', 'SWAT_GUEST_MEMBER'];
  if (!security.isTokenValid(rolesRequired)) {
    useUserProfile().login_post_back_page = router.currentRoute.value.path;
    router.push({ path: '/itwatts/signin' });
    return;
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
    <v-col cols="10" sm="10" lg="10">
      <v-card>
        <v-card-text>          
          <v-spacer></v-spacer>
          <v-spacer></v-spacer>
          <div class="align-center">
            <FullCalendar />
          </div>
        </v-card-text>
      </v-card>  
    </v-col>
  </v-row>
</template>
