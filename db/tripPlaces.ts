import type { SQLiteDatabase } from "expo-sqlite";
import type { TripPlace, TripPlaceWithPlace } from "../types";
import { getPlaceById } from "./places";

const TABLE = "trip_places";

function rowToTripPlace(row: Record<string, unknown>): TripPlace {
  const photosRaw = row.photos;
  const photos: string[] =
    typeof photosRaw === "string" ? JSON.parse(photosRaw) : [];
  return {
    id: String(row.id),
    tripId: String(row.tripId),
    placeId: String(row.placeId),
    order: Number(row.order),
    visited: Boolean(row.visited),
    visitDate: row.visitDate != null ? String(row.visitDate) : null,
    notes: String(row.notes ?? ""),
    photos,
    createdAt: String(row.createdAt),
  };
}

export async function getTripPlacesByTripId(
  db: SQLiteDatabase,
  tripId: string
): Promise<TripPlace[]> {
  const rows = await db.getAllAsync(
    `SELECT * FROM ${TABLE} WHERE tripId = ? ORDER BY "order" ASC`,
    tripId
  );
  return (rows as Record<string, unknown>[]).map(rowToTripPlace);
}

export async function getTripPlacesWithPlaceByTripId(
  db: SQLiteDatabase,
  tripId: string
): Promise<TripPlaceWithPlace[]> {
  const tripPlaces = await getTripPlacesByTripId(db, tripId);
  const result: TripPlaceWithPlace[] = [];
  for (const tp of tripPlaces) {
    const place = await getPlaceById(db, tp.placeId);
    if (place) {
      result.push({ ...tp, place });
    }
  }
  return result;
}

export async function getTripPlaceById(
  db: SQLiteDatabase,
  id: string
): Promise<TripPlace | null> {
  const row = await db.getFirstAsync(`SELECT * FROM ${TABLE} WHERE id = ?`, id);
  if (!row) return null;
  return rowToTripPlace(row as Record<string, unknown>);
}

export async function addTripPlace(
  db: SQLiteDatabase,
  tripId: string,
  placeId: string,
  order: number
): Promise<TripPlace> {
  const id = `tp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const createdAt = new Date().toISOString();
  const photosJson = "[]";

  await db.runAsync(
    `INSERT INTO ${TABLE} (id, tripId, placeId, "order", visited, visitDate, notes, photos, createdAt)
     VALUES (?, ?, ?, ?, 0, NULL, '', ?, ?)`,
    id,
    tripId,
    placeId,
    order,
    photosJson,
    createdAt
  );

  return {
    id,
    tripId,
    placeId,
    order,
    visited: false,
    visitDate: null,
    notes: "",
    photos: [],
    createdAt,
  };
}

export async function updateTripPlace(
  db: SQLiteDatabase,
  id: string,
  data: Partial<
    Pick<TripPlace, "order" | "visited" | "visitDate" | "notes" | "photos">
  >
): Promise<void> {
  const tp = await getTripPlaceById(db, id);
  if (!tp) return;

  const order = data.order ?? tp.order;
  const visited = data.visited ?? tp.visited;
  const visitDate = data.visitDate !== undefined ? data.visitDate : tp.visitDate;
  const notes = data.notes ?? tp.notes;
  const photos = data.photos ?? tp.photos;
  const photosJson = JSON.stringify(photos);

  await db.runAsync(
    `UPDATE ${TABLE} SET "order" = ?, visited = ?, visitDate = ?, notes = ?, photos = ? WHERE id = ?`,
    order,
    visited ? 1 : 0,
    visitDate ?? null,
    notes,
    photosJson,
    id
  );
}

export async function reorderTripPlaces(
  db: SQLiteDatabase,
  tripId: string,
  tripPlaceIdsInOrder: string[]
): Promise<void> {
  for (let i = 0; i < tripPlaceIdsInOrder.length; i++) {
    await db.runAsync(
      `UPDATE ${TABLE} SET "order" = ? WHERE id = ? AND tripId = ?`,
      i + 1,
      tripPlaceIdsInOrder[i],
      tripId
    );
  }
}

export async function deleteTripPlace(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync(`DELETE FROM ${TABLE} WHERE id = ?`, id);
}
