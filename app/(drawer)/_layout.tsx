import { useTheme } from "@/src/context/ThemeContext";
import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  const { colors } = useTheme();

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.headerText,
        drawerStyle: { backgroundColor: colors.card },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerActiveBackgroundColor: colors.accentLight,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Drawer.Screen name="index" options={{ title: "🏠 Início" }} />
      <Drawer.Screen name="treino/index" options={{ title: "💪 Treinos" }} />
      <Drawer.Screen name="configuracoes/index" options={{ title: "⚙️ Configurações" }} />
    </Drawer>
  );
}