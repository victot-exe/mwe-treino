import {
  getConfiguracao,
  setConfiguracao,
} from "@/src/database/configuracaoRepository";
import { darkTheme, lightTheme, ThemeColors } from "@/src/theme/colors";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "dark" | "light" | "auto";

interface ThemeContextData {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark"); // Padrão: Modo Escuro
  // Carrega a preferência salva no banco SQLite
  useEffect(() => {
    async function carregarTemaSalvo() {
      const salvo = await getConfiguracao("app_theme_mode", "dark");
      if (salvo === "dark" || salvo === "light" || salvo === "auto") {
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
    themeMode === "dark" ||
    (themeMode === "auto" && systemColorScheme === "dark") ||
    (themeMode === "auto" && !systemColorScheme);

  const colors = isDark ? darkTheme : lightTheme;

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
