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
  background: "#0f172a", // Slate 900
  backgroundSecondary: "#1e293b", // Slate 800
  card: "#1e293b",
  cardSecondary: "#334155",
  cardBorder: "#334155",
  text: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  primary: "#00b894", // Esmeralda vibrante
  primaryDark: "#00a383",
  accent: "#38bdf8", // Sky blue esportivo
  accentLight: "rgba(56, 189, 248, 0.15)",
  danger: "#ef4444",
  dangerLight: "rgba(239, 68, 68, 0.15)",
  success: "#10b981",
  successLight: "rgba(16, 185, 129, 0.15)",
  warning: "#f59e0b",
  warningLight: "rgba(245, 158, 11, 0.15)",
  inputBg: "#0f172a",
  inputBorder: "#334155",
  divider: "#1e293b",
  headerBg: "#090d16",
  headerText: "#ffffff",
  tabBarBg: "#090d16",
  badgeBg: "#1e293b",
  stepperBg: "#0f172a",
  stepperBtn: "#334155",
  stepperText: "#f8fafc",
  backdrop: "rgba(0, 0, 0, 0.75)",
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
