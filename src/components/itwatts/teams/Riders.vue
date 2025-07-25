<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch, nextTick } from 'vue';
import { setOptions }  from 'vue-filepond';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { uuid } from 'vue-uuid';
import config from "@/config/config.json";

import { useUserProfile } from '@/stores/user-profile';
import { remove } from 'lodash';

const props = defineProps({
    team: null,   
});

const emit = defineEmits(['onSuccess', 'onError', 'onLoading']);
const { t, locale } = useI18n({ useScope: 'global' });
const router = useRouter();

const removeRiderDialogItem = ref();
const removeRiderDialog = ref();
const powerTests = ref([]);
const loading = ref(false);
const isPowerTestFormValid = ref();
const riders = ref([]);
const search = ref();

const ridersHeaders = ref([
  { title: t('common.firstName'), key: 'first_name', align: 'start' },
  { title: t('common.lastName'), key: 'last_name', sortable: true },
  { title: t('common.gender'), key: 'gender', sortable: true, width: 10},
  { title: t('common.email'), key: 'email', sortable: true, width: '40%' },
  { title: t('common.zwiftPower'), key: 'zp_id', sortable: true },
  
  { title: t('actions.actions'), key: 'actions', sortable: false },
]);

function removeRider(item: any) {
  removeRiderDialogItem.value = Object.assign({}, item);
  removeRiderDialog.value = true;
}

async function confirmRemoveRiderDialog(id: any) {  
  emit('onError', '');
  try {
    emit('onLoading', true);
    loading.value = true;
    
    const newRidersList = riders.value.filter((rider: any) => rider.id !== id);
    const newRidersListFlatten = newRidersList.map((rider: any) => rider.id);
    await axios.patch(`${config.serverApi.publicHostname}/v1/teams/${props.team.id}`,
    {
      riders: newRidersListFlatten,
    },{
      withCredentials: true
    });
    riders.value = newRidersList;
  } catch (err: any) {
    emit('onError', t('errors.errorOccured', [err]));
    console.log(`Error: ${err} stack: ${err.stack}`);
  } finally {
    loading.value = false;
    emit('onLoading', false);
    removeRiderDialog.value = false;
  }
}

function closeRemoveRiderDialog() {
  removeRiderDialog.value = false;
}

async function refresh() {  
  try {
    riders.value = [];
    const allValidUsers = [];

    if (!props.team.riders || !props.team.riders.toString()) {
      return;
    }
    const allValidUsersResponse = await axios.get(`${config.serverApi.publicHostname}/v1/users?id=${props.team.riders.toString()}`,
    {
      withCredentials: true
    });
    if (allValidUsersResponse.data.data) {      
      for (const user of allValidUsersResponse.data.data) {
        allValidUsers.push({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          gender: user.gender,
          email: user.email,
          zp_id: user.zp_id,
        });
      }
      riders.value = allValidUsers;
    }
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      router.push({ path: '/itwatts/signin' });
    }
    emit('onError', t('errors.errorOccured', [err]));
    console.log(`an error occured: ${err} stack: ${err.stack}`);
  }
}

watch(() => props.team, (newValue, oldValue) => {
  refresh();
});
refresh();

</script>

<template>
  <v-form v-model="isPowerTestFormValid">
    
    <v-data-table class="border rounded-md" :headers="ridersHeaders" :items="riders"
      :sort-by="[{ key: 'model', order: 'asc' }]" :search="search">
      <template v-slot:top>
        <v-toolbar class="bg-lightsecondary" flat>
          <v-toolbar-title>{{ t('ridersComponent.myTeamRiders') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-inner-icon="mdi-magnify" single-line hide-details/>&nbsp;&nbsp;
          <v-dialog v-model="removeRiderDialog" max-width="500px">
            <v-card>
              <v-card-title class="text-h5 text-center py-6 text-wrap">
                {{ t('ridersComponent.removeRider',
                  [removeRiderDialogItem.first_name, removeRiderDialogItem.last_name, props.team.display_name])
                }}</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="tonal" color="error" @click="closeRemoveRiderDialog">{{ t('actions.cancel') }}</v-btn>
                <v-btn variant="flat" color="primary" @click="confirmRemoveRiderDialog(removeRiderDialogItem.id)">{{ t('actions.ok') }}</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.first_name="{ item }">
        <a :href="'/itwatts/user/profile/' + item.id">{{ item.first_name }}</a>
      </template>
      <template v-slot:item.created="{ value }">
        {{ value.split('T')[0] }}
      </template>
      <template v-slot:item.zp_id="{ item }">
        <a :href="'https://zwiftpower.com/profile.php?z=' + item.zp_id" target="_blank">{{ item.zp_id }}</a>
      </template>     
      <template v-slot:item.actions="{ item }">
        <div class="d-flex align-center">
          <v-tooltip :text="t('actions.removeRider')">
            <template v-slot:activator="{ props }">
              <v-btn icon flat @click="removeRider(item)" v-bind="props">
                <TrashIcon stroke-width="1.5" size="20" class="text-error"/>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>
    </v-data-table>
  </v-form>
</template>