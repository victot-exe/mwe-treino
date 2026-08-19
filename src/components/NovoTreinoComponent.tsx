import { useAlert } from "@/src/context/AlertContext";
import { useTheme } from "@/src/context/ThemeContext";
import { carregarExercicios, removerExercicio } from "@/src/store/exercicioSlice";
import { adicionarTreino } from "@/src/store/treinoSlice";
import { Exercicio, ExercicioConfigItem, GRUPOS_MUSCULARES } from "@/src/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Link, router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import {
  adicionarExercicioAoTreino,
  carregarExerciciosDoTreino,
} from "../store/exercicioTreinoSlice";

interface CardExercicioSelecionadoProps {
  item: ExercicioConfigItem;
  index: number;
  total: number;
  colors: any;
  onMove: (from: number, to: number) => void;
  onRemove: (id: number) => void;
  onUpdateField: (
    id: number,
    field: "series" | "repeticoes" | "carga" | "descanso",
    val: number | string
  ) => void;
}

function CardExercicioSelecionado({
  item,
  index,
  total,
  colors,
  onMove,
  onRemove,
  onUpdateField,
}: CardExercicioSelecionadoProps) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
      ]}
    >
      {/* Cabeçalho do Card */}
      <View style={[styles.cardHeader, { borderColor: colors.cardSecondary }]}>
        <View style={styles.cardTitleContainer}>
          <Text
            style={[
              styles.cardIndex,
              {
                backgroundColor: colors.accentLight,
                color: colors.accent,
                borderColor: colors.accent,
                borderWidth: 1,
              },
            ]}
          >
            {index + 1}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardNome, { color: colors.text }]}>
              {item.exercicio.nome}
            </Text>
            {item.exercicio.descricao ? (
              <Text
                style={[styles.cardDescricao, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {item.exercicio.descricao}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.cardActionsRow}>
          {/* Botão Mover Para Cima */}
          <TouchableOpacity
            onPress={() => onMove(index, index - 1)}
            disabled={index === 0}
            style={[
              styles.btnOrdem,
              { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
              index === 0 && { opacity: 0.25 },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Ionicons name="chevron-up" size={15} color={colors.text} />
          </TouchableOpacity>

          {/* Botão Mover Para Baixo */}
          <TouchableOpacity
            onPress={() => onMove(index, index + 1)}
            disabled={index === total - 1}
            style={[
              styles.btnOrdem,
              { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
              index === total - 1 && { opacity: 0.25 },
            ]}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Ionicons name="chevron-down" size={15} color={colors.text} />
          </TouchableOpacity>

          {/* Botão Remover */}
          <TouchableOpacity
            onPress={() => onRemove(item.exercicio.id)}
            style={styles.removerBtn}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Grid de Inputs Diretos */}
      <View style={styles.gridInputs}>
        {/* Séries */}
        <View style={styles.colInput}>
          <Text style={[styles.colLabel, { color: colors.textSecondary }]}>
            Séries
          </Text>
          <TextInput
            style={[
              styles.gridInput,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.inputBorder,
              },
            ]}
            keyboardType="numeric"
            selectTextOnFocus={true}
            value={item.series ? String(item.series) : ""}
            onChangeText={(val) =>
              onUpdateField(item.exercicio.id, "series", val)
            }
            placeholder="4"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Repetições */}
        <View style={styles.colInput}>
          <Text style={[styles.colLabel, { color: colors.textSecondary }]}>
            Reps
          </Text>
          <TextInput
            style={[
              styles.gridInput,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.inputBorder,
              },
            ]}
            keyboardType="numeric"
            selectTextOnFocus={true}
            value={item.repeticoes ? String(item.repeticoes) : ""}
            onChangeText={(val) =>
              onUpdateField(item.exercicio.id, "repeticoes", val)
            }
            placeholder="10"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Carga (kg) */}
        <View style={styles.colInput}>
          <Text style={[styles.colLabel, { color: colors.textSecondary }]}>
            Carga (kg)
          </Text>
          <TextInput
            style={[
              styles.gridInput,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.inputBorder,
              },
            ]}
            keyboardType="numeric"
            selectTextOnFocus={true}
            value={item.carga !== undefined ? String(item.carga) : "0"}
            onChangeText={(val) =>
              onUpdateField(item.exercicio.id, "carga", val)
            }
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Descanso (s) */}
        <View style={styles.colInput}>
          <Text style={[styles.colLabel, { color: colors.textSecondary }]}>
            Descanso (s)
          </Text>
          <TextInput
            style={[
              styles.gridInput,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
                borderColor: colors.inputBorder,
              },
            ]}
            keyboardType="numeric"
            selectTextOnFocus={true}
            value={item.descanso ? String(item.descanso) : ""}
            onChangeText={(val) =>
              onUpdateField(item.exercicio.id, "descanso", val)
            }
            placeholder="60"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>
    </View>
  );
}

