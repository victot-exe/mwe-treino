import { useAlert } from "@/src/context/AlertContext";
import { useTheme } from "@/src/context/ThemeContext";
import { AppDispatch } from "@/src/store";
import { adicionarExercicio } from "@/src/store/exercicioSlice";
import { Exercicio, GRUPOS_MUSCULARES, GrupoMuscular } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
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
  const { showAlert } = useAlert();

  const [form, setForm] = useState<Omit<Exercicio, "id">>({
    nome: "",
    descricao: "",
    grupo_muscular: "Peitoral",
  });
  const [salvando, setSalvando] = useState(false);

  const handleChange = (campo: keyof Exercicio, valor: any) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleSalvar = async () => {
    Keyboard.dismiss();

    if (!form.nome.trim()) {
      showAlert("Atenção", "O exercício precisa ter um nome!", "warning");
      return;
    }

    setSalvando(true);

    try {
      await dispatch(
        adicionarExercicio({
          nome: form.nome.trim(),
          descricao: form.descricao?.trim() || undefined,
          grupo_muscular: form.grupo_muscular || "Geral",
        })
      ).unwrap();
      showAlert("Sucesso!", "Exercício cadastrado com sucesso!", "success");
      router.back();
    } catch (error) {
      console.error(error);
      showAlert("Erro", "Erro ao salvar exercício.", "error");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 16 }}
      keyboardShouldPersistTaps="handled"
    >
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

        <Text style={[styles.label, { color: colors.text }]}>Grupo Muscular</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gruposScroll}
        >
          {GRUPOS_MUSCULARES.map((g) => {
            const ativo = form.grupo_muscular === g;
            return (
              <TouchableOpacity
                key={g}
                onPress={() => handleChange("grupo_muscular", g)}
                style={[
                  styles.grupoChip,
                  {
                    backgroundColor: ativo ? colors.primary : colors.cardSecondary,
                    borderColor: ativo ? colors.primary : colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.grupoChipText,
                    {
                      color: ativo ? "#fff" : colors.textSecondary,
                      fontWeight: ativo ? "bold" : "normal",
                    },
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.label, { color: colors.text, marginTop: 12 }]}>
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
    </ScrollView>
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
  gruposScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  grupoChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  grupoChipText: {
    fontSize: 13,
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
