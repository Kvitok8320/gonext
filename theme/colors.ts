import color from "color";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

/**
 * Явные цвета текста для гарантированной читаемости в каждой теме.
 */
export const THEME_TEXT_COLORS = {
  light: {
    primary: "#1C1B1F",
    secondary: "#49454F",
    background: "#F5F5F5",
  },
  dark: {
    primary: "#E6E1E5",
    secondary: "#CAC4D0",
    background: "#1C1B1F",
  },
} as const;

function buildPrimaryPalette(hex: string, isDark: boolean) {
  const c = color(hex);
  const onPrimary = c.luminosity() > 0.5 ? "#000000" : "#FFFFFF";
  return {
    primary: hex,
    primaryContainer: isDark
      ? c.mix(color("#000"), 0.7).hex()
      : c.mix(color("#FFF"), 0.9).hex(),
    onPrimary,
    onPrimaryContainer: isDark
      ? c.mix(color("#FFF"), 0.9).hex()
      : c.mix(color("#000"), 0.8).hex(),
  };
}

/**
 * Светлая тема с кастомным primary цветом.
 */
export function buildAppLightTheme(primaryHex: string) {
  const palette = buildPrimaryPalette(primaryHex, false);
  return {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      ...palette,
      onSurface: THEME_TEXT_COLORS.light.primary,
      onSurfaceVariant: THEME_TEXT_COLORS.light.secondary,
      onBackground: THEME_TEXT_COLORS.light.primary,
    },
  };
}

/**
 * Тёмная тема с кастомным primary цветом.
 */
export function buildAppDarkTheme(primaryHex: string) {
  const palette = buildPrimaryPalette(primaryHex, true);
  return {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      ...palette,
      onSurface: THEME_TEXT_COLORS.dark.primary,
      onSurfaceVariant: THEME_TEXT_COLORS.dark.secondary,
      onBackground: THEME_TEXT_COLORS.dark.primary,
    },
  };
}
