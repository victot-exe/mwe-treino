import { Button, Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import ListaExerciciosComponent from "./ListaExerciciosComponent";

export default function NovoTreinoComponent() {
  return (
    <View>
      <TextInput placeholder="Nome do Treino" />

      <View>
        <Text>Exercícios</Text>
        <Button title="Salvar Treino" onPress={() => alert("Salvar Treino no Database")} />
      </View>

      <View>
        <ListaExerciciosComponent />
      </View>
    </View>
  );
}
