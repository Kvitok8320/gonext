import { SQLiteProvider } from "expo-sqlite";
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { migrateDbIfNeeded } from "../db/init";

export default function RootLayout() {
  return (
    <PaperProvider>
      <SQLiteProvider
        databaseName="gonext.db"
        onInit={migrateDbIfNeeded}
      >
        <Stack screenOptions={{ headerShown: false }} />
      </SQLiteProvider>
    </PaperProvider>
  );
}
