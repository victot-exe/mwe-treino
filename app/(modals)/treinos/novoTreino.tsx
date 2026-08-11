import NovoTreinoComponent from "@/src/components/NovoTreinoComponent";
import { useTheme } from "@/src/context/ThemeContext";
import { View } from "react-native";

export default function NovoTreinoScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NovoTreinoComponent />
    </View>
  );
}