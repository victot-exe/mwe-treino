// src/database/exercicioTreinoRepository.ts
import { Exercicio, ExercicioTreino } from "@/src/types";
import { db } from "./database";

/**
 * Mapeia a linha retornada pelo SQLite para ExercicioTreino com o campo exercicio populado.
 * O SELECT usado abaixo traz colunas com alias 'exercicio_id', 'exercicio_nome', 'exercicio_descricao'
 * que são combinadas aqui.
 */
function mapRowToExercicioTreino(row: any): ExercicioTreino {
  return {
    id: row.id,
    treino_id: row.treinoId ?? row.treino_id,
    exercicio_id: row.exercicioId ?? row.exercicio_id,
    repeticoes: row.repeticoes,
    series: row.series,
    descanso: row.descanso,
    exercicio: {
      id: row["exercicio.id"] ?? row.exercicio_id,
      nome: row["exercicio.nome"] ?? row.exercicio_nome ?? row.nome,
      descricao: row["exercicio.descricao"] ?? row.exercicio_descricao ?? row.descricao,
    } as Exercicio,
  } as ExercicioTreino;
}

/** Retorna todos os ExercicioTreino de um treino (com o objeto exercicio preenchido) */
export async function getExerciciosDoTreino(treinoId: number): Promise<ExercicioTreino[]> {
  const rows = await db.getAllAsync<any>(
    `
    SELECT
      et.id,
      et.treino_id as treinoId,
      et.exercicio_id as exercicioId,
      et.repeticoes,
      et.series,
      et.descanso,
      e.id as 'exercicio.id',
      e.nome as 'exercicio.nome',
      e.descricao as 'exercicio.descricao'
    FROM exercicio_treino et
    JOIN exercicios e ON et.exercicio_id = e.id
    WHERE et.treino_id = ?
    ORDER BY et.id;
    `,
    [treinoId]
  );

  return rows.map(mapRowToExercicioTreino);
}

/** Retorna um ExercicioTreino por seu id (com exercicio preenchido) */
export async function getExercicioTreinoById(id: number): Promise<ExercicioTreino | null> {
  const row = await db.getFirstAsync<any>(
    `
    SELECT
      et.id,
      et.treino_id as treinoId,
      et.exercicio_id as exercicioId,
      et.repeticoes,
      et.series,
      et.descanso,
      e.id as 'exercicio.id',
      e.nome as 'exercicio.nome',
      e.descricao as 'exercicio.descricao'
    FROM exercicio_treino et
    JOIN exercicios e ON et.exercicio_id = e.id
    WHERE et.id = ?;
    `,
    [id]
  );

  return row ? mapRowToExercicioTreino(row) : null;
}

/** Insere um ExercicioTreino e retorna o id criado */
export async function addExercicioTreino(data: {
  treinoId: number;
  exercicioId: number;
  repeticoes: number;
  series: number;
  descanso: number;
}): Promise<number> {
  const res = await db.runAsync(
    `
    INSERT INTO exercicio_treino (treino_id, exercicio_id, repeticoes, series, descanso)
    VALUES (?, ?, ?, ?, ?);
    `,
    [data.treinoId, data.exercicioId, data.repeticoes, data.series, data.descanso]
  );

  return res.lastInsertRowId!;
}

/** Atualiza um ExercicioTreino por id */
export async function updateExercicioTreino(
  id: number,
  data: {
    repeticoes?: number;
    series?: number;
    descanso?: number;
    exercicioId?: number;
    treinoId?: number;
  }
) {
  const sets: string[] = [];
  const params: any[] = [];

  if (typeof data.repeticoes === "number") {
    sets.push("repeticoes = ?");
    params.push(data.repeticoes);
  }
  if (typeof data.series === "number") {
    sets.push("series = ?");
    params.push(data.series);
  }
  if (typeof data.descanso === "number") {
    sets.push("descanso = ?");
    params.push(data.descanso);
  }
  if (typeof data.exercicioId === "number") {
    sets.push("exercicio_id = ?");
    params.push(data.exercicioId);
  }
  if (typeof data.treinoId === "number") {
    sets.push("treino_id = ?");
    params.push(data.treinoId);
  }

  if (sets.length === 0) return;

  params.push(id);
  const sql = `UPDATE exercicio_treino SET ${sets.join(", ")} WHERE id = ?;`;
  await db.runAsync(sql, params);
}

/** Remove um exercício específico de um treino (pelo par treinoId + exercicioId) */
export async function removeExercicioDoTreino(treinoId: number, exercicioId: number) {
  await db.runAsync(
    `DELETE FROM exercicio_treino WHERE treino_id = ? AND exercicio_id = ?;`,
    [treinoId, exercicioId]
  );
}

/** Remove pelo id do registro exercicio_treino */
export async function deleteExercicioTreinoById(id: number) {
  await db.runAsync(`DELETE FROM exercicio_treino WHERE id = ?;`, [id]);
}
