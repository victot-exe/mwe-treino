import { db } from "./database";

export interface ProgressoSessaoExercicio {
  serieAtual: number;
  totalSeries: number;
  concluido: boolean;
  carga: number;
  repeticoes?: number;
}

export interface SessaoAtivaTreino {
  treinoId: number;
  nomeTreino: string;
  exercicioAtivoIndex: number;
  inicioTreinoTimestamp: number;
  tempoDecorridoSegundos: number;
  progresso: { [key: number]: ProgressoSessaoExercicio };
  ultimaAtualizacao: number;
}

/**
 * Salva ou atualiza a sessão temporária de treino em andamento.
 */
export async function salvarSessaoAtiva(sessao: SessaoAtivaTreino): Promise<void> {
  try {
    const dadosJson = JSON.stringify(sessao);
    await db.runAsync(
      `INSERT OR REPLACE INTO sessao_ativa_treino (id, treino_id, dados_json, updated_at) 
       VALUES (1, ?, ?, datetime('now'));`,
      [sessao.treinoId, dadosJson]
    );
  } catch (error) {
    console.error("Erro ao salvar sessão ativa de treino:", error);
  }
}

/**
 * Obtém a sessão de treino em andamento se existir.
 */
export async function obterSessaoAtiva(): Promise<SessaoAtivaTreino | null> {
  try {
    const row = await db.getFirstAsync<{ dados_json: string; updated_at: string }>(
      `SELECT dados_json, updated_at FROM sessao_ativa_treino WHERE id = 1 LIMIT 1;`
    );

    if (!row || !row.dados_json) {
      return null;
    }

    const sessao: SessaoAtivaTreino = JSON.parse(row.dados_json);
    return sessao;
  } catch (error) {
    console.error("Erro ao obter sessão ativa de treino:", error);
    return null;
  }
}

/**
 * Limpa a sessão temporária de treino ativa (quando o treino for finalizado ou descartado).
 */
export async function limparSessaoAtiva(): Promise<void> {
  try {
    await db.runAsync(`DELETE FROM sessao_ativa_treino WHERE id = 1;`);
  } catch (error) {
    console.error("Erro ao limpar sessão ativa de treino:", error);
  }
}
