import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import {
  Appbar,
  List,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { getAllPlaces } from "../../../db/places";
import { getTripPlacesByTripId, addTripPlace } from "../../../db/tripPlaces";
import type { Place } from "../../../types";
import { getPlaceName, getPlaceDescription } from "../../../utils/localize";
import { ScreenWithBackground } from "../../../components/ScreenWithBackground";

export default function AddPlaceToTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const db = useSQLiteContext();
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [tripPlaceIds, setTripPlaceIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [allPlaces, tripPlaces] = await Promise.all([
        getAllPlaces(db),
        getTripPlacesByTripId(db, id),
      ]);
      setPlaces(allPlaces);
      setTripPlaceIds(new Set(tripPlaces.map((tp) => tp.placeId)));
    } finally {
      setLoading(false);
    }
  }, [db, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const lang = i18n.language;
  const filteredPlaces = searchQuery.trim()
    ? places.filter(
        (p) =>
          getPlaceName(p, lang).toLowerCase().includes(searchQuery.toLowerCase()) ||
          getPlaceDescription(p, lang).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : places;

  const availablePlaces = filteredPlaces.filter(
    (p) => !tripPlaceIds.has(p.id)
  );

  const handleAdd = async (place: Place) => {
    const tripPlaces = await getTripPlacesByTripId(db, id!);
    const order = tripPlaces.length + 1;
    await addTripPlace(db, id!, place.id, order);
    setTripPlaceIds((prev) => new Set(prev).add(place.id));
  };

  return (
    <ScreenWithBackground>
      <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("trips.addPlaceToTrip")} />
      </Appbar.Header>

      <Searchbar
        placeholder={t("trips.searchPlaces")}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {loading ? (
        <View style={styles.center}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{t("common.loading")}</Text>
        </View>
      ) : availablePlaces.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
            {searchQuery.trim()
              ? t("places.nothingFound")
              : t("trips.allPlacesAdded")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={availablePlaces}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={getPlaceName(item, lang)}
              description={getPlaceDescription(item, lang) || t("places.noDescription")}
              right={(props) => (
                <List.Icon {...props} icon="plus" />
              )}
              onPress={() => handleAdd(item)}
            />
          )}
        />
      )}
      </View>
    </ScreenWithBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { margin: 8 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
});
