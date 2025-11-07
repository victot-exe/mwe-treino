import { getTreinoById } from "@/src/database/treinoRepository";
import { Treino } from "@/src/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function TreinoScreen() {
  const [treino, setTreino] = useState<Treino | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    async function carregarTreino() {
      if (!id) return;

      const treinoDb = await getTreinoById(Number(id));
      setTreino(treinoDb);
      setLoading(false);
    }

    carregarTreino();
    alert(id);
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10 }}>Carregando treino...</Text>
      </View>
    );
  }

  if (!treino) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Nenhum treino encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Treino: {treino.nome}
      </Text>

      <FlatList
        data={treino.exercicios}
        keyExtractor={(item) => item.id?.toString() || ""}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontWeight: "bold" }}>
              Exercício: {item.exercicio?.nome}
            </Text>
            {item.exercicio?.descricao && (
              <Text>Descrição: {item.exercicio.descricao}</Text>
            )}
            <Text>Repetições: {item.repeticoes}</Text>
            <Text>Séries: {item.series}</Text>
            <Text>Descanso: {item.descanso}s</Text>
          </View>
        )}
      />
    </View>
  );
}
