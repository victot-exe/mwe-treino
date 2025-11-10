import {
    addExercicioTreino,
    deleteExercicioTreinoById,
    getExerciciosDoTreino,
    updateExercicioTreino,
} from "@/src/database/exercicioTreinoRepository";
import { ExercicioTreino } from "@/src/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface ExercicioTreinoState {
  lista: ExercicioTreino[];
  loading: boolean;
}

const initialState: ExercicioTreinoState = {
  lista: [],
  loading: false,
};

export const carregarExerciciosDoTreino = createAsyncThunk(
  "exercicioTreino/carregar",
  async (treinoId: number) => await getExerciciosDoTreino(treinoId)
);

export const adicionarExercicioAoTreino = createAsyncThunk(
  "exercicioTreino/adicionar",
  async (data: {
    treinoId: number;
    exercicioId: number;
    repeticoes: number;
    series: number;
    descanso: number;
  }) => {
    await addExercicioTreino(data);
    return await getExerciciosDoTreino(data.treinoId);
  }
);

export const atualizarExercicioTreino = createAsyncThunk(
  "exercicioTreino/atualizar",
  async ({
    id,
    data,
    treinoId,
  }: {
    id: number;
    treinoId: number;
    data: Partial<ExercicioTreino>;
  }) => {
    await updateExercicioTreino(id, data);
    return await getExerciciosDoTreino(treinoId);
  }
);

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
      .addCase(carregarExerciciosDoTreino.fulfilled, (state, action) => {
        state.lista = action.payload;
        state.loading = false;
      })
      .addCase(adicionarExercicioAoTreino.fulfilled, (state, action) => {
        state.lista = action.payload;
      })
      .addCase(removerExercicioTreino.fulfilled, (state, action) => {
        state.lista = action.payload;
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        }
      );
  },
});

export default exercicioTreinoSlice.reducer;
