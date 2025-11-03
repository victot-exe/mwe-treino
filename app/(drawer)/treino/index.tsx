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
  }, []);//ver para tirar

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

const treinosDataOld: Treino[] = [
  {
    id: 1,
    nome: "Treino de Força - Parte Superior",
    exercicios: [
      { id: 1, nome: "Supino Reto", repeticoes: 10, series: 4, descanso: 60 },
      { id: 2, nome: "Remada Curvada", repeticoes: 10, series: 4, descanso: 60 },
      { id: 3, nome: "Desenvolvimento de Ombros", repeticoes: 10, series: 4, descanso: 60 },
      { id: 4, nome: "Puxada na Barra", repeticoes: 8, series: 4, descanso: 90 },
      { id: 5, nome: "Tríceps na Polia", repeticoes: 12, series: 3, descanso: 60 },
      { id: 6, nome: "Rosca Direta", repeticoes: 12, series: 3, descanso: 60 },
      { id: 7, nome: "Peck Deck", repeticoes: 10, series: 3, descanso: 60 },
      { id: 8, nome: "Elevação Lateral", repeticoes: 12, series: 3, descanso: 60 },
    ],
  },
  {
    id: 2,
    nome: "Treino de Força - Parte Inferior",
    exercicios: [
      { id: 1, nome: "Agachamento", repeticoes: 10, series: 4, descanso: 60 },
      { id: 2, nome: "Leg Press", repeticoes: 10, series: 4, descanso: 60 },
      { id: 3, nome: "Cadeira Extensora", repeticoes: 12, series: 3, descanso: 60 },
      { id: 4, nome: "Cadeira Flexora", repeticoes: 12, series: 3, descanso: 60 },
      { id: 5, nome: "Levantamento Terra", repeticoes: 8, series: 4, descanso: 90 },
      { id: 6, nome: "Panturrilha em Pé", repeticoes: 15, series: 3, descanso: 60 },
      { id: 7, nome: "Abdômen na Bola", repeticoes: 15, series: 3, descanso: 60 },
      { id: 8, nome: "Agachamento Unilateral", repeticoes: 10, series: 3, descanso: 60 },
    ],
  },
  {
    id: 3,
    nome: "Treino de Cardio e Funcional",
    exercicios: [
      { id: 1, nome: "Burpees", repeticoes: 10, series: 4, descanso: 60 },
      { id: 2, nome: "Pular Corda", repeticoes: 300, series: 1, descanso: 30 },
      { id: 3, nome: "Mountain Climbers", repeticoes: 15, series: 4, descanso: 60 },
      { id: 4, nome: "Corrida no Lugar", repeticoes: 1, series: 5, descanso: 30 }, // 1 min
      { id: 5, nome: "Agachamento com Salto", repeticoes: 10, series: 3, descanso: 60 },
      { id: 6, nome: "Flexão de Braço", repeticoes: 10, series: 4, descanso: 60 },
      { id: 7, nome: "Prancha", repeticoes: 30, series: 3, descanso: 30 }, // 30 seg
      { id: 8, nome: "Lateral Shuffle", repeticoes: 30, series: 4, descanso: 60 }, // 30 seg
    ],
  },
];