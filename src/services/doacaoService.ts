import { Doacao, DoacaoRequest, PaginaJava, StatusDoacao } from '@/types/api';

import { apiJava } from './api';

export type FiltrosDoacao = {
  status?: StatusDoacao;
  bairro?: string;
  idCategoria?: number;
  pagina?: number;
  tamanho?: number;
};

export async function listarDoacoes({ pagina = 0, tamanho = 10, ...filtros }: FiltrosDoacao = {}) {
  const { data } = await apiJava.get<PaginaJava<Doacao>>('/doacoes', {
    params: { ...filtros, page: pagina, size: tamanho, sort: 'dtPublicacao,desc' },
  });
  return data;
}

export async function listarMinhasDoacoes(pagina = 0) {
  const { data } = await apiJava.get<PaginaJava<Doacao>>('/doacoes/minhas', {
    params: { page: pagina, size: 20 },
  });
  return data;
}

export async function buscarDoacao(id: number) {
  const { data } = await apiJava.get<Doacao>(`/doacoes/${id}`);
  return data;
}

export async function criarDoacao(doacao: DoacaoRequest) {
  const { data } = await apiJava.post<Doacao>('/doacoes', doacao);
  return data;
}

export async function atualizarDoacao(id: number, doacao: DoacaoRequest) {
  const { data } = await apiJava.put<Doacao>(`/doacoes/${id}`, doacao);
  return data;
}

export async function excluirDoacao(id: number) {
  await apiJava.delete(`/doacoes/${id}`);
}
