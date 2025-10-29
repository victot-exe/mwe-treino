export interface Exercicio{
    id: number | null;
    nome: string;
    repeticoes: number;
    series: number;
    descanso: number;
}

export interface Treino{
    id: number;
    nome: string;
    exercicios: Exercicio[];
}