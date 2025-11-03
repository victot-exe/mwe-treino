import { getTreinoById } from "@/src/database/treinoRepository";
import { Treino } from "@/src/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";


export default function TreinoScreen(){

    const [treino, setTreino] = useState<Treino>();

    const { id } = useLocalSearchParams();

    useEffect(()=>{
        async function carregarTreino(){
            const treinoDb = await getTreinoById(Number(id));

            if(treinoDb){
                setTreino(treinoDb);
            }
        }

        carregarTreino();
    }, [id]);

    if(!treino){
        return(
            <View>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 10 }}>Carregando treino...</Text>
            </View>
        )
    }
    
    return(
        <View>
            {/* <Link href="/(drawer)/iniciar-treino" asChild/> */}
            <Text>Treino: {treino!.nome}</Text>
            <FlatList
                data={treino!.exercicios}
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