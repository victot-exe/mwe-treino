import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { Text, View } from "react-native";

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
        drawerLabelStyle: { marginLeft: -12, fontWeight: "600", fontSize: 15 },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: "Início",
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MaterialCommunityIcons name="dumbbell" size={22} color={colors.accent} />
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.headerText }}>
                MWE Treino
              </Text>
            </View>
          ),
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size || 22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="treino/index"
        options={{
          title: "Treinos",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dumbbell" size={size || 22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="historico/index"
        options={{
          title: "Histórico",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size || 22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="configuracoes/index"
        options={{
          title: "Configurações",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size || 22} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}