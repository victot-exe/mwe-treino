import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  return (
    <View>
      <Text>🏋️ Fit Daily</Text>
      <Link href="/treino" asChild>
        <TouchableOpacity>
          <Text>Ver Meus Treinos</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
