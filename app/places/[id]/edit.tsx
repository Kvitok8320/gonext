import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
} from "react-native-paper";
import { getPlaceById, updatePlace } from "../../../db/places";

export default function EditPlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visitlater, setVisitlater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadPlace = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const p = await getPlaceById(db, id);
      if (p) {
        setName(p.name);
        setDescription(p.description);
        setVisitlater(p.visitlater);
        setLiked(p.liked);
        setLatitude(p.latitude != null ? String(p.latitude) : "");
        setLongitude(p.longitude != null ? String(p.longitude) : "");
      }
    } finally {
      setLoading(false);
    }
  }, [db, id]);

  useEffect(() => {
    loadPlace();
  }, [loadPlace]);

  const lat = latitude.trim() ? parseFloat(latitude) : null;
  const lon = longitude.trim() ? parseFloat(longitude) : null;

  const handleSave = async () => {
    if (!id) return;
    if (!name.trim()) {
      setError("Введите название");
      return;
    }
    if (lat != null && (isNaN(lat) || lat < -90 || lat > 90)) {
      setError("Широта: от -90 до 90");
      return;
    }
    if (lon != null && (isNaN(lon) || lon < -180 || lon > 180)) {
      setError("Долгота: от -180 до 180");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await updatePlace(db, id, {
        name: name.trim(),
        description: description.trim(),
        visitlater,
        liked,
        latitude: lat,
        longitude: lon,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Редактирование" />
        </Appbar.Header>
        <View style={styles.center}>
          <Text variant="bodyLarge">Загрузка...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Редактировать место" />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <TextInput
            label="Название *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Описание"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />
          <View style={styles.row}>
            <Checkbox.Item
              label="Хочу посетить"
              status={visitlater ? "checked" : "unchecked"}
              onPress={() => setVisitlater(!visitlater)}
            />
          </View>
          <View style={styles.row}>
            <Checkbox.Item
              label="Понравилось"
              status={liked ? "checked" : "unchecked"}
              onPress={() => setLiked(!liked)}
            />
          </View>
          <Text variant="labelMedium" style={styles.label}>
            Координаты (Decimal Degrees)
          </Text>
          <View style={styles.coordsRow}>
            <TextInput
              label="Широта"
              value={latitude}
              onChangeText={setLatitude}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder="-90...90"
              style={styles.coordInput}
            />
            <TextInput
              label="Долгота"
              value={longitude}
              onChangeText={setLongitude}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder="-180...180"
              style={styles.coordInput}
            />
          </View>
          {error ? (
            <Text variant="bodySmall" style={styles.error}>
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
            Сохранить
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  keyboard: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  input: { marginBottom: 12 },
  row: { marginBottom: 0 },
  label: { marginTop: 8, marginBottom: 4 },
  coordsRow: { flexDirection: "row", gap: 12 },
  coordInput: { flex: 1, marginBottom: 12 },
  error: { color: "red", marginBottom: 8 },
  button: { marginTop: 16 },
});
