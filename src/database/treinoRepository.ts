import type { Exercicio, Treino } from "../types";
import { db } from "./database";

export async function getTreinos(): Promise<Treino[]> {
  const treinos = await db.getAllAsync<Treino>("SELECT * FROM treinos;");
  for (const treino of treinos) {
    const exercicios = await db.getAllAsync<Exercicio>(
      `SELECT e.* FROM exercicios e
       JOIN treino_exercicio te ON e.id = te.exercicio_id
       WHERE te.treino_id = ?;`,
      [treino.id]
    );
    treino.exercicios = exercicios;
  }
  return treinos;
}

export async function addTreino(nome: string, exercicios: number[]) {
  const result = await db.runAsync(`INSERT INTO treinos (nome) VALUES (?);`, [nome]);
  const treinoId = result.lastInsertRowId;
  for (const exercicioId of exercicios) {
    await db.runAsync(
      `INSERT INTO treino_exercicio (treino_id, exercicio_id)
       VALUES (?, ?);`,
      [treinoId, exercicioId]
    );
  }
}

export async function deleteTreino(id: number) {
  await db.runAsync(`DELETE FROM treinos WHERE id = ?;`, [id]);
}

export async function getTreinoById(id: number): Promise<Treino | null> {
  const treino = await db.getFirstAsync<Treino>(
    `SELECT * FROM treinos WHERE id = ?;`,
    [id]
  );

  if(!treino) {
    return null;
  }

  const exercicios = await db.getAllAsync<Exercicio>(
    `SELECT e.* FROM exercicios e
     JOIN treino_exercicio te ON e.id = te.exercicio_id
     WHERE te.treino_id = ?;`,
    [id]
  );
  treino.exercicios = exercicios;

  return treino;
}
