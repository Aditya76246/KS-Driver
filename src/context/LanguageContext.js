import React, { createContext, useContext, useState, useEffect } from "react";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "../locales/en";
import hi from "../locales/hi";
import te from "../locales/te";

// ─── i18next initialisation ───────────────────────────────────────────────────
// Bundled locale files serve as the offline/fallback translations.
// When dynamic translations are ready from the backend, add i18next-http-backend
// here and point loadPath to the API — no other file needs to change.
i18next.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    te: { translation: te },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const SUPPORTED_LANGS = ["en", "hi", "te"];
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState("en");

  const changeLanguage = async (lang) => {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    await i18next.changeLanguage(lang);
    setLocale(lang);
    await AsyncStorage.setItem("appLocale", lang);
  };

  // Wraps i18next so callers use the same t(key) API for both:
  //   • namespaced keys  →  "common.continue", "chooseLanguage.title"
  //   • flat text keys   →  "Full Name", "Mobile Number"  (live in the text map)
  const t = (key) => {
    if (!key) return key;
    const direct = i18next.t(key);
    if (direct !== key) return direct;
    // flat key not matched above — try the text namespace
    const fromText = i18next.t(`text.${key}`);
    if (fromText !== `text.${key}`) return fromText;
    return key;
  };

  useEffect(() => {
    AsyncStorage.getItem("appLocale").then((saved) => {
      if (saved && SUPPORTED_LANGS.includes(saved)) {
        i18next.changeLanguage(saved);
        setLocale(saved);
      }
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
