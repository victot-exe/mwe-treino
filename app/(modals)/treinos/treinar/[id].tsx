import { useAlert } from "@/src/context/AlertContext";
import { useTheme } from "@/src/context/ThemeContext";
import {
  atualizarOrdemExercicios,
  updateExercicioTreino,
} from "@/src/database/exercicioTreinoRepository";
import { salvarSessaoTreino } from "@/src/database/historicoRepository";
import {
  limparSessaoAtiva,
  obterSessaoAtiva,
  salvarSessaoAtiva,
} from "@/src/database/sessaoAtivaRepository";
import { getTreinoById } from "@/src/database/treinoRepository";
import {
  agendarNotificacaoDescanso,
  cancelarNotificacaoDescanso,
  requestNotificationPermissions,
} from "@/src/services/notificationService";
import { ExercicioTreino, Treino } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProgressoExercicio {
  serieAtual: number;
  totalSeries: number;
  concluido: boolean;
  carga: number;
  repeticoes?: number;
}

interface DrawerExercicioItemProps {
  item: ExercicioTreino;
  index: number;
  total: number;
  colors: any;
  isAtivo: boolean;
  est: ProgressoExercicio;
  onSelect: (index: number) => void;
  onToggleConcluido: (exercicioId: number) => void;
  onMove: (from: number, to: number) => void;
}

