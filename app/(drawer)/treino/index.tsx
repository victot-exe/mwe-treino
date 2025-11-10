import { AppDispatch, RootState } from "@/src/store";
import { carregarTreinos, removerTreino } from "@/src/store/treinoSlice";
import { Link, router } from "expo-router";
import { useEffect } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function TreinosScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const treinos = useSelector((state: RootState) => state.treinos.lista);
  const loading = useSelector((state: RootState) => state.treinos.loading);

  useEffect(() => {
    dispatch(carregarTreinos());
  }, []);

  function handleLongPress(id: number) {
    Alert.alert(
      "Excluir treino",
      "Tem certeza que deseja excluir este treino?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await dispatch(removerTreino(id));
            dispatch(carregarTreinos());
          },
        },
      ]
    );
  }

  return (
    <View>

      {loading ? (
        <Text>Carregando...</Text>
      ) : (
        <FlatList
          data={treinos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push(`/treinos/${item.id}`)
              }
              onLongPress={() => handleLongPress(item.id)}
              delayLongPress={500}
              style={{
                padding: 12,
                marginVertical: 6,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
              }}
            >
              <Text>{item.nome}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <Link href="/treinos/novoTreino" asChild>
        <TouchableOpacity>
          <Text>➕ Criar Novo Treino</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
