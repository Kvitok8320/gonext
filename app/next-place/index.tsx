import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Linking, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import {
  Appbar,
  Button,
  Card,
  Text,
} from "react-native-paper";
import { getCurrentTrip } from "../../db/trips";
import { getTripPlacesWithPlaceByTripId } from "../../db/tripPlaces";
import type { TripPlaceWithPlace } from "../../types";
import { ScreenWithBackground } from "../../components/ScreenWithBackground";

function openOnMap(lat: number, lon: number) {
  const url = `https://www.google.com/maps?q=${lat},${lon}`;
  Linking.openURL(url);
}

function openInNavigator(lat: number, lon: number) {
  const url =
    Platform.OS === "ios"
      ? `https://maps.apple.com/?daddr=${lat},${lon}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
  Linking.openURL(url);
}

export default function NextPlaceScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<{
    currentTrip: { id: string; title: string } | null;
    nextPlace: TripPlaceWithPlace | null;
    placeCount: number;
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const currentTrip = await getCurrentTrip(db);
      if (!currentTrip) {
        setState({ currentTrip: null, nextPlace: null, placeCount: 0 });
        return;
      }
      const places = await getTripPlacesWithPlaceByTripId(db, currentTrip.id);
      const first = places.find((tp) => !tp.visited) ?? null;
      setState({
        currentTrip: { id: currentTrip.id, title: currentTrip.title },
        nextPlace: first,
        placeCount: places.length,
      });
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) {
    return (
      <ScreenWithBackground>
        <View style={styles.container}>
          <Appbar.Header>
            <Appbar.BackAction onPress={() => router.back()} />
            <Appbar.Content title="Следующее место" />
          </Appbar.Header>
          <View style={styles.center}>
            <Text variant="bodyLarge">Загрузка...</Text>
          </View>
        </View>
      </ScreenWithBackground>
    );
  }

  const noCurrentTrip = !state || state.currentTrip === null;
  const noPlacesInRoute = state?.currentTrip && state.placeCount === 0;
  const allVisited =
    state?.currentTrip && state.placeCount > 0 && !state?.nextPlace;
  const hasNextPlace = !!state?.nextPlace;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Следующее место" />
      </Appbar.Header>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {noCurrentTrip && (
          <View style={styles.center}>
            <Text variant="bodyLarge" style={styles.message}>
              Нет текущей поездки
            </Text>
            <Text variant="bodySmall" style={styles.hint}>
              Создайте поездку или выберите текущую в разделе «Поездки»
            </Text>
            <Button
              mode="contained"
              icon="map-marker"
              onPress={() => router.push("/trips")}
              style={styles.actionButton}
            >
              Перейти к поездкам
            </Button>
          </View>
        )}

        {noPlacesInRoute && state?.currentTrip && (
          <View style={styles.center}>
            <Text variant="bodyLarge" style={styles.message}>
              Нет мест в маршруте
            </Text>
            <Text variant="bodySmall" style={styles.hint}>
              Добавьте места в поездку «{state.currentTrip.title}»
            </Text>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => router.push(`/trips/${state.currentTrip!.id}`)}
              style={styles.actionButton}
            >
              Добавить места
            </Button>
          </View>
        )}

        {allVisited && state?.currentTrip && (
          <View style={styles.center}>
            <Text variant="bodyLarge" style={styles.message}>
              Все места посещены!
            </Text>
            <Text variant="bodySmall" style={styles.hint}>
              Отличная поездка в «{state.currentTrip.title}»
            </Text>
            <Button
              mode="contained-tonal"
              icon="map-marker"
              onPress={() => router.push(`/trips/${state.currentTrip!.id}`)}
              style={styles.actionButton}
            >
              Открыть поездку
            </Button>
          </View>
        )}

        {hasNextPlace && state?.nextPlace && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleLarge" style={styles.placeName}>
                  {state.nextPlace.place.name}
                </Text>
                {state.nextPlace.place.description ? (
                  <Text variant="bodyMedium" style={styles.description}>
                    {state.nextPlace.place.description}
                  </Text>
                ) : null}
                {state.nextPlace.place.latitude != null &&
                  state.nextPlace.place.longitude != null && (
                    <Text variant="labelSmall" style={styles.coords}>
                      {state.nextPlace.place.latitude.toFixed(6)},{" "}
                      {state.nextPlace.place.longitude.toFixed(6)}
                    </Text>
                  )}
              </Card.Content>
            </Card>

            {state.nextPlace.place.latitude != null &&
            state.nextPlace.place.longitude != null ? (
              <View style={styles.buttons}>
                <Button
                  mode="contained"
                  icon="map"
                  onPress={() =>
                    openOnMap(
                      state.nextPlace!.place.latitude!,
                      state.nextPlace!.place.longitude!
                    )
                  }
                  style={styles.button}
                >
                  Открыть на карте
                </Button>
                <Button
                  mode="contained-tonal"
                  icon="navigation"
                  onPress={() =>
                    openInNavigator(
                      state.nextPlace!.place.latitude!,
                      state.nextPlace!.place.longitude!
                    )
                  }
                  style={styles.button}
                >
                  Открыть в навигаторе
                </Button>
              </View>
            ) : (
              <Text variant="bodySmall" style={styles.noCoords}>
                Добавьте координаты места, чтобы открыть на карте
              </Text>
            )}
          </>
        )}
      </ScrollView>
      </View>
    </ScreenWithBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, padding: 16 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  message: { textAlign: "center", marginBottom: 8 },
  hint: { textAlign: "center", color: "#666", marginBottom: 16 },
  actionButton: { marginTop: 8 },
  card: { marginBottom: 24 },
  placeName: { marginBottom: 8 },
  description: { color: "#555", marginBottom: 8 },
  coords: { color: "#888" },
  buttons: { gap: 12 },
  button: { marginBottom: 12 },
  noCoords: { color: "#666", fontStyle: "italic" },
});
