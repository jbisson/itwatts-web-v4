<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch } from "vue";
import { useUserProfile } from '@/stores/user-profile';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useI18n } from 'vue-i18n';
import type { Header, Item, ClickRowArgument } from "vue3-easy-data-table";
import { useRouter } from 'vue-router'

import config from "@/config/config.json";
import security from "@/security";

const { t, locale } = useI18n({ useScope: 'global' });
const page = ref({ title: t('adminInfo.pageTitle') });
const usersResult = reactive([] as any);
const router = useRouter();

const breadcrumbs = ref([
  {
    text: t('adminInfo.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('adminInfo.pageTitle'),
    disabled: true,
  },
]);
const userStoreProfile = useUserProfile();

async function refresh() {
  const rolesRequired = ['SUPER_ADMIN', 'SWAT_ADMIN'];
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
    <v-col cols="12" sm="12" lg="8">      
    <v-card>
      <v-card-text>
        <div class="d-flex align-center mb-4">
          <h2 class="text-h5">{{ $t('adminInfo.pageTitle') }}</h2>
        </div>
        <div class="align-center">
          Info à venir...
        </div>
      </v-card-text>
    </v-card>
    </v-col>  
  </v-row>
</template>
