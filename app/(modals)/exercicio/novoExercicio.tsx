import { adicionarExercicio } from "@/src/store/exercicioSlice";
import { Exercicio } from "@/src/types";
import { router } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useDispatch } from "react-redux";

export default function NovoExercicioScreen() {
  const dispatch = useDispatch();

  const [form, setForm] = useState<Omit<Exercicio, "id">>({
    nome: "",
    descricao: "",
  });

  const handleChange = (campo: keyof Exercicio, valor: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      alert("O exercício precisa ter um nome!");
      return;
    }

    try {
      await dispatch(adicionarExercicio(form) as any);

      alert("✅ Exercício salvo com sucesso!");

      router.back();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar exercício.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Criar novo exercício
      </Text>

      <TextInput
        placeholder="Nome do Exercício"
        value={form.nome}
        onChangeText={(valor) => handleChange("nome", valor)}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
        }}
      />

      <TextInput
        placeholder="Descrição (opcional)"
        value={form.descricao || ""}
        onChangeText={(valor) => handleChange("descricao", valor)}
        multiline
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 10,
          height: 80,
          textAlignVertical: "top",
          marginBottom: 20,
        }}
      />

      <Button title="Salvar Exercício" onPress={handleSalvar} />
    </View>
  );
}
