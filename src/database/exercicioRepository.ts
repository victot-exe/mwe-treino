import { Exercicio } from "../types";
import { db } from "./database";

export async function getExercicios(): Promise<Exercicio[]> {
  return await db.getAllAsync<Exercicio>(`SELECT * FROM exercicios`);
}

export async function getExercicioById(id: number): Promise<Exercicio | null> {
  return await db.getFirstAsync<Exercicio>(`SELECT * FROM exercicios WHERE id = ?`, [id]);
}

export async function addExercicio(exercicio: Omit<Exercicio, "id">) {
  await db.runAsync(
    `INSERT INTO exercicios (nome, descricao, grupo_muscular) VALUES (?, ?, ?)`,
    [exercicio.nome, exercicio.descricao ?? null, exercicio.grupo_muscular ?? "Geral"]
  );
}

export async function deleteExercicio(id: number) {
  await db.runAsync(`DELETE FROM exercicios WHERE id = ?`, [id]);
}

export async function updateExercicio(exercicio: Exercicio) {
  await db.runAsync(
    `UPDATE exercicios SET nome = ?, descricao = ?, grupo_muscular = ? WHERE id = ?`,
    [
      exercicio.nome,
      exercicio.descricao ?? null,
      exercicio.grupo_muscular ?? "Geral",
      exercicio.id,
    ]
  );
}