import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";
import {
  Appbar,
  Card,
  Chip,
  FAB,
  List,
  Text,
  useTheme,
} from "react-native-paper";
import { getAllTrips } from "../../db/trips";
import { getTripTitle, getTripDescription } from "../../utils/localize";
import type { Trip } from "../../types";
import { ScreenWithBackground } from "../../components/ScreenWithBackground";

export default function TripsScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllTrips(db);
      setTrips(list);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips])
  );

  const locale = i18n.language === "ru" ? "ru-RU" : "en-US";
  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" }) : "—";

  return (
    <ScreenWithBackground>
      <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("trips.title")} />
      </Appbar.Header>

      {loading ? (
        <View style={styles.center}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{t("common.loading")}</Text>
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{t("trips.noTrips")}</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card
              style={[
                styles.card,
                item.current && { ...styles.cardCurrent, borderColor: theme.colors.primary },
              ]}
              onPress={() => router.push(`/trips/${item.id}`)}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Text variant="titleMedium">{item.title}</Text>
                  {item.current && (
                    <Chip compact icon="map-marker" style={styles.currentChip}>
                      {t("trips.current")}
                    </Chip>
                  )}
                </View>
                {getTripDescription(item, i18n.language) ? (
                  <Text variant="bodySmall" numberOfLines={2} style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
                    {getTripDescription(item, i18n.language)}
                  </Text>
                ) : null}
                <Text variant="labelSmall" style={[styles.dates, { color: theme.colors.onSurfaceVariant }]}>
                  {formatDate(item.startDate)} — {formatDate(item.endDate)}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/trips/add")}
        label={t("trips.addTrip")}
      />
      </View>
    </ScreenWithBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  list: { padding: 16, paddingBottom: 80 },
  card: { marginBottom: 12 },
  cardCurrent: { borderWidth: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  currentChip: { alignSelf: "flex-start" },
  desc: { marginTop: 4 },
  dates: { marginTop: 8 },
  fab: { position: "absolute", right: 16, bottom: 54 },
});
