export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  card: string;
  cardSecondary: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  danger: string;
  dangerLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  inputBg: string;
  inputBorder: string;
  divider: string;
  headerBg: string;
  headerText: string;
  tabBarBg: string;
  badgeBg: string;
  stepperBg: string;
  stepperBtn: string;
  stepperText: string;
  backdrop: string;
}

export const darkTheme: ThemeColors = {
  background: "#090d16", // Preto azulado profundo estilo OLED premium
  backgroundSecondary: "#111827", // Superfície de transição
  card: "#131c2e", // Superfície de card elevada e nítida
  cardSecondary: "#1e293b", // Superfície interna / badges secundárias
  cardBorder: "rgba(255, 255, 255, 0.08)", // Borda translúcida moderna
  text: "#ffffff", // Branco puro para títulos com máximo contraste
  textSecondary: "#94a3b8", // Texto de apoio legível e suave
  textMuted: "#64748b", // Detalhes discretos
  primary: "#10b981", // Esmeralda esportivo equilibrado e confortável (sem ofuscar)
  primaryDark: "#059669",
  accent: "#38bdf8", // Sky Blue vibrante (destaques, timer, badges de ordem)
  accentLight: "rgba(56, 189, 248, 0.12)",
  danger: "#ef4444",
  dangerLight: "rgba(239, 68, 68, 0.15)",
  success: "#22c55e", // Verde vibrante exclusivo para checks e séries concluídas
  successLight: "rgba(34, 197, 94, 0.15)",
  warning: "#f59e0b",
  warningLight: "rgba(245, 158, 11, 0.15)",
  inputBg: "#0f172a", // Inputs escuros bem delimitados
  inputBorder: "#2d3748",
  divider: "rgba(255, 255, 255, 0.06)",
  headerBg: "#070a10", // Cabeçalho ultra dark clean
  headerText: "#ffffff",
  tabBarBg: "#070a10",
  badgeBg: "#1e293b",
  stepperBg: "#0f172a",
  stepperBtn: "#334155",
  stepperText: "#ffffff",
  backdrop: "rgba(0, 0, 0, 0.8)",
};

export const lightTheme: ThemeColors = {
  background: "#f8fafc", // Slate 50
  backgroundSecondary: "#f1f5f9", // Slate 100
  card: "#ffffff",
  cardSecondary: "#f8f9fa",
  cardBorder: "#e2e8f0",
  text: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  primary: "#00b894",
  primaryDark: "#00a383",
  accent: "#0984e3",
  accentLight: "rgba(9, 132, 227, 0.1)",
  danger: "#ef4444",
  dangerLight: "rgba(239, 68, 68, 0.1)",
  success: "#059669",
  successLight: "rgba(5, 150, 105, 0.1)",
  warning: "#d97706",
  warningLight: "rgba(217, 119, 6, 0.1)",
  inputBg: "#f8f9fa",
  inputBorder: "#dcdde1",
  divider: "#e2e8f0",
  headerBg: "#ffffff",
  headerText: "#0f172a",
  tabBarBg: "#ffffff",
  badgeBg: "#f1f5f9",
  stepperBg: "#f1f2f6",
  stepperBtn: "#e4e7eb",
  stepperText: "#2f3640",
  backdrop: "rgba(0, 0, 0, 0.5)",
};
