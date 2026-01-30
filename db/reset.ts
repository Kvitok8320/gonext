import type { SQLiteDatabase } from "expo-sqlite";
import * as FileSystem from "expo-file-system/legacy";

const PHOTOS_BASE_DIR = `${FileSystem.documentDirectory}gonext_photos`;

/**
 * Удаляет все данные из БД и каталога с фото.
 */
export async function resetAllData(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    DELETE FROM trip_place_photos;
    DELETE FROM trip_places;
    DELETE FROM place_photos;
    DELETE FROM places;
    DELETE FROM trips;
  `);

  const info = await FileSystem.getInfoAsync(PHOTOS_BASE_DIR);
  if (info.exists) {
    await FileSystem.deleteAsync(PHOTOS_BASE_DIR, { idempotent: true });
  }
}
