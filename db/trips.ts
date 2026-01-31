import type { SQLiteDatabase } from "expo-sqlite";
import type { Trip } from "../types";

const TABLE = "trips";

function rowToTrip(row: Record<string, unknown>): Trip {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description ?? ""),
    title_en: row.title_en != null ? String(row.title_en) : undefined,
    description_en: row.description_en != null ? String(row.description_en) : undefined,
    startDate: row.startDate != null ? String(row.startDate) : null,
    endDate: row.endDate != null ? String(row.endDate) : null,
    createdAt: String(row.createdAt),
    current: Boolean(row.current),
  };
}

export async function getAllTrips(db: SQLiteDatabase): Promise<Trip[]> {
  const rows = await db.getAllAsync(
    `SELECT * FROM ${TABLE} ORDER BY createdAt DESC`
  );
  return (rows as Record<string, unknown>[]).map(rowToTrip);
}

export async function getTripById(
  db: SQLiteDatabase,
  id: string
): Promise<Trip | null> {
  const row = await db.getFirstAsync(`SELECT * FROM ${TABLE} WHERE id = ?`, id);
  if (!row) return null;
  return rowToTrip(row as Record<string, unknown>);
}

export async function getCurrentTrip(
  db: SQLiteDatabase
): Promise<Trip | null> {
  const row = await db.getFirstAsync(
    `SELECT * FROM ${TABLE} WHERE current = 1 LIMIT 1`
  );
  if (!row) return null;
  return rowToTrip(row as Record<string, unknown>);
}

export async function createTrip(
  db: SQLiteDatabase,
  data: Omit<Trip, "id" | "createdAt">
): Promise<Trip> {
  const id = `trip_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const createdAt = new Date().toISOString();

  if (data.current) {
    await db.runAsync(`UPDATE ${TABLE} SET current = 0`);
  }

  await db.runAsync(
    `INSERT INTO ${TABLE} (id, title, description, title_en, description_en, startDate, endDate, createdAt, current)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    data.title,
    data.description ?? "",
    data.title_en ?? "",
    data.description_en ?? "",
    data.startDate ?? null,
    data.endDate ?? null,
    createdAt,
    data.current ? 1 : 0
  );

  return {
    id,
    ...data,
    createdAt,
  };
}

export async function updateTrip(
  db: SQLiteDatabase,
  id: string,
  data: Partial<Omit<Trip, "id" | "createdAt">>
): Promise<void> {
  const trip = await getTripById(db, id);
  if (!trip) return;

  if (data.current === true) {
    await db.runAsync(`UPDATE ${TABLE} SET current = 0`);
  }

  const title = data.title ?? trip.title;
  const description = data.description ?? trip.description;
  const title_en = data.title_en !== undefined ? data.title_en : trip.title_en ?? "";
  const description_en = data.description_en !== undefined ? data.description_en : trip.description_en ?? "";
  const startDate = data.startDate !== undefined ? data.startDate : trip.startDate;
  const endDate = data.endDate !== undefined ? data.endDate : trip.endDate;
  const current = data.current ?? trip.current;

  await db.runAsync(
    `UPDATE ${TABLE} SET title = ?, description = ?, title_en = ?, description_en = ?, startDate = ?, endDate = ?, current = ? WHERE id = ?`,
    title,
    description,
    title_en,
    description_en,
    startDate ?? null,
    endDate ?? null,
    current ? 1 : 0,
    id
  );
}

export async function setCurrentTrip(
  db: SQLiteDatabase,
  tripId: string
): Promise<void> {
  await db.runAsync(`UPDATE ${TABLE} SET current = 0`);
  await db.runAsync(`UPDATE ${TABLE} SET current = 1 WHERE id = ?`, tripId);
}

export async function deleteTrip(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync(`DELETE FROM ${TABLE} WHERE id = ?`, id);
}
