//i18
import { createI18n } from "vue-i18n";
import messages from "@/utils/locales/messages";

export const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'fr',
  legacy: false,
  messages: messages,
  silentTranslationWarn: true,
  silentFallbackWarn: true
});