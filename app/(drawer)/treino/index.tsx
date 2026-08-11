import { AppDispatch, RootState } from "@/src/store";
import { carregarTreinos, removerTreino } from "@/src/store/treinoSlice";
import { useFocusEffect } from "@react-navigation/native";
import { Link, router } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function TreinosScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const treinos = useSelector((state: RootState) => state.treinos.lista);
  const loading = useSelector((state: RootState) => state.treinos.loading);

  useFocusEffect(
    useCallback(() => {
      dispatch(carregarTreinos());
    }, [dispatch])
  );

  function handleLongPress(id: number, nome: string) {
    Alert.alert(
      "Excluir Treino",
      `Tem certeza que deseja excluir "${nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await dispatch(removerTreino(id));
            dispatch(carregarTreinos());
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      {loading && treinos.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00b894" />
          <Text style={styles.loadingText}>Carregando treinos...</Text>
        </View>
      ) : (
        <FlatList
          data={treinos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(modals)/treinos/${item.id}`)}
              onLongPress={() => handleLongPress(item.id, item.nome)}
              delayLongPress={400}
              style={styles.treinoCard}
              activeOpacity={0.7}
            >
              <View style={styles.treinoIconContainer}>
                <Text style={styles.treinoIcon}>💪</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.treinoNome}>{item.nome}</Text>
                <Text style={styles.treinoSub}>
                  {item.exercicios?.length
                    ? `${item.exercicios.length} exercício(s)`
                    : "Toque para ver os detalhes"}
                </Text>
              </View>
              <Text style={styles.seta}>›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🏋️</Text>
              <Text style={styles.emptyTitle}>Nenhum treino criado ainda</Text>
              <Text style={styles.emptySub}>
                Crie o seu primeiro treino clicando no botão abaixo!
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.bottomBar}>
        <Link href="/(modals)/treinos/novoTreino" asChild>
          <TouchableOpacity style={styles.btnNovoTreino}>
            <Text style={styles.btnNovoTreinoText}>➕ Criar Novo Treino</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#747d8c",
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  treinoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e1e2e6",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  treinoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  treinoIcon: {
    fontSize: 20,
  },
  treinoNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2f3640",
  },
  treinoSub: {
    fontSize: 12,
    color: "#747d8c",
    marginTop: 2,
  },
  seta: {
    fontSize: 24,
    color: "#a4b0be",
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2f3640",
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: "#747d8c",
    textAlign: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(245, 246, 250, 0.95)",
    borderTopWidth: 1,
    borderColor: "#e1e2e6",
  },
  btnNovoTreino: {
    backgroundColor: "#00b894",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#00b894",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  btnNovoTreinoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

