import * as FileSystem from "expo-file-system";

const BASE_DIR = `${FileSystem.documentDirectory}gonext_photos`;

/**
 * Каталог для фотографий мест: {documentDirectory}/gonext_photos/places/
 */
export function getPlacesPhotosDir(): string {
  return `${BASE_DIR}/places`;
}

/**
 * Каталог для фотографий мест в поездке: {documentDirectory}/gonext_photos/trip_places/
 */
export function getTripPlacesPhotosDir(): string {
  return `${BASE_DIR}/trip_places`;
}

/**
 * Создаёт каталог для фото места (если не существует).
 * Возвращает путь к каталогу: .../places/{placeId}/
 */
export async function ensurePlacePhotoDir(placeId: string): Promise<string> {
  const dir = `${getPlacesPhotosDir()}/${placeId}`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

/**
 * Создаёт каталог для фото места в поездке (если не существует).
 * Возвращает путь к каталогу: .../trip_places/{tripPlaceId}/
 */
export async function ensureTripPlacePhotoDir(
  tripPlaceId: string
): Promise<string> {
  const dir = `${getTripPlacesPhotosDir()}/${tripPlaceId}`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}
