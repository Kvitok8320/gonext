import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

/**
 * Явные цвета текста для гарантированной читаемости в каждой теме.
 * Светлая тема: тёмный текст на светлом фоне.
 * Тёмная тема: светлый текст на тёмном фоне.
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

/**
 * Светлая тема с усиленным контрастом текста.
 */
export const AppLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    onSurface: THEME_TEXT_COLORS.light.primary,
    onSurfaceVariant: THEME_TEXT_COLORS.light.secondary,
    onBackground: THEME_TEXT_COLORS.light.primary,
  },
};

/**
 * Тёмная тема с усиленным контрастом текста.
 */
export const AppDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    onSurface: THEME_TEXT_COLORS.dark.primary,
    onSurfaceVariant: THEME_TEXT_COLORS.dark.secondary,
    onBackground: THEME_TEXT_COLORS.dark.primary,
  },
};
