import { useAlert } from "@/src/context/AlertContext";
import { useTheme } from "@/src/context/ThemeContext";
import {
  addExercicioTreino,
  deleteExercicioTreinoById,
  updateExercicioTreino,
} from "@/src/database/exercicioTreinoRepository";
import { getExercicios } from "@/src/database/exercicioRepository";
import {
  limparSessaoAtiva,
  obterSessaoAtiva,
  SessaoAtivaTreino,
} from "@/src/database/sessaoAtivaRepository";
import { getTreinoById, updateTreino } from "@/src/database/treinoRepository";
import { AppDispatch } from "@/src/store";
import { carregarTreinos } from "@/src/store/treinoSlice";
import { Exercicio, ExercicioTreino, GRUPOS_MUSCULARES, Treino } from "@/src/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

interface CardExercicioEdicaoProps {
  item: ExercicioTreino;
  index: number;
  total: number;
  colors: any;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  onUpdateField: (index: number, field: keyof ExercicioTreino, val: string) => void;
}

function CardExercicioEdicao({
  item,
  index,
  total,
  colors,
  onMove,
  onRemove,
  onUpdateField,
}: CardExercicioEdicaoProps) {
  return (
    <View
      style={[
        styles.cardEdicao,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
      ]}
    >
      <View style={[styles.cardHeaderEdicao, { borderColor: colors.cardSecondary }]}>
        <View style={styles.cardTitleContainer}>
          <Text style={[styles.cardIndexEdicao, { backgroundColor: colors.accent }]}>
            {index + 1}
          </Text>
          <Text style={[styles.cardNomeEdicao, { color: colors.text }]}>
            {item.exercicio?.nome}
          </Text>
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
            onPress={() => onRemove(index)}
            style={styles.removerBtn}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Inputs Diretos */}
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
            value={item.series !== undefined ? String(item.series) : "4"}
            onChangeText={(val) => onUpdateField(index, "series", val)}
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
            value={
              item.repeticoes !== undefined ? String(item.repeticoes) : "10"
            }
            onChangeText={(val) => onUpdateField(index, "repeticoes", val)}
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
            onChangeText={(val) => onUpdateField(index, "carga", val)}
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
            value={
              item.descanso !== undefined ? String(item.descanso) : "60"
            }
            onChangeText={(val) => onUpdateField(index, "descanso", val)}
            placeholder="60"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>
    </View>
  );
}

