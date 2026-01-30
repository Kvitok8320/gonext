import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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
} from "react-native-paper";
import { useRouter } from "expo-router";
import { getAllPlaces } from "../../db/places";
import type { Place } from "../../types";

export default function PlacesScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
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
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Места" />
      </Appbar.Header>

      <Searchbar
        placeholder="Поиск мест..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {loading ? (
        <View style={styles.center}>
          <Text variant="bodyLarge">Загрузка...</Text>
        </View>
      ) : filteredPlaces.length === 0 ? (
        <View style={styles.center}>
          <Text variant="bodyLarge">
            {searchQuery.trim() ? "Ничего не найдено" : "Нет мест. Добавьте первое!"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              title={item.name}
              description={item.description || "Без описания"}
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
        label="Добавить"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { margin: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  fab: { position: "absolute", right: 16, bottom: 54 },
});
