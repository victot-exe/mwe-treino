import type { Exercicio } from "../types";
import { db } from "./database";

export async function getExercicios(): Promise<Exercicio[]> {
  const result = await db.getAllAsync<Exercicio>("SELECT * FROM exercicios;");
  return result;
}

export async function getExercicioById(id: number): Promise<Exercicio | null> {
  const result = await db.getFirstAsync<Exercicio>(
    "SELECT * FROM exercicios WHERE id = ?;",
    [id]
  );
  return result || null;
}

export async function addExercicio(exercicio: Omit<Exercicio, "id">) {
  await db.runAsync(
    `INSERT INTO exercicios (nome, repeticoes, series, descanso)
     VALUES (?, ?, ?, ?);`,
    [exercicio.nome, exercicio.repeticoes, exercicio.series, exercicio.descanso]
  );
}

export async function updateExercicio(exercicio: Exercicio) {
  await db.runAsync(
    `UPDATE exercicios
     SET nome = ?, repeticoes = ?, series = ?, descanso = ?
     WHERE id = ?;`,
    [exercicio.nome, exercicio.repeticoes, exercicio.series, exercicio.descanso, exercicio.id]
  );
}

export async function deleteExercicio(id: number) {
  await db.runAsync(`DELETE FROM exercicios WHERE id = ?;`, [id]);
}