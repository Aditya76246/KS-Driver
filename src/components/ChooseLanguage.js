import React from "react";
import {
  View,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import globalStyles from "../styles/globalStyles";
import { color } from "../styles/theme";
import CustomText from "../components/CustomText";
import SplashScreenBg from "../../assets/images/splashBg.png";
import { useLanguage } from "../context/LanguageContext";

const languages = [
  { id: "en", title: "English", subtitle: "English", short: "Aa" },
  { id: "hi", title: "हिन्दी (Hindi)", subtitle: "Hindi", short: "अ" },
  { id: "te", title: "తెలుగు (Telugu)", subtitle: "Telugu", short: "తె" },
];

export default function ChooseLanguage() {
  const { locale, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();

  const handleContinue = () => {
    if (route.params?.goBackOnContinue) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />

      <ImageBackground source={SplashScreenBg} resizeMode="cover" style={styles.bg}>
        <View style={styles.overlay} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.globeIconWrap}>
              <Ionicons name="globe-outline" size={38} color={color.GREEN} />
            </View>

            <CustomText style={styles.title}>{t("chooseLanguage.title")}</CustomText>
            <CustomText style={styles.subtitle}>{t("chooseLanguage.subtitle")}</CustomText>
          </View>

          {languages.map((item) => {
            const isSelected = locale === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => changeLanguage(item.id)}
                style={[styles.languageCard, isSelected && styles.languageCardSelected]}
              >
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>

                <View style={{ flex: 1 }}>
                  <CustomText style={styles.languageTitle}>{item.title}</CustomText>
                  <CustomText style={styles.languageSubtitle}>{item.subtitle}</CustomText>
                </View>

                <View style={styles.languageBadge}>
                  <CustomText style={styles.languageBadgeText}>{item.short}</CustomText>
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={{ flex: 1 }} />

          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleContinue}
              style={styles.continueButton}
            >
              <CustomText style={styles.continueText}>{t("common.continue")}</CustomText>

              <View style={styles.continueArrowWrap}>
                <Ionicons name="arrow-forward" size={34} color={color.WHITE} />
              </View>
            </TouchableOpacity>

            <View style={styles.secureRow}>
              <Ionicons name="shield-checkmark-outline" size={26} color={color.GREEN} />

              <CustomText style={styles.secureText}>
                <CustomText style={styles.secureStrong}>100%</CustomText> {t("common.secure")}
              </CustomText>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  bg: { flex: 2 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.82)",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  globeIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: color.BORDER_GREEN,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "rgba(46,125,50,0.04)",
  },
  title: {
    ...globalStyles.f24Bold,
    color: color.TEXT_MAIN,
    textAlign: "center",
  },
  subtitle: {
    ...globalStyles.f18Regular,
    color: color.TEXT_MUTED,
    textAlign: "center",
    marginTop: 10,
  },
  languageCard: {
    height: 60,
    borderRadius: 24,
    backgroundColor: "#ffffffbf",
    borderWidth: 1,
    borderColor: "#E2E2E2",
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
  },
  languageCardSelected: {
    borderColor: color.GREEN,
    backgroundColor: "rgba(46,125,50,0.04)",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#C8C8C8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },
  radioOuterSelected: { borderColor: color.GREEN },
  radioInner: {
    width: 18,
    height: 18,
    borderRadius: 50,
    backgroundColor: color.GREEN,
  },
  languageTitle: {
    ...globalStyles.f16Bold,
    color: color.TEXT_MAIN,
  },
  languageSubtitle: {
    ...globalStyles.f16Regular,
    color: color.TEXT_MUTED,
    marginTop: 4,
  },
  languageBadge: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  languageBadgeText: {
    ...globalStyles.f20Bold,
    color: color.GREEN,
  },
  footer: {
    paddingHorizontal: 2,
    marginTop: 10,
    paddingBottom: 10,
  },
  continueButton: {
    height: 60,
    backgroundColor: color.GREEN,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    position: "relative",
  },
  continueText: {
    ...globalStyles.f20Bold,
    color: color.WHITE,
    letterSpacing: 0.3,
  },
  continueArrowWrap: {
    position: "absolute",
    right: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  secureRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  secureText: {
    ...globalStyles.f16Regular,
    marginLeft: 8,
    color: color.TEXT_SUB,
  },
  secureStrong: {
    ...globalStyles.f16Bold,
    color: color.GREEN,
  },
});
