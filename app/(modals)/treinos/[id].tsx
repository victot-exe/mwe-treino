import { useTheme } from "@/src/context/ThemeContext";
import {
  addExercicioTreino,
  deleteExercicioTreinoById,
  updateExercicioTreino,
} from "@/src/database/exercicioTreinoRepository";
import { getExercicios } from "@/src/database/exercicioRepository";
import { getTreinoById, updateTreino } from "@/src/database/treinoRepository";
import { AppDispatch } from "@/src/store";
import { carregarTreinos } from "@/src/store/treinoSlice";
import { Exercicio, ExercicioTreino, Treino } from "@/src/types";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { useDispatch } from "react-redux";

export default function TreinoScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [treino, setTreino] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados do Modo Edição
  const [modoEdicao, setModoEdicao] = useState(false);
  const [nomeEditado, setNomeEditado] = useState("");
  const [exerciciosEditados, setExerciciosEditados] = useState<ExercicioTreino[]>([]);
  const [idsParaExcluir, setIdsParaExcluir] = useState<number[]>([]);
  const [salvando, setSalvando] = useState(false);

  // Catálogo de Exercícios para Adicionar durante a edição
  const [todosExercicios, setTodosExercicios] = useState<Exercicio[]>([]);
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
  const [pesquisa, setPesquisa] = useState("");

  const carregarTreino = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const treinoDb = await getTreinoById(Number(id));
    setTreino(treinoDb);
    if (treinoDb) {
      setNomeEditado(treinoDb.nome);
      setExerciciosEditados(treinoDb.exercicios || []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    carregarTreino();
  }, [carregarTreino]);

  const iniciarEdicao = async () => {
    if (!treino) return;
    setNomeEditado(treino.nome);
    setExerciciosEditados(treino.exercicios ? [...treino.exercicios] : []);
    setIdsParaExcluir([]);
    setMostrarCatalogo(false);

    // Carrega o catálogo caso queira adicionar novos exercícios
    const listaEx = await getExercicios();
    setTodosExercicios(listaEx);

    setModoEdicao(true);
  };

  const cancelarEdicao = () => {
    if (!treino) return;
    setNomeEditado(treino.nome);
    setExerciciosEditados(treino.exercicios ? [...treino.exercicios] : []);
    setIdsParaExcluir([]);
    setMostrarCatalogo(false);
    setModoEdicao(false);
  };

  const atualizarCampoExercicio = (
    index: number,
    campo: "series" | "repeticoes" | "carga" | "descanso",
    valorTexto: string
  ) => {
    const valorNum = valorTexto === "" ? 0 : parseInt(valorTexto, 10);
    const valorValido = isNaN(valorNum) ? 0 : Math.max(0, valorNum);

    setExerciciosEditados((prev) => {
      const novaLista = [...prev];
      novaLista[index] = {
        ...novaLista[index],
        [campo]: valorValido,
      };
      return novaLista;
    });
  };

  const alterarValorRapido = (
    index: number,
    campo: "series" | "repeticoes" | "carga" | "descanso",
    delta: number,
    minimo: number = 0
  ) => {
    setExerciciosEditados((prev) => {
      const novaLista = [...prev];
      const atual = Number(novaLista[index][campo]) || 0;
      novaLista[index] = {
        ...novaLista[index],
        [campo]: Math.max(minimo, atual + delta),
      };
      return novaLista;
    });
  };

  const removerExercicioDoTreino = (index: number) => {
    const item = exerciciosEditados[index];
    if (item.id) {
      setIdsParaExcluir((prev) => [...prev, item.id]);
    }
    setExerciciosEditados((prev) => prev.filter((_, i) => i !== index));
  };

  const adicionarExercicioAoTreinoLocal = (ex: Exercicio) => {
    const novoItem: ExercicioTreino = {
      id: 0,
      treino_id: Number(id),
      exercicio_id: ex.id,
      exercicio: ex,
      series: 4,
      repeticoes: 10,
      carga: 0,
      descanso: 60,
    };

    setExerciciosEditados((prev) => [...prev, novoItem]);
    setMostrarCatalogo(false);
  };

  const salvarAlteracoes = async () => {
    Keyboard.dismiss();

    if (!nomeEditado.trim()) {
      Alert.alert("Atenção", "O nome do treino não pode ficar vazio!");
      return;
    }

    if (exerciciosEditados.length === 0) {
      Alert.alert("Atenção", "O treino precisa ter ao menos 1 exercício!");
      return;
    }

    setSalvando(true);

    try {
      const treinoIdNum = Number(id);

      // 1. Atualiza o nome do treino se mudou
      if (treino && nomeEditado.trim() !== treino.nome) {
        await updateTreino(treinoIdNum, nomeEditado.trim());
      }

      // 2. Exclui os exercícios removidos
      for (const idExcluir of idsParaExcluir) {
        await deleteExercicioTreinoById(idExcluir);
      }

      // 3. Atualiza ou insere os exercícios editados
      for (const item of exerciciosEditados) {
        if (item.id && item.id > 0) {
          await updateExercicioTreino(item.id, {
            series: Number(item.series) || 1,
            repeticoes: Number(item.repeticoes) || 1,
            carga: Number(item.carga) || 0,
            descanso: Number(item.descanso) || 30,
          });
        } else {
          await addExercicioTreino({
            treinoId: treinoIdNum,
            exercicioId: item.exercicio_id,
            series: Number(item.series) || 1,
            repeticoes: Number(item.repeticoes) || 1,
            carga: Number(item.carga) || 0,
            descanso: Number(item.descanso) || 30,
          });
        }
      }

      await carregarTreino();
      dispatch(carregarTreinos());

      setModoEdicao(false);
      Alert.alert("Sucesso! 🎉", "Treino atualizado com sucesso!");
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Erro ao salvar alterações no treino.");
    } finally {
      setSalvando(false);
    }
  };

  const exerciciosFiltrados = todosExercicios.filter((ex) =>
    ex.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Carregando treino...
        </Text>
      </View>
    );
  }

  if (!treino) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Nenhum treino encontrado.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Cabeçalho */}
        <View
          style={[
            styles.headerCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          {!modoEdicao ? (
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  🏋️ {treino.nome}
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                  {treino.exercicios?.length || 0} exercício(s) configurado(s)
                </Text>
              </View>
              <TouchableOpacity
                onPress={iniciarEdicao}
                style={[styles.btnEditar, { backgroundColor: colors.accent }]}
                activeOpacity={0.8}
              >
                <Text style={styles.btnEditarText}>✏️ Editar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={[styles.labelEdicao, { color: colors.textSecondary }]}>
                Nome do Treino
              </Text>
              <TextInput
                style={[
                  styles.inputNome,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                ]}
                value={nomeEditado}
                onChangeText={setNomeEditado}
                placeholder="Nome do Treino"
                placeholderTextColor={colors.textMuted}
              />
              <View style={styles.edicaoActionsRow}>
                <TouchableOpacity
                  onPress={cancelarEdicao}
                  disabled={salvando}
                  style={[styles.btnCancelar, { backgroundColor: colors.cardSecondary }]}
                >
                  <Text style={[styles.btnCancelarText, { color: colors.text }]}>
                    ❌ Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={salvarAlteracoes}
                  disabled={salvando}
                  style={[styles.btnSalvar, { backgroundColor: colors.primary }]}
                >
                  {salvando ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.btnSalvarText}>💾 Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Conteúdo: Modo Leitura vs Modo Edição */}
        {!modoEdicao ? (
          /* MODO LEITURA */
          <View style={{ flex: 1 }}>
            <FlatList
              data={treino.exercicios}
              keyExtractor={(item, idx) => item.id?.toString() || String(idx)}
              contentContainerStyle={styles.listContent}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.exerciseCard,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  ]}
                >
                  <View style={styles.exerciseHeader}>
                    <Text
                      style={[
                        styles.exerciseIndex,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      {index + 1}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.exerciseNome, { color: colors.text }]}>
                        {item.exercicio?.nome}
                      </Text>
                      {item.exercicio?.descricao ? (
                        <Text
                          style={[
                            styles.exerciseDescricao,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {item.exercicio.descricao}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Badges de Parâmetros */}
                  <View style={styles.badgesRow}>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: colors.cardSecondary,
                          borderColor: colors.cardBorder,
                        },
                      ]}
                    >
                      <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>
                        🔁 Séries
                      </Text>
                      <Text style={[styles.badgeValue, { color: colors.text }]}>
                        {item.series}x
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: colors.cardSecondary,
                          borderColor: colors.cardBorder,
                        },
                      ]}
                    >
                      <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>
                        🔢 Reps
                      </Text>
                      <Text style={[styles.badgeValue, { color: colors.text }]}>
                        {item.repeticoes}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: colors.cardSecondary,
                          borderColor: colors.cardBorder,
                        },
                      ]}
                    >
                      <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>
                        ⚖️ Carga
                      </Text>
                      <Text style={[styles.badgeValue, { color: colors.text }]}>
                        {item.carga || 0} kg
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: colors.cardSecondary,
                          borderColor: colors.cardBorder,
                        },
                      ]}
                    >
                      <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>
                        ⏱️ Descanso
                      </Text>
                      <Text style={[styles.badgeValue, { color: colors.text }]}>
                        {item.descanso}s
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text style={[styles.emptyListText, { color: colors.textSecondary }]}>
                    Nenhum exercício cadastrado para este treino.
                  </Text>
                </View>
              }
            />

            {/* BOTÃO FIXO INFERIOR: INICIAR TREINO */}
            {treino.exercicios && treino.exercicios.length > 0 && (
              <View
                style={[
                  styles.bottomTreinarBar,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => router.push(`/(modals)/treinos/treinar/${id}`)}
                  style={[styles.btnIniciarTreino, { backgroundColor: colors.primary }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnIniciarTreinoText}>🔥 Iniciar Treino</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* MODO EDIÇÃO */
          <ScrollView
            contentContainerStyle={styles.listContentEdicao}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
          >
            {exerciciosEditados.map((item, index) => (
              <View
                key={item.id ? `id-${item.id}` : `novo-${index}`}
                style={[
                  styles.cardEdicao,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <View
                  style={[
                    styles.cardHeaderEdicao,
                    { borderColor: colors.cardSecondary },
                  ]}
                >
                  <View style={styles.cardTitleContainer}>
                    <Text
                      style={[
                        styles.cardIndexEdicao,
                        { backgroundColor: colors.accent },
                      ]}
                    >
                      {index + 1}
                    </Text>
                    <Text style={[styles.cardNomeEdicao, { color: colors.text }]}>
                      {item.exercicio?.nome}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removerExercicioDoTreino(index)}
                    style={styles.removerBtn}
                  >
                    <Text style={styles.removerBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                {/* Inputs com Steppers */}
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
                        onPress={() => alterarValorRapido(index, "series", -1, 1)}
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
                        value={item.series !== undefined ? String(item.series) : "4"}
                        onChangeText={(val) =>
                          atualizarCampoExercicio(index, "series", val)
                        }
                      />
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(index, "series", 1, 1)}
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
                        onPress={() => alterarValorRapido(index, "repeticoes", -1, 1)}
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
                        value={
                          item.repeticoes !== undefined ? String(item.repeticoes) : "10"
                        }
                        onChangeText={(val) =>
                          atualizarCampoExercicio(index, "repeticoes", val)
                        }
                      />
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(index, "repeticoes", 1, 1)}
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
                        onPress={() => alterarValorRapido(index, "carga", -5, 0)}
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
                          atualizarCampoExercicio(index, "carga", val)
                        }
                      />
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(index, "carga", 5, 0)}
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
                        onPress={() => alterarValorRapido(index, "descanso", -15, 0)}
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
                        value={
                          item.descanso !== undefined ? String(item.descanso) : "60"
                        }
                        onChangeText={(val) =>
                          atualizarCampoExercicio(index, "descanso", val)
                        }
                      />
                      <TouchableOpacity
                        onPress={() => alterarValorRapido(index, "descanso", 15, 0)}
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
            ))}

            {/* Adicionar Mais Exercícios ao Treino */}
            <TouchableOpacity
              onPress={() => setMostrarCatalogo(!mostrarCatalogo)}
              style={[
                styles.btnAddExercicio,
                { backgroundColor: colors.accentLight, borderColor: colors.accent },
              ]}
            >
              <Text style={[styles.btnAddExercicioText, { color: colors.accent }]}>
                {mostrarCatalogo ? "▲ Fechar Catálogo" : "➕ Adicionar Mais Exercícios"}
              </Text>
            </TouchableOpacity>

            {mostrarCatalogo && (
              <View
                style={[
                  styles.catalogoContainer,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <TextInput
                  placeholder="🔍 Pesquisar no catálogo..."
                  placeholderTextColor={colors.textMuted}
                  value={pesquisa}
                  onChangeText={setPesquisa}
                  style={[
                    styles.inputBusca,
                    {
                      backgroundColor: colors.inputBg,
                      color: colors.text,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                />
                {exerciciosFiltrados.map((ex) => {
                  const jaNoTreino = exerciciosEditados.some(
                    (item) => item.exercicio_id === ex.id
                  );
                  return (
                    <TouchableOpacity
                      key={ex.id}
                      onPress={() => !jaNoTreino && adicionarExercicioAoTreinoLocal(ex)}
                      style={[
                        styles.catalogoItem,
                        { borderColor: colors.cardSecondary },
                        jaNoTreino && styles.catalogoItemDesativado,
                      ]}
                      disabled={jaNoTreino}
                    >
                      <Text style={styles.catalogoItemIcon}>
                        {jaNoTreino ? "✅" : "➕"}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.catalogoItemNome,
                            { color: colors.text },
                            jaNoTreino && { color: colors.textMuted },
                          ]}
                        >
                          {ex.nome}
                        </Text>
                        {ex.descricao ? (
                          <Text
                            style={[
                              styles.catalogoItemDesc,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {ex.descricao}
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
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
  emptyText: {
    fontSize: 16,
  },
  headerCard: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  btnEditar: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  btnEditarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  labelEdicao: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 6,
  },
  inputNome: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  edicaoActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  btnCancelar: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  btnCancelarText: {
    fontWeight: "bold",
    fontSize: 13,
  },
  btnSalvar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  btnSalvarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  bottomTreinarBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  btnIniciarTreino: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#00b894",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  btnIniciarTreinoText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  listContentEdicao: {
    padding: 16,
    paddingBottom: 300,
  },
  exerciseCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "bold",
    fontSize: 12,
    marginRight: 10,
  },
  exerciseNome: {
    fontSize: 16,
    fontWeight: "bold",
  },
  exerciseDescricao: {
    fontSize: 12,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  badge: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 2,
  },
  badgeValue: {
    fontSize: 13,
    fontWeight: "bold",
  },
  cardEdicao: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeaderEdicao: {
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
  cardIndexEdicao: {
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
  cardNomeEdicao: {
    fontSize: 15,
    fontWeight: "bold",
  },
  removerBtn: {
    padding: 4,
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
  btnAddExercicio: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  btnAddExercicioText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  catalogoContainer: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  inputBusca: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10,
  },
  catalogoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  catalogoItemDesativado: {
    opacity: 0.5,
  },
  catalogoItemIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  catalogoItemNome: {
    fontSize: 14,
    fontWeight: "bold",
  },
  catalogoItemDesc: {
    fontSize: 12,
  },
  emptyListContainer: {
    padding: 30,
    alignItems: "center",
  },
  emptyListText: {
    fontSize: 14,
    textAlign: "center",
  },
});
