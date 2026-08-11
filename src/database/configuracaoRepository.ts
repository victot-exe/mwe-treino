import { db } from "./database";

export async function getConfiguracao(
  chave: string,
  valorPadrao: string = ""
): Promise<string> {
  try {
    const row = await db.getFirstAsync<{ valor: string }>(
      `SELECT valor FROM configuracoes WHERE chave = ?;`,
      [chave]
    );
    return row ? row.valor : valorPadrao;
  } catch (error) {
    console.warn("Erro ao buscar configuracao:", error);
    return valorPadrao;
  }
}

export async function setConfiguracao(chave: string, valor: string): Promise<void> {
  try {
    await db.runAsync(
      `INSERT INTO configuracoes (chave, valor) VALUES (?, ?)
       ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor;`,
      [chave, valor]
    );
  } catch (error) {
    console.warn("Erro ao salvar configuracao:", error);
  }
}
