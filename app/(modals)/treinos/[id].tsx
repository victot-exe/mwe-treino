import { Treino } from "@/src/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { FlatList, Text, View } from "react-native";


export default function TreinoScreen(){

    const treino: Treino = {
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
    ],}

    const { id } = useLocalSearchParams();

    useEffect(()=>{
        alert(`ID do treino: ${id}`);
        //funcao para pegar o treino do db
    })
    
    return(
        <View>
            {/* <Link href="/(drawer)/iniciar-treino" asChild/> */}
            <Text>Treino: {treino.nome}</Text>
            <FlatList
                data={treino.exercicios}
                keyExtractor={(item) => item.id?.toString() || ''}
                renderItem={({item}) => (
                    <View>
                        <Text>Exercicio: {item.nome}</Text>
                        <Text>Repetições: {item.repeticoes}</Text>
                        <Text>Séries: {item.series}</Text>
                        <Text>Descanso: {item.descanso} segundos</Text>
                    </View>
                )}
            />
        </View>
    )
}