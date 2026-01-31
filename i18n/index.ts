import AsyncStoragePlugin from "i18next-react-native-async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import ru from "../locales/ru.json";

export const LANGUAGES = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

i18n
  .use(AsyncStoragePlugin("ru"))
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
    },
    lng: "ru",
    fallbackLng: "ru",
    compatibilityJSON: "v4",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
