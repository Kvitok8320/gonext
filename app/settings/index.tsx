import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import Constants from "expo-constants";
import {
  Appbar,
  Divider,
  List,
  Text,
} from "react-native-paper";
import { resetAllData } from "../../db";

export default function SettingsScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
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
          text: "Удалить всё",
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
  };

  return (
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
          <List.Subheader>Данные</List.Subheader>
          <List.Item
            title="Сбросить все данные"
            description="Удалить места, поездки и фото"
            left={(props) => <List.Icon {...props} icon="delete-forever" />}
            onPress={handleResetData}
            disabled={resetting}
          />
        </List.Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
});
