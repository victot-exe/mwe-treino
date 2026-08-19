import {
  getConfiguracao,
  setConfiguracao,
} from "@/src/database/configuracaoRepository";
import { themes, ThemeColors } from "@/src/theme/colors";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode =
  | "dark"
  | "dark_orange"
  | "dark_emerald"
  | "dark_volt"
  | "dark_blue"
  | "dark_violet"
  | "light"
  | "auto";

interface ThemeContextData {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark_orange"); // Padrão: Energy Sunset

  // Carrega a preferência salva no banco SQLite
  useEffect(() => {
    async function carregarTemaSalvo() {
      const salvo = (await getConfiguracao("app_theme_mode", "dark_orange")) as ThemeMode;
      if (
        salvo === "dark" ||
        salvo === "dark_orange" ||
        salvo === "dark_emerald" ||
        salvo === "dark_volt" ||
        salvo === "dark_blue" ||
        salvo === "dark_violet" ||
        salvo === "light" ||
        salvo === "auto"
      ) {
        setThemeModeState(salvo);
      }
    }
    carregarTemaSalvo();
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await setConfiguracao("app_theme_mode", mode);
  }, []);

  // Determina se o modo visual final é escuro ou claro
  const isDark =
    themeMode !== "light" &&
    (themeMode !== "auto" || systemColorScheme === "dark" || !systemColorScheme);

  const getThemeColors = (): ThemeColors => {
    if (themeMode === "auto") {
      return systemColorScheme === "dark" || !systemColorScheme
        ? themes.dark_orange
        : themes.light;
    }
    if (themeMode === "dark") {
      return themes.dark_orange;
    }
    return themes[themeMode] || themes.dark_orange;
  };

  const colors = getThemeColors();

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        colors,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser utilizado dentro de um ThemeProvider");
  }
  return context;
}
