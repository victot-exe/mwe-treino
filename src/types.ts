export interface Exercicio{
    id: number;
    nome: string;
    descricao?: string;
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
}

export interface ExercicioConfigItem {
    exercicio: Exercicio;
    series: number;
    repeticoes: number;
    descanso: number;
    carga: number;
}