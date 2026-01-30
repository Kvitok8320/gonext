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
  IconButton,
  Text,
  TextInput,
} from "react-native-paper";
import { getTripPlaceById, updateTripPlace } from "../../../../db/tripPlaces";
import { ensureTripPlacePhotoDir, saveImageFromPicker } from "../../../../utils/photos";
import type { TripPlaceWithPlace } from "../../../../types";

function openOnMap(lat: number, lon: number) {
  const url = `https://www.google.com/maps?q=${lat},${lon}`;
  Linking.openURL(url);
}

export default function TripPlaceDetailScreen() {
  const { id, tripPlaceId } = useLocalSearchParams<{
    id: string;
    tripPlaceId: string;
  }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const [tripPlace, setTripPlace] = useState<TripPlaceWithPlace | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!tripPlaceId) return;
    setLoading(true);
    try {
      const tp = await getTripPlaceById(db, tripPlaceId);
      if (tp) {
        const { getPlaceById } = await import("../../../../db/places");
        const place = await getPlaceById(db, tp.placeId);
        if (place) {
          setTripPlace({ ...tp, place });
          setNotes(tp.notes);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [db, tripPlaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveNotes = async () => {
    if (!tripPlace) return;
    await updateTripPlace(db, tripPlace.id, { notes });
    setTripPlace({ ...tripPlace, notes });
  };

  const handleAddPhoto = async () => {
    if (!tripPlace) return;
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
      const dir = await ensureTripPlacePhotoDir(tripPlace.id);
      const filename = `photo_${Date.now()}.jpg`;
      const destPath = await saveImageFromPicker(
        result.assets[0],
        dir,
        filename
      );
      const newPhotos = [...tripPlace.photos, destPath];
      await updateTripPlace(db, tripPlace.id, { photos: newPhotos });
      setTripPlace({ ...tripPlace, photos: newPhotos });
    } catch (err) {
      Alert.alert("Ошибка", "Не удалось сохранить фото");
    }
  };

  const handleDeletePhoto = async (index: number) => {
    if (!tripPlace) return;
    const newPhotos = tripPlace.photos.filter((_, i) => i !== index);
    await updateTripPlace(db, tripPlace.id, { photos: newPhotos });
    setTripPlace({ ...tripPlace, photos: newPhotos });
  };

  if (loading || !tripPlace) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Место" />
        </Appbar.Header>
        <View style={styles.center}>
          <Text variant="bodyLarge">
            {loading ? "Загрузка..." : "Не найдено"}
          </Text>
        </View>
      </View>
    );
  }

  const { place } = tripPlace;
  const hasCoords = place.latitude != null && place.longitude != null;
  const formatDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={place.name} />
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            {place.description ? (
              <Text variant="bodyMedium" style={styles.desc}>
                {place.description}
              </Text>
            ) : null}
            {tripPlace.visited && tripPlace.visitDate && (
              <Text variant="labelSmall" style={styles.visitDate}>
                Посещено: {formatDate(tripPlace.visitDate)}
              </Text>
            )}
          </Card.Content>
        </Card>

        <Text variant="titleSmall" style={styles.sectionTitle}>
          Заметки
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={4}
          placeholder="Заметки о посещении..."
          style={styles.notesInput}
          onBlur={handleSaveNotes}
        />

        <Text variant="titleSmall" style={styles.sectionTitle}>
          Фотографии
        </Text>
        <View style={styles.photosRow}>
          {tripPlace.photos.map((path, index) => (
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
            <IconButton
              icon="camera-plus"
              size={32}
              onPress={handleAddPhoto}
            />
            <Text variant="labelSmall">Добавить</Text>
          </View>
        </View>

        {hasCoords && (
          <Button
            mode="contained"
            icon="map"
            onPress={() =>
              openOnMap(place.latitude!, place.longitude!)
            }
            style={styles.mapButton}
          >
            Открыть на карте
          </Button>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 16 },
  desc: { marginBottom: 4 },
  visitDate: { color: "#666" },
  sectionTitle: { marginBottom: 8 },
  notesInput: { marginBottom: 16 },
  photosRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photoWrapper: { position: "relative" },
  photo: { width: 80, height: 80, borderRadius: 8 },
  photoDelete: { position: "absolute", top: -8, right: -8, margin: 0 },
  addPhotoBtn: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 8,
  },
  mapButton: { marginTop: 24 },
});
