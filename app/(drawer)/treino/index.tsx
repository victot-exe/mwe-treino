import { useAlert } from "@/src/context/AlertContext";
import { useTheme } from "@/src/context/ThemeContext";
import { AppDispatch, RootState } from "@/src/store";
import { carregarTreinos, removerTreino } from "@/src/store/treinoSlice";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function TreinosScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const { showConfirm } = useAlert();

  const treinos = useSelector((state: RootState) => state.treinos.lista);
  const loading = useSelector((state: RootState) => state.treinos.loading);

  useFocusEffect(
    useCallback(() => {
      dispatch(carregarTreinos());
    }, [dispatch])
  );

  function handleLongPress(id: number, nome: string) {
    showConfirm(
      "Excluir Treino",
      `Tem certeza que deseja excluir "${nome}"?`,
      async () => {
        await dispatch(removerTreino(id));
        dispatch(carregarTreinos());
      },
      true,
      "Excluir"
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && treinos.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando treinos...
          </Text>
        </View>
      ) : (
        <FlatList
          data={treinos}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.headerSection}>
              {/* Card de Criar Novo Treino no Padrão da Tela Inicial */}
              <TouchableOpacity
                onPress={() => router.push("/(modals)/treinos/novoTreino")}
                activeOpacity={0.8}
                style={[
                  styles.cardNovoTreino,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.novoTreinoRow}>
                  <View
                    style={[
                      styles.novoTreinoIconContainer,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.novoTreinoTitle, { color: colors.text }]}>
                      Criar Novo Treino
                    </Text>
                    <Text
                      style={[
                        styles.novoTreinoSubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Monte uma nova rotina com séries, reps e cargas
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </View>
              </TouchableOpacity>

              {/* Título da Seção */}
              {treinos.length > 0 && (
                <View style={styles.sectionTitleRow}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <MaterialCommunityIcons name="dumbbell" size={18} color={colors.accent} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Meus Treinos ({treinos.length})
                    </Text>
                  </View>
                  <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
                    Segure para excluir
                  </Text>
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(modals)/treinos/${item.id}`)}
              onLongPress={() => handleLongPress(item.id, item.nome)}
              delayLongPress={400}
              style={[
                styles.treinoCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.treinoIconContainer,
                  { backgroundColor: colors.accentLight },
                ]}
              >
                <MaterialCommunityIcons name="dumbbell" size={22} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.treinoNome, { color: colors.text }]}>{item.nome}</Text>
                <Text style={[styles.treinoSub, { color: colors.textSecondary }]}>
                  {item.exercicios?.length
                    ? `${item.exercicios.length} exercício(s) configurado(s)`
                    : "Toque para ver os detalhes"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: colors.cardSecondary },
                ]}
              >
                <MaterialCommunityIcons name="dumbbell" size={42} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Nenhum treino criado ainda
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Toque no card acima para montar a sua primeira ficha de treino!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 16,
  },
  cardNovoTreino: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  novoTreinoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  novoTreinoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  novoTreinoIcon: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  novoTreinoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  novoTreinoSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  setaNovo: {
    fontSize: 26,
    fontWeight: "bold",
    marginLeft: 8,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },
  sectionHint: {
    fontSize: 11,
  },
  treinoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  treinoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  treinoIcon: {
    fontSize: 20,
  },
  treinoNome: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  treinoSub: {
    fontSize: 12,
  },
  seta: {
    fontSize: 24,
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 30,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
