import { SQLiteProvider } from "expo-sqlite";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { migrateDbIfNeeded } from "../db/init";
import { ThemeProvider, useThemeMode } from "../hooks/useThemeMode";
import { AppDarkTheme, AppLightTheme } from "../theme/colors";

function AppContent() {
  const { themeMode } = useThemeMode();
  const paperTheme = themeMode === "dark" ? AppDarkTheme : AppLightTheme;

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

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
