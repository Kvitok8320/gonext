import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Appbar, Button, Surface, Text, useTheme } from "react-native-paper";
import { ScreenWithBackground } from "../components/ScreenWithBackground";

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <ScreenWithBackground>
      <Appbar.Header>
        <Appbar.Content title={t("home.title")} />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        <Text variant="titleMedium" style={[styles.subtitle, { color: theme.colors.onSurface }]}>
          {t("home.subtitle")}
        </Text>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push("/places")}
        >
          {t("home.places")}
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push("/trips")}
        >
          {t("home.trips")}
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push("/next-place")}
        >
          {t("home.nextPlace")}
        </Button>
        <Button
          mode="contained"
          style={styles.button}
          onPress={() => router.push("/settings")}
        >
          {t("home.settings")}
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
