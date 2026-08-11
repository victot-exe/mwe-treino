import { useAlert } from "@/src/context/AlertContext";
import { useTheme } from "@/src/context/ThemeContext";
import {
  deleteHistoricoSessao,
  getAllHistoricoSessoes,
} from "@/src/database/historicoRepository";
import { HistoricoSessao } from "@/src/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HistoricoScreen() {
  const { colors } = useTheme();
  const { showConfirm } = useAlert();
  const [sessoes, setSessoes] = useState<HistoricoSessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessoesExpandidas, setSessoesExpandidas] = useState<{
    [id: number]: boolean;
  }>({});

  const carregarHistorico = useCallback(async () => {
    try {
      const dados = await getAllHistoricoSessoes();
      setSessoes(dados);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarHistorico();
    }, [carregarHistorico])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarHistorico();
  };

  const toggleExpand = (id: number) => {
    setSessoesExpandidas((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const confirmarExclusao = (sessao: HistoricoSessao) => {
    showConfirm(
      "Excluir Registro",
      `Deseja realmente remover o registro de ${sessao.nome_treino} do histórico?`,
      async () => {
        await deleteHistoricoSessao(sessao.id);
        carregarHistorico();
      },
      true,
      "Excluir"
    );
  };

  const formatarData = (isoString: string) => {
    try {
      const data = new Date(isoString);
      const agora = new Date();

      const mesmoDia =
        data.getDate() === agora.getDate() &&
        data.getMonth() === agora.getMonth() &&
        data.getFullYear() === agora.getFullYear();

      const ontem = new Date(agora);
      ontem.setDate(agora.getDate() - 1);
      const foiOntem =
        data.getDate() === ontem.getDate() &&
        data.getMonth() === ontem.getMonth() &&
        data.getFullYear() === ontem.getFullYear();

      const horas = data.getHours().toString().padStart(2, "0");
      const minutos = data.getMinutes().toString().padStart(2, "0");
      const horaStr = `${horas}:${minutos}`;

      if (mesmoDia) return `Hoje às ${horaStr}`;
      if (foiOntem) return `Ontem às ${horaStr}`;

      const dia = data.getDate().toString().padStart(2, "0");
      const mes = (data.getMonth() + 1).toString().padStart(2, "0");
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano} às ${horaStr}`;
    } catch {
      return isoString;
    }
  };

  const formatarDuracao = (segundos: number) => {
    if (segundos < 60) return `${segundos}s`;
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    if (min < 60) {
      return seg > 0 ? `${min}m ${seg}s` : `${min} min`;
    }
    const horas = Math.floor(min / 60);
    const restoMin = min % 60;
    return `${horas}h ${restoMin}m`;
  };

  const renderSessaoItem = ({ item }: { item: HistoricoSessao }) => {
    const expandido = !!sessoesExpandidas[item.id];
    const totalExercicios = item.total_exercicios || (item.exercicios?.length ?? 0);
    const concluidos = item.exercicios_concluidos ?? 0;
    const taxaConclusao = totalExercicios > 0 ? (concluidos / totalExercicios) * 100 : 100;

    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        {/* Cabeçalho do Card */}
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTreinoNome, { color: colors.text }]}>
              {item.nome_treino}
            </Text>
            <View style={styles.cardDataRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
              <Text style={[styles.cardData, { color: colors.textSecondary }]}>
                {formatarData(item.data_inicio)}
              </Text>
            </View>
          </View>

          {/* Botão de Excluir */}
          <TouchableOpacity
            onPress={() => confirmarExclusao(item)}
            style={[styles.btnDelete, { backgroundColor: colors.cardSecondary }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Badges de Resumo */}
        <View style={styles.badgesRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.accentLight, borderColor: colors.cardBorder },
            ]}
          >
            <Ionicons name="time-outline" size={13} color={colors.accent} />
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              {formatarDuracao(item.duracao_segundos)}
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              taxaConclusao === 100
                ? { backgroundColor: colors.successLight }
                : { backgroundColor: colors.cardSecondary },
            ]}
          >
            <Ionicons
              name={taxaConclusao === 100 ? "checkmark-circle" : "checkmark-circle-outline"}
              size={13}
              color={taxaConclusao === 100 ? colors.success : colors.textSecondary}
            />
            <Text
              style={[
                styles.badgeText,
                taxaConclusao === 100
                  ? { color: colors.success }
                  : { color: colors.textSecondary },
              ]}
            >
              {concluidos}/{totalExercicios} feitos
            </Text>
          </View>
        </View>

        {/* Botão de Expansão */}
        <TouchableOpacity
          onPress={() => toggleExpand(item.id)}
          style={[
            styles.btnExpandir,
            { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
          ]}
          activeOpacity={0.7}
        >
          <Text style={[styles.btnExpandirText, { color: colors.primary }]}>
            {expandido ? "Ocultar Detalhes" : "Ver Exercícios e Cargas"}
          </Text>
          <Ionicons
            name={expandido ? "chevron-up" : "chevron-down"}
            size={14}
            color={colors.primary}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        {/* Lista de Exercícios Realizados (Accordion) */}
        {expandido && (
          <View
            style={[
              styles.detalhesContainer,
              { borderColor: colors.cardBorder, backgroundColor: colors.inputBg },
            ]}
          >
            {item.exercicios && item.exercicios.length > 0 ? (
              item.exercicios.map((ex, idx) => (
                <View
                  key={ex.id || idx}
                  style={[
                    styles.exercicioRow,
                    idx < item.exercicios!.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.cardBorder,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.exercicioNome, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {ex.nome_exercicio}
                    </Text>
                    <Text style={[styles.exercicioSub, { color: colors.textSecondary }]}>
                      {ex.series_feitas} séries • {ex.repeticoes} reps
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.cargaBadge,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    ]}
                  >
                    <Text style={[styles.cargaValor, { color: colors.accent }]}>
                      {ex.carga} kg
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text
                style={[
                  styles.semDetalhesText,
                  { color: colors.textSecondary },
                ]}
              >
                Nenhum exercício registrado nesta sessão.
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Carregando histórico...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={sessoes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSessaoItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          sessoes.length > 0 ? (
            <View style={styles.headerInfo}>
              <Text style={[styles.headerCount, { color: colors.textSecondary }]}>
                Total de <Text style={{ color: colors.primary, fontWeight: "bold" }}>{sessoes.length}</Text> {sessoes.length === 1 ? "treino registrado" : "treinos registrados"}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: colors.cardSecondary },
              ]}
            >
              <MaterialCommunityIcons name="history" size={42} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Nenhum treino no histórico
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Finalize um treino na aba "Treinos" para que ele fique registrado automaticamente aqui com suas cargas e tempos!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(drawer)/treino")}
              style={[styles.btnIrTreinar, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="dumbbell" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.btnIrTreinarText}>Iniciar um Treino</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerInfo: {
    marginBottom: 12,
  },
  headerCount: {
    fontSize: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTreinoNome: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardData: {
    fontSize: 13,
  },
  btnDelete: {
    padding: 8,
    borderRadius: 10,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  btnExpandir: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnExpandirText: {
    fontSize: 13,
    fontWeight: "600",
  },
  detalhesContainer: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  exercicioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  exercicioNome: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  exercicioSub: {
    fontSize: 12,
  },
  cargaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  cargaValor: {
    fontSize: 14,
    fontWeight: "bold",
  },
  semDetalhesText: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 10,
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  btnIrTreinar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  btnIrTreinarText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
