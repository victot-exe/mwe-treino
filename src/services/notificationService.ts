// Serviço de temporização e notificações de descanso limpo e compatível com Expo Go
export async function requestNotificationPermissions(): Promise<boolean> {
  return true;
}

export async function agendarNotificacaoDescanso(
  _segundos: number,
  _nomeExercicio: string
): Promise<string | null> {
  // O ciclo do descanso é gerenciado pelo sistema de Timestamps e AppState
  return `timer-${Date.now()}`;
}

export async function cancelarNotificacaoDescanso(_notificationId?: string | null) {
  // Limpeza de timer
}