function DrawerExercicioItem({
  item,
  index,
  total,
  colors,
  isAtivo,
  est,
  onSelect,
  onToggleConcluido,
  onMove,
}: DrawerExercicioItemProps) {
  return (
    <View
      style={[
        styles.drawerItem,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        },
        isAtivo && {
          borderColor: colors.accent,
          backgroundColor: colors.accentLight,
        },
        est?.concluido && {
          backgroundColor: colors.successLight,
          borderColor: colors.success,
        },
      ]}
    >
      {/* Checkbox direta */}
      <TouchableOpacity
        onPress={() => onToggleConcluido(item.exercicio_id)}
        style={styles.checkboxTouch}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={est?.concluido ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={est?.concluido ? colors.success : colors.textMuted}
        />
      </TouchableOpacity>

      {/* Toque no Nome muda para este exercício */}
      <TouchableOpacity
        onPress={() => onSelect(index)}
        style={{ flex: 1 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={[
              styles.drawerItemNome,
              { color: colors.text },
              est?.concluido && {
                textDecorationLine: "line-through",
                color: colors.textMuted,
              },
              isAtivo && { color: colors.accent },
            ]}
            numberOfLines={1}
          >
            {item.exercicio?.nome}
          </Text>
          {isAtivo && (
            <View
              style={[
                styles.badgeAtual,
                { backgroundColor: colors.accent },
              ]}
            >
              <Text style={styles.badgeAtualText}>Atual</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.drawerItemStatus,
            { color: colors.textSecondary },
          ]}
        >
          {est?.serieAtual ?? 1}/{est?.totalSeries ?? item.series ?? 4} séries • {est?.carga ?? item.carga ?? 0} kg
        </Text>
      </TouchableOpacity>

      {/* Controles de Reordenação */}
      <View style={styles.drawerItemActions}>
        <TouchableOpacity
          onPress={() => onMove(index, index - 1)}
          disabled={index === 0}
          style={[
            styles.btnDrawerOrdem,
            index === 0 && { opacity: 0.2 },
          ]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="chevron-up" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onMove(index, index + 1)}
          disabled={index === total - 1}
          style={[
            styles.btnDrawerOrdem,
            index === total - 1 && { opacity: 0.2 },
          ]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TreinarScreen() {
  const { colors } = useTheme();
  const { showConfirm } = useAlert();
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [treino, setTreino] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(true);

  // Índice do exercício ativo no momento
  const [exercicioAtivoIndex, setExercicioAtivoIndex] = useState(0);

  // Mapa de progresso de cada exercício (por exercicio_id)
  const [progresso, setProgresso] = useState<{ [key: number]: ProgressoExercicio }>({});

  // Cronômetro total do treino baseado em Timestamp (imune a segundo plano)
  const inicioTreinoTimestampRef = useRef<number>(Date.now());
  const [tempoDecorrido, setTempoDecorrido] = useState(0);

  // Estado do Descanso baseado em Timestamp
  const [descansoAtivo, setDescansoAtivo] = useState(false);
  const [tempoRestanteDescanso, setTempoRestanteDescanso] = useState(0);
  const fimDescansoTimestampRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ID da notificação agendada
  const notificationIdRef = useRef<string | null>(null);

  // Menu Lateral Retrátil (Checklist)
  const [menuLateralAberto, setMenuLateralAberto] = useState(false);
  const [drawerScrollHabilitado, setDrawerScrollHabilitado] = useState(true);

  // Modal de Celebração de Treino Concluído
  const [treinoFinalizadoModal, setTreinoFinalizadoModal] = useState(false);

  // Modal de Edição Manual de Carga
  const [modalEditarCarga, setModalEditarCarga] = useState(false);
  const [inputCargaTexto, setInputCargaTexto] = useState("");
  const inputCargaRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (modalEditarCarga) {
      const timer = setTimeout(() => {
        inputCargaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [modalEditarCarga]);

  // Modal de Edição Manual de Repetições
  const [modalEditarReps, setModalEditarReps] = useState(false);
  const [inputRepsTexto, setInputRepsTexto] = useState("");
  const inputRepsRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (modalEditarReps) {
      const timer = setTimeout(() => {
        inputRepsRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [modalEditarReps]);

  // Carrega treino, solicita permissões e inicializa ou restaura progresso
  const inicializarTreino = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    await requestNotificationPermissions();

    const treinoDb = await getTreinoById(Number(id));
    setTreino(treinoDb);

    if (treinoDb && treinoDb.exercicios && treinoDb.exercicios.length > 0) {
      const treinoIdNum = Number(id);
      const sessaoSalva = await obterSessaoAtiva();

      if (
        sessaoSalva &&
        sessaoSalva.treinoId === treinoIdNum &&
        sessaoSalva.progresso &&
        Object.keys(sessaoSalva.progresso).length > 0
      ) {
        // Restaura progresso salvo da sessão ativa
        setProgresso(sessaoSalva.progresso);
        const idx =
          sessaoSalva.exercicioAtivoIndex >= 0 &&
          sessaoSalva.exercicioAtivoIndex < treinoDb.exercicios.length
            ? sessaoSalva.exercicioAtivoIndex
            : 0;
        setExercicioAtivoIndex(idx);
        inicioTreinoTimestampRef.current =
          sessaoSalva.inicioTreinoTimestamp || Date.now();
        const decorridoInicial = Math.floor(
          (Date.now() - inicioTreinoTimestampRef.current) / 1000
        );
        setTempoDecorrido(Math.max(0, decorridoInicial));
      } else {
        // Inicializa nova sessão
        const mapaInicial: { [key: number]: ProgressoExercicio } = {};
        treinoDb.exercicios.forEach((ex) => {
          mapaInicial[ex.exercicio_id] = {
            serieAtual: 1,
            totalSeries: ex.series || 4,
            concluido: false,
            carga: ex.carga || 0,
            repeticoes: ex.repeticoes || 10,
          };
        });
        setProgresso(mapaInicial);
        setExercicioAtivoIndex(0);
        inicioTreinoTimestampRef.current = Date.now();
        setTempoDecorrido(0);

        // Salva estado inicial ativo no SQLite
        await salvarSessaoAtiva({
          treinoId: treinoIdNum,
          nomeTreino: treinoDb.nome,
          exercicioAtivoIndex: 0,
          inicioTreinoTimestamp: inicioTreinoTimestampRef.current,
          tempoDecorridoSegundos: 0,
          progresso: mapaInicial,
          ultimaAtualizacao: Date.now(),
        });
      }
    }

    setLoading(false);
  }, [id]);

  // Salva snapshot do treino temporário no SQLite
  const persistirSessaoTemporaria = useCallback(
    async (
      novoProgresso: { [key: number]: ProgressoExercicio },
      novoIndex?: number
    ) => {
      if (!treino || !id) return;
      const idx = novoIndex !== undefined ? novoIndex : exercicioAtivoIndex;
      await salvarSessaoAtiva({
        treinoId: Number(id),
        nomeTreino: treino.nome,
        exercicioAtivoIndex: idx,
        inicioTreinoTimestamp: inicioTreinoTimestampRef.current,
        tempoDecorridoSegundos: tempoDecorrido,
        progresso: novoProgresso,
        ultimaAtualizacao: Date.now(),
      });
    },
    [treino, id, exercicioAtivoIndex, tempoDecorrido]
  );

  useEffect(() => {
    inicializarTreino();
  }, [inicializarTreino]);

  // Função central que atualiza os tempos com precisão matemática via Timestamp
  const sincronizarCronometros = useCallback(() => {
    const decorrido = Math.floor((Date.now() - inicioTreinoTimestampRef.current) / 1000);
    setTempoDecorrido(Math.max(0, decorrido));

    if (fimDescansoTimestampRef.current !== null) {
      const restanteMs = fimDescansoTimestampRef.current - Date.now();
      const restanteSeg = restanteMs >= 0
        ? Math.ceil(restanteMs / 1000)
        : Math.floor(restanteMs / 1000);

      setTempoRestanteDescanso(restanteSeg);
    }
  }, []);

  // Loop de intervalo contínuo
  useEffect(() => {
    if (loading || !treino) return;

    timerIntervalRef.current = setInterval(() => {
      sincronizarCronometros();
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [loading, treino, sincronizarCronometros]);

  // Sincroniza IMEDIATAMENTE ao voltar do segundo plano
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        sincronizarCronometros();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [sincronizarCronometros]);

  // Limpa notificações ao desmontar a tela
  useEffect(() => {
    return () => {
      if (notificationIdRef.current) {
        cancelarNotificacaoDescanso(notificationIdRef.current);
      }
    };
  }, []);

  // Formatação de Tempo (segundos -> MM:SS)
  const formatarTempo = (totalSegundos: number) => {
    const min = Math.floor(totalSegundos / 60);
    const seg = totalSegundos % 60;
    return `${min.toString().padStart(2, "0")}:${seg.toString().padStart(2, "0")}`;
  };

  // Formatação de Tempo de Descanso (suporta contagem regressiva e contagem negativa de tempo excedente)
  const formatarTempoDescanso = (segundos: number) => {
    const isNegativo = segundos < 0;
    const totalSegundos = Math.abs(segundos);
    const min = Math.floor(totalSegundos / 60);
    const seg = totalSegundos % 60;
    const formatado = `${min.toString().padStart(2, "0")}:${seg.toString().padStart(2, "0")}`;
    return isNegativo ? `-${formatado}` : formatado;
  };

  // Iniciar Cronômetro de Descanso
  const iniciarDescanso = async (segundos: number, nomeExercicio: string) => {
    if (notificationIdRef.current) {
      await cancelarNotificacaoDescanso(notificationIdRef.current);
    }

    const tempoValido = Math.max(5, segundos);
    fimDescansoTimestampRef.current = Date.now() + tempoValido * 1000;
    setTempoRestanteDescanso(tempoValido);
    setDescansoAtivo(true);

    const notifId = await agendarNotificacaoDescanso(tempoValido, nomeExercicio);
    notificationIdRef.current = notifId;
  };

  // Pular / Cancelar Descanso
  const pularDescanso = async () => {
    if (notificationIdRef.current) {
      await cancelarNotificacaoDescanso(notificationIdRef.current);
      notificationIdRef.current = null;
    }
    fimDescansoTimestampRef.current = null;
    setDescansoAtivo(false);
    setTempoRestanteDescanso(0);
  };

  // Adicionar +15s ao descanso
  const adicionarTempoDescanso = async (segundosAdicionais: number = 15) => {
    if (fimDescansoTimestampRef.current !== null) {
      if (fimDescansoTimestampRef.current < Date.now()) {
        fimDescansoTimestampRef.current = Date.now() + segundosAdicionais * 1000;
      } else {
        fimDescansoTimestampRef.current += segundosAdicionais * 1000;
      }
      const restanteMs = fimDescansoTimestampRef.current - Date.now();
      setTempoRestanteDescanso(Math.ceil(restanteMs / 1000));
    }
  };

  // Ref para evitar salvar a mesma sessão mais de uma vez
  const salvoRef = useRef(false);

  // Função central para persistir a sessão e abrir modal de parabéns
  const finalizarESalvarTreino = useCallback(
    async (progressoAtual?: { [key: number]: ProgressoExercicio }) => {
      if (salvoRef.current || !treino) return;
      salvoRef.current = true;

      await pularDescanso();

      try {
        const mapa = progressoAtual || progresso;
        const dataInicio = new Date(inicioTreinoTimestampRef.current).toISOString();
        const dataFim = new Date().toISOString();
        const concluidos = Object.values(mapa).filter((p) => p.concluido).length;

        const exerciciosParaSalvar = (treino.exercicios || []).map((item) => {
          const est = mapa[item.exercicio_id];
          return {
            exercicio_id: item.exercicio_id,
            nome_exercicio: item.exercicio?.nome || "Exercício",
            series_feitas: est ? (est.concluido ? est.totalSeries : est.serieAtual) : item.series,
            repeticoes: item.repeticoes,
            carga: est ? est.carga : item.carga,
          };
        });

        await salvarSessaoTreino({
          treino_id: treino.id,
          nome_treino: treino.nome,
          data_inicio: dataInicio,
          data_fim: dataFim,
          duracao_segundos: tempoDecorrido,
          exercicios_concluidos: concluidos,
          total_exercicios: treino.exercicios?.length || 0,
          exercicios: exerciciosParaSalvar,
        });

        // Limpa a sessão temporária ativa do SQLite
        await limparSessaoAtiva();
      } catch (error) {
        console.error("Erro ao salvar histórico de treino:", error);
      }

      setTreinoFinalizadoModal(true);
    },
    [treino, progresso, tempoDecorrido]
  );

  // Concluir Série do Exercício Ativo
  const concluirSerie = (exercicioAtual: ExercicioTreino) => {
    const estado = progresso[exercicioAtual.exercicio_id];
    if (!estado) return;

    const tempoDescanso = exercicioAtual.descanso || 60;
    const nomeEx = exercicioAtual.exercicio?.nome || "Exercício";

    if (estado.serieAtual < estado.totalSeries) {
      const novoProgresso = {
        ...progresso,
        [exercicioAtual.exercicio_id]: {
          ...progresso[exercicioAtual.exercicio_id],
          serieAtual: progresso[exercicioAtual.exercicio_id].serieAtual + 1,
        },
      };
      setProgresso(novoProgresso);
      persistirSessaoTemporaria(novoProgresso);
      iniciarDescanso(tempoDescanso, nomeEx);
    } else {
      const novoProgresso = {
        ...progresso,
        [exercicioAtual.exercicio_id]: {
          ...progresso[exercicioAtual.exercicio_id],
          concluido: true,
        },
      };
      setProgresso(novoProgresso);

      const todosConcluidos = Object.values(novoProgresso).every((p) => p.concluido);
      if (todosConcluidos) {
        finalizarESalvarTreino(novoProgresso);
      } else {
        iniciarDescanso(tempoDescanso, nomeEx);
        const proximoIndex = treino?.exercicios?.findIndex(
          (item) => !novoProgresso[item.exercicio_id]?.concluido
        );
        const idxFinal =
          proximoIndex !== undefined && proximoIndex !== -1
            ? proximoIndex
            : exercicioAtivoIndex;
        if (proximoIndex !== undefined && proximoIndex !== -1) {
          setExercicioAtivoIndex(proximoIndex);
        }
        persistirSessaoTemporaria(novoProgresso, idxFinal);
      }
    }
  };

  // Alternar Checkbox manualmente na lista lateral
  const toggleCheckboxManual = (exercicioId: number) => {
    setProgresso((prev) => {
      const atual = prev[exercicioId];
      if (!atual) return prev;
      const novoStatus = !atual.concluido;
      const novoProgresso = {
        ...prev,
        [exercicioId]: {
          ...atual,
          concluido: novoStatus,
        },
      };

      const todosConcluidos = Object.values(novoProgresso).every((p) => p.concluido);
      if (todosConcluidos) {
        finalizarESalvarTreino(novoProgresso);
      } else {
        persistirSessaoTemporaria(novoProgresso);
      }

      return novoProgresso;
    });
  };

  // Mover exercício na lista durante o treino e sincronizar no banco
  const moverExercicioNaExecucao = async (fromIndex: number, toIndex: number) => {
    if (!treino || !treino.exercicios) return;
    if (toIndex < 0 || toIndex >= treino.exercicios.length) return;

    const exercicioAtivoId = treino.exercicios[exercicioAtivoIndex]?.exercicio_id;
    const novaLista = [...treino.exercicios];
    const [itemMovido] = novaLista.splice(fromIndex, 1);
    novaLista.splice(toIndex, 0, itemMovido);

    const novaListaComOrdem = novaLista.map((item, idx) => ({ ...item, ordem: idx }));

    // Mantém o exercício ativo sincronizado com a nova posição
    const novoIndexAtivo = novaListaComOrdem.findIndex(
      (item) => item.exercicio_id === exercicioAtivoId
    );
    if (novoIndexAtivo !== -1) {
      setExercicioAtivoIndex(novoIndexAtivo);
    }

    setTreino((prev) => (prev ? { ...prev, exercicios: novaListaComOrdem } : prev));

    // Salva a nova sequência de ordens no SQLite
    const itensParaAtualizar = novaListaComOrdem
      .filter((item) => item.id && item.id > 0)
      .map((item, idx) => ({ id: item.id, ordem: idx }));

    if (itensParaAtualizar.length > 0) {
      await atualizarOrdemExercicios(itensParaAtualizar);
    }
  };

  // Abrir modal de edição manual de carga
  const abrirEdicaoManualCarga = () => {
    const exAtual = treino?.exercicios?.[exercicioAtivoIndex];
    if (!exAtual) return;
    const progAtual = progresso[exAtual.exercicio_id];
    setInputCargaTexto((progAtual?.carga ?? exAtual.carga ?? 0).toString());
    setModalEditarCarga(true);
  };

  // Salvar carga digitada manualmente
  const salvarCargaManual = async () => {
    const exAtual = treino?.exercicios?.[exercicioAtivoIndex];
    if (!exAtual) return;

    const valorLimpo = inputCargaTexto.replace(",", ".");
    const valorNum = parseFloat(valorLimpo);
    const novaCarga = isNaN(valorNum) ? 0 : Math.max(0, valorNum);

    const novoProgresso = {
      ...progresso,
      [exAtual.exercicio_id]: {
        ...progresso[exAtual.exercicio_id],
        carga: novaCarga,
      },
    };

    setProgresso(novoProgresso);
    persistirSessaoTemporaria(novoProgresso);

    if (exAtual.id) {
      await updateExercicioTreino(exAtual.id, { carga: novaCarga });
    }

    setModalEditarCarga(false);
    Keyboard.dismiss();
  };

  // Abrir modal de edição manual de repetições
  const abrirEdicaoManualReps = () => {
    const exAtual = treino?.exercicios?.[exercicioAtivoIndex];
    if (!exAtual) return;
    const progAtual = progresso[exAtual.exercicio_id];
    setInputRepsTexto((progAtual?.repeticoes ?? exAtual.repeticoes ?? 10).toString());
    setModalEditarReps(true);
  };

  // Salvar repetições digitadas manualmente
  const salvarRepsManual = async () => {
    const exAtual = treino?.exercicios?.[exercicioAtivoIndex];
    if (!exAtual) return;

    const valorLimpo = inputRepsTexto.replace(",", ".");
    const valorNum = parseInt(valorLimpo, 10);
    const novasReps = isNaN(valorNum) ? 1 : Math.max(1, valorNum);

    const novoProgresso = {
      ...progresso,
      [exAtual.exercicio_id]: {
        ...progresso[exAtual.exercicio_id],
        repeticoes: novasReps,
      },
    };

    setProgresso(novoProgresso);
    persistirSessaoTemporaria(novoProgresso);

    if (exAtual.id) {
      await updateExercicioTreino(exAtual.id, { repeticoes: novasReps });
    }

    setModalEditarReps(false);
    Keyboard.dismiss();
  };

  // Confirmar saída do treino
  const confirmarEncerramento = () => {
    showConfirm(
      "Finalizar Treino",
      "Deseja realmente encerrar a sessão de treino agora?",
      () => {
        finalizarESalvarTreino();
      },
      true,
      "Encerrar e Salvar",
      "Continuar Treinando"
    );
  };

  if (loading || !treino || !treino.exercicios || treino.exercicios.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Preparando seu treino...
        </Text>
      </View>
    );
  }

  const exercicioAtual = treino.exercicios[exercicioAtivoIndex] || treino.exercicios[0];
  const estadoAtual = progresso[exercicioAtual.exercicio_id] || {
    serieAtual: 1,
    totalSeries: exercicioAtual.series || 4,
    concluido: false,
    carga: exercicioAtual.carga || 0,
  };

  const totalExercicios = treino.exercicios.length;
  const concluidosCount = Object.values(progresso).filter((p) => p.concluido).length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBg }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* CABEÇALHO COM BOTÃO DE LISTA NA ESQUERDA */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.headerBg, borderColor: colors.cardBorder },
          ]}
        >
          {/* Botão de Lista na Esquerda */}
          <TouchableOpacity
            onPress={() => setMenuLateralAberto(true)}
            style={[
              styles.btnMenu,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="list" size={16} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.btnMenuText, { color: colors.text }]}>Lista</Text>
          </TouchableOpacity>

          {/* Centro: Nome do Treino e Cronômetro */}
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTreinoNome, { color: colors.headerText }]} numberOfLines={1}>
              {treino.nome}
            </Text>
            <View style={styles.headerStatusRow}>
              <View style={styles.headerTimerRow}>
                <Ionicons name="time-outline" size={13} color={colors.primary} />
                <Text style={[styles.headerTimer, { color: colors.primary }]}>
                  {formatarTempo(tempoDecorrido)}
                </Text>
              </View>
              <Text style={[styles.headerDot, { color: colors.textMuted }]}>•</Text>
              <Text style={[styles.headerProgresso, { color: colors.textSecondary }]}>
                {concluidosCount}/{totalExercicios} feitos
              </Text>
            </View>
          </View>

          {/* Botão de Fechar na Direita */}
          <TouchableOpacity
            onPress={() => {
              showConfirm(
                "Pausar e Sair",
                "Seu treino continuará salvo para você retomar quando quiser.",
                () => {
                  pularDescanso();
                  router.back();
                },
                false,
                "Sair e Manter Salvo",
                "Continuar Treinando"
              );
            }}
            style={[
              styles.btnVoltar,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* CORPO PRINCIPAL: EXERCÍCIO EM FOCO */}
        <ScrollView contentContainerStyle={styles.mainContent}>
          {/* Card do Exercício Atual */}
          <View
            style={[
              styles.cardPrincipal,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.nomeExercicio, { color: colors.text }]}>
              {exercicioAtual.exercicio?.nome}
            </Text>
            {exercicioAtual.exercicio?.descricao ? (
              <Text style={[styles.descExercicio, { color: colors.textSecondary }]}>
                {exercicioAtual.exercicio.descricao}
              </Text>
            ) : null}

            {/* Marcador Visual de Séries */}
            <View
              style={[
                styles.seriesIndicatorContainer,
                { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
              ]}
            >
              <Text style={[styles.seriesLabel, { color: colors.textSecondary }]}>
                Série <Text style={[styles.seriesDestaque, { color: colors.accent }]}>{estadoAtual.serieAtual}</Text> /{" "}
                {estadoAtual.totalSeries}
              </Text>
              <View style={styles.seriesDotsRow}>
                {Array.from({ length: estadoAtual.totalSeries }).map((_, idx) => {
                  const feito = idx + 1 < estadoAtual.serieAtual || estadoAtual.concluido;
                  const atual = idx + 1 === estadoAtual.serieAtual && !estadoAtual.concluido;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.serieDot,
                        { backgroundColor: colors.inputBg },
                        feito && { backgroundColor: colors.primary },
                        atual && {
                          backgroundColor: colors.accent,
                          borderWidth: 2,
                          borderColor: colors.accent,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.serieDotText,
                          { color: colors.textSecondary },
                          (feito || atual) && styles.serieDotTextActive,
                        ]}
                      >
                        {idx + 1}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Parâmetros do Exercício (Reps e Carga com Toque para Editar) */}
            <View style={styles.parametrosGrid}>
              {/* Repetições Alvo (Toque para Editar) */}
              <TouchableOpacity
                onPress={abrirEdicaoManualReps}
                activeOpacity={0.7}
                style={[
                  styles.paramBox,
                  { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
                ]}
              >
                <Text style={[styles.paramLabel, { color: colors.textSecondary }]}>
                  Repetições Alvo
                </Text>
                <View style={styles.cargaDisplayRow}>
                  <Text style={[styles.paramValor, { color: colors.text }]}>
                    {estadoAtual.repeticoes ?? exercicioAtual.repeticoes} reps
                  </Text>
                  <Ionicons
                    name="create-outline"
                    size={14}
                    color={colors.accent}
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </TouchableOpacity>

              {/* Carga Atual (Toque para Editar) */}
              <TouchableOpacity
                onPress={abrirEdicaoManualCarga}
                activeOpacity={0.7}
                style={[
                  styles.paramBox,
                  { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
                ]}
              >
                <Text style={[styles.paramLabel, { color: colors.textSecondary }]}>
                  Carga Atual
                </Text>
                <View style={styles.cargaDisplayRow}>
                  <Text style={[styles.paramValor, { color: colors.accent }]}>
                    {estadoAtual.carga} kg
                  </Text>
                  <Ionicons
                    name="create-outline"
                    size={14}
                    color={colors.accent}
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* PAINEL DE CRONÔMETRO DE DESCANSO */}
          {descansoAtivo ? (
            <View
              style={[
                styles.descansoCard,
                { backgroundColor: colors.cardSecondary },
                tempoRestanteDescanso < 0 && {
                  borderColor: colors.danger,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.descansoTituloRow}>
                <Ionicons
                  name={tempoRestanteDescanso < 0 ? "time-outline" : "hourglass-outline"}
                  size={16}
                  color={colors.accent}
                />
                <Text style={[styles.descansoTitulo, { color: colors.accent }]}>
                  {tempoRestanteDescanso < 0
                    ? "TEMPO DE DESCANSO EXCEDIDO"
                    : "DESCANSO EM ANDAMENTO"}
                </Text>
              </View>
              <Text
                style={[
                  styles.descansoCronometro,
                  { color: tempoRestanteDescanso < 0 ? colors.danger : colors.text },
                ]}
              >
                {formatarTempoDescanso(tempoRestanteDescanso)}
              </Text>
              <Text style={[styles.descansoSub, { color: colors.textSecondary }]}>
                {tempoRestanteDescanso < 0
                  ? "Descanso finalizado! Inicie a próxima série."
                  : "Aproveite para recuperar o fôlego antes da próxima série."}
              </Text>

              <View style={styles.descansoBotoesRow}>
                <TouchableOpacity
                  onPress={() => adicionarTempoDescanso(15)}
                  style={[styles.btnMaisTempo, { backgroundColor: colors.accentLight }]}
                >
                  <Text style={[styles.btnMaisTempoText, { color: colors.accent }]}>
                    +15s
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={pularDescanso}
                  style={[
                    styles.btnPularDescanso,
                    { backgroundColor: tempoRestanteDescanso < 0 ? colors.danger : colors.primary },
                  ]}
                >
                  <Ionicons
                    name={tempoRestanteDescanso < 0 ? "stop-circle-outline" : "play-skip-forward"}
                    size={15}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.btnPularDescansoText}>
                    {tempoRestanteDescanso < 0 ? "Encerrar Descanso" : "Pular Descanso"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.descansoInativoCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <Text style={[styles.descansoInativoText, { color: colors.textSecondary }]}>
                Descanso configurado:{" "}
                <Text style={{ fontWeight: "bold", color: colors.text }}>
                  {exercicioAtual.descanso || 60} segundos
                </Text>
              </Text>
            </View>
          )}
        </ScrollView>

        {/* BOTÃO FIXO DE AÇÃO INFERIOR */}
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: colors.background, borderColor: colors.cardBorder },
          ]}
        >
          <TouchableOpacity
            onPress={() => concluirSerie(exercicioAtual)}
            style={[
              styles.btnConcluirSerie,
              { backgroundColor: colors.primary },
              estadoAtual.concluido && { backgroundColor: colors.cardSecondary },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.btnConcluirSerieText}>
              {estadoAtual.concluido
                ? "Exercício Concluído!"
                : `Concluir Série (${estadoAtual.serieAtual}/${estadoAtual.totalSeries})`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* MENU LATERAL RETRÁTIL (CHECKLIST GAVETA À ESQUERDA) */}
        <Modal
          visible={menuLateralAberto}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMenuLateralAberto(false)}
        >
          <View style={styles.modalOverlay}>
            {/* Gaveta Lateral à Esquerda */}
            <View
              style={[
                styles.drawerContainer,
                { backgroundColor: colors.card },
              ]}
            >
              <View style={styles.drawerHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="list-outline" size={20} color={colors.text} />
                  <Text style={[styles.drawerTitle, { color: colors.text }]}>
                    Lista de Exercícios
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setMenuLateralAberto(false)}
                  style={styles.drawerCloseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.drawerSub, { color: colors.textMuted }]}>
                Toque no nome para focar ou use as setas para reorganizar a ordem.
              </Text>

              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
              >
                {treino.exercicios.map((item, index) => {
                  const est = progresso[item.exercicio_id] || {
                    serieAtual: 1,
                    totalSeries: item.series || 4,
                    concluido: false,
                    carga: item.carga || 0,
                  };
                  const isAtivo = index === exercicioAtivoIndex;

                  return (
                    <DrawerExercicioItem
                      key={item.exercicio_id}
                      item={item}
                      index={index}
                      total={totalExercicios}
                      colors={colors}
                      isAtivo={isAtivo}
                      est={est}
                      onSelect={(idx) => {
                        setExercicioAtivoIndex(idx);
                        setMenuLateralAberto(false);
                      }}
                      onToggleConcluido={toggleCheckboxManual}
                      onMove={moverExercicioNaExecucao}
                    />
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                onPress={() => {
                  setMenuLateralAberto(false);
                  confirmarEncerramento();
                }}
                style={[styles.drawerBtnEncerrar, { backgroundColor: colors.danger }]}
              >
                <Ionicons name="flag-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.drawerBtnEncerrarText}>Encerrar Treino</Text>
              </TouchableOpacity>
            </View>

            {/* Backdrop clicável à direita para fechar a gaveta */}
            <TouchableOpacity
              style={[styles.modalBackdrop, { backgroundColor: colors.backdrop }]}
              activeOpacity={1}
              onPress={() => setMenuLateralAberto(false)}
            />
          </View>
        </Modal>

        {/* MODAL DE CELEBRAÇÃO (TREINO CONCLUÍDO) */}
        <Modal
          visible={treinoFinalizadoModal}
          transparent={true}
          animationType="slide"
        >
          <View style={[styles.celebrationOverlay, { backgroundColor: colors.backdrop }]}>
            <View
              style={[
                styles.celebrationCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View
                style={[
                  styles.celebrationTrophyCircle,
                  { backgroundColor: colors.cardSecondary },
                ]}
              >
                <Ionicons name="trophy" size={44} color="#eab308" />
              </View>
              <Text style={[styles.celebrationTitle, { color: colors.text }]}>
                Treino Finalizado!
              </Text>
              <Text style={[styles.celebrationSub, { color: colors.textSecondary }]}>
                Parabéns pelo treino de hoje! A constância é o segredo do resultado.
              </Text>

              <View style={styles.celebrationStats}>
                <View
                  style={[
                    styles.statBox,
                    { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
                  ]}
                >
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Tempo Total
                  </Text>
                  <Text style={[styles.statValor, { color: colors.primary }]}>
                    {formatarTempo(tempoDecorrido)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statBox,
                    { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
                  ]}
                >
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                    Exercícios
                  </Text>
                  <Text style={[styles.statValor, { color: colors.primary }]}>
                    {concluidosCount}/{totalExercicios}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setTreinoFinalizadoModal(false);
                  router.replace("/(drawer)/historico" as any);
                }}
                style={[
                  styles.btnVoltarHome,
                  { backgroundColor: colors.accent, marginBottom: 10 },
                ]}
              >
                <Ionicons name="time-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.btnVoltarHomeText}>Ver no Histórico</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setTreinoFinalizadoModal(false);
                  router.replace("/(drawer)/treino" as any);
                }}
                style={[
                  styles.btnVoltarHome,
                  { backgroundColor: colors.cardSecondary, borderWidth: 1, borderColor: colors.cardBorder },
                ]}
              >
                <Ionicons name="home-outline" size={18} color={colors.text} style={{ marginRight: 6 }} />
                <Text style={[styles.btnVoltarHomeText, { color: colors.text }]}>
                  Voltar aos Treinos
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL DE EDIÇÃO MANUAL DE CARGA */}
        <Modal
          visible={modalEditarCarga}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalEditarCarga(false)}
          onShow={() => {
            setTimeout(() => {
              inputCargaRef.current?.focus();
            }, 60);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={[styles.modalCargaOverlay, { backgroundColor: colors.backdrop }]}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalCargaDismissArea}>
                <View
                  style={[
                    styles.modalCargaCard,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Ionicons name="create-outline" size={22} color={colors.accent} />
                    <Text style={[styles.modalCargaTitle, { color: colors.text }]}>
                      Ajustar Carga
                    </Text>
                  </View>
                  <Text
                    style={[styles.modalCargaSub, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {exercicioAtual.exercicio?.nome}
                  </Text>

                  <View
                    style={[
                      styles.modalCargaInputContainer,
                      { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                    ]}
                  >
                    <TextInput
                      ref={inputCargaRef}
                      style={[styles.modalCargaInput, { color: colors.text }]}
                      value={inputCargaTexto}
                      onChangeText={setInputCargaTexto}
                      keyboardType="numeric"
                      selectTextOnFocus={true}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      maxLength={6}
                      onSubmitEditing={salvarCargaManual}
                      returnKeyType="done"
                    />
                    <Text style={[styles.modalCargaUnit, { color: colors.textSecondary }]}>
                      kg
                    </Text>
                  </View>

                  <View style={styles.modalCargaBotoesRow}>
                    <TouchableOpacity
                      onPress={() => setModalEditarCarga(false)}
                      style={[
                        styles.modalCargaBtnCancelar,
                        { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.modalCargaBtnCancelarText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Cancelar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={salvarCargaManual}
                      style={[
                        styles.modalCargaBtnSalvar,
                        { backgroundColor: colors.primary },
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalCargaBtnSalvarText}>
                        Salvar Carga
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>

        {/* MODAL DE EDIÇÃO MANUAL DE REPETIÇÕES */}
        <Modal
          visible={modalEditarReps}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalEditarReps(false)}
          onShow={() => {
            setTimeout(() => {
              inputRepsRef.current?.focus();
            }, 60);
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={[styles.modalCargaOverlay, { backgroundColor: colors.backdrop }]}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalCargaDismissArea}>
                <View
                  style={[
                    styles.modalCargaCard,
                    { backgroundColor: colors.card, borderColor: colors.cardBorder },
                  ]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Ionicons name="create-outline" size={22} color={colors.accent} />
                    <Text style={[styles.modalCargaTitle, { color: colors.text }]}>
                      Ajustar Repetições
                    </Text>
                  </View>
                  <Text
                    style={[styles.modalCargaSub, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {exercicioAtual.exercicio?.nome}
                  </Text>

                  <View
                    style={[
                      styles.modalCargaInputContainer,
                      { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
                    ]}
                  >
                    <TextInput
                      ref={inputRepsRef}
                      style={[styles.modalCargaInput, { color: colors.text }]}
                      value={inputRepsTexto}
                      onChangeText={setInputRepsTexto}
                      keyboardType="numeric"
                      selectTextOnFocus={true}
                      placeholder="10"
                      placeholderTextColor={colors.textMuted}
                      maxLength={4}
                      onSubmitEditing={salvarRepsManual}
                      returnKeyType="done"
                    />
                    <Text style={[styles.modalCargaUnit, { color: colors.textSecondary }]}>
                      reps
                    </Text>
                  </View>

                  <View style={styles.modalCargaBotoesRow}>
                    <TouchableOpacity
                      onPress={() => setModalEditarReps(false)}
                      style={[
                        styles.modalCargaBtnCancelar,
                        { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.modalCargaBtnCancelarText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Cancelar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={salvarRepsManual}
                      style={[
                        styles.modalCargaBtnSalvar,
                        { backgroundColor: colors.primary },
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalCargaBtnSalvarText}>
                        Salvar Reps
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  btnMenu: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
  },
  btnMenuIcon: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 4,
  },
  btnMenuText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  headerTreinoNome: {
    fontSize: 15,
    fontWeight: "bold",
  },
  headerStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  headerTimerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerTimer: {
    fontSize: 12,
    fontWeight: "bold",
  },
  headerDot: {
    marginHorizontal: 5,
  },
  headerProgresso: {
    fontSize: 11,
  },
  btnVoltar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  btnVoltarText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  mainContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cardPrincipal: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  nomeExercicio: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  descExercicio: {
    fontSize: 13,
    marginBottom: 16,
  },
  seriesIndicatorContainer: {
    borderRadius: 12,
    padding: 14,
    marginVertical: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  seriesLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  seriesDestaque: {
    fontSize: 20,
    fontWeight: "bold",
  },
  seriesDotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  serieDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  serieDotText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  serieDotTextActive: {
    color: "#fff",
  },
  parametrosGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  paramBox: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  paramLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  paramValor: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cargaDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cargaPencilIcon: {
    fontSize: 13,
    marginLeft: 3,
  },
  descansoCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  descansoTituloRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  descansoTitulo: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  descansoCronometro: {
    fontSize: 36,
    fontWeight: "bold",
    marginVertical: 4,
  },
  descansoSub: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
  descansoBotoesRow: {
    flexDirection: "row",
    gap: 10,
  },
  btnMaisTempo: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnMaisTempoText: {
    fontWeight: "bold",
    fontSize: 13,
  },
  btnPularDescanso: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnPularDescansoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  descansoInativoCard: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  descansoInativoText: {
    fontSize: 13,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  btnConcluirSerie: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#00b894",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  btnConcluirSerieText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  drawerContainer: {
    width: "82%",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 25,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 3, height: 0 },
    shadowRadius: 10,
    elevation: 10,
  },
  modalBackdrop: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  drawerCloseBtn: {
    padding: 6,
  },
  drawerSub: {
    fontSize: 12,
    marginBottom: 16,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  checkboxTouch: {
    paddingRight: 10,
  },
  drawerItemNome: {
    fontSize: 14,
    fontWeight: "bold",
  },
  drawerItemStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeAtual: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  badgeAtualText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  drawerItemActions: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    gap: 2,
  },
  btnDrawerOrdem: {
    padding: 3,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  drawerBtnEncerrar: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  drawerBtnEncerrarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  celebrationOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  celebrationCard: {
    borderRadius: 20,
    padding: 26,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    borderWidth: 1,
  },
  celebrationTrophyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  celebrationSub: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
  },
  celebrationStats: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statValor: {
    fontSize: 18,
    fontWeight: "bold",
  },
  btnVoltarHome: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  btnVoltarHomeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepperCargaTouch: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCargaOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCargaDismissArea: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCargaCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  modalCargaTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  modalCargaSub: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  modalCargaInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
    marginBottom: 20,
  },
  modalCargaInput: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 80,
    paddingVertical: 4,
  },
  modalCargaUnit: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 6,
  },
  modalCargaBotoesRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  modalCargaBtnCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  modalCargaBtnCancelarText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalCargaBtnSalvar: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCargaBtnSalvarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
