import type { SQLiteDatabase } from "expo-sqlite";
import type { Place } from "../types";

const TABLE = "places";

function rowToPlace(row: Record<string, unknown>): Place {
  const photosRaw = row.photos;
  const photos: string[] =
    typeof photosRaw === "string" ? JSON.parse(photosRaw) : [];
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    visitlater: Boolean(row.visitlater),
    liked: Boolean(row.liked),
    latitude: row.latitude != null ? Number(row.latitude) : null,
    longitude: row.longitude != null ? Number(row.longitude) : null,
    photos,
    createdAt: String(row.createdAt),
  };
}

export async function getAllPlaces(db: SQLiteDatabase): Promise<Place[]> {
  const rows = await db.getAllAsync(`SELECT * FROM ${TABLE} ORDER BY createdAt DESC`);
  return (rows as Record<string, unknown>[]).map(rowToPlace);
}

export async function getPlaceById(
  db: SQLiteDatabase,
  id: string
): Promise<Place | null> {
  const row = await db.getFirstAsync(`SELECT * FROM ${TABLE} WHERE id = ?`, id);
  if (!row) return null;
  return rowToPlace(row as Record<string, unknown>);
}

export async function createPlace(
  db: SQLiteDatabase,
  data: Omit<Place, "id" | "createdAt">
): Promise<Place> {
  const id = `place_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const createdAt = new Date().toISOString();
  const photosJson = JSON.stringify(data.photos ?? []);

  await db.runAsync(
    `INSERT INTO ${TABLE} (id, name, description, visitlater, liked, latitude, longitude, photos, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    data.name,
    data.description ?? "",
    data.visitlater ? 1 : 0,
    data.liked ? 1 : 0,
    data.latitude ?? null,
    data.longitude ?? null,
    photosJson,
    createdAt
  );

  return {
    id,
    ...data,
    photos: data.photos ?? [],
    createdAt,
  };
}

export async function updatePlace(
  db: SQLiteDatabase,
  id: string,
  data: Partial<Omit<Place, "id" | "createdAt">>
): Promise<void> {
  const place = await getPlaceById(db, id);
  if (!place) return;

  const name = data.name ?? place.name;
  const description = data.description ?? place.description;
  const visitlater = data.visitlater ?? place.visitlater;
  const liked = data.liked ?? place.liked;
  const latitude = data.latitude !== undefined ? data.latitude : place.latitude;
  const longitude =
    data.longitude !== undefined ? data.longitude : place.longitude;
  const photos = data.photos ?? place.photos;
  const photosJson = JSON.stringify(photos);

  await db.runAsync(
    `UPDATE ${TABLE} SET name = ?, description = ?, visitlater = ?, liked = ?, latitude = ?, longitude = ?, photos = ? WHERE id = ?`,
    name,
    description,
    visitlater ? 1 : 0,
    liked ? 1 : 0,
    latitude ?? null,
    longitude ?? null,
    photosJson,
    id
  );
}

export async function deletePlace(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync(`DELETE FROM ${TABLE} WHERE id = ?`, id);
}
