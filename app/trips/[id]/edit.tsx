import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { getTripById, updateTrip } from "../../../db/trips";
import { ScreenWithBackground } from "../../../components/ScreenWithBackground";

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const theme = useTheme();
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [current, setCurrent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTrip = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const t = await getTripById(db, id);
      if (t) {
        setTitle(t.title);
        setDescription(t.description);
        setStartDate(t.startDate ?? "");
        setEndDate(t.endDate ?? "");
        setCurrent(t.current);
      }
    } finally {
      setLoading(false);
    }
  }, [db, id]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  const parseDate = (s: string) => {
    const trimmed = s.trim();
    if (!trimmed) return null;
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  };

  const handleSave = async () => {
    if (!id) return;
    if (!title.trim()) {
      setError(t("trips.errorName"));
      return;
    }
    const sd = parseDate(startDate);
    const ed = parseDate(endDate);
    if (sd && ed && sd > ed) {
      setError(t("trips.errorDates"));
      return;
    }
    setError("");
    setSaving(true);
    try {
      await updateTrip(db, id, {
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

  if (loading) {
    return (
      <ScreenWithBackground>
        <View style={styles.container}>
          <Appbar.Header>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title={t("edit.title")} />
          </Appbar.Header>
          <View style={styles.center}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{t("common.loading")}</Text>
          </View>
        </View>
      </ScreenWithBackground>
    );
  }

  return (
    <ScreenWithBackground>
      <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Редактировать поездку" />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <TextInput
            label={t("trips.nameLabel")}
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label={t("trips.descriptionLabel")}
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
            label={t("trips.startDateLabel")}
            value={startDate}
            onChangeText={setStartDate}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />
          <TextInput
            label={t("trips.endDateLabel")}
            value={endDate}
            onChangeText={setEndDate}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />
          <View style={styles.row}>
            <Checkbox.Item
              label={t("trips.currentTrip")}
              status={current ? "checked" : "unchecked"}
              onPress={() => setCurrent(!current)}
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
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  keyboard: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  input: { marginBottom: 12 },
  row: { marginBottom: 0 },
  label: { marginTop: 8, marginBottom: 4 },
  error: { marginBottom: 8 },
  button: { marginTop: 16 },
});
