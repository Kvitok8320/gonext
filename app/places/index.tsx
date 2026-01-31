import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  StyleSheet,
  View,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import {
  Appbar,
  FAB,
  List,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { getAllPlaces } from "../../db/places";
import type { Place } from "../../types";
import { ScreenWithBackground } from "../../components/ScreenWithBackground";

export default function PlacesScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const theme = useTheme();
  const { t } = useTranslation();
  const [places, setPlaces] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllPlaces(db);
      setPlaces(list);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadPlaces();
    }, [loadPlaces])
  );

  const filteredPlaces = searchQuery.trim()
    ? places.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : places;

  return (
    <ScreenWithBackground>
      <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={t("places.title")} />
      </Appbar.Header>

      <Searchbar
        placeholder={t("places.search")}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {loading ? (
        <View style={styles.center}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>{t("common.loading")}</Text>
        </View>
      ) : filteredPlaces.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
            {searchQuery.trim() ? t("places.nothingFound") : t("places.noPlaces")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.description || t("places.noDescription")}
              left={(props) => (
                <List.Icon {...props} icon={item.liked ? "heart" : "map-marker"} />
              )}
              onPress={() => router.push(`/places/${item.id}`)}
            />
          )}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/places/add")}
        label={t("places.add")}
      />
      </View>
    </ScreenWithBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { margin: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  fab: { position: "absolute", right: 16, bottom: 54 },
});
