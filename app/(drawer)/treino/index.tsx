import { useAlert } from "@/src/context/AlertContext";
import { useTheme } from "@/src/context/ThemeContext";
import {
  limparSessaoAtiva,
  obterSessaoAtiva,
  SessaoAtivaTreino,
} from "@/src/database/sessaoAtivaRepository";
import { AppDispatch, RootState } from "@/src/store";
import { carregarTreinos, removerTreino } from "@/src/store/treinoSlice";
import { Treino } from "@/src/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
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
  const [sessaoAtiva, setSessaoAtiva] = useState<SessaoAtivaTreino | null>(null);

  useFocusEffect(
    useCallback(() => {
      dispatch(carregarTreinos());
      obterSessaoAtiva().then((sessao) => {
        setSessaoAtiva(sessao);
      });
    }, [dispatch])
  );

  const calcularExerciciosConcluidos = (prog: { [key: number]: any }) => {
    if (!prog) return "0 exercícios";
    const total = Object.keys(prog).length;
    const concluidos = Object.values(prog).filter((p: any) => p.concluido).length;
    return `${concluidos} de ${total} exercícios concluídos`;
  };

  const handleDescartarSessaoAtiva = () => {
    showConfirm(
      "Descartar Treino em Andamento",
      "Tem certeza que deseja descartar esta sessão? O progresso não finalizado será perdido.",
      async () => {
        await limparSessaoAtiva();
        setSessaoAtiva(null);
      },
      true,
      "Descartar Treino",
      "Manter Treino"
    );
  };

  function handleLongPress(id: number, nome: string) {
    showConfirm(
      "Excluir Treino",
      `Tem certeza que deseja excluir "${nome}"?`,
      async () => {
        if (sessaoAtiva && sessaoAtiva.treinoId === id) {
          await limparSessaoAtiva();
          setSessaoAtiva(null);
        }
        await dispatch(removerTreino(id));
        dispatch(carregarTreinos());
      },
      true,
      "Excluir"
    );
  }

  const handlePressTreino = (item: Treino) => {
    if (sessaoAtiva && sessaoAtiva.treinoId === item.id) {
      router.push(`/(modals)/treinos/treinar/${item.id}`);
    } else {
      router.push(`/(modals)/treinos/${item.id}`);
    }
  };

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
              {/* Banner de Treino em Andamento */}
              {sessaoAtiva ? (
                <View
                  style={[
                    styles.cardSessaoAtiva,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.accent,
                    },
                  ]}
                >
                  <View style={styles.sessaoAtivaHeader}>
                    <View style={[styles.sessaoAtivaBadge, { backgroundColor: colors.accent }]}>
                      <Ionicons name="flash" size={13} color="#fff" style={{ marginRight: 4 }} />
                      <Text style={styles.sessaoAtivaBadgeText}>TREINO EM ANDAMENTO</Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleDescartarSessaoAtiva}
                      style={styles.sessaoAtivaBtnDescartar}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.sessaoAtivaNome, { color: colors.text }]}>
                    {sessaoAtiva.nomeTreino}
                  </Text>

                  <Text style={[styles.sessaoAtivaInfo, { color: colors.textSecondary }]}>
                    {calcularExerciciosConcluidos(sessaoAtiva.progresso)}
                  </Text>

                  <View style={styles.sessaoAtivaActions}>
                    <TouchableOpacity
                      onPress={() =>
                        router.push(`/(modals)/treinos/treinar/${sessaoAtiva.treinoId}`)
                      }
                      style={[styles.btnContinuarTreino, { backgroundColor: colors.accent }]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="play" size={16} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.btnContinuarTreinoText}>Continuar Treino</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

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
              onPress={() => handlePressTreino(item)}
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
  cardSessaoAtiva: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  sessaoAtivaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sessaoAtivaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sessaoAtivaBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  sessaoAtivaBtnDescartar: {
    padding: 4,
  },
  sessaoAtivaNome: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sessaoAtivaInfo: {
    fontSize: 13,
    marginBottom: 14,
  },
  sessaoAtivaActions: {
    flexDirection: "row",
  },
  btnContinuarTreino: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnContinuarTreinoText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
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
