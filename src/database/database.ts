import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("mwe-treino.db");

export async function initDatabase() {
  await db.execAsync(` CREATE TABLE IF NOT EXISTS exercicios ( id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, repeticoes INTEGER NOT NULL, series INTEGER NOT NULL, descanso INTEGER NOT NULL ); CREATE TABLE IF NOT EXISTS treinos ( id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL ); CREATE TABLE IF NOT EXISTS treino_exercicio ( treino_id INTEGER NOT NULL, exercicio_id INTEGER NOT NULL, FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE, FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE ); `);

  const existing = await db.getFirstAsync<{count : number}>(
    `SELECT COUNT(*) as count FROM exercicios;`
  );

  if(!existing || existing.count === 0){
    console.log("🌱 Inserindo dados iniciais...");

    await db.runAsync(` INSERT INTO exercicios (nome, repeticoes, series, descanso) VALUES ('Supino Reto', 10, 4, 60), ('Remada Curvada', 10, 4, 60), ('Desenvolvimento de Ombros', 10, 4, 60), ('Puxada na Barra', 8, 4, 90), ('Tríceps na Polia', 12, 3, 60), ('Rosca Direta', 12, 3, 60), ('Peck Deck', 10, 3, 60), ('Elevação Lateral', 12, 3, 60), ('Agachamento', 10, 4, 60), ('Leg Press', 10, 4, 60), ('Cadeira Extensora', 12, 3, 60), ('Cadeira Flexora', 12, 3, 60), ('Levantamento Terra', 8, 4, 90), ('Panturrilha em Pé', 15, 3, 60), ('Abdômen na Bola', 15, 3, 60), ('Agachamento Unilateral', 10, 3, 60), ('Burpees', 10, 4, 60), ('Pular Corda', 300, 1, 30), ('Mountain Climbers', 15, 4, 60), ('Corrida no Lugar', 1, 5, 30), ('Agachamento com Salto', 10, 3, 60), ('Flexão de Braço', 10, 4, 60), ('Prancha', 30, 3, 30), ('Lateral Shuffle', 30, 4, 60); `);

    await db.runAsync(` INSERT INTO treinos (nome) VALUES ('Treino de Força - Parte Superior'), ('Treino de Força - Parte Inferior'), ('Treino de Cardio e Funcional'); `);

    await db.runAsync(` INSERT INTO treino_exercicio (treino_id, exercicio_id) VALUES (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (2, 9), (2, 10), (2, 11), (2, 12), (2, 13), (2, 14), (2, 15), (2, 16), (3, 17), (3, 18), (3, 19), (3, 20), (3, 21), (3, 22), (3, 23), (3, 24); `);

    console.log("✅ Banco de dados inicializado com sucesso!");
  }
}