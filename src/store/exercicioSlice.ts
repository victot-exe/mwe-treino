import {
  addExercicio,
  deleteExercicio,
  getExercicios,
  updateExercicio,
} from "@/src/database/exercicioRepository";
import { Exercicio } from "@/src/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface ExercicioState {
  lista: Exercicio[];
  loading: boolean;
}

const initialState: ExercicioState = {
  lista: [],
  loading: false,
};

export const carregarExercicios = createAsyncThunk(
  "exercicios/carregar",
  async () => await getExercicios()
);

export const adicionarExercicio = createAsyncThunk(
  "exercicios/adicionar",
  async (exercicio: Omit<Exercicio, "id">) => {
    await addExercicio(exercicio);
    return await getExercicios();
  }
);

export const editarExercicio = createAsyncThunk(
  "exercicios/editar",
  async (exercicio: Exercicio) => {
    await updateExercicio(exercicio);
    return await getExercicios();
  }
);

export const removerExercicio = createAsyncThunk(
  "exercicios/remover",
  async (id: number) => {
    await deleteExercicio(id);
    return await getExercicios();
  }
);

const exercicioSlice = createSlice({
  name: "exercicios",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(carregarExercicios.fulfilled, (state, action) => {
        state.lista = action.payload;
        state.loading = false;
      })
      .addCase(adicionarExercicio.fulfilled, (state, action) => {
        state.lista = action.payload;
      })
      .addCase(editarExercicio.fulfilled, (state, action) => {
        state.lista = action.payload;
      })
      .addCase(removerExercicio.fulfilled, (state, action) => {
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

export default exercicioSlice.reducer;
