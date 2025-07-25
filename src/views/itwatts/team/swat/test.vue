<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

// common components
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

//Table
import MembersTable from '@/components/table/ItWattsMembersTable.vue';

const { t, locale } = useI18n({ useScope: 'global' });

// theme breadcrumb
const page = ref({ title: t('swatMembers.pageTitle') });
const breadcrumbs = ref([
  {
    text: t('swatMembers.pageCategory'),
    disabled: false,
    to: "#",
  },
  {
    text: t('swatMembers.pageTitle'),
    disabled: true,
  },
]);
</script>

<template>
  <BaseBreadcrumb
    :title="page.title"
    :breadcrumbs="breadcrumbs"
  ></BaseBreadcrumb>
  <v-row>
        <v-col cols="12">
            <UiParentCard :title="t('swatMembers.pageTitle')">
                <MembersTable />
            </UiParentCard>
        </v-col>
    </v-row>  
</template>
