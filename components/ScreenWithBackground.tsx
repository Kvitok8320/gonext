import { ImageBackground, StyleSheet, View } from "react-native";
import { useThemeMode } from "../hooks/useThemeMode";

const bgImage = require("../assets/backgrounds/gonext-bg.png");

type ScreenWithBackgroundProps = {
  children: React.ReactNode;
};

export function ScreenWithBackground({ children }: ScreenWithBackgroundProps) {
  const { themeMode } = useThemeMode();

  if (themeMode === "dark") {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={bgImage}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        {children}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
});
