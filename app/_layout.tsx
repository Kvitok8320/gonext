import { SQLiteProvider } from "expo-sqlite";
import { Stack } from "expo-router";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { migrateDbIfNeeded } from "../db/init";
import { ThemeProvider, useThemeMode } from "../hooks/useThemeMode";

function AppContent() {
  const { themeMode } = useThemeMode();
  const paperTheme = themeMode === "dark" ? MD3DarkTheme : MD3LightTheme;

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
