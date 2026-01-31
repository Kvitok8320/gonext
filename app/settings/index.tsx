import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import Constants from "expo-constants";
import {
  Appbar,
  Button,
  Divider,
  List,
  Switch,
  useTheme,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { resetAllData } from "../../db";
import { ScreenWithBackground } from "../../components/ScreenWithBackground";
import { LANGUAGES } from "../../i18n";
import { usePrimaryColor } from "../../hooks/usePrimaryColor";
import { useThemeMode } from "../../hooks/useThemeMode";
import { PRIMARY_COLOR_PRESETS } from "../../theme/primaryColors";

export default function SettingsScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { t, i18n } = useTranslation();
  const { themeMode, setThemeMode } = useThemeMode();
  const { primaryColor, setPrimaryColor } = usePrimaryColor();
  const theme = useTheme();
  const [resetting, setResetting] = useState(false);

  const appVersion =
    Constants.expoConfig?.version ?? Constants.manifest?.version ?? "1.0.0";

  const handleResetData = () => {
    Alert.alert(
      t("settings.resetConfirm"),
      t("settings.resetMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.continue"),
          onPress: () => {
            Alert.alert(
              t("settings.resetConfirmTitle"),
              t("settings.resetConfirmMessage"),
              [
                { text: t("common.cancel"), style: "cancel" },
                {
                  text: t("settings.resetConfirmButton"),
                  style: "destructive",
                  onPress: async () => {
                    setResetting(true);
                    try {
                      await resetAllData(db);
                      router.replace("/");
                    } catch {
                      Alert.alert(t("alerts.error"), t("settings.resetError"));
                    } finally {
                      setResetting(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScreenWithBackground>
      <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("settings.title")} />
      </Appbar.Header>

      <ScrollView style={styles.scroll}>
        <List.Section>
          <List.Subheader>{t("settings.about")}</List.Subheader>
          <List.Item
            title={t("settings.appName")}
            description={t("settings.version", { version: appVersion })}
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title={t("settings.offlineNote")}
            description={t("settings.offlineDesc")}
            left={(props) => <List.Icon {...props} icon="cellphone" />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>{t("settings.appearance")}</List.Subheader>
          <List.Item
            title={t("settings.language")}
            description={LANGUAGES.find((l) => l.code === i18n.language)?.label ?? i18n.language}
            left={(props) => <List.Icon {...props} icon="translate" />}
          />
          <View style={styles.langPicker}>
            {LANGUAGES.map(({ code, label }) => (
              <Button
                key={code}
                mode={i18n.language === code ? "contained" : "outlined"}
                compact
                onPress={() => i18n.changeLanguage(code)}
                style={styles.langButton}
              >
                {label}
              </Button>
            ))}
          </View>
          <List.Item
            title={t("settings.themeColor")}
            description={t("settings.themeColorDesc")}
            left={(props) => <List.Icon {...props} icon="palette" />}
          />
          <View style={styles.colorPicker}>
            {PRIMARY_COLOR_PRESETS.map((hex) => (
              <Pressable
                key={hex}
                onPress={() => setPrimaryColor(hex)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: hex },
                  primaryColor === hex && styles.colorCircleSelected,
                  primaryColor === hex && {
                    borderColor: theme.colors.onSurface,
                    borderWidth: 3,
                  },
                ]}
              />
            ))}
          </View>
          <List.Item
            title={t("settings.darkTheme")}
            description={themeMode === "dark" ? t("settings.darkThemeOn") : t("settings.darkThemeOff")}
            left={(props) => (
              <List.Icon
                {...props}
                icon={themeMode === "light" ? "white-balance-sunny" : "weather-night"}
              />
            )}
            right={() => (
              <Switch
                value={themeMode === "dark"}
                onValueChange={(value) => setThemeMode(value ? "dark" : "light")}
              />
            )}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>{t("settings.data")}</List.Subheader>
        </List.Section>
        <Button
          mode="contained-tonal"
          icon="delete-forever"
          onPress={handleResetData}
          disabled={resetting}
          style={styles.resetButton}
          textColor={theme.colors.error}
        >
          {t("settings.resetData")}
        </Button>
      </ScrollView>
      </View>
    </ScreenWithBackground>
  );
}

const CIRCLE_SIZE = 36;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  langPicker: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  langButton: { minWidth: 80 },
  colorPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  colorCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
  },
  colorCircleSelected: {
    transform: [{ scale: 1.1 }],
  },
  resetButton: { marginHorizontal: 16, marginBottom: 24 },
});