export default function NovoTreinoComponent() {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const { showAlert, showConfirm } = useAlert();

  const exercicios = useSelector((state: RootState) => state.exercicios.lista);

  const [nomeTreino, setNomeTreino] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState<string>("Todos");
  const [selecionados, setSelecionados] = useState<ExercicioConfigItem[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
  const [scrollHabilitado] = useState(true);

  useFocusEffect(
    useCallback(() => {
      dispatch(carregarExercicios());
    }, [dispatch])
  );

  const toggleSelecao = (ex: Exercicio) => {
    const jaSelecionado = selecionados.some((item) => item.exercicio.id === ex.id);

    if (jaSelecionado) {
      setSelecionados(
        selecionados
          .filter((item) => item.exercicio.id !== ex.id)
          .map((item, idx) => ({ ...item, ordem: idx }))
      );
    } else {
      setSelecionados([
        ...selecionados,
        {
          exercicio: ex,
          series: 4,
          repeticoes: 10,
          carga: 0,
          descanso: 60,
          ordem: selecionados.length,
        },
      ]);
    }
  };

  const removerSelecionado = (id: number) => {
    setSelecionados(
      selecionados
        .filter((item) => item.exercicio.id !== id)
        .map((item, idx) => ({ ...item, ordem: idx }))
    );
  };

  const moverItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= selecionados.length) return;
    setSelecionados((prev) => {
      const novaLista = [...prev];
      const [itemMovido] = novaLista.splice(fromIndex, 1);
      novaLista.splice(toIndex, 0, itemMovido);
      return novaLista.map((item, idx) => ({ ...item, ordem: idx }));
    });
  };

  const atualizarCampo = (
    id: number,
    campo: "series" | "repeticoes" | "carga" | "descanso",
    novoValor: number | string
  ) => {
    setSelecionados(
      selecionados.map((item) => {
        if (item.exercicio.id === id) {
          const valorNumerico =
            novoValor === "" ? "" : Number(novoValor) || 0;
          return { ...item, [campo]: valorNumerico };
        }
        return item;
      })
    );
  };

  const filtrados = exercicios.filter((ex: Exercicio) => {
    const matchTexto =
      pesquisa.trim() === "" ||
      ex.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      (ex.descricao && ex.descricao.toLowerCase().includes(pesquisa.toLowerCase()));

    if (!matchTexto) return false;
    if (filtroGrupo === "Todos") return true;

    return (ex.grupo_muscular || "Geral") === filtroGrupo;
  });

  function handleLongPressExcluirDoBanco(id: number, nome: string) {
    showConfirm(
      "Excluir Exercício do Banco",
      `Tem certeza que deseja excluir "${nome}" permanentemente?`,
      async () => {
        await dispatch(removerExercicio(id));
        setSelecionados((prev) => prev.filter((item) => item.exercicio.id !== id));
        dispatch(carregarExercicios());
      },
      true,
      "Excluir"
    );
  }

  const handleSalvar = async () => {
    Keyboard.dismiss();

    if (!nomeTreino.trim()) {
      showAlert("Atenção", "Digite um nome para o treino!", "warning");
      return;
    }

    if (selecionados.length === 0) {
      showAlert("Atenção", "Selecione ao menos 1 exercício para o treino!", "warning");
      return;
    }

    setSalvando(true);

    try {
      const { id: novoTreinoId } = await dispatch(
        adicionarTreino(nomeTreino.trim())
      ).unwrap();

      for (let i = 0; i < selecionados.length; i++) {
        const item = selecionados[i];
        await dispatch(
          adicionarExercicioAoTreino({
            treinoId: novoTreinoId,
            exercicioId: item.exercicio.id,
            series: Number(item.series) || 1,
            repeticoes: Number(item.repeticoes) || 1,
            carga: Number(item.carga) || 0,
            descanso: Number(item.descanso) || 30,
            ordem: i,
          })
        ).unwrap();
      }

      await dispatch(carregarExerciciosDoTreino(novoTreinoId));

      showAlert("Sucesso!", "Treino criado com sucesso!", "success");
      router.back();
    } catch (e) {
      console.error(e);
      showAlert("Erro", "Erro ao salvar treino.", "error");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardWrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        scrollEnabled={scrollHabilitado}
        style={[styles.scrollWrapper, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        showsVerticalScrollIndicator={true}
      >
        {/* Campo Nome do Treino */}
        <View style={styles.section}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Ionicons name="document-text-outline" size={16} color={colors.accent} />
            <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>
              Nome do Treino
            </Text>
          </View>
          <TextInput
            placeholder="Ex: Treino A - Peito e Tríceps"
            placeholderTextColor={colors.textMuted}
            value={nomeTreino}
            onChangeText={setNomeTreino}
            style={[
              styles.inputNome,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            returnKeyType="done"
          />
        </View>

        {/* Seção de Seleção de Exercícios */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <MaterialCommunityIcons name="dumbbell" size={18} color={colors.accent} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Adicionar Exercícios
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setMostrarCatalogo(!mostrarCatalogo)}
              style={styles.toggleCatalogoBtn}
            >
              <Text style={[styles.toggleCatalogoText, { color: colors.accent }]}>
                {mostrarCatalogo ? "Ocultar Busca ▲" : "Buscar Exercícios ▼"}
              </Text>
            </TouchableOpacity>
          </View>

          {mostrarCatalogo && (
            <View
              style={[
                styles.catalogoContainer,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <TextInput
                placeholder="Pesquisar exercício ou músculo..."
                placeholderTextColor={colors.textMuted}
                value={pesquisa}
                onChangeText={setPesquisa}
                style={[
                  styles.inputBusca,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                returnKeyType="search"
              />

              {/* Chips de Filtro por Grupo Muscular */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, paddingVertical: 4, marginBottom: 8 }}
              >
                {["Todos", ...GRUPOS_MUSCULARES].map((grupo) => {
                  const ativo = filtroGrupo === grupo;
                  return (
                    <TouchableOpacity
                      key={grupo}
                      onPress={() => setFiltroGrupo(grupo)}
                      style={[
                        styles.chipFiltroCatalogo,
                        {
                          backgroundColor: ativo ? colors.primary : colors.cardSecondary,
                          borderColor: ativo ? colors.primary : colors.cardBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipFiltroCatalogoText,
                          {
                            color: ativo ? "#fff" : colors.textSecondary,
                            fontWeight: ativo ? "bold" : "normal",
                          },
                        ]}
                      >
                        {grupo}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.novoExercicioRow}>
                <Link href="/(modals)/exercicio/novoExercicio" asChild>
                  <TouchableOpacity style={styles.novoExercicioBtn}>
                    <Ionicons name="add-circle-outline" size={16} color={colors.accent} style={{ marginRight: 4 }} />
                    <Text style={[styles.novoExercicioText, { color: colors.accent }]}>
                      Cadastrar Novo Exercício
                    </Text>
                  </TouchableOpacity>
                </Link>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <Ionicons name="information-circle-outline" size={12} color={colors.textMuted} />
                  <Text style={[styles.hintText, { color: colors.textMuted }]}>
                    Segure para excluir do banco
                  </Text>
                </View>
              </View>

              <FlatList
                data={filtrados}
                scrollEnabled={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  const selecionado = selecionados.some(
                    (s) => s.exercicio.id === item.id
                  );
                  return (
                    <TouchableOpacity
                      onPress={() => toggleSelecao(item)}
                      onLongPress={() => handleLongPressExcluirDoBanco(item.id, item.nome)}
                      style={[
                        styles.exercicioItem,
                        { borderColor: colors.cardSecondary },
                        selecionado && {
                          backgroundColor: colors.accentLight,
                          borderColor: colors.accent,
                        },
                      ]}
                    >
                      <Ionicons
                        name={selecionado ? "checkmark-circle" : "add-circle-outline"}
                        size={22}
                        color={selecionado ? colors.success : colors.accent}
                        style={{ marginRight: 10 }}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                          <Text
                            style={[
                              styles.exercicioNome,
                              { color: colors.text },
                              selecionado && { color: colors.accent, fontWeight: "bold" },
                            ]}
                          >
                            {item.nome}
                          </Text>
                          <View
                            style={[
                              styles.miniBadgeGrupo,
                              { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
                            ]}
                          >
                            <Text style={[styles.miniBadgeGrupoText, { color: colors.textSecondary }]}>
                              {item.grupo_muscular || "Geral"}
                            </Text>
                          </View>
                        </View>
                        {item.descricao ? (
                          <Text
                            style={[
                              styles.exercicioDescricao,
                              { color: colors.textSecondary },
                            ]}
                            numberOfLines={1}
                          >
                            {item.descricao}
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    Nenhum exercício encontrado
                  </Text>
                }
              />
            </View>
          )}
        </View>

        {/* Exercícios Selecionados e Configuração de Séries/Carga */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="list-outline" size={18} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Exercícios do Treino ({selecionados.length})
              </Text>
            </View>
            {!mostrarCatalogo && (
              <TouchableOpacity
                onPress={() => setMostrarCatalogo(true)}
                style={[styles.addMaisBtn, { backgroundColor: colors.accent }]}
              >
                <Ionicons name="add" size={14} color="#fff" style={{ marginRight: 2 }} />
                <Text style={styles.addMaisText}>Adicionar</Text>
              </TouchableOpacity>
            )}
          </View>

          {selecionados.length === 0 ? (
            <View
              style={[
                styles.emptyCardsContainer,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View
                style={[
                  styles.emptyCardsIconCircle,
                  { backgroundColor: colors.cardSecondary },
                ]}
              >
                <MaterialCommunityIcons name="dumbbell" size={42} color={colors.primary} />
              </View>
              <Text style={[styles.emptyCardsTitle, { color: colors.text }]}>
                Nenhum exercício adicionado
              </Text>
              <Text style={[styles.emptyCardsSub, { color: colors.textSecondary }]}>
                Abra a busca acima para escolher os exercícios deste treino.
              </Text>
              <TouchableOpacity
                onPress={() => setMostrarCatalogo(true)}
                style={[styles.abrirBuscaBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.abrirBuscaBtnText}>Buscar Exercícios</Text>
              </TouchableOpacity>
            </View>
          ) : (
            selecionados.map((item, index) => (
              <CardExercicioSelecionado
                key={item.exercicio.id}
                item={item}
                index={index}
                total={selecionados.length}
                colors={colors}
                onMove={moverItem}
                onRemove={removerSelecionado}
                onUpdateField={atualizarCampo}
              />
            ))
          )}
        </View>

        {/* Botão Salvar Treino */}
        <TouchableOpacity
          onPress={handleSalvar}
          disabled={salvando}
          style={[
            styles.btnSalvar,
            { backgroundColor: colors.primary },
            salvando && styles.btnSalvarDisabled,
          ]}
        >
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.btnSalvarText}>Salvar Treino Completo</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardWrapper: {
    flex: 1,
  },
  scrollWrapper: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 350,
    flexGrow: 1,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  inputNome: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleCatalogoBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleCatalogoText: {
    fontWeight: "600",
    fontSize: 13,
  },
  addMaisBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addMaisText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  catalogoContainer: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  inputBusca: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 8,
  },
  chipFiltroCatalogo: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipFiltroCatalogoText: {
    fontSize: 11,
  },
  miniBadgeGrupo: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  miniBadgeGrupoText: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  novoExercicioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  novoExercicioBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  novoExercicioText: {
    fontWeight: "bold",
    fontSize: 13,
  },
  hintText: {
    fontSize: 11,
  },
  exercicioItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderRadius: 6,
  },
  checkIcon: {
    marginRight: 10,
  },
  exercicioNome: {
    fontSize: 14,
    fontWeight: "600",
  },
  exercicioDescricao: {
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: 12,
  },
  emptyCardsContainer: {
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyCardsIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyCardsTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  emptyCardsSub: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 14,
  },
  abrirBuscaBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  abrirBuscaBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    color: "#fff",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "bold",
    fontSize: 12,
    marginRight: 8,
  },
  cardNome: {
    fontSize: 15,
    fontWeight: "bold",
  },
  cardDescricao: {
    fontSize: 12,
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  btnOrdem: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  removerBtn: {
    padding: 6,
  },
  removerBtnText: {
    fontSize: 16,
  },
  gridInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  colInput: {
    flex: 1,
    alignItems: "center",
  },
  colLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  gridInput: {
    width: "100%",
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  btnSalvar: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#00b894",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  btnSalvarDisabled: {
    opacity: 0.6,
  },
  btnSalvarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
