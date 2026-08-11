import {
    createTreino,
    deleteTreino,
    getAllTreinos,
    updateTreino,
} from "@/src/database/treinoRepository";
import { Treino } from "@/src/types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface TreinoState {
  lista: Treino[];
  loading: boolean;
}

const initialState: TreinoState = {
  lista: [],
  loading: false,
};

export const carregarTreinos = createAsyncThunk(
  "treinos/carregar",
  async () => await getAllTreinos()
);

export const adicionarTreino = createAsyncThunk(
  "treinos/adicionar",
  async (nome: string) => {
    const id = await createTreino(nome);
    const lista = await getAllTreinos();
    return { id, lista };
  }
);

export const editarTreino = createAsyncThunk(
  "treinos/editar",
  async ({ id, nome }: { id: number; nome: string }) => {
    await updateTreino(id, nome);
    return await getAllTreinos();
  }
);

export const removerTreino = createAsyncThunk(
  "treinos/remover",
  async (id: number) => {
    await deleteTreino(id);
    return await getAllTreinos();
  }
);

const treinoSlice = createSlice({
  name: "treinos",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(carregarTreinos.fulfilled, (state, action) => {
        state.lista = action.payload;
        state.loading = false;
      })
      .addCase(adicionarTreino.fulfilled, (state, action) => {
        state.lista = action.payload.lista;
      })
      .addCase(removerTreino.fulfilled, (state, action) => {
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

export default treinoSlice.reducer;
