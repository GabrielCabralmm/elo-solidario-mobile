import { SugestaoDoacao } from '@/types/api';

import { apiJava } from './api';

export async function sugerirDoacao(texto: string) {
  const { data } = await apiJava.post<SugestaoDoacao>('/assistente/sugestao', { texto });
  return data;
}
