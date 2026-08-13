import { configureStore } from "@reduxjs/toolkit";
import databaseReducer, { initializeDatabase } from "./databaseSlice";
import exercicioReducer from "./exercicioSlice";
import exercicioTreinoReducer from "./exercicioTreinoSlice";
import treinoReducer from "./treinoSlice";

export const store = configureStore({
  reducer: {
    database: databaseReducer,
    exercicios: exercicioReducer,
    treinos: treinoReducer,
    exercicioTreinos: exercicioTreinoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

