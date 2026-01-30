import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSQLiteContext } from "expo-sqlite";
import {
  Appbar,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Text,
} from "react-native-paper";
import { getPlaceById, updatePlace, deletePlace } from "../../../db/places";
import { ensurePlacePhotoDir, saveImageFromPicker } from "../../../utils/photos";
import type { Place } from "../../../types";

function openOnMap(place: Place) {
  if (place.latitude == null || place.longitude == null) {
    return;
  }
  const url = `https://www.google.com/maps?q=${place.latitude},${place.longitude}`;
  Linking.openURL(url);
}

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPlace = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await getPlaceById(db, id);
      setPlace(p ?? null);
    } finally {
      setLoading(false);
    }
  }, [db, id]);

  useEffect(() => {
    loadPlace();
  }, [loadPlace]);

  const handleAddPhoto = async () => {
    if (!place) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Ошибка", "Нужен доступ к фото");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
    });
    if (result.canceled || !result.assets[0]) return;
    try {
      const dir = await ensurePlacePhotoDir(place.id);
      const filename = `photo_${Date.now()}.jpg`;
      const destPath = await saveImageFromPicker(
        result.assets[0],
        dir,
        filename
      );
      const newPhotos = [...place.photos, destPath];
      await updatePlace(db, place.id, { photos: newPhotos });
      setPlace({ ...place, photos: newPhotos });
    } catch (err) {
      Alert.alert("Ошибка", "Не удалось сохранить фото");
    }
  };

  const handleDeletePhoto = async (index: number) => {
    if (!place) return;
    const newPhotos = place.photos.filter((_, i) => i !== index);
    await updatePlace(db, place.id, { photos: newPhotos });
    setPlace({ ...place, photos: newPhotos });
  };

  const handleDeletePlace = () => {
    Alert.alert("Удалить место?", place?.name ?? "", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          if (!place) return;
          await deletePlace(db, place.id);
          router.back();
        },
      },
    ]);
  };

  if (loading || !place) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Место" />
        </Appbar.Header>
        <View style={styles.center}>
          <Text variant="bodyLarge">{loading ? "Загрузка..." : "Не найдено"}</Text>
        </View>
      </View>
    );
  }

  const hasCoords = place.latitude != null && place.longitude != null;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={place.name} />
        <Appbar.Action icon="pencil" onPress={() => router.push(`/places/${place.id}/edit`)} />
        <Appbar.Action icon="delete" onPress={handleDeletePlace} />
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.chips}>
              {place.visitlater && <Chip icon="map-marker">Хочу посетить</Chip>}
              {place.liked && <Chip icon="heart">Понравилось</Chip>}
            </View>
            {place.description ? (
              <Text variant="bodyLarge" style={styles.description}>
                {place.description}
              </Text>
            ) : null}
            {hasCoords && (
              <Text variant="bodySmall" style={styles.coords}>
                {place.latitude?.toFixed(6)}, {place.longitude?.toFixed(6)}
              </Text>
            )}
          </Card.Content>
        </Card>

        <Text variant="titleMedium" style={styles.sectionTitle}>
          Фотографии
        </Text>
        <View style={styles.photosRow}>
          {place.photos.map((path, index) => (
            <View key={path} style={styles.photoWrapper}>
              <Image source={{ uri: path }} style={styles.photo} />
              <IconButton
                icon="close"
                size={20}
                style={styles.photoDelete}
                onPress={() => handleDeletePhoto(index)}
              />
            </View>
          ))}
          <View style={styles.addPhotoBtn}>
            <IconButton icon="camera-plus" size={32} onPress={handleAddPhoto} />
            <Text variant="labelSmall">Добавить</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        {hasCoords && (
          <Button
            mode="contained"
            icon="map"
            onPress={() => openOnMap(place)}
            style={styles.mapButton}
          >
            Открыть на карте
          </Button>
        )}
        {!hasCoords && (
          <Text variant="bodySmall" style={styles.hint}>
            Добавьте координаты при редактировании, чтобы открыть место на карте.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  description: { marginTop: 8 },
  coords: { marginTop: 8, color: "#666" },
  sectionTitle: { marginBottom: 8 },
  photosRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photoWrapper: { position: "relative" },
  photo: { width: 80, height: 80, borderRadius: 8 },
  photoDelete: { position: "absolute", top: -8, right: -8, margin: 0 },
  addPhotoBtn: { width: 80, height: 80, justifyContent: "center", alignItems: "center", borderWidth: 1, borderStyle: "dashed", borderRadius: 8 },
  divider: { marginVertical: 16 },
  mapButton: { marginTop: 8 },
  hint: { color: "#666", fontStyle: "italic" },
});
