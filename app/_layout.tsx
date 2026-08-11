import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { store } from "@/src/store";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";

function RootNavigator() {
  const { colors, isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.cardBorder,
      primary: colors.primary,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <GestureHandlerRootView
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.headerBg,
            },
            headerTintColor: colors.headerText,
            contentStyle: {
              backgroundColor: colors.background,
            },
            animation: "default",
          }}
        >
          <Stack.Screen
            name="(drawer)"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="(modals)/exercicio/novoExercicio"
            options={{
              presentation: "modal",
              title: "➕ Novo Exercício",
              contentStyle: { backgroundColor: colors.background },
            }}
          />

          <Stack.Screen
            name="(modals)/treinos/novoTreino"
            options={{
              presentation: "modal",
              title: "➕ Novo Treino",
              contentStyle: { backgroundColor: colors.background },
            }}
          />

          <Stack.Screen
            name="(modals)/treinos/[id]"
            options={{
              presentation: "modal",
              title: "Treino",
              contentStyle: { backgroundColor: colors.background },
            }}
          />

          <Stack.Screen
            name="(modals)/treinos/treinar/[id]"
            options={{
              presentation: "fullScreenModal",
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </Provider>
  );
}