export default function TreinoScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const { showAlert, showConfirm } = useAlert();
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
  const [scrollHabilitado, setScrollHabilitado] = useState(true);

  // Catálogo de Exercícios para Adicionar durante a edição
  const [todosExercicios, setTodosExercicios] = useState<Exercicio[]>([]);
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroGrupoCatalogo, setFiltroGrupoCatalogo] = useState<string>("Todos");
  const [sessaoAtiva, setSessaoAtiva] = useState<SessaoAtivaTreino | null>(null);

  const carregarTreino = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const treinoDb = await getTreinoById(Number(id));
    setTreino(treinoDb);
    if (treinoDb) {
      setNomeEditado(treinoDb.nome);
      setExerciciosEditados(treinoDb.exercicios ? [...treinoDb.exercicios] : []);
    }
    const sessao = await obterSessaoAtiva();
    setSessaoAtiva(sessao);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    carregarTreino();
  }, [carregarTreino]);

  // Carrega o catálogo caso queira adicionar novos exercícios
  useEffect(() => {
    if (modoEdicao) {
      getExercicios().then((res) => setTodosExercicios(res));
    }
  }, [modoEdicao]);

  const iniciarEdicao = () => {
    if (treino) {
      setNomeEditado(treino.nome);
      setExerciciosEditados(treino.exercicios ? [...treino.exercicios] : []);
      setIdsParaExcluir([]);
    }
    setModoEdicao(true);
  };

  const cancelarEdicao = () => {
    if (treino) {
      setNomeEditado(treino.nome);
      setExerciciosEditados(treino.exercicios ? [...treino.exercicios] : []);
    }
    setIdsParaExcluir([]);
    setMostrarCatalogo(false);
    setModoEdicao(false);
  };

  const atualizarCampoExercicio = (
    index: number,
    campo: keyof ExercicioTreino,
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

  const removerExercicioDoTreino = (index: number) => {
    const itemRemover = exerciciosEditados[index];
    if (itemRemover && itemRemover.id && itemRemover.id > 0) {
      setIdsParaExcluir((prev) => [...prev, itemRemover.id]);
    }
    setExerciciosEditados((prev) =>
      prev.filter((_, i) => i !== index).map((item, idx) => ({ ...item, ordem: idx }))
    );
  };

  const moverExercicioEditado = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= exerciciosEditados.length) return;
    setExerciciosEditados((prev) => {
      const novaLista = [...prev];
      const [itemMovido] = novaLista.splice(fromIndex, 1);
      novaLista.splice(toIndex, 0, itemMovido);
      return novaLista.map((item, idx) => ({ ...item, ordem: idx }));
    });
  };

  const adicionarExercicioAoTreinoLocal = (ex: Exercicio) => {
    const treinoIdNum = Number(id);
    const novoItem: ExercicioTreino = {
      id: 0,
      treino_id: treinoIdNum,
      exercicio_id: ex.id,
      exercicio: ex,
      series: 4,
      repeticoes: 10,
      carga: 0,
      descanso: 60,
      ordem: exerciciosEditados.length,
    };

    setExerciciosEditados((prev) => [...prev, novoItem]);
    setMostrarCatalogo(false);
  };

  const salvarAlteracoes = async () => {
    Keyboard.dismiss();

    if (!nomeEditado.trim()) {
      showAlert("Atenção", "O nome do treino não pode ficar vazio!", "warning");
      return;
    }

    if (exerciciosEditados.length === 0) {
      showAlert("Atenção", "O treino precisa ter ao menos 1 exercício!", "warning");
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
      for (let i = 0; i < exerciciosEditados.length; i++) {
        const item = exerciciosEditados[i];
        if (item.id && item.id > 0) {
          await updateExercicioTreino(item.id, {
            series: Number(item.series) || 1,
            repeticoes: Number(item.repeticoes) || 1,
            carga: Number(item.carga) || 0,
            descanso: Number(item.descanso) || 30,
            ordem: i,
          });
        } else {
          await addExercicioTreino({
            treinoId: treinoIdNum,
            exercicioId: item.exercicio_id,
            series: Number(item.series) || 1,
            repeticoes: Number(item.repeticoes) || 1,
            carga: Number(item.carga) || 0,
            descanso: Number(item.descanso) || 30,
            ordem: i,
          });
        }
      }

      await carregarTreino();
      dispatch(carregarTreinos());

      setModoEdicao(false);
      showAlert("Sucesso!", "Treino atualizado com sucesso!", "success");
    } catch (e) {
      console.error(e);
      showAlert("Erro", "Erro ao salvar alterações no treino.", "error");
    } finally {
      setSalvando(false);
    }
  };

  const exerciciosFiltrados = todosExercicios.filter((ex) => {
    const matchBusca =
      pesquisa.trim() === "" ||
      ex.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
      (ex.descricao && ex.descricao.toLowerCase().includes(pesquisa.toLowerCase()));

    if (!matchBusca) return false;
    if (filtroGrupoCatalogo === "Todos") return true;

    return (ex.grupo_muscular || "Geral") === filtroGrupoCatalogo;
  });

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
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <MaterialCommunityIcons name="dumbbell" size={24} color={colors.accent} />
                  <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {treino.nome}
                  </Text>
                </View>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                  {treino.exercicios?.length || 0} exercício(s) configurado(s)
                </Text>
              </View>
              <TouchableOpacity
                onPress={iniciarEdicao}
                style={[styles.btnEditar, { backgroundColor: colors.accent }]}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={15} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.btnEditarText}>Editar</Text>
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
                  <Ionicons name="close-outline" size={16} color={colors.text} style={{ marginRight: 4 }} />
                  <Text style={[styles.btnCancelarText, { color: colors.text }]}>
                    Cancelar
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
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="save-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
                      <Text style={styles.btnSalvarText}>Salvar</Text>
                    </View>
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
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 2 }}>
                        <Ionicons name="repeat" size={11} color={colors.textSecondary} />
                        <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>
                          Séries
                        </Text>
                      </View>
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
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 2 }}>
                        <Ionicons name="bar-chart-outline" size={11} color={colors.textSecondary} />
                        <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>
                          Reps
                        </Text>
                      </View>
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
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 2 }}>
                        <MaterialCommunityIcons name="weight-kilogram" size={12} color={colors.textSecondary} />
                        <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>
                          Carga
                        </Text>
                      </View>
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
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 2 }}>
                        <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
                        <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>
                          Descanso
                        </Text>
                      </View>
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

            {/* BOTÃO FIXO INFERIOR: INICIAR / CONTINUAR TREINO */}
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
                  onPress={() => {
                    if (sessaoAtiva && sessaoAtiva.treinoId === Number(id)) {
                      // Continua direto a sessão ativa deste treino
                      router.push(`/(modals)/treinos/treinar/${id}`);
                    } else if (sessaoAtiva && sessaoAtiva.treinoId !== Number(id)) {
                      // Avisa que já existe outro treino em andamento
                      showConfirm(
                        "Treino em Andamento",
                        `Você já possui uma sessão em andamento de "${sessaoAtiva.nomeTreino}". Deseja descartá-la para iniciar este novo treino?`,
                        async () => {
                          await limparSessaoAtiva();
                          router.push(`/(modals)/treinos/treinar/${id}`);
                        },
                        true,
                        "Descartar Anterior e Iniciar",
                        "Cancelar"
                      );
                    } else {
                      router.push(`/(modals)/treinos/treinar/${id}`);
                    }
                  }}
                  style={[
                    styles.btnIniciarTreino,
                    {
                      backgroundColor:
                        sessaoAtiva && sessaoAtiva.treinoId === Number(id)
                          ? colors.accent
                          : colors.primary,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={
                      sessaoAtiva && sessaoAtiva.treinoId === Number(id)
                        ? "flash"
                        : "play"
                    }
                    size={18}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.btnIniciarTreinoText}>
                    {sessaoAtiva && sessaoAtiva.treinoId === Number(id)
                      ? "Continuar Treino em Andamento"
                      : "Iniciar Treino"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* MODO EDIÇÃO */
          <ScrollView
            scrollEnabled={scrollHabilitado}
            contentContainerStyle={styles.listContentEdicao}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
          >
            {exerciciosEditados.map((item, index) => (
              <CardExercicioEdicao
                key={item.id ? `id-${item.id}` : `novo-${index}`}
                item={item}
                index={index}
                total={exerciciosEditados.length}
                colors={colors}
                onMove={moverExercicioEditado}
                onRemove={removerExercicioDoTreino}
                onUpdateField={atualizarCampoExercicio}
              />
            ))}

            {/* Adicionar Mais Exercícios ao Treino */}
            <TouchableOpacity
              onPress={() => setMostrarCatalogo(!mostrarCatalogo)}
              style={[
                styles.btnAddExercicio,
                { backgroundColor: colors.accentLight, borderColor: colors.accent },
              ]}
            >
              <Ionicons
                name={mostrarCatalogo ? "chevron-up" : "add-circle-outline"}
                size={18}
                color={colors.accent}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.btnAddExercicioText, { color: colors.accent }]}>
                {mostrarCatalogo ? "Fechar Catálogo" : "Adicionar Mais Exercícios"}
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
                  placeholder="Pesquisar exercício ou músculo..."
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

                {/* Chips de Filtro por Grupo Muscular */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6, paddingVertical: 4, marginBottom: 8 }}
                >
                  {["Todos", ...GRUPOS_MUSCULARES].map((grupo) => {
                    const ativo = filtroGrupoCatalogo === grupo;
                    return (
                      <TouchableOpacity
                        key={grupo}
                        onPress={() => setFiltroGrupoCatalogo(grupo)}
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
                      <Ionicons
                        name={jaNoTreino ? "checkmark-circle" : "add-circle-outline"}
                        size={22}
                        color={jaNoTreino ? colors.success : colors.accent}
                        style={{ marginRight: 10 }}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                          <Text
                            style={[
                              styles.catalogoItemNome,
                              { color: colors.text },
                              jaNoTreino && { color: colors.textMuted },
                            ]}
                          >
                            {ex.nome}
                          </Text>
                          <View
                            style={[
                              styles.miniBadgeGrupo,
                              { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
                            ]}
                          >
                            <Text style={[styles.miniBadgeGrupoText, { color: colors.textSecondary }]}>
                              {ex.grupo_muscular || "Geral"}
                            </Text>
                          </View>
                        </View>
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
