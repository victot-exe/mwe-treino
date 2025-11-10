import { Exercicio, ExercicioTreino } from "@/src/types";
import { db } from "./database";

function mapRowToExercicioTreino(row: any): ExercicioTreino {
  return {
    id: row.id,
    treino_id: row.treinoId ?? row.treino_id,
    exercicio_id: row.exercicioId ?? row.exercicio_id,
    repeticoes: row.repeticoes,
    series: row.series,
    descanso: row.descanso,
    carga: row.carga,

    exercicio: {
      id: row["exercicio.id"] ?? row.exercicio_id,
      nome: row["exercicio.nome"] ?? row.exercicio_nome ?? row.nome,
      descricao:
        row["exercicio.descricao"] ??
        row.exercicio_descricao ??
        row.descricao,
    } as Exercicio,
  } as ExercicioTreino;
}

export async function getExerciciosDoTreino(
  treinoId: number
): Promise<ExercicioTreino[]> {
  const rows = await db.getAllAsync<any>(
    `
    SELECT
      et.id,
      et.treino_id AS treinoId,
      et.exercicio_id AS exercicioId,
      et.repeticoes,
      et.series,
      et.descanso,
      et.carga,
      e.id AS 'exercicio.id',
      e.nome AS 'exercicio.nome',
      e.descricao AS 'exercicio.descricao'
    FROM exercicio_treino et
    JOIN exercicios e ON et.exercicio_id = e.id
    WHERE et.treino_id = ?
    ORDER BY et.id;
    `,
    [treinoId]
  );

  return rows.map(mapRowToExercicioTreino);
}

export async function getExercicioTreinoById(
  id: number
): Promise<ExercicioTreino | null> {
  const row = await db.getFirstAsync<any>(
    `
    SELECT
      et.id,
      et.treino_id AS treinoId,
      et.exercicio_id AS exercicioId,
      et.repeticoes,
      et.series,
      et.descanso,
      et.carga,
      e.id AS 'exercicio.id',
      e.nome AS 'exercicio.nome',
      e.descricao AS 'exercicio.descricao'
    FROM exercicio_treino et
    JOIN exercicios e ON et.exercicio_id = e.id
    WHERE et.id = ?;
    `,
    [id]
  );

  return row ? mapRowToExercicioTreino(row) : null;
}

export async function addExercicioTreino(data: {
  treinoId: number;
  exercicioId: number;
  repeticoes: number;
  series: number;
  descanso: number;
  carga: number;
}): Promise<number> {
  const res = await db.runAsync(
    `
    INSERT INTO exercicio_treino (
      treino_id,
      exercicio_id,
      repeticoes,
      series,
      descanso,
      carga
    )
    VALUES (?, ?, ?, ?, ?, ?);
    `,
    [
      data.treinoId,
      data.exercicioId,
      data.repeticoes,
      data.series,
      data.descanso,
      data.carga,
    ]
  );

  return res.lastInsertRowId!;
}

export async function updateExercicioTreino(
  id: number,
  data: {
    repeticoes?: number;
    series?: number;
    descanso?: number;
    carga?: number;
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
  if (typeof data.carga === "number") {
    sets.push("carga = ?");
    params.push(data.carga);
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


export async function removeExercicioDoTreino(
  treinoId: number,
  exercicioId: number
) {
  await db.runAsync(
    `DELETE FROM exercicio_treino WHERE treino_id = ? AND exercicio_id = ?;`,
    [treinoId, exercicioId]
  );
}

export async function deleteExercicioTreinoById(id: number) {
  await db.runAsync(`DELETE FROM exercicio_treino WHERE id = ?;`, [id]);
}
