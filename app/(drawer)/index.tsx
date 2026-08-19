import { useAlert } from "@/src/context/AlertContext";
import { useTheme } from "@/src/context/ThemeContext";
import {
  limparSessaoAtiva,
  obterSessaoAtiva,
  SessaoAtivaTreino,
} from "@/src/database/sessaoAtivaRepository";
import { AppDispatch, RootState } from "@/src/store";
import { initializeDatabase } from "@/src/store/databaseSlice";
import { carregarTreinos } from "@/src/store/treinoSlice";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const { showConfirm } = useAlert();

  const initialized = useSelector((state: RootState) => state.database.initialized);
  const treinos = useSelector((state: RootState) => state.treinos.lista);
  const [sessaoAtiva, setSessaoAtiva] = useState<SessaoAtivaTreino | null>(null);

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeDatabase());
    } else {
      dispatch(carregarTreinos());
    }
  }, [initialized, dispatch]);

  useFocusEffect(
    useCallback(() => {
      if (initialized) {
        dispatch(carregarTreinos());
      }
      obterSessaoAtiva().then((sessao) => {
        setSessaoAtiva(sessao);
      });
    }, [initialized, dispatch])
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
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

      {/* Cards de Acesso Rápido */}
      <View style={styles.sectionTitleRow}>
        <Ionicons name="flash-outline" size={18} color={colors.accent} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Acesso Rápido
        </Text>
      </View>

      <View style={styles.gridContainer}>
        {/* Card: Meus Treinos */}
        <TouchableOpacity
          onPress={() => router.push("/treino")}
          activeOpacity={0.8}
          style={[
            styles.cardAcao,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="dumbbell" size={28} color={colors.primary} />
            <View style={[styles.badgeCount, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeCountText}>{treinos.length} Treinos</Text>
            </View>
          </View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Meus Treinos</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Visualize suas fichas e inicie uma sessão com cronômetro de descanso.
          </Text>
        </TouchableOpacity>

        {/* Card: Criar Novo Treino */}
        <TouchableOpacity
          onPress={() => router.push("/(modals)/treinos/novoTreino")}
          activeOpacity={0.8}
          style={[
            styles.cardAcao,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Ionicons name="add-circle-outline" size={28} color={colors.accent} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Novo Treino</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Monte uma nova rotina com séries, repetições e cargas personalizadas.
          </Text>
        </TouchableOpacity>

        {/* Card: Histórico de Treinos */}
        <TouchableOpacity
          onPress={() => router.push("/(drawer)/historico" as any)}
          activeOpacity={0.8}
          style={[
            styles.cardAcao,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Ionicons name="time-outline" size={28} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Histórico de Treinos</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Consulte seus treinos realizados, duração e progressão de cargas.
          </Text>
        </TouchableOpacity>

        {/* Card: Biblioteca de Exercícios */}
        <TouchableOpacity
          onPress={() => router.push("/(drawer)/exercicios" as any)}
          activeOpacity={0.8}
          style={[
            styles.cardAcao,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <MaterialCommunityIcons name="format-list-bulleted" size={28} color={colors.accent} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Biblioteca de Exercícios</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Explore, filtre por grupo muscular e edite seu catálogo de movimentos.
          </Text>
        </TouchableOpacity>

        {/* Card: Configurações & Aparência */}
        <TouchableOpacity
          onPress={() => router.push("/(drawer)/configuracoes" as any)}
          activeOpacity={0.8}
          style={[
            styles.cardAcao,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Ionicons name="color-palette-outline" size={28} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Aparência & Tema</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Alterne entre o Modo Escuro Premium ou Modo Claro.
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  gridContainer: {
    gap: 12,
  },
  cardAcao: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
  badgeCount: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardSessaoAtiva: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    marginBottom: 20,
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
});
