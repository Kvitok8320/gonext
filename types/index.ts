/**
 * Типы сущностей приложения GoNext (по PROJECT.md).
 */

/** Место — хранилище мест для посещения или уже посещённых. */
export interface Place {
  id: string;
  name: string;
  description: string;
  visitlater: boolean;
  liked: boolean;
  /** Широта (Decimal Degrees). */
  latitude: number | null;
  /** Долгота (Decimal Degrees). */
  longitude: number | null;
  /** Пути к файлам фотографий (локальное хранилище). */
  photos: string[];
  createdAt: string; // ISO 8601
}

/** Поездка — маршрут с датами и упорядоченным списком мест. */
export interface Trip {
  id: string;
  title: string;
  description: string;
  startDate: string | null; // ISO date
  endDate: string | null;
  createdAt: string;
  /** Признак текущей (активной) поездки. */
  current: boolean;
}

/** Место в поездке — связь поездки с местом + факт посещения. */
export interface TripPlace {
  id: string;
  tripId: string;
  placeId: string;
  /** Порядок в маршруте (1-based). */
  order: number;
  visited: boolean;
  visitDate: string | null; // ISO date
  notes: string;
  /** Пути к файлам фотографий, сделанных при посещении. */
  photos: string[];
  createdAt: string;
}

/** Место в поездке с подтянутыми данными места (для экранов). */
export interface TripPlaceWithPlace extends TripPlace {
  place: Place;
}
