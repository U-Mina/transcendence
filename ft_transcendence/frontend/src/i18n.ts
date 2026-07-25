import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";
import zh from "./locales/zh.json";

const SAVED_LANG = localStorage.getItem("i18n_lang") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
      zh: { translation: zh },
    },
    lng: SAVED_LANG,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

function updateDocumentDirection(lang: string) {
  const dir = i18n.dir(lang);
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
  localStorage.setItem("i18n_lang", lang);
}

// Set initial direction on boot
updateDocumentDirection(i18n.language);

// Update whenever language changes
i18n.on("languageChanged", (lang) => {
  updateDocumentDirection(lang);
});

export default i18n;
