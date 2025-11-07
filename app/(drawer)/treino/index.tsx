import { getTreinos } from "@/src/database/treinoRepository";
import { Treino } from "@/src/types";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

export default function TreinosScreen() {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  

  useEffect(() => {
    async function carregarTreinos(){
      const treinosData = await getTreinos();
      setTreinos(treinosData);
    }

    carregarTreinos();
  }, []);

  return (
    <View>
      <Text>Meus Treinos</Text>

      <FlatList
        data={treinos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: "/treinos/[id]", params: { id: String(item.id) } }}
            asChild
          >
            <TouchableOpacity>
              <Text>{item.nome}</Text>
            </TouchableOpacity>
          </Link>
        )}
      />

      <Link href={{ pathname: "/treinos/novoTreino" }} asChild>
        <TouchableOpacity>
          <Text>
            ➕ Criar Novo Treino
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}