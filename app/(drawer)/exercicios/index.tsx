import { useAlert } from "@/src/context/AlertContext";
import { useTheme } from "@/src/context/ThemeContext";
import { AppDispatch, RootState } from "@/src/store";
import {
  adicionarExercicio,
  carregarExercicios,
  editarExercicio,
  removerExercicio,
} from "@/src/store/exercicioSlice";
import { Exercicio, GRUPOS_MUSCULARES, GrupoMuscular } from "@/src/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

const FILTROS_TELA = ["Todos", ...GRUPOS_MUSCULARES] as const;

export default function ExerciciosScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();
  const { showAlert, showConfirm } = useAlert();

  const exercicios = useSelector((state: RootState) => state.exercicios.lista);
  const loading = useSelector((state: RootState) => state.exercicios.loading);

  const [pesquisa, setPesquisa] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState<string>("Todos");

  // Modal Criar / Editar
  const [modalAberto, setModalAberto] = useState(false);
  const [exercicioEmEdicao, setExercicioEmEdicao] = useState<Exercicio | null>(null);
  const [nomeForm, setNomeForm] = useState("");
  const [descricaoForm, setDescricaoForm] = useState("");
  const [grupoForm, setGrupoForm] = useState<GrupoMuscular>("Peitoral");
  const [salvando, setSalvando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(carregarExercicios());
    }, [dispatch])
  );

  const abrirModalNovo = () => {
    setExercicioEmEdicao(null);
    setNomeForm("");
    setDescricaoForm("");
    setGrupoForm(
      filtroGrupo !== "Todos" ? (filtroGrupo as GrupoMuscular) : "Peitoral"
    );
    setModalAberto(true);
  };

  const abrirModalEdicao = (ex: Exercicio) => {
    setExercicioEmEdicao(ex);
    setNomeForm(ex.nome);
    setDescricaoForm(ex.descricao || "");
    setGrupoForm(ex.grupo_muscular || "Geral");
    setModalAberto(true);
  };

  const salvarExercicioForm = async () => {
    Keyboard.dismiss();
    if (!nomeForm.trim()) {
      showAlert("Atenção", "O exercício precisa ter um nome!", "warning");
      return;
    }

    setSalvando(true);
    try {
      if (exercicioEmEdicao) {
        await dispatch(
          editarExercicio({
            id: exercicioEmEdicao.id,
            nome: nomeForm.trim(),
            descricao: descricaoForm.trim() || undefined,
            grupo_muscular: grupoForm,
          })
        ).unwrap();
      } else {
        await dispatch(
          adicionarExercicio({
            nome: nomeForm.trim(),
            descricao: descricaoForm.trim() || undefined,
            grupo_muscular: grupoForm,
          })
        ).unwrap();
      }
      setModalAberto(false);
    } catch (error) {
      console.error(error);
      showAlert("Erro", "Não foi possível salvar o exercício.", "error");
    } finally {
      setSalvando(false);
    }
  };

  const confirmarExclusao = (ex: Exercicio) => {
    showConfirm(
      "Excluir Exercício",
      `Deseja realmente remover "${ex.nome}" do catálogo?`,
      async () => {
        await dispatch(removerExercicio(ex.id));
      },
      true,
      "Excluir"
    );
  };

  const exerciciosFiltrados = useMemo(() => {
    return exercicios.filter((ex) => {
      const matchBusca =
        pesquisa.trim() === "" ||
        ex.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
        (ex.descricao && ex.descricao.toLowerCase().includes(pesquisa.toLowerCase()));

      if (!matchBusca) return false;
      if (filtroGrupo === "Todos") return true;

      return (ex.grupo_muscular || "Geral") === filtroGrupo;
    });
  }, [exercicios, pesquisa, filtroGrupo]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Barra de Busca e Botão Novo */}
      <View style={styles.topSection}>
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            placeholder="Pesquisar por nome ou músculo..."
            placeholderTextColor={colors.textMuted}
            value={pesquisa}
            onChangeText={setPesquisa}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
          />
          {pesquisa.length > 0 && (
            <TouchableOpacity
              onPress={() => setPesquisa("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Botão Novo Exercício */}
        <TouchableOpacity
          onPress={abrirModalNovo}
          style={[styles.btnNovo, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.btnNovoText}>Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Chips de Filtro por Grupo Muscular */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {FILTROS_TELA.map((grupo) => {
            const ativo = filtroGrupo === grupo;
            return (
              <TouchableOpacity
                key={grupo}
                onPress={() => setFiltroGrupo(grupo)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: ativo ? colors.primary : colors.card,
                    borderColor: ativo ? colors.primary : colors.cardBorder,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: ativo ? "#fff" : colors.textSecondary },
                  ]}
                >
                  {grupo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Header Info */}
      <View style={styles.headerInfoRow}>
        <Text style={[styles.headerCount, { color: colors.textSecondary }]}>
          Exibindo{" "}
          <Text style={{ color: colors.primary, fontWeight: "bold" }}>
            {exerciciosFiltrados.length}
          </Text>{" "}
          de {exercicios.length} exercícios
        </Text>
      </View>

      {/* Lista de Exercícios */}
      {loading && exercicios.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando catálogo...
          </Text>
        </View>
      ) : (
        <FlatList
          data={exerciciosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View
              style={[
                styles.exerciseCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View style={styles.exerciseCardContent}>
                <View
                  style={[
                    styles.exerciseIconContainer,
                    { backgroundColor: colors.accentLight },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="dumbbell"
                    size={22}
                    color={colors.accent}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardTitleRow}>
                    <Text style={[styles.exerciseNome, { color: colors.text }]}>
                      {item.nome}
                    </Text>
                    <View
                      style={[
                        styles.badgeGrupo,
                        {
                          backgroundColor: colors.accentLight,
                          borderColor: colors.accent,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeGrupoText,
                          { color: colors.accent },
                        ]}
                      >
                        {item.grupo_muscular || "Geral"}
                      </Text>
                    </View>
                  </View>
                  {item.descricao ? (
                    <Text
                      style={[
                        styles.exerciseDescricao,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={2}
                    >
                      {item.descricao}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Ações de Edição e Exclusão */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={() => abrirModalEdicao(item)}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: colors.cardSecondary,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="create-outline"
                    size={15}
                    color={colors.accent}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.actionBtnText, { color: colors.accent }]}>
                    Editar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => confirmarExclusao(item)}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: colors.cardSecondary,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trash-outline"
                    size={15}
                    color={colors.danger}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.actionBtnText, { color: colors.danger }]}>
                    Excluir
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View
              style={[
                styles.emptyContainer,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <MaterialCommunityIcons
                name="magnify-remove-outline"
                size={44}
                color={colors.textMuted}
                style={{ marginBottom: 12 }}
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Nenhum exercício encontrado
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Tente buscar por outro termo ou cadastre um novo exercício pelo botão acima.
              </Text>
            </View>
          }
        />
      )}

      {/* Modal de Criação / Edição de Exercício */}
      <Modal
        visible={modalAberto}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalAberto(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[styles.modalOverlay, { backgroundColor: colors.backdrop }]}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalDismissArea}>
              <View
                style={[
                  styles.modalCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <View style={styles.modalHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons
                      name={exercicioEmEdicao ? "create-outline" : "add-circle-outline"}
                      size={22}
                      color={colors.accent}
                    />
                    <Text style={[styles.modalTitle, { color: colors.text }]}>
                      {exercicioEmEdicao ? "Editar Exercício" : "Novo Exercício"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalAberto(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Input Nome */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Nome do Exercício *
                </Text>
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                  value={nomeForm}
                  onChangeText={setNomeForm}
                  placeholder="Ex: Supino Reto com Barra"
                  placeholderTextColor={colors.textMuted}
                  autoFocus={true}
                />

                {/* Seletor de Grupo Muscular */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Grupo Muscular
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.modalGruposScroll}
                >
                  {GRUPOS_MUSCULARES.map((g) => {
                    const selecionado = grupoForm === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        onPress={() => setGrupoForm(g)}
                        style={[
                          styles.modalGrupoChip,
                          {
                            backgroundColor: selecionado
                              ? colors.primary
                              : colors.cardSecondary,
                            borderColor: selecionado
                              ? colors.primary
                              : colors.cardBorder,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalGrupoChipText,
                            {
                              color: selecionado ? "#fff" : colors.textSecondary,
                              fontWeight: selecionado ? "bold" : "normal",
                            },
                          ]}
                        >
                          {g}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Input Descrição */}
                <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 10 }]}>
                  Descrição ou Músculo Alvo (opcional)
                </Text>
                <TextInput
                  style={[
                    styles.inputField,
                    styles.inputTextArea,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                  value={descricaoForm}
                  onChangeText={setDescricaoForm}
                  placeholder="Ex: Foco no peitoral maior e tríceps"
                  placeholderTextColor={colors.textMuted}
                  multiline={true}
                  numberOfLines={3}
                />

                {/* Botões de Ação */}
                <View style={styles.modalBotoesRow}>
                  <TouchableOpacity
                    onPress={() => setModalAberto(false)}
                    disabled={salvando}
                    style={[
                      styles.modalBtnCancelar,
                      {
                        backgroundColor: colors.cardSecondary,
                        borderColor: colors.cardBorder,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalBtnCancelarText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Cancelar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={salvarExercicioForm}
                    disabled={salvando}
                    style={[
                      styles.modalBtnSalvar,
                      { backgroundColor: colors.primary },
                    ]}
                    activeOpacity={0.8}
                  >
                    {salvando ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons
                          name="save-outline"
                          size={16}
                          color="#fff"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={styles.modalBtnSalvarText}>
                          {exercicioEmEdicao ? "Salvar Alterações" : "Cadastrar"}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  btnNovo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  btnNovoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  chipsContainer: {
    marginBottom: 4,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  headerInfoRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  headerCount: {
    fontSize: 13,
  },
  listContent: {
    padding: 16,
    paddingTop: 6,
    paddingBottom: 40,
  },
  exerciseCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  exerciseCardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  exerciseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 3,
  },
  exerciseNome: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
  },
  badgeGrupo: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  badgeGrupoText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  exerciseDescricao: {
    fontSize: 13,
    lineHeight: 17,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(150, 150, 150, 0.15)",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalDismissArea: {
    width: "100%",
    alignItems: "center",
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
  },
  inputTextArea: {
    height: 70,
    textAlignVertical: "top",
  },
  modalGruposScroll: {
    gap: 6,
    paddingVertical: 4,
    marginBottom: 6,
  },
  modalGrupoChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalGrupoChipText: {
    fontSize: 12,
  },
  modalBotoesRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  modalBtnCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  modalBtnCancelarText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  modalBtnSalvar: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnSalvarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
