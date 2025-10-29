import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      
      <Stack>
        <Stack.Screen
          name="(drawer)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(modals)/exercicio/novoExercicio"
          options={{
            presentation: "modal",
            title: "➕ Novo Exercício",
          }}
        />

        <Stack.Screen
          name="(modals)/treinos/novoTreino"
          options={{
            presentation: "modal",
            title: "➕ Novo Treino",
          }}
        />
        <Stack.Screen
          name="(modals)/treinos/[id]"
          options={{
            presentation: "modal",
            title: "Treino",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
