//definir como modal e nao como tela inteira 
import { Exercicio } from "@/src/types";
import React, { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

type FormExercicio = {
    nome: string;
    repeticoes: number;
    series: number;
    descanso: number;
};

export default function NovoExercicioScreen() {
    const [form, setForm] = useState<Exercicio>({
        id: 0,
        nome: "",
        repeticoes: 0,
        series: 0,
        descanso: 0,
    });

    const handleChange = (campo: keyof FormExercicio, valor: string) => {
        setForm({
        ...form,
        [campo]: campo === "nome" ? valor : parseInt(valor) || 0, // garante que não vire NaN
        });
    };

    const handleSalvar = () => {
        //aqui vou colocar o service que salva no banco de dados
        alert(
            `Exercício salvo Nome: ${form.nome}\nRepetições: ${form.repeticoes}\nSéries: ${form.series}\nDescanso: ${form.descanso}`
        );

        setForm({ id: 0, nome: "", repeticoes: 0, series: 0, descanso: 0 });
        //funcao para fechar o modal apos salvar e voltar  para a tela anterior
    };

    return (
        <View>
            <Text>Criar novo exercício</Text>

            <TextInput
                placeholder="Nome do Exercício"
                value={form.nome}
                onChangeText={(valor) => handleChange("nome", valor)}
            />

            <TextInput
                placeholder="Repetições"
                keyboardType="number-pad"
                value={form.repeticoes === 0 ? "" : form.repeticoes.toString()}
                onChangeText={(valor) => handleChange("repeticoes", valor)}
            />

            <TextInput
                placeholder="Séries"
                keyboardType="number-pad"
                value={form.series === 0 ? "" : form.series.toString()}
                onChangeText={(valor) => handleChange("series", valor)}
            />

            <TextInput
                placeholder="Descanso (segundos)"
                keyboardType="number-pad"
                value={form.descanso === 0 ? "" : form.descanso.toString()}
                onChangeText={(valor) => handleChange("descanso", valor)}
            />

            <Button title="Salvar Exercício"
                onPress={handleSalvar}
                />
        </View>
    );
}