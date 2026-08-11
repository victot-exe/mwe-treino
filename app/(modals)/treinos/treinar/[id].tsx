import { useTheme } from "@/src/context/ThemeContext";
import { updateExercicioTreino } from "@/src/database/exercicioTreinoRepository";
import { getTreinoById } from "@/src/database/treinoRepository";
import {
  agendarNotificacaoDescanso,
  cancelarNotificacaoDescanso,
  requestNotificationPermissions,
} from "@/src/services/notificationService";
import { ExercicioTreino, Treino } from "@/src/types";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


interface ProgressoExercicio {
  serieAtual: number;
  totalSeries: number;
  concluido: boolean;
  carga: number;
}

export default function TreinarScreen() {
  const { colors } = useTheme();
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

  // Modal de Celebração de Treino Concluído
  const [treinoFinalizadoModal, setTreinoFinalizadoModal] = useState(false);

  // Carrega treino, solicita permissões e inicializa progresso
  const inicializarTreino = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    await requestNotificationPermissions();

    const treinoDb = await getTreinoById(Number(id));
    setTreino(treinoDb);

    if (treinoDb && treinoDb.exercicios && treinoDb.exercicios.length > 0) {
      const mapaInicial: { [key: number]: ProgressoExercicio } = {};
      treinoDb.exercicios.forEach((ex) => {
        mapaInicial[ex.exercicio_id] = {
          serieAtual: 1,
          totalSeries: ex.series || 4,
          concluido: false,
          carga: ex.carga || 0,
        };
      });
      setProgresso(mapaInicial);
      setExercicioAtivoIndex(0);
      inicioTreinoTimestampRef.current = Date.now();
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    inicializarTreino();
  }, [inicializarTreino]);

  // Função central que atualiza os tempos com precisão matemática via Timestamp
  const sincronizarCronometros = useCallback(() => {
    const decorrido = Math.floor((Date.now() - inicioTreinoTimestampRef.current) / 1000);
    setTempoDecorrido(Math.max(0, decorrido));

    if (fimDescansoTimestampRef.current !== null) {
      const restanteMs = fimDescansoTimestampRef.current - Date.now();
      const restanteSeg = Math.ceil(restanteMs / 1000);

      if (restanteSeg <= 0) {
        fimDescansoTimestampRef.current = null;
        setDescansoAtivo(false);
        setTempoRestanteDescanso(0);
        notificationIdRef.current = null;
      } else {
        setTempoRestanteDescanso(restanteSeg);
      }
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
    if (fimDescansoTimestampRef.current) {
      fimDescansoTimestampRef.current += segundosAdicionais * 1000;
      const novoTempo = tempoRestanteDescanso + segundosAdicionais;
      setTempoRestanteDescanso(novoTempo);

      if (notificationIdRef.current) {
        await cancelarNotificacaoDescanso(notificationIdRef.current);
      }
      const exAtual = treino?.exercicios?.[exercicioAtivoIndex];
      const notifId = await agendarNotificacaoDescanso(
        novoTempo,
        exAtual?.exercicio?.nome || "Próximo Exercício"
      );
      notificationIdRef.current = notifId;
    }
  };

  // Concluir Série do Exercício Ativo
  const concluirSerie = (exercicioAtual: ExercicioTreino) => {
    const estado = progresso[exercicioAtual.exercicio_id];
    if (!estado) return;

    const tempoDescanso = exercicioAtual.descanso || 60;
    const nomeEx = exercicioAtual.exercicio?.nome || "Exercício";

    if (estado.serieAtual < estado.totalSeries) {
      setProgresso((prev) => ({
        ...prev,
        [exercicioAtual.exercicio_id]: {
          ...prev[exercicioAtual.exercicio_id],
          serieAtual: prev[exercicioAtual.exercicio_id].serieAtual + 1,
        },
      }));
      iniciarDescanso(tempoDescanso, nomeEx);
    } else {
      setProgresso((prev) => {
        const novoProgresso = {
          ...prev,
          [exercicioAtual.exercicio_id]: {
            ...prev[exercicioAtual.exercicio_id],
            concluido: true,
          },
        };

        const todosConcluidos = Object.values(novoProgresso).every((p) => p.concluido);
        if (todosConcluidos) {
          pularDescanso();
          setTreinoFinalizadoModal(true);
        } else {
          iniciarDescanso(tempoDescanso, nomeEx);
          const proximoIndex = treino?.exercicios?.findIndex(
            (item) => !novoProgresso[item.exercicio_id]?.concluido
          );
          if (proximoIndex !== undefined && proximoIndex !== -1) {
            setExercicioAtivoIndex(proximoIndex);
          }
        }

        return novoProgresso;
      });
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
        setTreinoFinalizadoModal(true);
      }

      return novoProgresso;
    });
  };

  // Ajuste rápido de carga durante o treino
  const alterarCargaRapida = async (delta: number) => {
    const exAtual = treino?.exercicios?.[exercicioAtivoIndex];
    if (!exAtual) return;

    const progAtual = progresso[exAtual.exercicio_id];
    const novaCarga = Math.max(0, (progAtual?.carga || 0) + delta);

    setProgresso((prev) => ({
      ...prev,
      [exAtual.exercicio_id]: {
        ...prev[exAtual.exercicio_id],
        carga: novaCarga,
      },
    }));

    if (exAtual.id) {
      await updateExercicioTreino(exAtual.id, { carga: novaCarga });
    }
  };

  // Confirmar saída do treino
  const confirmarEncerramento = () => {
    Alert.alert(
      "Finalizar Treino",
      "Deseja realmente encerrar a sessão de treino agora?",
      [
        { text: "Continuar Treinando", style: "cancel" },
        {
          text: "Encerrar",
          style: "destructive",
          onPress: () => {
            pularDescanso();
            setTreinoFinalizadoModal(true);
          },
        },
      ]
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
            <Text style={[styles.btnMenuIcon, { color: colors.primary }]}>⋮</Text>
            <Text style={[styles.btnMenuText, { color: colors.text }]}>Lista</Text>
          </TouchableOpacity>

          {/* Centro: Nome do Treino e Cronômetro */}
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTreinoNome, { color: colors.headerText }]} numberOfLines={1}>
              {treino.nome}
            </Text>
            <View style={styles.headerStatusRow}>
              <Text style={[styles.headerTimer, { color: colors.primary }]}>
                ⏱️ {formatarTempo(tempoDecorrido)}
              </Text>
              <Text style={[styles.headerDot, { color: colors.textMuted }]}>•</Text>
              <Text style={[styles.headerProgresso, { color: colors.textSecondary }]}>
                {concluidosCount}/{totalExercicios} feitos
              </Text>
            </View>
          </View>

          {/* Botão de Fechar na Direita */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Sair do Treino", "Deseja voltar para a tela anterior?", [
                { text: "Cancelar", style: "cancel" },
                {
                  text: "Sair",
                  onPress: () => {
                    pularDescanso();
                    router.back();
                  },
                },
              ]);
            }}
            style={[
              styles.btnVoltar,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Text style={[styles.btnVoltarText, { color: colors.text }]}>✕</Text>
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
            <View
              style={[
                styles.badgeExercicioIndex,
                { backgroundColor: colors.accentLight },
              ]}
            >
              <Text
                style={[
                  styles.badgeExercicioIndexText,
                  { color: colors.accent },
                ]}
              >
                Exercício {exercicioAtivoIndex + 1} de {totalExercicios}
              </Text>
            </View>

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

            {/* Parâmetros do Exercício (Reps e Carga com Stepper) */}
            <View style={styles.parametrosGrid}>
              {/* Repetições Alvo */}
              <View
                style={[
                  styles.paramBox,
                  { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
                ]}
              >
                <Text style={[styles.paramLabel, { color: colors.textSecondary }]}>
                  Repetições Alvo
                </Text>
                <Text style={[styles.paramValor, { color: colors.text }]}>
                  {exercicioAtual.repeticoes} reps
                </Text>
              </View>

              {/* Carga Ajustável */}
              <View
                style={[
                  styles.paramBox,
                  { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder },
                ]}
              >
                <Text style={[styles.paramLabel, { color: colors.textSecondary }]}>
                  Carga Atual
                </Text>
                <View
                  style={[
                    styles.stepperCarga,
                    { backgroundColor: colors.stepperBg, borderColor: colors.inputBorder },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => alterarCargaRapida(-5)}
                    style={[styles.stepperCargaBtn, { backgroundColor: colors.stepperBtn }]}
                  >
                    <Text style={[styles.stepperCargaBtnText, { color: colors.text }]}>
                      -
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.stepperCargaText, { color: colors.text }]}>
                    {estadoAtual.carga} kg
                  </Text>
                  <TouchableOpacity
                    onPress={() => alterarCargaRapida(5)}
                    style={[styles.stepperCargaBtn, { backgroundColor: colors.stepperBtn }]}
                  >
                    <Text style={[styles.stepperCargaBtnText, { color: colors.text }]}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* PAINEL DE CRONÔMETRO DE DESCANSO */}
          {descansoAtivo ? (
            <View
              style={[
                styles.descansoCard,
                { backgroundColor: colors.cardSecondary },
              ]}
            >
              <Text style={[styles.descansoTitulo, { color: colors.accent }]}>
                ⏱️ DESCANSO EM ANDAMENTO
              </Text>
              <Text style={[styles.descansoCronometro, { color: colors.text }]}>
                {formatarTempo(tempoRestanteDescanso)}
              </Text>
              <Text style={[styles.descansoSub, { color: colors.textSecondary }]}>
                O alarme do celular tocará quando o tempo acabar!
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
                  style={[styles.btnPularDescanso, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.btnPularDescansoText}>⏩ Pular Descanso</Text>
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
            <Text style={styles.btnConcluirSerieText}>
              {estadoAtual.concluido
                ? "✅ Exercício Concluído!"
                : `✅ Concluir Série (${estadoAtual.serieAtual}/${estadoAtual.totalSeries})`}
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
                <Text style={[styles.drawerTitle, { color: colors.text }]}>
                  📋 Lista de Exercícios
                </Text>
                <TouchableOpacity
                  onPress={() => setMenuLateralAberto(false)}
                  style={styles.drawerCloseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.drawerCloseBtnText, { color: colors.textSecondary }]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.drawerSub, { color: colors.textMuted }]}>
                Toque no nome para mudar de aparelho ou na caixa para marcar.
              </Text>

              <ScrollView style={{ flex: 1 }}>
                {treino.exercicios.map((item, index) => {
                  const est = progresso[item.exercicio_id] || {
                    serieAtual: 1,
                    totalSeries: item.series || 4,
                    concluido: false,
                    carga: item.carga || 0,
                  };
                  const isAtivo = index === exercicioAtivoIndex;

                  return (
                    <View
                      key={item.exercicio_id}
                      style={[
                        styles.drawerItem,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.cardBorder,
                        },
                        isAtivo && {
                          borderColor: colors.accent,
                          backgroundColor: colors.accentLight,
                        },
                        est.concluido && {
                          backgroundColor: colors.successLight,
                          borderColor: colors.success,
                        },
                      ]}
                    >
                      {/* Checkbox direta */}
                      <TouchableOpacity
                        onPress={() => toggleCheckboxManual(item.exercicio_id)}
                        style={styles.checkboxTouch}
                      >
                        <Text style={styles.checkboxEmoji}>
                          {est.concluido ? "✅" : "⬜"}
                        </Text>
                      </TouchableOpacity>

                      {/* Toque no Nome muda para este exercício */}
                      <TouchableOpacity
                        onPress={() => {
                          setExercicioAtivoIndex(index);
                          setMenuLateralAberto(false);
                        }}
                        style={{ flex: 1 }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text
                            style={[
                              styles.drawerItemNome,
                              { color: colors.text },
                              est.concluido && {
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
                          {est.serieAtual}/{est.totalSeries} séries • {est.carga} kg
                        </Text>
                      </TouchableOpacity>
                    </View>
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
                <Text style={styles.drawerBtnEncerrarText}>🏁 Encerrar Treino</Text>
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
              <Text style={styles.celebrationEmoji}>🎉 🏆 🔥</Text>
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
                  router.replace("/(drawer)/treino");
                }}
                style={[styles.btnVoltarHome, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.btnVoltarHomeText}>🏠 Voltar aos Treinos</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  badgeExercicioIndex: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeExercicioIndexText: {
    fontSize: 12,
    fontWeight: "bold",
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
  stepperCarga: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  stepperCargaBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepperCargaBtnText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  stepperCargaText: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: "bold",
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
  descansoTitulo: {
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  descansoCronometro: {
    fontSize: 48,
    fontWeight: "bold",
    fontVariant: ["tabular-nums"],
    marginVertical: 4,
  },
  descansoSub: {
    fontSize: 13,
    marginBottom: 14,
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
  drawerCloseBtnText: {
    fontSize: 18,
    fontWeight: "bold",
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
  checkboxEmoji: {
    fontSize: 20,
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
  drawerBtnEncerrar: {
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
  celebrationEmoji: {
    fontSize: 48,
    marginBottom: 12,
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
});
