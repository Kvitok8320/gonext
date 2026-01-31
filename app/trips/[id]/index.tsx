import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import {
  Appbar,
  Button,
  Card,
  Checkbox,
  Chip,
  IconButton,
  List,
  Text,
  useTheme,
} from "react-native-paper";
import {
  getTripById,
  updateTrip,
  deleteTrip,
  setCurrentTrip,
} from "../../../db/trips";
import {
  getTripPlacesWithPlaceByTripId,
  updateTripPlace,
  reorderTripPlaces,
  deleteTripPlace,
} from "../../../db/tripPlaces";
import type { Trip } from "../../../types";
import type { TripPlaceWithPlace } from "../../../types";
import { ScreenWithBackground } from "../../../components/ScreenWithBackground";

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const theme = useTheme();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [places, setPlaces] = useState<TripPlaceWithPlace[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [t, pl] = await Promise.all([
        getTripById(db, id),
        getTripPlacesWithPlaceByTripId(db, id),
      ]);
      setTrip(t ?? null);
      setPlaces(pl);
    } finally {
      setLoading(false);
    }
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleReorder = async (index: number, direction: "up" | "down") => {
    if (places.length < 2) return;
    const newOrder = [...places];
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= newOrder.length) return;
    [newOrder[index], newOrder[swap]] = [newOrder[swap], newOrder[index]];
    const ids = newOrder.map((p) => p.id);
    await reorderTripPlaces(db, id!, ids);
    setPlaces(newOrder);
  };

  const handleToggleVisited = async (tp: TripPlaceWithPlace) => {
    const visited = !tp.visited;
    const visitDate = visited ? new Date().toISOString().slice(0, 10) : null;
    await updateTripPlace(db, tp.id, { visited, visitDate });
    setPlaces((prev) =>
      prev.map((p) =>
        p.id === tp.id ? { ...p, visited, visitDate } : p
      )
    );
  };

  const handleSetCurrent = async () => {
    if (!trip) return;
    await setCurrentTrip(db, trip.id);
    setTrip({ ...trip, current: true });
  };

  const handleDeletePlace = (tp: TripPlaceWithPlace) => {
    Alert.alert("Удалить место из маршрута?", tp.place.name, [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          await deleteTripPlace(db, tp.id);
          setPlaces((prev) => prev.filter((p) => p.id !== tp.id));
        },
      },
    ]);
  };

  const handleDeleteTrip = () => {
    Alert.alert("Удалить поездку?", trip?.title ?? "", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          if (!trip) return;
          await deleteTrip(db, trip.id);
          router.back();
        },
      },
    ]);
  };

  const formatDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  if (loading || !trip) {
    return (
      <ScreenWithBackground>
        <View style={styles.container}>
          <Appbar.Header>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title="Поездка" />
          </Appbar.Header>
          <View style={styles.center}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
              {loading ? "Загрузка..." : "Не найдено"}
            </Text>
          </View>
        </View>
      </ScreenWithBackground>
    );
  }

  const visitedCount = places.filter((p) => p.visited).length;

  return (
    <ScreenWithBackground>
      <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={trip.title} />
        <Appbar.Action
          icon="pencil"
          onPress={() => router.push(`/trips/${trip.id}/edit`)}
        />
        <Appbar.Action icon="delete" onPress={handleDeleteTrip} />
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            {trip.description ? (
              <Text variant="bodyMedium" style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
                {trip.description}
              </Text>
            ) : null}
            <Text variant="labelSmall" style={[styles.dates, { color: theme.colors.onSurfaceVariant }]}>
              {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
            </Text>
            <View style={styles.chips}>
              {trip.current && (
                <Chip compact icon="map-marker">
                  Текущая поездка
                </Chip>
              )}
              {!trip.current && (
                <Button
                  mode="outlined"
                  compact
                  onPress={handleSetCurrent}
                  style={styles.setCurrentBtn}
                >
                  Сделать текущей
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>

        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>Маршрут</Text>
          <Text variant="bodySmall" style={[styles.progress, { color: theme.colors.onSurfaceVariant }]}>
            {visitedCount} / {places.length} посещено
          </Text>
        </View>

        {places.length === 0 ? (
          <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
            Нет мест в маршруте. Добавьте первое!
          </Text>
        ) : (
          places.map((tp, index) => (
            <Card key={tp.id} style={styles.placeCard}>
              <List.Item
                title={tp.place.name}
                description={
                  tp.visited && tp.visitDate
                    ? `Посещено: ${formatDate(tp.visitDate)}`
                    : tp.place.description || undefined
                }
                left={() => (
                  <View style={styles.listLeft}>
                    <Checkbox
                      status={tp.visited ? "checked" : "unchecked"}
                      onPress={() => handleToggleVisited(tp)}
                    />
                    <Text variant="labelLarge" style={styles.order}>
                      {index + 1}
                    </Text>
                  </View>
                )}
                right={() => (
                  <View style={styles.listRight}>
                    <IconButton
                      icon="chevron-up"
                      size={20}
                      onPress={() => handleReorder(index, "up")}
                      disabled={index === 0}
                    />
                    <IconButton
                      icon="chevron-down"
                      size={20}
                      onPress={() => handleReorder(index, "down")}
                      disabled={index === places.length - 1}
                    />
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => handleDeletePlace(tp)}
                    />
                  </View>
                )}
                onPress={() =>
                  router.push(`/trips/${trip.id}/place/${tp.id}`)
                }
              />
            </Card>
          ))
        )}

        <Button
          mode="outlined"
          icon="plus"
          onPress={() => router.push(`/trips/${trip.id}/add-place`)}
          style={styles.addPlaceBtn}
        >
          Добавить место
        </Button>
      </ScrollView>
      </View>
    </ScreenWithBackground>
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
  desc: { marginBottom: 8 },
  dates: { marginBottom: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  setCurrentBtn: { alignSelf: "flex-start" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progress: {},
  empty: { marginBottom: 16, fontStyle: "italic" },
  placeCard: { marginBottom: 8 },
  listLeft: { flexDirection: "row", alignItems: "center" },
  order: { minWidth: 24, textAlign: "center" },
  listRight: { flexDirection: "row" },
  addPlaceBtn: { marginTop: 16 },
});
