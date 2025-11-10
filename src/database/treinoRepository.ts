import { Exercicio, ExercicioTreino, Treino } from "../types";
import { db } from "./database";

export async function getAllTreinos(): Promise<Treino[]> {
  const result = await db.getAllAsync<Treino>(`SELECT * FROM treinos`);
  const treinosComExercicios: Treino[] = [];

  for (const treino of result) {
    const exerciciosTreino = await db.getAllAsync<
      ExercicioTreino & { nome: string; descricao: string }
    >(
      `
      SELECT et.*, e.nome, e.descricao
      FROM exercicio_treino et
      JOIN exercicios e ON et.exercicio_id = e.id
      WHERE et.treino_id = ?
      `,
      [treino.id]
    );

    const exercicios = exerciciosTreino.map((et) => ({
      id: et.id,
      treino_id: et.treino_id,
      exercicio_id: et.exercicio_id,
      repeticoes: et.repeticoes,
      series: et.series,
      descanso: et.descanso,
      carga: et.carga, // ✅ ADICIONADO
      exercicio: {
        id: et.exercicio_id,
        nome: et.nome,
        descricao: et.descricao,
      } as Exercicio,
    }));

    treinosComExercicios.push({ ...treino, exercicios });
  }

  return treinosComExercicios;
}

export async function getTreinoById(id: number): Promise<Treino | null> {
  const treino = await db.getFirstAsync<Treino>(
    `SELECT * FROM treinos WHERE id = ?`,
    [id]
  );

  if (!treino) return null;

  const exerciciosTreino = await db.getAllAsync<
    ExercicioTreino & { nome: string; descricao: string }
  >(
    `
    SELECT et.*, e.nome, e.descricao
    FROM exercicio_treino et
    JOIN exercicios e ON et.exercicio_id = e.id
    WHERE et.treino_id = ?
    `,
    [id]
  );

  const exercicios = exerciciosTreino.map((et) => ({
    id: et.id,
    treino_id: et.treino_id,
    exercicio_id: et.exercicio_id,
    repeticoes: et.repeticoes,
    series: et.series,
    descanso: et.descanso,
    carga: et.carga, // ✅ ADICIONADO
    exercicio: {
      id: et.exercicio_id,
      nome: et.nome,
      descricao: et.descricao,
    } as Exercicio,
  }));

  return { ...treino, exercicios };
}

export async function createTreino(nome: string): Promise<number> {
  const result = await db.runAsync(`INSERT INTO treinos (nome) VALUES (?)`, [
    nome,
  ]);
  return result.lastInsertRowId!;
}

export async function updateTreino(id: number, nome: string): Promise<void> {
  await db.runAsync(`UPDATE treinos SET nome = ? WHERE id = ?`, [nome, id]);
}

export async function deleteTreino(id: number): Promise<void> {
  await db.runAsync(`DELETE FROM treinos WHERE id = ?`, [id]);
}

export async function getTreinos(): Promise<Treino[]> {
  return db.getAllAsync<Treino>(`SELECT * FROM treinos`);
}