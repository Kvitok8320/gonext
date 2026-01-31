import "../i18n";
import { Suspense } from "react";
import { ActivityIndicator, View } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { migrateDbIfNeeded } from "../db/init";
import { PrimaryColorProvider, usePrimaryColor } from "../hooks/usePrimaryColor";
import { ThemeProvider, useThemeMode } from "../hooks/useThemeMode";
import { buildAppDarkTheme, buildAppLightTheme } from "../theme/colors";

function AppContent() {
  const { themeMode } = useThemeMode();
  const { primaryColor } = usePrimaryColor();
  const paperTheme =
    themeMode === "dark"
      ? buildAppDarkTheme(primaryColor)
      : buildAppLightTheme(primaryColor);

  return (
    <PaperProvider theme={paperTheme}>
      <SQLiteProvider
        databaseName="gonext.db"
        onInit={migrateDbIfNeeded}
      >
        <Stack screenOptions={{ headerShown: false }} />
      </SQLiteProvider>
    </PaperProvider>
  );
}

function LoadingFallback() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThemeProvider>
        <PrimaryColorProvider>
          <AppContent />
        </PrimaryColorProvider>
      </ThemeProvider>
    </Suspense>
  );
}
