import { Alimento, Categoria, PaginaDotnet } from '@/types/api';

import { apiDotnet } from './api';

export async function listarCategorias() {
  const { data } = await apiDotnet.get<Categoria[]>('/categorias');
  return data;
}

export async function listarAlimentos(nome?: string) {
  const { data } = await apiDotnet.get<PaginaDotnet<Alimento>>('/alimentos', {
    params: { nome: nome || undefined, tamanho: 50 },
  });
  return data.itens;
}
