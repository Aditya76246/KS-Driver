import React, { createContext, useContext, useState, useEffect } from "react";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en";
import hi from "../locales/hi";
import te from "../locales/te";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [locale, setLocale] = useState("en");

    const changeLanguage = async (lang) => {
        if (!["en", "hi", "te"].includes(lang)) return;
        await i18next.changeLanguage(lang);
        setLocale(lang);
        await AsyncStorage.setItem("appLocale", lang);
    };

    useEffect(() => {
        AsyncStorage.getItem("appLocale").then((saved) => {
            if (saved && ["en", "hi", "te"].includes(saved)) {
                i18next.changeLanguage(saved);
                setLocale(saved);
            }
        });
    }, []);



    return (
        <LanguageContext.Provider value={{ locale, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
