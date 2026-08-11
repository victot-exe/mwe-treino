import { useTheme } from "@/src/context/ThemeContext";
import { AppDispatch } from "@/src/store";
import { adicionarExercicio } from "@/src/store/exercicioSlice";
import { Exercicio } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";

export default function NovoExercicioScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useTheme();

  const [form, setForm] = useState<Omit<Exercicio, "id">>({
    nome: "",
    descricao: "",
  });
  const [salvando, setSalvando] = useState(false);

  const handleChange = (campo: keyof Exercicio, valor: string) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleSalvar = async () => {
    Keyboard.dismiss();

    if (!form.nome.trim()) {
      Alert.alert("Atenção", "O exercício precisa ter um nome!");
      return;
    }

    setSalvando(true);

    try {
      await dispatch(adicionarExercicio(form)).unwrap();
      Alert.alert("Sucesso! 🎉", "Exercício cadastrado com sucesso!");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Erro ao salvar exercício.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <Text style={[styles.label, { color: colors.text }]}>Nome do Exercício *</Text>
        <TextInput
          placeholder="Ex: Supino Inclinado com Halteres"
          placeholderTextColor={colors.textMuted}
          value={form.nome}
          onChangeText={(valor) => handleChange("nome", valor)}
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
        />

        <Text style={[styles.label, { color: colors.text }]}>
          Descrição ou Músculo Alvo (opcional)
        </Text>
        <TextInput
          placeholder="Ex: Foco na porção superior do peitoral e tríceps"
          placeholderTextColor={colors.textMuted}
          value={form.descricao || ""}
          onChangeText={(valor) => handleChange("descricao", valor)}
          multiline
          numberOfLines={3}
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
        />

        <TouchableOpacity
          onPress={handleSalvar}
          disabled={salvando}
          style={[
            styles.btnSalvar,
            { backgroundColor: colors.primary },
            salvando && styles.btnDisabled,
          ]}
          activeOpacity={0.8}
        >
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.btnSalvarText}>Salvar Exercício</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    height: 85,
    textAlignVertical: "top",
  },
  btnSalvar: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
    shadowColor: "#00b894",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnSalvarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
