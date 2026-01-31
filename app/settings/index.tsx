import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import Constants from "expo-constants";
import {
  Appbar,
  Button,
  Divider,
  List,
  Switch,
} from "react-native-paper";
import { resetAllData } from "../../db";
import { ScreenWithBackground } from "../../components/ScreenWithBackground";
import { useThemeMode } from "../../hooks/useThemeMode";

export default function SettingsScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { themeMode, setThemeMode } = useThemeMode();
  const [resetting, setResetting] = useState(false);

  const appVersion =
    Constants.expoConfig?.version ?? Constants.manifest?.version ?? "1.0.0";

  const handleResetData = () => {
    Alert.alert(
      "Сброс данных",
      "Удалить все места, поездки и фотографии? Это действие нельзя отменить.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Продолжить",
          onPress: () => {
            Alert.alert(
              "Подтверждение",
              "Вы уверены? Все данные будут удалены безвозвратно.",
              [
                { text: "Отмена", style: "cancel" },
                {
                  text: "Да, удалить всё",
                  style: "destructive",
                  onPress: async () => {
                    setResetting(true);
                    try {
                      await resetAllData(db);
                      router.replace("/");
                    } catch {
                      Alert.alert("Ошибка", "Не удалось сбросить данные");
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
        <Appbar.Content title="Настройки" />
      </Appbar.Header>

      <ScrollView style={styles.scroll}>
        <List.Section>
          <List.Subheader>О приложении</List.Subheader>
          <List.Item
            title="GoNext — Дневник туриста"
            description={`Версия ${appVersion}`}
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title="Данные хранятся только на устройстве"
            description="Приложение работает офлайн"
            left={(props) => <List.Icon {...props} icon="cellphone" />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Внешний вид</List.Subheader>
          <List.Item
            title="Тёмная тема"
            description={themeMode === "dark" ? "Включена" : "Выключена"}
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
          <List.Subheader>Данные</List.Subheader>
        </List.Section>
        <Button
          mode="contained-tonal"
          icon="delete-forever"
          onPress={handleResetData}
          disabled={resetting}
          style={styles.resetButton}
          textColor="#C62828"
        >
          Сбросить все данные
        </Button>
      </ScrollView>
      </View>
    </ScreenWithBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  resetButton: { marginHorizontal: 16, marginBottom: 24 },
});
