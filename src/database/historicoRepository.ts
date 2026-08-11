import { HistoricoSessao, HistoricoSessaoExercicio } from "../types";
import { db } from "./database";

export interface SalvarSessaoInput {
  treino_id?: number | null;
  nome_treino: string;
  data_inicio: string;
  data_fim: string;
  duracao_segundos: number;
  exercicios_concluidos: number;
  total_exercicios: number;
  exercicios: Array<{
    exercicio_id?: number | null;
    nome_exercicio: string;
    series_feitas: number;
    repeticoes: number;
    carga: number;
  }>;
}

/**
 * Salva uma nova sessão de treino e todos os exercícios realizados na sessão
 */
export async function salvarSessaoTreino(
  dados: SalvarSessaoInput
): Promise<number> {
  const result = await db.runAsync(
    `
    INSERT INTO historico_sessoes 
    (treino_id, nome_treino, data_inicio, data_fim, duracao_segundos, exercicios_concluidos, total_exercicios)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      dados.treino_id ?? null,
      dados.nome_treino,
      dados.data_inicio,
      dados.data_fim,
      dados.duracao_segundos,
      dados.exercicios_concluidos,
      dados.total_exercicios,
    ]
  );

  const sessaoId = result.lastInsertRowId!;

  for (const ex of dados.exercicios) {
    await db.runAsync(
      `
      INSERT INTO historico_sessao_exercicios
      (sessao_id, exercicio_id, nome_exercicio, series_feitas, repeticoes, carga)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        sessaoId,
        ex.exercicio_id ?? null,
        ex.nome_exercicio,
        ex.series_feitas,
        ex.repeticoes,
        ex.carga,
      ]
    );
  }

  return sessaoId;
}

/**
 * Retorna todas as sessões do histórico ordenadas da mais recente para a mais antiga
 */
export async function getAllHistoricoSessoes(): Promise<HistoricoSessao[]> {
  const sessoes = await db.getAllAsync<HistoricoSessao>(
    `SELECT * FROM historico_sessoes ORDER BY id DESC`
  );

  const sessoesCompletas: HistoricoSessao[] = [];

  for (const sessao of sessoes) {
    const exercicios = await db.getAllAsync<HistoricoSessaoExercicio>(
      `SELECT * FROM historico_sessao_exercicios WHERE sessao_id = ? ORDER BY id ASC`,
      [sessao.id]
    );
    sessoesCompletas.push({ ...sessao, exercicios });
  }

  return sessoesCompletas;
}

/**
 * Retorna os detalhes completos de uma sessão específica
 */
export async function getHistoricoSessaoById(
  id: number
): Promise<HistoricoSessao | null> {
  const sessao = await db.getFirstAsync<HistoricoSessao>(
    `SELECT * FROM historico_sessoes WHERE id = ?`,
    [id]
  );

  if (!sessao) return null;

  const exercicios = await db.getAllAsync<HistoricoSessaoExercicio>(
    `SELECT * FROM historico_sessao_exercicios WHERE sessao_id = ? ORDER BY id ASC`,
    [id]
  );

  return { ...sessao, exercicios };
}

/**
 * Retorna a evolução de cargas de um exercício ao longo do tempo
 */
export async function getEvolucaoCargasPorExercicio(
  exercicioId: number
): Promise<
  Array<{
    data: string;
    carga: number;
    nome_treino: string;
    series_feitas: number;
    repeticoes: number;
  }>
> {
  return db.getAllAsync(
    `
    SELECT 
      s.data_inicio as data, 
      se.carga, 
      s.nome_treino,
      se.series_feitas,
      se.repeticoes
    FROM historico_sessao_exercicios se
    JOIN historico_sessoes s ON se.sessao_id = s.id
    WHERE se.exercicio_id = ?
    ORDER BY s.id ASC
    `,
    [exercicioId]
  );
}

/**
 * Remove um registro de sessão do histórico
 */
export async function deleteHistoricoSessao(id: number): Promise<void> {
  await db.runAsync(`DELETE FROM historico_sessoes WHERE id = ?`, [id]);
}
