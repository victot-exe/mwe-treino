import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("mwe-treino-v3.db");

export async function initDatabase() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercicios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT
    );

    CREATE TABLE IF NOT EXISTS treinos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exercicio_treino (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      treino_id INTEGER NOT NULL,
      exercicio_id INTEGER NOT NULL,
      repeticoes INTEGER NOT NULL,
      series INTEGER NOT NULL,
      descanso INTEGER NOT NULL,
      carga INTEGER NOT NULL,
      FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE,
      FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS configuracoes (
      chave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    );
  `);

  const existing = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM exercicios;`
  );

  if (!existing || existing.count === 0) {
    console.log("🌱 Inserindo dados iniciais...");

    await db.runAsync(`
      INSERT INTO exercicios (nome, descricao) VALUES
      ('Supino Reto', 'Exercício para peitoral com barra'),
      ('Remada Curvada', 'Trabalha costas e bíceps'),
      ('Agachamento', 'Foco em pernas e glúteos');
    `);

    await db.runAsync(`
      INSERT INTO treinos (nome) VALUES
      ('Treino A'),
      ('Treino B');
    `);

    await db.runAsync(`
      INSERT INTO exercicio_treino (treino_id, exercicio_id, repeticoes, series, descanso, carga) VALUES
      (1, 1, 10, 4, 60, 20),
      (1, 2, 12, 3, 45, 35),
      (2, 3, 10, 4, 90, 0);
    `);

    console.log("✅ Banco de dados inicializado com sucesso!");
  }
}
