/**
 * 10 preset primary colors for выбора основной темы.
 */
export const PRIMARY_COLOR_PRESETS = [
  "#6750A4", // фиолетовый (по умолчанию)
  "#1976D2", // синий
  "#00897B", // бирюзовый
  "#43A047", // зелёный
  "#E65100", // оранжевый
  "#D32F2F", // красный
  "#7B1FA2", // пурпурный
  "#5E35B1", // тёмно-фиолетовый
  "#0288D1", // голубой
  "#388E3C", // тёмно-зелёный
] as const;

export const DEFAULT_PRIMARY = PRIMARY_COLOR_PRESETS[0];
