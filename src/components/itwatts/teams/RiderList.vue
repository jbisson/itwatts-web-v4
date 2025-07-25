<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch, onBeforeUpdate } from 'vue';
import vueFilePond from 'vue-filepond';
import { setOptions }  from 'vue-filepond';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { useUserProfile } from '@/stores/user-profile';
import config from "@/config/config.json";

const emit = defineEmits(['onSuccess', 'onError', 'onLoading']);
const { t, locale } = useI18n({ useScope: 'global' });

const dialog = ref(false);
const dialogConfirmDeleteList = ref(false);
const isFormValid = ref();
const dialogListName = ref();
const dialogUsers = reactive([] as any);


function refresh() {
}

watch(() => [], refresh);
refresh();

const rules = ref({
  required: (value: any) => !!value || t('validations.required'),
  email: (value: any) => {
      const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(value) || t('validations.invalidEmail');
    },
});

async function save(newZpPreferences: object) {
  try {
    await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
    {
      newZpPreferences
    },
    {
      withCredentials: true
    });
  } catch (err: any) {
    emit('onError', t('errors.errorOccured', [err]));
    console.log(`Error: ${err} stack: ${err.stack}`);
  }
}

async function addList() {
  const zp_ids = dialogUsers.value.map((user: any) => user.zp_id);
  
  const newZpPreferences = {
    my_lists: useUserProfile().zp_preferences ? useUserProfile().zp_preferences.my_lists : []
  }
  newZpPreferences.my_lists.push({
    name: dialogListName.value,
    zp_ids: zp_ids
  });
  await save(newZpPreferences);
  dialog.value = false;
}

async function deleteList() {
  const newZpPreferences = {
    my_lists: useUserProfile().zp_preferences ? useUserProfile().zp_preferences.my_lists : []
  }

  newZpPreferences.my_lists = newZpPreferences.my_lists.filter((list: any) => list.name !== dialogListName.value);
  await save(newZpPreferences);
  dialogConfirmDeleteList.value = false;
}

</script>
<template>  
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-form ref="myform" v-model="isFormValid">   
        <v-card-text>
          <h4 class="text-h3 mb-4">{{ t('teamPowerStats.addList') }}</h4>
          <p>
            <v-text-field
              v-model="dialogListName"
              variant="outlined"
              :placeholder="t('teamPowerStats.nameList')"
              hide-details
              density="compact"
              :rules="[rules.required]"
            ></v-text-field>
          </p><br>
          <h4 class="text-h6 mb-4">{{ t('teamPowerStats.riders') }}</h4>
          <div class="my-5 text-subtitle-1 lh-md">
            <span
              v-for="(user,lineNumber) of dialogUsers.value" 
              v-bind:key="lineNumber" >
              - {{ user.first_name }} {{ user.last_name }}<br/>
            </span><br>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="tonal" color="error" @click="dialog = false">{{ t('actions.cancel') }}</v-btn>
          <v-btn variant="flat" color="primary" @click="addList()" :disabled="!isFormValid">{{ t('actions.save') }}</v-btn>                    
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
      <v-card-actions>
        <v-btn variant="tonal" color="error" @click="dialogConfirmDeleteList = false">{{ t('actions.cancel') }}</v-btn>
        <v-btn variant="flat" color="primary" @click="deleteList()">{{ t('common.yes') }}</v-btn>                    
        </v-card-actions>
    </v-card>
  </v-dialog>
</template>
