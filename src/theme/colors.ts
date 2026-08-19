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

export const themes: Record<string, ThemeColors> = {
  dark_orange: {
    // 1. Energy Sunset (Laranja esportivo suave e acolhedor)
    background: "#0d1117",
    backgroundSecondary: "#161b22",
    card: "#161b22",
    cardSecondary: "#21262d",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    text: "#ffffff",
    textSecondary: "#8b949e",
    textMuted: "#6e7681",
    primary: "#f0643b", // Laranja Sunset suave (sem ofuscar)
    primaryDark: "#d94e26",
    accent: "#f59e6c", // Laranja/pêssego suave harmonioso
    accentLight: "rgba(240, 100, 59, 0.12)",
    danger: "#ef4444",
    dangerLight: "rgba(239, 68, 68, 0.15)",
    success: "#10b981", // Verde exclusivo para checks
    successLight: "rgba(16, 185, 129, 0.15)",
    warning: "#f59e0b",
    warningLight: "rgba(245, 158, 11, 0.15)",
    inputBg: "#0d1117",
    inputBorder: "#30363d",
    divider: "rgba(255, 255, 255, 0.06)",
    headerBg: "#090d13",
    headerText: "#ffffff",
    tabBarBg: "#090d13",
    badgeBg: "#21262d",
    stepperBg: "#0d1117",
    stepperBtn: "#21262d",
    stepperText: "#ffffff",
    backdrop: "rgba(0, 0, 0, 0.8)",
  },

  dark_emerald: {
    // 2. Emerald Gym (Esmeralda monocromático)
    background: "#090d16",
    backgroundSecondary: "#111827",
    card: "#131c2e",
    cardSecondary: "#1e293b",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    text: "#ffffff",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    primary: "#10b981", // Esmeralda equilibrado
    primaryDark: "#059669",
    accent: "#34d399", // Menta suave
    accentLight: "rgba(52, 211, 153, 0.15)",
    danger: "#ef4444",
    dangerLight: "rgba(239, 68, 68, 0.15)",
    success: "#22c55e",
    successLight: "rgba(34, 197, 94, 0.15)",
    warning: "#f59e0b",
    warningLight: "rgba(245, 158, 11, 0.15)",
    inputBg: "#0f172a",
    inputBorder: "#2d3748",
    divider: "rgba(255, 255, 255, 0.06)",
    headerBg: "#070a10",
    headerText: "#ffffff",
    tabBarBg: "#070a10",
    badgeBg: "#1e293b",
    stepperBg: "#0f172a",
    stepperBtn: "#334155",
    stepperText: "#ffffff",
    backdrop: "rgba(0, 0, 0, 0.8)",
  },

  dark_volt: {
    // 3. Volt Cyber (Lima Cyber monocromático)
    background: "#09090b",
    backgroundSecondary: "#141417",
    card: "#18181b",
    cardSecondary: "#27272a",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    text: "#ffffff",
    textSecondary: "#a1a1aa",
    textMuted: "#71717a",
    primary: "#84cc16", // Lima Volt
    primaryDark: "#65a30d",
    accent: "#bef264", // Lima claro harmonioso
    accentLight: "rgba(132, 204, 22, 0.15)",
    danger: "#ef4444",
    dangerLight: "rgba(239, 68, 68, 0.15)",
    success: "#22c55e",
    successLight: "rgba(34, 197, 94, 0.15)",
    warning: "#f59e0b",
    warningLight: "rgba(245, 158, 11, 0.15)",
    inputBg: "#09090b",
    inputBorder: "#3f3f46",
    divider: "rgba(255, 255, 255, 0.06)",
    headerBg: "#050507",
    headerText: "#ffffff",
    tabBarBg: "#050507",
    badgeBg: "#27272a",
    stepperBg: "#09090b",
    stepperBtn: "#27272a",
    stepperText: "#ffffff",
    backdrop: "rgba(0, 0, 0, 0.8)",
  },

  dark_blue: {
    // 4. Royal Focus (Azul Esportivo monocromático)
    background: "#080b11",
    backgroundSecondary: "#0f141f",
    card: "#121824",
    cardSecondary: "#1a2233",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    text: "#ffffff",
    textSecondary: "#8da2ba",
    textMuted: "#5e7188",
    primary: "#3b82f6", // Azul Royal
    primaryDark: "#2563eb",
    accent: "#60a5fa", // Azul claro harmonioso
    accentLight: "rgba(59, 130, 246, 0.15)",
    danger: "#ef4444",
    dangerLight: "rgba(239, 68, 68, 0.15)",
    success: "#10b981",
    successLight: "rgba(16, 185, 129, 0.15)",
    warning: "#f59e0b",
    warningLight: "rgba(245, 158, 11, 0.15)",
    inputBg: "#080b11",
    inputBorder: "#243048",
    divider: "rgba(255, 255, 255, 0.06)",
    headerBg: "#05070c",
    headerText: "#ffffff",
    tabBarBg: "#05070c",
    badgeBg: "#1a2233",
    stepperBg: "#080b11",
    stepperBtn: "#1a2233",
    stepperText: "#ffffff",
    backdrop: "rgba(0, 0, 0, 0.8)",
  },

  dark_violet: {
    // 5. Obsidian Violet (Roxo Cyber monocromático)
    background: "#0c0a14",
    backgroundSecondary: "#141120",
    card: "#171326",
    cardSecondary: "#231c38",
    cardBorder: "rgba(255, 255, 255, 0.08)",
    text: "#ffffff",
    textSecondary: "#a79ebd",
    textMuted: "#736b85",
    primary: "#a855f7", // Roxo Elétrico
    primaryDark: "#9333ea",
    accent: "#c084fc", // Lavanda brilhante
    accentLight: "rgba(168, 85, 247, 0.15)",
    danger: "#ef4444",
    dangerLight: "rgba(239, 68, 68, 0.15)",
    success: "#10b981",
    successLight: "rgba(16, 185, 129, 0.15)",
    warning: "#f59e0b",
    warningLight: "rgba(245, 158, 11, 0.15)",
    inputBg: "#0c0a14",
    inputBorder: "#2d2448",
    divider: "rgba(255, 255, 255, 0.06)",
    headerBg: "#07050d",
    headerText: "#ffffff",
    tabBarBg: "#07050d",
    badgeBg: "#231c38",
    stepperBg: "#0c0a14",
    stepperBtn: "#231c38",
    stepperText: "#ffffff",
    backdrop: "rgba(0, 0, 0, 0.8)",
  },

  light: {
    // 6. Modo Claro
    background: "#f8fafc",
    backgroundSecondary: "#f1f5f9",
    card: "#ffffff",
    cardSecondary: "#f8f9fa",
    cardBorder: "#e2e8f0",
    text: "#0f172a",
    textSecondary: "#64748b",
    textMuted: "#94a3b8",
    primary: "#10b981",
    primaryDark: "#059669",
    accent: "#0284c7",
    accentLight: "rgba(2, 132, 199, 0.1)",
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
  },
};

export const darkTheme: ThemeColors = themes.dark_orange;
export const lightTheme: ThemeColors = themes.light;
