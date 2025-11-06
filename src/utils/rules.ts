import { toRefs, ref, onMounted, reactive, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

export function rules() {
  const { t, locale } = useI18n({ useScope: 'global' });

  const rules = {
    required: (value: any) => Array.isArray(value) ? value.length > 0 :!!value || t('validations.required'),
    email: (value: any) => {
      const pattern =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return pattern.test(value) || t('validations.invalidEmail');
    },
    validateCheckbox: (value: any) => value.length > 0,
  }

  return rules;
};

