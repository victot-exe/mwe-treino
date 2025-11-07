import { Exercicio } from "@/src/types";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getExercicios } from "../database/exercicioRepository";

export default function ListaExerciciosComponent() {
  const [pesquisa, setPesquisa] = useState("");
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [exerciciosSelecionados, setExerciciosSelecionados] = useState<Exercicio[]>([]);

  useEffect(() => {
    getExercicios().then(setExercicios);
  }, []);

  const exerciciosFiltrados = exercicios.filter((ex) =>
    ex.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const onSelecionar = (selecionados: Exercicio[]) => {
    setExerciciosSelecionados(selecionados);
  };

  const estaSelecionado = (exercicio: Exercicio) => {
    return exerciciosSelecionados.some((ex) => ex.id === exercicio.id);
  };

  const toggleSelecao = (exercicio: Exercicio) => {
    if (estaSelecionado(exercicio)) {
      onSelecionar(exerciciosSelecionados.filter((ex) => ex.id !== exercicio.id));
    } else {
      onSelecionar([...exerciciosSelecionados, exercicio]);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="🔍 Pesquisar exercício..."
        value={pesquisa}
        onChangeText={setPesquisa}
      />

      <Link href="/(modals)/exercicio/novoExercicio" asChild>
        <TouchableOpacity>
          <Text>➕ Novo Exercicio</Text>
        </TouchableOpacity>
      </Link>

      <FlatList
        data={exerciciosFiltrados}
        keyExtractor={(item) => item.id?.toString() || ""}
        renderItem={({ item }) => {
          const selecionado = estaSelecionado(item);
          return (
            <TouchableOpacity onPress={() => toggleSelecao(item)}>
              <View>
                {selecionado && <Text>✓</Text>}
              </View>
              <View>
                <Text>{item.nome}</Text>
                {/* <Text>
                  {item.series}x{item.repeticoes} • {item.descanso}s descanso
                </Text> */}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text>Nenhum exercício encontrado</Text>}
      />

      <View>
        <Text>{exerciciosSelecionados.length} exercício(s) selecionado(s)</Text>
      </View>
    </View>
  );
}
