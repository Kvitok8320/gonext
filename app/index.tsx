import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Appbar, Button, Surface, Text, useTheme } from "react-native-paper";
import { ScreenWithBackground } from "../components/ScreenWithBackground";

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <ScreenWithBackground>
      <Appbar.Header>
        <Appbar.Content title="GoNext" />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        <Text variant="titleMedium" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
          Дневник туриста
        </Text>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push("/places")}
        >
          Места
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push("/trips")}
        >
          Поездки
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push("/next-place")}
        >
          Следующее место
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push("/settings")}
        >
          Настройки
        </Button>
      </Surface>
    </ScreenWithBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
    backgroundColor: "transparent",
  },
  subtitle: {
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    marginBottom: 12,
  },
});
