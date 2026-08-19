export const GRUPOS_MUSCULARES = [
  "Peitoral",
  "Costas",
  "Ombros",
  "Bíceps",
  "Tríceps",
  "Pernas",
  "Abdômen",
  "Geral",
] as const;

export type GrupoMuscular = (typeof GRUPOS_MUSCULARES)[number];

export interface Exercicio {
  id: number;
  nome: string;
  descricao?: string;
  grupo_muscular?: GrupoMuscular;
}

export interface Treino{
    id: number;
    nome: string;
    exercicios?: ExercicioTreino[];
}

export interface ExercicioTreino{
    id: number;
    treino_id: number;
    exercicio_id: number;
    exercicio?: Exercicio;
    repeticoes: number;
    series: number;
    descanso: number;
    carga: number;
    ordem?: number;
}

export interface ExercicioConfigItem {
    exercicio: Exercicio;
    series: number;
    repeticoes: number;
    descanso: number;
    carga: number;
    ordem?: number;
}

export interface HistoricoSessao {
    id: number;
    treino_id?: number | null;
    nome_treino: string;
    data_inicio: string;
    data_fim: string;
    duracao_segundos: number;
    exercicios_concluidos: number;
    total_exercicios: number;
    exercicios?: HistoricoSessaoExercicio[];
}

export interface HistoricoSessaoExercicio {
    id: number;
    sessao_id: number;
    exercicio_id?: number | null;
    nome_exercicio: string;
    series_feitas: number;
    repeticoes: number;
    carga: number;
}