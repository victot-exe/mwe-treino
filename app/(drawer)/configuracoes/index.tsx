import { useAlert } from "@/src/context/AlertContext";
import { ThemeMode, useTheme } from "@/src/context/ThemeContext";
import { resetarCatalogoPadrao } from "@/src/database/database";
import { AppDispatch } from "@/src/store";
import { carregarExercicios } from "@/src/store/exercicioSlice";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";

export default function ConfiguracoesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { colors, themeMode, setThemeMode, isDark } = useTheme();
  const { showAlert, showConfirm } = useAlert();
  const [resetando, setResetando] = useState(false);

  const versaoApp = Constants.expoConfig?.version || "1.1.0";

  const opcoesTema: {
    id: ThemeMode;
    titulo: string;
    icone: keyof typeof Ionicons.glyphMap;
    iconeColor: string;
    desc: string;
  }[] = [
    {
      id: "dark",
      icone: "moon",
      iconeColor: colors.accent,
      titulo: "Modo Escuro",
      desc: "Visual escuro premium, ideal para economizar bateria e conforto visual.",
    },
    {
      id: "light",
      icone: "sunny",
      iconeColor: "#eab308",
      titulo: "Modo Claro",
      desc: "Visual claro e contrastante para ambientes bem iluminados.",
    },
    {
      id: "auto",
      icone: "phone-portrait-outline",
      iconeColor: colors.primary,
      titulo: "Automático",
      desc: "Acompanha o tema configurado nas configurações do seu celular.",
    },
  ];

  const handleRestaurarCatalogo = () => {
    showConfirm(
      "Restaurar Catálogo",
      "Deseja limpar duplicidades e restaurar o catálogo oficial de 45 exercícios? Seus treinos criados não serão apagados.",
      async () => {
        setResetando(true);
        try {
          await resetarCatalogoPadrao();
          await dispatch(carregarExercicios());
          showAlert(
            "Sucesso!",
            "O catálogo foi restaurado e todas as duplicidades foram removidas com sucesso.",
            "success"
          );
        } catch (error) {
          console.error(error);
          showAlert("Erro", "Não foi possível restaurar o catálogo.", "error");
        } finally {
          setResetando(false);
        }
      },
      false,
      "Restaurar"
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Seção de Aparência */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <Ionicons name="color-palette-outline" size={22} color={colors.accent} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Aparência do App
          </Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Escolha o tema visual da sua preferência
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {opcoesTema.map((opcao) => {
          const selecionado = themeMode === opcao.id;

          return (
            <TouchableOpacity
              key={opcao.id}
              onPress={() => setThemeMode(opcao.id)}
              activeOpacity={0.7}
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selecionado ? colors.primary : colors.cardBorder,
                  borderWidth: selecionado ? 2 : 1,
                },
              ]}
            >
              <View style={styles.optionRow}>
                <View
                  style={[
                    styles.optionIconContainer,
                    { backgroundColor: colors.cardSecondary },
                  ]}
                >
                  <Ionicons name={opcao.icone} size={22} color={opcao.iconeColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>
                    {opcao.titulo}
                  </Text>
                  <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                    {opcao.desc}
                  </Text>
                </View>

                {selecionado && (
                  <View style={[styles.badgeAtivo, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={14} color="#fff" style={{ marginRight: 2 }} />
                    <Text style={styles.badgeAtivoText}>Ativo</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Seção de Gerenciamento de Dados */}
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <MaterialCommunityIcons name="database-cog-outline" size={22} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Gerenciamento de Dados
          </Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Ações de manutenção do banco de dados local
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          onPress={handleRestaurarCatalogo}
          disabled={resetando}
          activeOpacity={0.7}
          style={[
            styles.optionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.optionRow}>
            <View
              style={[
                styles.optionIconContainer,
                { backgroundColor: colors.cardSecondary },
              ]}
            >
              {resetando ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <MaterialCommunityIcons
                  name="database-sync"
                  size={22}
                  color={colors.primary}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Restaurar Catálogo de Exercícios
              </Text>
              <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                Remove duplicidades e restaura os 45 exercícios oficiais organizados por grupo muscular.
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Card Informativo do App */}
      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.infoTitle, { color: colors.text }]}>
            Sobre o MWE Treino
          </Text>
        </View>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          • Banco de Dados: SQLite Local (100% Offline)
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          • Tema Atual: {isDark ? "Escuro (Dark Mode)" : "Claro (Light Mode)"}
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          • Versão: {versaoApp}
        </Text>
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
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  badgeAtivo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeAtivoText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  infoCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

