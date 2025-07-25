<script setup lang="ts">
import axios from 'axios';
import { toRefs, ref, onMounted, reactive, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import config from "@/config/config.json";
import { useUserProfile } from '@/stores/user-profile';

const isPrivacyFormValid = ref();
const privacyConsent = ref();
const loading = ref(false);
const emit = defineEmits(['onSuccess', 'onError', 'onLoading']);
const { t, locale } = useI18n({ useScope: 'global' });
const router = useRouter();

const props = defineProps({
  fera_privacy: null,   
});

const rules = ref({
  required: (value: any) => !!value || t('validations.required'),
  email: (value: any) => {
      const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return pattern.test(value) || t('validations.invalidEmail');
    },
});

async function submitPrivacy() {  
  try {
    loading.value = true;
    emit('onLoading', true);

    const user = await axios.patch(`${config.serverApi.publicHostname}/v1/users/${useUserProfile().user_id}`,
    {
      fera_privacy: {
        consent: privacyConsent.value,
      }
    },{
      withCredentials: true
    });

    emit('onSuccess', t('dialogs.success'));
  } catch (err: any) {
    emit('onError', t('errors.errorOccured', [err]));
    console.log(`Error: ${err} stack: ${err.stack}`);
  } finally {
    loading.value = false;
    emit('onLoading', false);
  }
}

async function refresh() {
  if (props.fera_privacy) {
    privacyConsent.value =  props.fera_privacy.consent;
  }
}

watch(() => [], refresh);
refresh();

</script>

<template>
  <v-form v-model="isPrivacyFormValid">
    <b>
      <i18n-t keypath="feraPrivacyComponent.iAuthorizeMy" tag="p" scope="global">
        <a href="/itwatts/fera/all-riders">{{ $t('feraPrivacyComponent.listRiders') }}</a>
      </i18n-t>
    </b>
    <v-radio-group inline hide-details="auto" v-model="privacyConsent" :rules=[rules.required]>
      <v-radio :label="t('common.yes')" color="primary" value="yes"></v-radio>
      <v-radio :label="t('common.no')" color="primary" value="no"></v-radio>                  
    </v-radio-group><br>
    <v-btn color="primary" flat @click="submitPrivacy()" :disabled="!isPrivacyFormValid || loading">{{ t('actions.save') }}</v-btn>
  </v-form>
</template>