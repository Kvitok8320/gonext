import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  Text,
  useTheme,
} from "react-native-paper";
import { getPlaceById, updatePlace, deletePlace } from "../../../db/places";
import { ensurePlacePhotoDir, saveImageFromPicker } from "../../../utils/photos";
import type { Place } from "../../../types";
import { getPlaceName, getPlaceDescription } from "../../../utils/localize";

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
  const theme = useTheme();
  const { t } = useTranslation();
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
      Alert.alert(t("alerts.error"), t("alerts.photoAccessError"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
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
      Alert.alert(t("alerts.error"), t("alerts.photoSaveError"));
    }
  };

  const handleDeletePhoto = async (index: number) => {
    if (!place) return;
    const newPhotos = place.photos.filter((_, i) => i !== index);
    await updatePlace(db, place.id, { photos: newPhotos });
    setPlace({ ...place, photos: newPhotos });
  };

  const handleDeletePlace = () => {
    Alert.alert(t("alerts.deletePlace"), place ? getPlaceName(place, i18n.language) : "", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title={t("places.place")} />
        </Appbar.Header>
        <View style={styles.center}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{loading ? t("common.loading") : t("common.notFound")}</Text>
        </View>
      </View>
    );
  }

  const hasCoords = place.latitude != null && place.longitude != null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={place.name} />
        <Appbar.Action icon="pencil" onPress={() => router.push(`/places/${place.id}/edit`)} />
        <Appbar.Action icon="delete" onPress={handleDeletePlace} />
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card style={styles.infoCard}>
          <Card.Content style={styles.infoContent}>
            <Text variant="titleLarge" style={[styles.placeName, { color: theme.colors.onSurface }]}>
              {getPlaceName(place, i18n.language)}
            </Text>
            {getPlaceDescription(place, i18n.language) ? (
              <Text variant="bodyMedium" style={[styles.infoRow, { color: theme.colors.onSurface }]}>
                {getPlaceDescription(place, i18n.language)}
              </Text>
            ) : null}
            {hasCoords && (
              <Text variant="bodyMedium" style={[styles.infoRow, { color: theme.colors.onSurface }]}>
                DD: {place.latitude?.toFixed(6)}, {place.longitude?.toFixed(6)}
              </Text>
            )}
            <Text variant="bodyMedium" style={[styles.infoRow, { color: theme.colors.onSurface }]}>
              {t("places.inPlans")}: {place.visitlater ? t("common.yes") : t("common.no")}
            </Text>
            <Text variant="bodyMedium" style={[styles.infoRow, { color: theme.colors.onSurface }]}>
              {t("places.liked")}: {place.liked ? t("common.yes") : t("common.no")}
            </Text>
          </Card.Content>
        </Card>

        {hasCoords && (
          <Button
            mode="contained"
            icon="map"
            onPress={() => openOnMap(place)}
            style={styles.mapButton}
          >
            {t("places.openOnMap")}
          </Button>
        )}

        <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          {t("places.photos")}
        </Text>
        <Button
          mode="outlined"
          icon="camera-plus"
          onPress={handleAddPhoto}
          style={styles.addPhotoButton}
        >
          {t("places.addPhoto")}
        </Button>

        {place.photos.map((path, index) => (
          <View key={path} style={styles.photoBlock}>
            <Image source={{ uri: path }} style={styles.photoImage} />
            <Button
              mode="contained"
              icon="delete"
              onPress={() => handleDeletePhoto(index)}
              buttonColor={theme.colors.error}
              style={styles.deletePhotoButton}
            >
              {t("places.deletePhoto")}
            </Button>
          </View>
        ))}

        {!hasCoords && (
          <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            {t("places.addCoordsHint")}
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
  infoCard: { marginBottom: 16 },
  infoContent: { gap: 4 },
  placeName: { marginBottom: 8 },
  infoRow: { marginBottom: 4 },
  mapButton: { marginBottom: 24 },
  sectionTitle: { marginBottom: 12 },
  addPhotoButton: { marginBottom: 16 },
  photoBlock: { marginBottom: 16 },
  photoImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  deletePhotoButton: {},
  hint: { fontStyle: "italic" },
});
