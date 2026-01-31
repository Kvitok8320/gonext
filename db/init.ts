import type { SQLiteDatabase } from "expo-sqlite";

const DATABASE_VERSION = 2;

/**
 * Миграции при первом запуске: создаёт таблицы places, trips, trip_places,
 * place_photos, trip_place_photos.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS places (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        name_en TEXT NOT NULL DEFAULT '',
        description_en TEXT NOT NULL DEFAULT '',
        visitlater INTEGER NOT NULL DEFAULT 1,
        liked INTEGER NOT NULL DEFAULT 0,
        latitude REAL,
        longitude REAL,
        photos TEXT NOT NULL DEFAULT '[]',
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS place_photos (
        id TEXT PRIMARY KEY NOT NULL,
        placeId TEXT NOT NULL,
        path TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (placeId) REFERENCES places(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS trips (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        title_en TEXT NOT NULL DEFAULT '',
        description_en TEXT NOT NULL DEFAULT '',
        startDate TEXT,
        endDate TEXT,
        createdAt TEXT NOT NULL,
        current INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS trip_places (
        id TEXT PRIMARY KEY NOT NULL,
        tripId TEXT NOT NULL,
        placeId TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        visited INTEGER NOT NULL DEFAULT 0,
        visitDate TEXT,
        notes TEXT NOT NULL DEFAULT '',
        photos TEXT NOT NULL DEFAULT '[]',
        createdAt TEXT NOT NULL,
        FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE,
        FOREIGN KEY (placeId) REFERENCES places(id)
      );

      CREATE TABLE IF NOT EXISTS trip_place_photos (
        id TEXT PRIMARY KEY NOT NULL,
        tripPlaceId TEXT NOT NULL,
        path TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (tripPlaceId) REFERENCES trip_places(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_place_photos_placeId ON place_photos(placeId);
      CREATE INDEX IF NOT EXISTS idx_trip_places_tripId ON trip_places(tripId);
      CREATE INDEX IF NOT EXISTS idx_trip_places_placeId ON trip_places(placeId);
      CREATE INDEX IF NOT EXISTS idx_trip_place_photos_tripPlaceId ON trip_place_photos(tripPlaceId);
    `);
  }

  if (currentVersion === 1) {
    await db.execAsync(`ALTER TABLE places ADD COLUMN name_en TEXT DEFAULT ''`);
    await db.execAsync(`ALTER TABLE places ADD COLUMN description_en TEXT DEFAULT ''`);
    await db.execAsync(`ALTER TABLE trips ADD COLUMN title_en TEXT DEFAULT ''`);
    await db.execAsync(`ALTER TABLE trips ADD COLUMN description_en TEXT DEFAULT ''`);
  }

  await db.runAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
