import { Exercicio } from "@/src/types";
import React, { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function NovoExercicioScreen() {
  const [form, setForm] = useState<Exercicio>({
    id: 0,
    nome: "",
    descricao: "",
  });

  const handleChange = (campo: keyof Exercicio, valor: string) => {
    setForm({
      ...form,
      [campo]: valor,
    });
  };

  const handleSalvar = () => {
    // Aqui você chamará o repository ou service que salva no banco (exercicioRepository)
    alert(
      `Exercício salvo:\n\nNome: ${form.nome}\nDescrição: ${form.descricao || "—"}`
    );

    // Reseta o formulário
    setForm({ id: 0, nome: "", descricao: "" });

    // Aqui você pode adicionar o fechamento do modal (por exemplo, com router.back() ou setModalVisible(false))
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
