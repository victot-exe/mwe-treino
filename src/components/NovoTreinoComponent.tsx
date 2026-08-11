import { useTheme } from "@/src/context/ThemeContext";
import { carregarExercicios, removerExercicio } from "@/src/store/exercicioSlice";
import { adicionarTreino } from "@/src/store/treinoSlice";
import { Exercicio, ExercicioConfigItem } from "@/src/types";
import { useFocusEffect } from "@react-navigation/native";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function NovoTreinoComponent() {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();

  const exercicios = useSelector((state: RootState) => state.exercicios.lista);

  const [nomeTreino, setNomeTreino] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [selecionados, setSelecionados] = useState<ExercicioConfigItem[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(carregarExercicios());
    }, [dispatch])
  );

  const toggleSelecao = (ex: Exercicio) => {
    const jaSelecionado = selecionados.some((item) => item.exercicio.id === ex.id);

    if (jaSelecionado) {
      setSelecionados(selecionados.filter((item) => item.exercicio.id !== ex.id));
    } else {
      setSelecionados([
        ...selecionados,
        {
          exercicio: ex,
          series: 4,
          repeticoes: 10,
          carga: 0,
          descanso: 60,
        },
      ]);
    }
  };

  const removerSelecionado = (id: number) => {
    setSelecionados(selecionados.filter((item) => item.exercicio.id !== id));
  };

  const atualizarCampo = (
    id: number,
    campo: "series" | "repeticoes" | "carga" | "descanso",
    valorTexto: string
  ) => {
    const valorNumerico = valorTexto === "" ? 0 : parseInt(valorTexto, 10);
    const valorValido = isNaN(valorNumerico) ? 0 : Math.max(0, valorNumerico);

    setSelecionados((prev) =>
      prev.map((item) => {
        if (item.exercicio.id === id) {
          return { ...item, [campo]: valorValido };
        }
        return item;
      })
    );
  };

  const alterarValorRapido = (
    id: number,
    campo: "series" | "repeticoes" | "carga" | "descanso",
    delta: number,
    minimo: number = 0
  ) => {
    setSelecionados((prev) =>
      prev.map((item) => {
        if (item.exercicio.id === id) {
          const atual = Number(item[campo]) || 0;
          const novo = Math.max(minimo, atual + delta);
          return { ...item, [campo]: novo };
        }
        return item;
      })
    );
  };

  const filtrados = exercicios.filter((ex: Exercicio) =>
    ex.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  function handleLongPressExcluirDoBanco(id: number, nome: string) {
    Alert.alert(
      "Excluir Exercício do Banco",
      `Tem certeza que deseja excluir "${nome}" permanentemente?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await dispatch(removerExercicio(id));
            setSelecionados((prev) => prev.filter((item) => item.exercicio.id !== id));
            dispatch(carregarExercicios());
          },
        },
      ]
    );
  }

  const handleSalvar = async () => {
    Keyboard.dismiss();

    if (!nomeTreino.trim()) {
      Alert.alert("Atenção", "Digite um nome para o treino!");
      return;
    }

    if (selecionados.length === 0) {
      Alert.alert("Atenção", "Selecione ao menos 1 exercício para o treino!");
      return;
    }

    setSalvando(true);

    try {
      const { id: novoTreinoId } = await dispatch(
        adicionarTreino(nomeTreino.trim())
      ).unwrap();

      for (const item of selecionados) {
        await dispatch(
          adicionarExercicioAoTreino({
            treinoId: novoTreinoId,
            exercicioId: item.exercicio.id,
            series: Number(item.series) || 1,
            repeticoes: Number(item.repeticoes) || 1,
            carga: Number(item.carga) || 0,
            descanso: Number(item.descanso) || 30,
          })
        ).unwrap();
      }

      await dispatch(carregarExerciciosDoTreino(novoTreinoId));

      Alert.alert("Sucesso! 🎉", "Treino criado com sucesso!");
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Erro ao salvar treino.");
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
        style={[styles.scrollWrapper, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        showsVerticalScrollIndicator={true}
      >
        {/* Campo Nome do Treino */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>📝 Nome do Treino</Text>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              💪 Adicionar Exercícios
            </Text>
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
                placeholder="🔍 Pesquisar exercício..."
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

              <View style={styles.novoExercicioRow}>
                <Link href="/(modals)/exercicio/novoExercicio" asChild>
                  <TouchableOpacity style={styles.novoExercicioBtn}>
                    <Text style={[styles.novoExercicioText, { color: colors.accent }]}>
                      ➕ Cadastrar Novo Exercício
                    </Text>
                  </TouchableOpacity>
                </Link>
                <Text style={[styles.hintText, { color: colors.textMuted }]}>
                  💡 Segure para excluir do banco
                </Text>
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
                      <Text style={styles.checkIcon}>{selecionado ? "✅" : "➕"}</Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.exercicioNome,
                            { color: colors.text },
                            selecionado && { color: colors.accent, fontWeight: "bold" },
                          ]}
                        >
                          {item.nome}
                        </Text>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📋 Exercícios do Treino ({selecionados.length})
            </Text>
            {!mostrarCatalogo && (
              <TouchableOpacity
                onPress={() => setMostrarCatalogo(true)}
                style={[styles.addMaisBtn, { backgroundColor: colors.accent }]}
              >
                <Text style={styles.addMaisText}>+ Adicionar</Text>
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
              <Text style={styles.emptyCardsEmoji}>🏋️‍♂️</Text>
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
              <View
                key={item.exercicio.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                {/* Cabeçalho do Card */}
                <View
                  style={[
                    styles.cardHeader,
                    { borderColor: colors.cardSecondary },
                  ]}
                >
                  <View style={styles.cardTitleContainer}>
                    <Text
                      style={[
                        styles.cardIndex,
                        { backgroundColor: colors.accent },
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
                          style={[
                            styles.cardDescricao,
                            { color: colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {item.exercicio.descricao}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => removerSelecionado(item.exercicio.id)}
                    style={styles.removerBtn}
                  >
                    <Text style={styles.removerBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                {/* Grid de Inputs com Steppers */}
                <View style={styles.gridInputs}>
                  {/* Séries */}
                  <View style={styles.colInput}>
                    <Text style={[styles.colLabel, { color: colors.textSecondary }]}>
                      Séries
                    </Text>
                    <View
                      style={[
                        styles.stepperContainer,
                        {
                          backgroundColor: colors.stepperBg,
                          borderColor: colors.inputBorder,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "series", -1, 1)}
                        style={[
                          styles.stepperBtn,
                          { backgroundColor: colors.stepperBtn },
                        ]}
                      >
                        <Text style={[styles.stepperBtnText, { color: colors.text }]}>
                          -
                        </Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[
                          styles.gridInput,
                          { backgroundColor: colors.inputBg, color: colors.text },
                        ]}
                        keyboardType="numeric"
                        selectTextOnFocus={true}
                        value={item.series ? String(item.series) : ""}
                        onChangeText={(val) =>
                          atualizarCampo(item.exercicio.id, "series", val)
                        }
                        placeholder="4"
                        placeholderTextColor={colors.textMuted}
                      />
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "series", 1, 1)}
                        style={[
                          styles.stepperBtn,
                          { backgroundColor: colors.stepperBtn },
                        ]}
                      >
                        <Text style={[styles.stepperBtnText, { color: colors.text }]}>
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Repetições */}
                  <View style={styles.colInput}>
                    <Text style={[styles.colLabel, { color: colors.textSecondary }]}>
                      Reps
                    </Text>
                    <View
                      style={[
                        styles.stepperContainer,
                        {
                          backgroundColor: colors.stepperBg,
                          borderColor: colors.inputBorder,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "repeticoes", -1, 1)}
                        style={[
                          styles.stepperBtn,
                          { backgroundColor: colors.stepperBtn },
                        ]}
                      >
                        <Text style={[styles.stepperBtnText, { color: colors.text }]}>
                          -
                        </Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[
                          styles.gridInput,
                          { backgroundColor: colors.inputBg, color: colors.text },
                        ]}
                        keyboardType="numeric"
                        selectTextOnFocus={true}
                        value={item.repeticoes ? String(item.repeticoes) : ""}
                        onChangeText={(val) =>
                          atualizarCampo(item.exercicio.id, "repeticoes", val)
                        }
                        placeholder="10"
                        placeholderTextColor={colors.textMuted}
                      />
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "repeticoes", 1, 1)}
                        style={[
                          styles.stepperBtn,
                          { backgroundColor: colors.stepperBtn },
                        ]}
                      >
                        <Text style={[styles.stepperBtnText, { color: colors.text }]}>
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Carga (kg) */}
                  <View style={styles.colInput}>
                    <Text style={[styles.colLabel, { color: colors.textSecondary }]}>
                      Carga (kg)
                    </Text>
                    <View
                      style={[
                        styles.stepperContainer,
                        {
                          backgroundColor: colors.stepperBg,
                          borderColor: colors.inputBorder,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "carga", -5, 0)}
                        style={[
                          styles.stepperBtn,
                          { backgroundColor: colors.stepperBtn },
                        ]}
                      >
                        <Text style={[styles.stepperBtnText, { color: colors.text }]}>
                          -
                        </Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[
                          styles.gridInput,
                          { backgroundColor: colors.inputBg, color: colors.text },
                        ]}
                        keyboardType="numeric"
                        selectTextOnFocus={true}
                        value={item.carga !== undefined ? String(item.carga) : "0"}
                        onChangeText={(val) =>
                          atualizarCampo(item.exercicio.id, "carga", val)
                        }
                        placeholder="0"
                        placeholderTextColor={colors.textMuted}
                      />
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "carga", 5, 0)}
                        style={[
                          styles.stepperBtn,
                          { backgroundColor: colors.stepperBtn },
                        ]}
                      >
                        <Text style={[styles.stepperBtnText, { color: colors.text }]}>
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Descanso (s) */}
                  <View style={styles.colInput}>
                    <Text style={[styles.colLabel, { color: colors.textSecondary }]}>
                      Descanso (s)
                    </Text>
                    <View
                      style={[
                        styles.stepperContainer,
                        {
                          backgroundColor: colors.stepperBg,
                          borderColor: colors.inputBorder,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "descanso", -15, 0)}
                        style={[
                          styles.stepperBtn,
                          { backgroundColor: colors.stepperBtn },
                        ]}
                      >
                        <Text style={[styles.stepperBtnText, { color: colors.text }]}>
                          -
                        </Text>
                      </TouchableOpacity>
                      <TextInput
                        style={[
                          styles.gridInput,
                          { backgroundColor: colors.inputBg, color: colors.text },
                        ]}
                        keyboardType="numeric"
                        selectTextOnFocus={true}
                        value={item.descanso ? String(item.descanso) : ""}
                        onChangeText={(val) =>
                          atualizarCampo(item.exercicio.id, "descanso", val)
                        }
                        placeholder="60"
                        placeholderTextColor={colors.textMuted}
                      />
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "descanso", 15, 0)}
                        style={[
                          styles.stepperBtn,
                          { backgroundColor: colors.stepperBtn },
                        ]}
                      >
                        <Text style={[styles.stepperBtnText, { color: colors.text }]}>
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
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
            <Text style={styles.btnSalvarText}>💾 Salvar Treino Completo</Text>
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
    marginBottom: 10,
  },
  novoExercicioRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  novoExercicioBtn: {
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
    fontSize: 16,
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
  emptyCardsEmoji: {
    fontSize: 36,
    marginBottom: 8,
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
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    width: "100%",
  },
  stepperBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  gridInput: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 4,
    paddingHorizontal: 2,
    fontSize: 13,
    fontWeight: "bold",
    minWidth: 26,
  },
  btnSalvar: {
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
