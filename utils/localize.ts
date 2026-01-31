import type { Place, Trip } from "../types";

/**
 * Возвращает локализованное название места.
 */
export function getPlaceName(place: Place, lang: string): string {
  if (lang === "en" && place.name_en?.trim()) {
    return place.name_en.trim();
  }
  return place.name;
}

/**
 * Возвращает локализованное описание места.
 */
export function getPlaceDescription(place: Place, lang: string): string {
  if (lang === "en" && place.description_en?.trim()) {
    return place.description_en.trim();
  }
  return place.description ?? "";
}

/**
 * Возвращает локализованное название поездки.
 */
export function getTripTitle(trip: Trip, lang: string): string {
  if (lang === "en" && trip.title_en?.trim()) {
    return trip.title_en.trim();
  }
  return trip.title;
}

/**
 * Возвращает локализованное описание поездки.
 */
export function getTripDescription(trip: Trip, lang: string): string {
  if (lang === "en" && trip.description_en?.trim()) {
    return trip.description_en.trim();
  }
  return trip.description ?? "";
}
