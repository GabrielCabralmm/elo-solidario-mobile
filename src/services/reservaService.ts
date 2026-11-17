import { PaginaJava, Reserva } from '@/types/api';

import { apiJava } from './api';

export async function reservarDoacao(idDoacao: number, observacao?: string) {
  const { data } = await apiJava.post<Reserva>(`/doacoes/${idDoacao}/reservas`, { observacao });
  return data;
}

export async function listarMinhasReservas(pagina = 0) {
  const { data } = await apiJava.get<PaginaJava<Reserva>>('/reservas/minhas', {
    params: { page: pagina, size: 20 },
  });
  return data;
}

export async function listarReservasDaDoacao(idDoacao: number) {
  const { data } = await apiJava.get<Reserva[]>(`/doacoes/${idDoacao}/reservas`);
  return data;
}

export async function concluirReserva(id: number) {
  const { data } = await apiJava.patch<Reserva>(`/reservas/${id}/concluir`);
  return data;
}

export async function cancelarReserva(id: number) {
  const { data } = await apiJava.patch<Reserva>(`/reservas/${id}/cancelar`);
  return data;
}
