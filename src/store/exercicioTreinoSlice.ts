import {
  addExercicioTreino,
  deleteExercicioTreinoById,
  getExerciciosDoTreino,
  updateExercicioTreino,
} from "@/src/database/exercicioTreinoRepository";

import { ExercicioTreino } from "@/src/types";
import { AnyAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface ExercicioTreinoState {
  lista: ExercicioTreino[];
  loading: boolean;
  error: string | null;
}

const initialState: ExercicioTreinoState = {
  lista: [],
  loading: false,
  error: null,
};

// ✅ Carregar todos exercícios de um treino
export const carregarExerciciosDoTreino = createAsyncThunk(
  "exercicioTreino/carregar",
  async (treinoId: number) => {
    return await getExerciciosDoTreino(treinoId);
  }
);

// ✅ Inserir APENAS – não busca lista para evitar sobrescrita
export const adicionarExercicioAoTreino = createAsyncThunk(
  "exercicioTreino/adicionar",
  async (data: {
    treinoId: number;
    exercicioId: number;
    repeticoes: number;
    series: number;
    descanso: number;
    carga: number;
  }) => {
    return await addExercicioTreino(data); // devolve só o ID do item inserido
  }
);

// ✅ Atualizar e só depois buscar lista atualizada
export const atualizarExercicioTreino = createAsyncThunk(
  "exercicioTreino/atualizar",
  async (args: {
    id: number;
    treinoId: number;
    data: Partial<ExercicioTreino>;
  }) => {
    const { id, treinoId, data } = args;
    await updateExercicioTreino(id, data);
    return await getExerciciosDoTreino(treinoId);
  }
);

// ✅ Remover e só depois buscar lista atualizada
export const removerExercicioTreino = createAsyncThunk(
  "exercicioTreino/remover",
  async ({ id, treinoId }: { id: number; treinoId: number }) => {
    await deleteExercicioTreinoById(id);
    return await getExerciciosDoTreino(treinoId);
  }
);

const exercicioTreinoSlice = createSlice({
  name: "exercicioTreino",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // ✅ Quando carregar, substituir lista
      .addCase(carregarExerciciosDoTreino.fulfilled, (state, action) => {
        state.lista = action.payload;
      })

      // ✅ adicionar NÃO altera lista (evita sobrescrever)
      .addCase(adicionarExercicioAoTreino.fulfilled, (state) => {
        // não mexe na lista aqui!
      })

      // ✅ atualizar -> lista nova
      .addCase(atualizarExercicioTreino.fulfilled, (state, action) => {
        state.lista = action.payload;
      })

      // ✅ remover -> lista nova
      .addCase(removerExercicioTreino.fulfilled, (state, action) => {
        state.lista = action.payload;
      })

      // Estados padrão
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addMatcher(
        (action) => action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
          state.error = null;
        }
      )

      .addMatcher(
        (action: AnyAction) => action.type.endsWith("/rejected"),
        (state, action: AnyAction) => {
          state.loading = false;
          state.error = action.payload || action.error?.message || "Erro desconhecido";
        }
      )

  },
});

export default exercicioTreinoSlice.reducer;
