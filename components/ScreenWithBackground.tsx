import { ImageBackground, StyleSheet, View } from "react-native";

const bgImage = require("../assets/backgrounds/gonext-bg.png");

type ScreenWithBackgroundProps = {
  children: React.ReactNode;
};

export function ScreenWithBackground({ children }: ScreenWithBackgroundProps) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={bgImage}
        style={styles.background}
        resizeMode="cover"
      >
        {children}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width: "100%" },
});
