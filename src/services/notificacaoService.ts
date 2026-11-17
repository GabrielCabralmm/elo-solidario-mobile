import { Notificacao, PaginaJava } from '@/types/api';

import { apiJava } from './api';

export async function listarNotificacoes() {
  const { data } = await apiJava.get<PaginaJava<Notificacao>>('/notificacoes', {
    params: { size: 30 },
  });
  return data.content;
}

export async function marcarNotificacaoComoLida(id: number) {
  const { data } = await apiJava.patch<Notificacao>(`/notificacoes/${id}/lida`);
  return data;
}
