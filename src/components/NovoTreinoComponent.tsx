import { Link } from "expo-router";
import { Button, FlatList, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

export default function NovoTreinoComponent() {

    const lista = ["data 1", "data 2"];//lista que vai receber os exercicios criados

    return (
        <View>
            <Text>Novo Treino Screen</Text>
            <TextInput
                placeholder="Nome do Treino"
            />
            {/* Colocar estilo nessa view para ficar lado a lado */}
            <View>
                <Text>Exercicios</Text>
                <Link href="/(modals)/exercicio/novoExercicio" asChild>
                    <TouchableOpacity>
                        <Text>
                            ➕ Novo Exercicio
                        </Text>
                    </TouchableOpacity>
                </Link>
            </View>
                
            <FlatList
                data={lista}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Text>{item}</Text>}
            />
            <Button title="Salvar Treino" onPress={() => alert('Salvar Treino no Database')} />
        </View>
    );
}