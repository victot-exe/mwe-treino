import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("mwe-treino-v5.db");

export async function initDatabase() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercicios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      grupo_muscular TEXT NOT NULL DEFAULT 'Geral'
    );

    CREATE INDEX IF NOT EXISTS idx_exercicios_grupo ON exercicios(grupo_muscular);

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

    CREATE TABLE IF NOT EXISTS historico_sessoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      treino_id INTEGER,
      nome_treino TEXT NOT NULL,
      data_inicio TEXT NOT NULL,
      data_fim TEXT NOT NULL,
      duracao_segundos INTEGER NOT NULL,
      exercicios_concluidos INTEGER NOT NULL,
      total_exercicios INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS historico_sessao_exercicios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessao_id INTEGER NOT NULL,
      exercicio_id INTEGER,
      nome_exercicio TEXT NOT NULL,
      series_feitas INTEGER NOT NULL,
      repeticoes INTEGER NOT NULL,
      carga REAL NOT NULL,
      FOREIGN KEY (sessao_id) REFERENCES historico_sessoes(id) ON DELETE CASCADE
    );
  `);

  const existing = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM exercicios;`
  );

  if (!existing || existing.count === 0) {
    console.log("🌱 Inserindo catálogo categorizado de exercícios essenciais...");

    await db.runAsync(`
      INSERT INTO exercicios (nome, descricao, grupo_muscular) VALUES
      -- Peitoral
      ('Supino Reto com Barra', 'Peitoral maior (geral e médio) e tríceps', 'Peitoral'),
      ('Supino Inclinado com Halteres', 'Peitoral superior (porção clavicular)', 'Peitoral'),
      ('Supino Declinado com Barra', 'Porção inferior do peitoral', 'Peitoral'),
      ('Crucifixo na Máquina (Peck Deck)', 'Isolamento e contração peitoral', 'Peitoral'),
      ('Crossover na Polia Média', 'Peitoral com foco em adução e tensão contínua', 'Peitoral'),
      ('Flexão de Braços', 'Peitoral, tríceps e estabilização do core', 'Peitoral'),

      -- Costas & Trapézio
      ('Puxada Alta Frontal', 'Latíssimo do dorso (largura das costas)', 'Costas'),
      ('Remada Curvada com Barra', 'Dorsais, trapézio e romboides (espessura)', 'Costas'),
      ('Remada Baixa no Triângulo', 'Dorsais e meio das costas', 'Costas'),
      ('Remada Unilateral com Halter (Serrote)', 'Latíssimo unilateral com máxima amplitude', 'Costas'),
      ('Pulldown na Polia com Corda', 'Isolamento de grande dorsal', 'Costas'),
      ('Levantamento Terra', 'Cadeia posterior, eretores da espinha e glúteos', 'Costas'),
      ('Barra Fixa (Pull-up)', 'Grande dorsal, bíceps e força funcional', 'Costas'),
      ('Encolhimento de Ombros com Halteres', 'Trapézio superior', 'Costas'),

      -- Ombros
      ('Desenvolvimento com Halteres', 'Deltoide anterior e medial', 'Ombros'),
      ('Elevação Lateral com Halteres', 'Deltoide lateral (largura dos ombros)', 'Ombros'),
      ('Elevação Lateral na Polia', 'Deltoide lateral com tensão constante', 'Ombros'),
      ('Elevação Frontal com Halteres', 'Deltoide anterior', 'Ombros'),
      ('Crucifixo Inverso no Peck Deck', 'Deltoide posterior e romboides', 'Ombros'),
      ('Face Pull na Polia', 'Deltoide posterior, trapézio e manguito rotador', 'Ombros'),

      -- Bíceps
      ('Rosca Direta com Barra W', 'Bíceps braquial e antebraço', 'Bíceps'),
      ('Rosca Alternada com Halteres', 'Bíceps com rotação/supinação', 'Bíceps'),
      ('Rosca Martelo com Halteres', 'Braquial e braquiorradial (antebraço)', 'Bíceps'),
      ('Rosca Scott na Máquina', 'Isolamento e pico do bíceps', 'Bíceps'),
      ('Rosca Concentrada', 'Isolamento total de bíceps', 'Bíceps'),

      -- Tríceps
      ('Tríceps Corda na Polia', 'Cabeça lateral e longa do tríceps', 'Tríceps'),
      ('Tríceps Testa com Barra W', 'Cabeça longa do tríceps', 'Tríceps'),
      ('Tríceps Pulley com Barra Reta', 'Tríceps geral e cabeça medial', 'Tríceps'),
      ('Tríceps Francês com Halter', 'Cabeça longa do tríceps em máxima extensão', 'Tríceps'),
      ('Mergulho no Banco / Paralelas', 'Tríceps e porção inferior do peitoral', 'Tríceps'),

      -- Pernas - Quadríceps
      ('Agachamento Livre com Barra', 'Quadríceps, glúteos e core geral', 'Pernas'),
      ('Leg Press 45°', 'Quadríceps e glúteos com suporte lombar', 'Pernas'),
      ('Cadeira Extensora', 'Isolamento de quadríceps', 'Pernas'),
      ('Agachamento Búlgaro com Halteres', 'Unilateral para quadríceps e glúteo', 'Pernas'),
      ('Hack Squat', 'Foco intenso em quadríceps', 'Pernas'),

      -- Pernas - Posterior & Glúteos
      ('Mesa Flexora', 'Isquiotibiais (posterior de coxa)', 'Pernas'),
      ('Cadeira Flexora', 'Isquiotibiais com foco sentado', 'Pernas'),
      ('Stiff com Barra ou Halteres', 'Posterior de coxa e glúteos', 'Pernas'),
      ('Elevação Pélvica com Barra', 'Glúteo máximo e estabilidade de quadril', 'Pernas'),
      ('Cadeira Abdutora', 'Glúteo médio e mínimo', 'Pernas'),
      ('Cadeira Adutora', 'Adutores da coxa', 'Pernas'),

      -- Panturrilhas
      ('Panturrilha em Pé no Degrau', 'Gastrocnêmio', 'Pernas'),
      ('Panturrilha Sentado (Gêmeos)', 'Sóleo', 'Pernas'),

      -- Abdômen & Core
      ('Abdominal Supra no Solo', 'Reto abdominal', 'Abdômen'),
      ('Elevação de Pernas (Infra)', 'Porção inferior do abdômen', 'Abdômen'),
      ('Prancha Isométrica', 'Core profundo, transverso e estabilidade lombar', 'Abdômen'),
      ('Abdominal na Polia com Corda', 'Reto abdominal com sobrecarga progressiva', 'Abdômen');
    `);

    console.log("✅ Catálogo categorizado de 45 exercícios inserido com sucesso!");
  }
}
