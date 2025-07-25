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
const loading = ref(false);
const inviteDialog = ref(false);
const invitationDialogItem = ref();
const isInviteFormValid = ref();
const infoAlert = ref();
const warningAlert = ref();
const errorAlert = ref();
const search = ref();

const rules = ref({
  required: (value: any) => !!value || t('validations.required'),
  email: (value: any) => {
      const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(value) || t('validations.invalidEmail');
    },
});

const invitesHeaders = ref([
  { title: t('common.date'), key: 'created', sortable: true },
  { title: t('common.email'), key: 'email', sortable: true, width: '30%' },
  { title: t('common.zwiftPowerID'), key: 'zp_id', sortable: true },
  { title: t('common.code'), key: 'code', sortable: true },  
  { title: t('common.status'), key: 'status', sortable: true },  
  { title: t('common.acceptedDate'), key: 'accepted_date', sortable: true },    
  { title: t('actions.actions'), key: 'actions', sortable: false },
]);

function removeInvitation(item: any) {
  removeRiderDialogItem.value = Object.assign({}, item);
  removeRiderDialog.value = true;
}

async function confirmRemoveInvitationDialog(code: any) {  
  emit('onError', '');
  try {
    emit('onLoading', true);
    loading.value = true;
    
    const newRiderInvites = props.team.rider_invites.filter((invite: any) => invite.code !== code);    
    await axios.patch(`${config.serverApi.publicHostname}/v1/teams/${props.team.id}`,
    {
      rider_invites: newRiderInvites,
    },{
      withCredentials: true
    });
    props.team.rider_invites = newRiderInvites;
  } catch (err: any) {
    emit('onError', t('errors.errorOccured', [err]));
    console.log(`Error: ${err} stack: ${err.stack}`);
  } finally {
    loading.value = false;
    emit('onLoading', false);
    removeRiderDialog.value = false;
  }
}

function closeRemoveInvitationDialog() {  
  removeRiderDialog.value = false;
}

async function refresh() {

}

function applyDefaultInvite() {
  setTimeout(() => {
    invitationDialogItem.value = {
      id: uuid.v4()
    }
  });
}

function closeInviteDialog() {
  inviteDialog.value = false;
  applyDefaultInvite();
}

async function saveRiderInviteDialog() {
  try {
    errorAlert.value = '';
    loading.value = true;
    const response = await axios.post(`${config.serverApi.publicHostname}/v1/teams/${props.team.id}/rider-invite`, {      
      email: invitationDialogItem.value.email,
      zp_id: invitationDialogItem.value.zp_id,
    }, {
      withCredentials: true
    });
    props.team.rider_invites.push(
      response.data
    );
    closeInviteDialog();
  } catch (err: any) {
    if (err.response && err.response.data && err.response.data.message.includes('zp_id')) {
      errorAlert.value = t('errors.invalidZwiftPowerID');
    } else {
      errorAlert.value = t('errors.errorOccured', [err]);
    }
  } finally {
    loading.value = false;    
  }
}

applyDefaultInvite();

/*watch(() => props.team, (newValue, oldValue) => {
  refresh();
});*/

refresh();

</script>

<template>
  <v-form v-model="isInviteFormValid">    
    <v-data-table class="border rounded-md" :headers="invitesHeaders" :items="props.team.rider_invites"
      :sort-by="[{ key: 'model', order: 'asc' }]" :search="search">                    
      <template v-slot:top>
        <v-toolbar class="bg-lightsecondary" flat>
          <v-toolbar-title>{{ t('invitesComponent.myTeamInvites') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field v-model="search" append-inner-icon="mdi-magnify" single-line hide-details  variant="outlined"/>&nbsp;&nbsp;
          <v-dialog v-model="inviteDialog" max-width="500px">
            <template v-slot:activator="{ props }">
              <v-btn color="primary" variant="flat" dark v-bind="props" density="compact" icon="mdi-plus"></v-btn>
            </template>
            <v-card>
              <v-card-title class="d-flex justify-space-between align-center bg-primary">
                <div class="text-h3">{{ t('invitesComponent.invitation') }}</div>               
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  @click="closeInviteDialog()">
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-container class="px-0">
                  <v-row>
                    <v-progress-linear
                    v-if="loading"
                    indeterminate
                    streamf
                    color="primary"            
                  ></v-progress-linear>
                    <v-col cols="12" sm="10">
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
                        type="warning"
                        :text="warningAlert"
                        v-if="warningAlert"
                      ></v-alert>
                      <v-alert
                        style="white-space: pre-line;"
                        density="compact"
                        type="error"
                        :text="errorAlert"
                        v-if="errorAlert"
                      ></v-alert>      
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-text-field
                      :label="t('common.email')"
                      color="primary"
                      variant="outlined"
                      hide-details="auto"
                      v-model="invitationDialogItem.email"
                      :rules="[rules.required, rules.email]"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="10">
                      <v-text-field
                      :label="t('common.zwiftPowerID')"
                      color="primary"
                      variant="outlined"
                      hide-details="auto"
                      v-model="invitationDialogItem.zp_id"
                      :rules="[rules.required]"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="tonal" color="error" @click="closeInviteDialog()">{{ t('actions.cancel') }}</v-btn>
                <v-btn variant="flat" color="primary" dark @click="saveRiderInviteDialog()" :disabled="!isInviteFormValid || loading">{{ t('actions.invite') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="removeRiderDialog" max-width="500px">
            <v-card>
              <v-card-title class="text-h5 text-center py-6 text-wrap">
                {{ t('ridersComponent.removeInvitation',
                  [removeRiderDialogItem.code, props.team.display_name])
                }}</v-card-title>                              
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="tonal" color="error" @click="closeRemoveInvitationDialog">{{ t('actions.cancel') }}</v-btn>
                <v-btn variant="flat" color="primary" @click="confirmRemoveInvitationDialog(removeRiderDialogItem.code)">{{ t('actions.ok') }}</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>                      
      </template>
      <template v-slot:item.created="{ value }">
        {{ value.split('T')[0] }}
      </template>
      <template v-slot:item.accepted_date="{ value }">
        {{ value ? value.split('T')[0] : '' }}
      </template>                  
      <template v-slot:item.zp_id="{ item }">
        <a :href="'https://zwiftpower.com/profile.php?z=' + item.zp_id" target="_blank">{{ item.zp_id }}</a>
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex align-center">
          <v-tooltip :text="t('actions.removeInvitation')">
            <template v-slot:activator="{ props }">
              <v-btn icon flat @click="removeInvitation(item)" v-bind="props">
                <TrashIcon stroke-width="1.5" size="20" class="text-error"/>
              </v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>
    </v-data-table>
  </v-form>
</template>