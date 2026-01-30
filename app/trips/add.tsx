import { useRouter } from "expo-router";
import { useState } from "react";
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
import { createTrip } from "../../db/trips";

export default function AddTripScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const parseDate = (s: string) => {
    const trimmed = s.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Введите название");
      return;
    }
    const sd = parseDate(startDate);
    const ed = parseDate(endDate);
    if (sd && ed && sd > ed) {
      setError("Дата начала не может быть позже даты окончания");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await createTrip(db, {
        title: title.trim(),
        description: description.trim(),
        startDate: sd,
        endDate: ed,
        current,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Создать поездку" />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <TextInput
            label="Название *"
            value={title}
            onChangeText={setTitle}
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
          <Text variant="labelMedium" style={styles.label}>
            Даты
          </Text>
          <TextInput
            label="Дата начала"
            value={startDate}
            onChangeText={setStartDate}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />
          <TextInput
            label="Дата окончания"
            value={endDate}
            onChangeText={setEndDate}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />
          <View style={styles.row}>
            <Checkbox.Item
              label="Текущая поездка"
              status={current ? "checked" : "unchecked"}
              onPress={() => setCurrent(!current)}
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
            Создать
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  error: { color: "red", marginBottom: 8 },
  button: { marginTop: 16 },
});
