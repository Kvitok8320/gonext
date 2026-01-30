import { useRouter } from "expo-router";
import { ImageBackground, StyleSheet, View } from "react-native";
import { Appbar, Button, Surface, Text } from "react-native-paper";

const bgImage = require("../assets/backgrounds/gonext-bg.png");

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <Appbar.Header>
        <Appbar.Content title="GoNext" />
      </Appbar.Header>

      <Surface style={styles.content} elevation={0}>
        <Text variant="titleMedium" style={styles.subtitle}>
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
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
  },
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
