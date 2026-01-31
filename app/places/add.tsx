import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import {
  Appbar,
  Button,
  Checkbox,
  TextInput,
  Text,
  useTheme,
} from "react-native-paper";
import { createPlace } from "../../db/places";
import { ScreenWithBackground } from "../../components/ScreenWithBackground";

export default function AddPlaceScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const theme = useTheme();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visitlater, setVisitlater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const lat = latitude.trim() ? parseFloat(latitude) : null;
  const lon = longitude.trim() ? parseFloat(longitude) : null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t("places.errorName"));
      return;
    }
    if (lat != null && (isNaN(lat) || lat < -90 || lat > 90)) {
      setError(t("places.errorLatitude"));
      return;
    }
    if (lon != null && (isNaN(lon) || lon < -180 || lon > 180)) {
      setError(t("places.errorLongitude"));
      return;
    }
    setError("");
    setSaving(true);
    try {
      await createPlace(db, {
        name: name.trim(),
        description: description.trim(),
        visitlater,
        liked,
        latitude: lat,
        longitude: lon,
        photos: [],
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWithBackground>
      <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("places.addPlace")} />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <TextInput
            label={t("places.nameLabel")}
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label={t("places.descriptionLabel")}
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          <View style={styles.row}>
            <Checkbox.Item
              label={t("places.wantToVisit")}
              status={visitlater ? "checked" : "unchecked"}
              onPress={() => setVisitlater(!visitlater)}
            />
          </View>
          <View style={styles.row}>
            <Checkbox.Item
              label={t("places.liked")}
              status={liked ? "checked" : "unchecked"}
              onPress={() => setLiked(!liked)}
            />
          </View>
          <Text variant="labelMedium" style={styles.label}>
            {t("places.coordsLabel")}
          </Text>
          <View style={styles.coordsRow}>
            <TextInput
              label={t("places.latitudeLabel")}
              value={latitude}
              onChangeText={setLatitude}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder="-90...90"
              style={styles.coordInput}
            />
            <TextInput
              label={t("places.longitudeLabel")}
              value={longitude}
              onChangeText={setLongitude}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder="-180...180"
              style={styles.coordInput}
            />
          </View>
          {error ? (
            <Text variant="bodySmall" style={[styles.error, { color: theme.colors.error }]}>
              {error}
            </Text>
          ) : null}
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.button}
          >
            {t("common.save")}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
      </View>
    </ScreenWithBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboard: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  input: { marginBottom: 12 },
  row: { marginBottom: 0 },
  label: { marginTop: 8, marginBottom: 4 },
  coordsRow: { flexDirection: "row", gap: 12 },
  coordInput: { flex: 1, marginBottom: 12 },
  error: { marginBottom: 8 },
  button: { marginTop: 16 },
});
