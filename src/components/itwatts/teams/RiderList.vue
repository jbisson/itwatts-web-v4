<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch, onBeforeUpdate } from 'vue';
import vueFilePond from 'vue-filepond';
import { setOptions }  from 'vue-filepond';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { useUserProfile } from '@/stores/user-profile';
import config from "@/config/config.json";
import { rules } from '@/utils/rules';

const emit = defineEmits(['onFilterChanged', 'update:dialog', 'handledialog']);
const { t, locale } = useI18n({ useScope: 'global' });

const dialogConfirmDeleteList = ref(false);
const isFormValid = ref();
const filterSelection = ref();
const dialogListName = ref();
const loading = ref(false);
const infoAlert = ref();
const errorAlert = ref();
const warningAlert = ref();

const props = defineProps({  
  visible: null,
  teamName: null,
  users: Array,
});

const dialog = computed({
  // getter
  get() {
    return props.visible;
  },
  // setter
  set(value) {    
    emit('update:dialog', value);
  }
});

function refresh() {

}

watch(() => [], refresh);
refresh();

watch(() => props.visible, (newVal, oldVal) => {
  if (newVal) {
    infoAlert.value = '';
    errorAlert.value = '';
    warningAlert.value = '';
    dialogListName.value = '';
  }
});

async function save(newUsersLists: any) {  
  try {
    loading.value = true;
    await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
    {
      users_lists: newUsersLists,
    },
    {
      withCredentials: true
    });
    useUserProfile().users_lists = newUsersLists;
  } catch (err: any) {
    errorAlert.value = t('errors.errorOccured', [err]);
    console.log(`Error: ${err} stack: ${err.stack}`);
  } finally {
    loading.value = false;
  }
}

async function addList() {
  if (!props.users || !props.teamName) {
    return;
  }
  const user_ids = props.users.map((user: any) => user.id);
  
  const newUsersLists = useUserProfile().users_lists ? useUserProfile().users_lists : [];

  if (newUsersLists.find((list: any) => list.name === dialogListName.value && list.team_name === props.teamName)) {
    errorAlert.value = t('errors.invalidListName');    
    return;
  }

  newUsersLists.push({
    name: dialogListName.value,
    team_name: props.teamName,
    user_ids: user_ids
  });
  await save(newUsersLists);
  emit('handledialog');
}

async function deleteList() {
  let newUsersLists = useUserProfile().users_lists ? useUserProfile().users_lists : [];
  newUsersLists = newUsersLists.filter((list: any) => !(list.name === dialogListName.value && list.team_name === props.teamName));
  await save(newUsersLists);
  dialogConfirmDeleteList.value = false;
}

function showDialogRemoveList(list: any) {
  dialogListName.value = list.name;
  dialogConfirmDeleteList.value = true;
}

</script>
<template>
  <v-row>
    <v-col cols="12">     
      <v-chip-group
        v-model="filterSelection"
        selected-class="text-primary"
        @update:modelValue="emit('onFilterChanged', filterSelection)"
        column>
        <v-chip
          v-if="useUserProfile().users_lists"
          variant="outlined"            
          v-for="list in useUserProfile().users_lists.filter((list) => list.team_name === props.teamName)"
          :key="list"
          :value="list"
          filter
          >
          {{ list.name }}
          <template #close>
            <v-icon icon="mdi-close-circle" @click.stop="showDialogRemoveList(list)" />
          </template>
        </v-chip>
      </v-chip-group>
    </v-col>
  </v-row>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-form v-model="isFormValid">
        <v-progress-linear v-if="loading"
          indeterminate
          stream
          color="primary">
        </v-progress-linear>
        <v-card-title class="d-flex justify-space-between align-center">
          <div class="text-h3">
            {{ t('teamPowerStats.addList') }}
          </div>
          <v-btn
          icon="mdi-close"
          variant="text"
          @click="$emit('handledialog')">
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
            <v-alert
              class="mb-4"
              density="compact"
              type="info"
              :text="infoAlert"
              v-if="infoAlert"
            ></v-alert>    
            <v-alert
              class="mb-4"
              density="compact"
              type="error"
              :text="errorAlert"
              v-if="errorAlert"
            ></v-alert>
            <v-alert
              class="mb-4"
              density="compact"
              type="warning"
              :text="warningAlert"
              v-if="warningAlert"
            ></v-alert>
            </v-col>      
          </v-row>          
          <v-text-field
            v-model="dialogListName"
            variant="outlined"
            :placeholder="t('teamPowerStats.nameList')"
            hide-details
            density="compact"
            :rules="[rules().required]"
          ></v-text-field>
          <br>
          <h4 class="text-h6 mb-4">{{ t('teamPowerStats.riders') }}</h4>
          <div class="text-subtitle-1">
            <span
              v-for="(user,lineNumber) of props.users" 
              v-bind:key="lineNumber" >
              - {{ user.first_name }} {{ user.last_name }}<br/>
            </span>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end ga-3 ma-3">          
          <v-btn color="error" @click="$emit('handledialog')">{{ t('actions.cancel') }}</v-btn>
          <v-btn color="primary" @click="addList()" :disabled="!isFormValid">{{ t('actions.save') }}</v-btn>          
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
  <v-dialog v-model="dialogConfirmDeleteList" max-width="500">
    <v-card>
      <v-card-text class="mb-4">
        <h4 class="text-h4 mb-5">{{ t('actions.confirm') }}</h4>
        {{ t('teamPowerStats.areYouSureRemoveList', [dialogListName]) }}
      </v-card-text>                
      <v-card-actions class="justify-end ga-3 ma-3">
        <v-btn color="error" @click="dialogConfirmDeleteList = false">{{ t('actions.cancel') }}</v-btn>
        <v-btn color="primary" @click="deleteList()">{{ t('common.yes') }}</v-btn>                    
        </v-card-actions>
    </v-card>
  </v-dialog>
</template>
