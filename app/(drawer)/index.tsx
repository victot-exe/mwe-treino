import { useTheme } from "@/src/context/ThemeContext";
import { AppDispatch, RootState } from "@/src/store";
import { initializeDatabase } from "@/src/store/databaseSlice";
import { carregarTreinos } from "@/src/store/treinoSlice";
import { router } from "expo-router";
import { useEffect } from "react";
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

  const initialized = useSelector((state: RootState) => state.database.initialized);
  const treinos = useSelector((state: RootState) => state.treinos.lista);

  useEffect(() => {
    if (!initialized) {
      dispatch(initializeDatabase());
    } else {
      dispatch(carregarTreinos());
    }
  }, [initialized, dispatch]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Banner de Boas-Vindas */}
      <View
        style={[
          styles.heroCard,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <Text style={styles.heroEmoji}>🔥 🏋️‍♂️</Text>
        <Text style={[styles.heroTitle, { color: colors.text }]}>MWE Treino</Text>
        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
          Seu diário de treinos e evolução de cargas inteligente e 100% offline.
        </Text>
      </View>

      {/* Cards de Acesso Rápido */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ Acesso Rápido</Text>

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
            <Text style={styles.cardIcon}>💪</Text>
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
          <Text style={styles.cardIcon}>➕</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Novo Treino</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Monte uma nova rotina com séries, repetições e cargas personalizadas.
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
          <Text style={styles.cardIcon}>🎨</Text>
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
  heroCard: {
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  heroEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
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
});
