import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: "#111" },
        headerTintColor: "#fff",
        drawerStyle: { backgroundColor: "#1a1a1a" },
        drawerActiveTintColor: "#00b894",
        drawerInactiveTintColor: "#ccc",
      }}
    >
      <Drawer.Screen name="index" options={{ title: "🏠 Início" }} />
      <Drawer.Screen name="treino/index" options={{ title: "💪 Treinos" }} />
    </Drawer>
  );
}