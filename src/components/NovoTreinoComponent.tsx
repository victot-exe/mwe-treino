import { carregarExercicios, removerExercicio } from "@/src/store/exercicioSlice";
import { adicionarTreino } from "@/src/store/treinoSlice";
import { Exercicio } from "@/src/types";
import { useFocusEffect } from "@react-navigation/native";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Button, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store";
import { adicionarExercicioAoTreino, carregarExerciciosDoTreino } from "../store/exercicioTreinoSlice";

export default function NovoTreinoComponent() {
  const dispatch = useDispatch<AppDispatch>();

  const exercicios = useSelector((state: any) => state.exercicios.lista);

  const [nomeTreino, setNomeTreino] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [selecionados, setSelecionados] = useState<Exercicio[]>([]);

  useFocusEffect(
    useCallback(() => {
      dispatch(carregarExercicios() as any);
    }, [dispatch])
  );

  const toggleSelecao = (ex: Exercicio) => {
    if (selecionados.some((s) => s.id === ex.id)) {
      setSelecionados(selecionados.filter((s) => s.id !== ex.id));
    } else {
      setSelecionados([...selecionados, ex]);
    }
  };

  const filtrados = exercicios.filter((ex: Exercicio) =>
    ex.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  function handleLongPress(id: number) {
      Alert.alert(
        "Excluir Exercicio",
        "Tem certeza que deseja excluir este exercicio?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              await dispatch(removerExercicio(id));
              dispatch(carregarExercicios());
            },
          },
        ]
      );
    }

  const handleSalvar = async () => {
    if (!nomeTreino.trim()) {
      alert("Digite um nome para o treino!");
      return;
    }

    if (selecionados.length === 0) {
      alert("Selecione ao menos 1 exercício!");
      return;
    }

    try {
      const novoTreino = await dispatch(adicionarTreino(nomeTreino) as any).unwrap();
      const novoTreinoId = novoTreino[novoTreino.length - 1].id;

      for (const ex of selecionados) {
        await dispatch(
          adicionarExercicioAoTreino({
            treinoId: novoTreinoId,
            exercicioId: ex.id,
            series: 4,
            repeticoes: 12,
            descanso: 60,
            carga: 0,
          }) as any
        );
      }

      await dispatch(carregarExerciciosDoTreino(novoTreinoId) as any);

      alert("✅ Treino criado com sucesso!");
      router.back();

    } catch (e) {
      console.log(e);
      alert("Erro ao salvar treino.");
    }
  };

  return (
    <View style={{ padding: 20 }}>

      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Criar Treino</Text>

      <TextInput
        placeholder="Nome do Treino"
        value={nomeTreino}
        onChangeText={setNomeTreino}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          borderRadius: 8,
          marginVertical: 10,
        }}
      />

      <TextInput
        placeholder="🔍 Pesquisar exercício..."
        value={pesquisa}
        onChangeText={setPesquisa}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
        }}
      />

      <Link href="/(modals)/exercicio/novoExercicio" asChild>
        <TouchableOpacity style={{ marginBottom: 10 }}>
          <Text style={{ color: "blue" }}>➕ Novo Exercício</Text>
        </TouchableOpacity>
      </Link>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id.toString()}
        style={{ maxHeight: 300 }}
        renderItem={({ item }) => {
          const selecionado = selecionados.some((s) => s.id === item.id);
          return (
            <TouchableOpacity
              onPress={() => toggleSelecao(item)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 10,
                borderBottomWidth: 1,
                borderColor: "#eee",
              }}

              onLongPress={() =>handleLongPress(Number(item.id))}
            >
              <Text style={{ width: 30 }}>{selecionado ? "✅" : "⬜"}</Text>
              <Text>{item.nome}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text>Nenhum exercício encontrado</Text>}
      />

      <Text style={{ marginVertical: 10 }}>
        {selecionados.length} exercício(s) selecionado(s)
      </Text>

      <Button title="Salvar Treino" onPress={handleSalvar} />
    </View>
  );
}
