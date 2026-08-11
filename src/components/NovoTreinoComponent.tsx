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
        style={styles.scrollWrapper}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        showsVerticalScrollIndicator={true}
      >
        {/* Campo Nome do Treino */}
        <View style={styles.section}>
          <Text style={styles.label}>📝 Nome do Treino</Text>
          <TextInput
            placeholder="Ex: Treino A - Peito e Tríceps"
            placeholderTextColor="#888"
            value={nomeTreino}
            onChangeText={setNomeTreino}
            style={styles.inputNome}
            returnKeyType="done"
          />
        </View>

        {/* Seção de Seleção de Exercícios */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>💪 Adicionar Exercícios</Text>
            <TouchableOpacity
              onPress={() => setMostrarCatalogo(!mostrarCatalogo)}
              style={styles.toggleCatalogoBtn}
            >
              <Text style={styles.toggleCatalogoText}>
                {mostrarCatalogo ? "Ocultar Busca ▲" : "Buscar Exercícios ▼"}
              </Text>
            </TouchableOpacity>
          </View>

          {mostrarCatalogo && (
            <View style={styles.catalogoContainer}>
              <TextInput
                placeholder="🔍 Pesquisar exercício..."
                placeholderTextColor="#888"
                value={pesquisa}
                onChangeText={setPesquisa}
                style={styles.inputBusca}
                returnKeyType="search"
              />

              <View style={styles.novoExercicioRow}>
                <Link href="/(modals)/exercicio/novoExercicio" asChild>
                  <TouchableOpacity style={styles.novoExercicioBtn}>
                    <Text style={styles.novoExercicioText}>➕ Cadastrar Novo Exercício</Text>
                  </TouchableOpacity>
                </Link>
                <Text style={styles.hintText}>💡 Segure para excluir do banco</Text>
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
                        selecionado && styles.exercicioItemSelecionado,
                      ]}
                    >
                      <Text style={styles.checkIcon}>{selecionado ? "✅" : "➕"}</Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.exercicioNome,
                            selecionado && styles.exercicioNomeSelecionado,
                          ]}
                        >
                          {item.nome}
                        </Text>
                        {item.descricao ? (
                          <Text style={styles.exercicioDescricao} numberOfLines={1}>
                            {item.descricao}
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Nenhum exercício encontrado</Text>
                }
              />
            </View>
          )}
        </View>

        {/* Exercícios Selecionados e Configuração de Séries/Carga */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              📋 Exercícios do Treino ({selecionados.length})
            </Text>
            {!mostrarCatalogo && (
              <TouchableOpacity
                onPress={() => setMostrarCatalogo(true)}
                style={styles.addMaisBtn}
              >
                <Text style={styles.addMaisText}>+ Adicionar</Text>
              </TouchableOpacity>
            )}
          </View>

          {selecionados.length === 0 ? (
            <View style={styles.emptyCardsContainer}>
              <Text style={styles.emptyCardsEmoji}>🏋️‍♂️</Text>
              <Text style={styles.emptyCardsTitle}>Nenhum exercício adicionado</Text>
              <Text style={styles.emptyCardsSub}>
                Abra a busca acima para escolher os exercícios deste treino.
              </Text>
              <TouchableOpacity
                onPress={() => setMostrarCatalogo(true)}
                style={styles.abrirBuscaBtn}
              >
                <Text style={styles.abrirBuscaBtnText}>Buscar Exercícios</Text>
              </TouchableOpacity>
            </View>
          ) : (
            selecionados.map((item, index) => (
              <View key={item.exercicio.id} style={styles.card}>
                {/* Cabeçalho do Card */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardIndex}>{index + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardNome}>{item.exercicio.nome}</Text>
                      {item.exercicio.descricao ? (
                        <Text style={styles.cardDescricao} numberOfLines={1}>
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

                {/* Grid de Inputs: Séries, Repetições, Carga, Descanso com Steppers */}
                <View style={styles.gridInputs}>
                  {/* Séries */}
                  <View style={styles.colInput}>
                    <Text style={styles.colLabel}>Séries</Text>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "series", -1, 1)}
                        style={styles.stepperBtn}
                      >
                        <Text style={styles.stepperBtnText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.gridInput}
                        keyboardType="numeric"
                        selectTextOnFocus={true}
                        value={item.series ? String(item.series) : ""}
                        onChangeText={(val) =>
                          atualizarCampo(item.exercicio.id, "series", val)
                        }
                        placeholder="4"
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "series", 1, 1)}
                        style={styles.stepperBtn}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Repetições */}
                  <View style={styles.colInput}>
                    <Text style={styles.colLabel}>Reps</Text>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "repeticoes", -1, 1)}
                        style={styles.stepperBtn}
                      >
                        <Text style={styles.stepperBtnText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.gridInput}
                        keyboardType="numeric"
                        selectTextOnFocus={true}
                        value={item.repeticoes ? String(item.repeticoes) : ""}
                        onChangeText={(val) =>
                          atualizarCampo(item.exercicio.id, "repeticoes", val)
                        }
                        placeholder="10"
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "repeticoes", 1, 1)}
                        style={styles.stepperBtn}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Carga (kg) */}
                  <View style={styles.colInput}>
                    <Text style={styles.colLabel}>Carga (kg)</Text>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "carga", -5, 0)}
                        style={styles.stepperBtn}
                      >
                        <Text style={styles.stepperBtnText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.gridInput}
                        keyboardType="numeric"
                        selectTextOnFocus={true}
                        value={item.carga !== undefined ? String(item.carga) : "0"}
                        onChangeText={(val) =>
                          atualizarCampo(item.exercicio.id, "carga", val)
                        }
                        placeholder="0"
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "carga", 5, 0)}
                        style={styles.stepperBtn}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Descanso (s) */}
                  <View style={styles.colInput}>
                    <Text style={styles.colLabel}>Descanso (s)</Text>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "descanso", -15, 0)}
                        style={styles.stepperBtn}
                      >
                        <Text style={styles.stepperBtnText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.gridInput}
                        keyboardType="numeric"
                        selectTextOnFocus={true}
                        value={item.descanso ? String(item.descanso) : ""}
                        onChangeText={(val) =>
                          atualizarCampo(item.exercicio.id, "descanso", val)
                        }
                        placeholder="60"
                        placeholderTextColor="#999"
                      />
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(item.exercicio.id, "descanso", 15, 0)}
                        style={styles.stepperBtn}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
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
          style={[styles.btnSalvar, salvando && styles.btnSalvarDisabled]}
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
    backgroundColor: "#f5f6fa",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2f3640",
    marginBottom: 6,
  },
  inputNome: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dcdde1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2f3640",
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
    color: "#2f3640",
  },
  toggleCatalogoBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleCatalogoText: {
    color: "#0984e3",
    fontWeight: "600",
    fontSize: 13,
  },
  addMaisBtn: {
    backgroundColor: "#00b894",
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
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dcdde1",
    marginBottom: 10,
  },
  inputBusca: {
    backgroundColor: "#f1f2f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#2f3640",
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
    color: "#0984e3",
    fontWeight: "bold",
    fontSize: 13,
  },
  hintText: {
    fontSize: 11,
    color: "#a4b0be",
  },
  exercicioItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#f1f2f6",
    borderRadius: 6,
  },
  exercicioItemSelecionado: {
    backgroundColor: "#e8f5e9",
  },
  checkIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  exercicioNome: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2f3640",
  },
  exercicioNomeSelecionado: {
    color: "#2e7d32",
    fontWeight: "bold",
  },
  exercicioDescricao: {
    fontSize: 12,
    color: "#747d8c",
  },
  emptyText: {
    textAlign: "center",
    color: "#a4b0be",
    paddingVertical: 12,
  },
  emptyCardsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e2e6",
    borderStyle: "dashed",
  },
  emptyCardsEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyCardsTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2f3640",
    marginBottom: 4,
  },
  emptyCardsSub: {
    fontSize: 13,
    color: "#747d8c",
    textAlign: "center",
    marginBottom: 14,
  },
  abrirBuscaBtn: {
    backgroundColor: "#0984e3",
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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e1e2e6",
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
    borderColor: "#f1f2f6",
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
    backgroundColor: "#0984e3",
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
    color: "#2f3640",
  },
  cardDescricao: {
    fontSize: 12,
    color: "#747d8c",
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
    color: "#747d8c",
    marginBottom: 4,
    textAlign: "center",
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f2f6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcdde1",
    overflow: "hidden",
    width: "100%",
  },
  stepperBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e4e7eb",
  },
  stepperBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2f3640",
  },
  gridInput: {
    flex: 1,
    backgroundColor: "#fff",
    textAlign: "center",
    paddingVertical: 4,
    paddingHorizontal: 2,
    fontSize: 13,
    fontWeight: "bold",
    color: "#2f3640",
    minWidth: 26,
  },
  btnSalvar: {
    backgroundColor: "#00b894",
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
