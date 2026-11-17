import { DoacaoUrgente, Impacto, ImpactoDoador } from '@/types/api';

import { apiDotnet } from './api';

export async function buscarImpacto() {
  const { data } = await apiDotnet.get<Impacto>('/impacto');
  return data;
}

export async function buscarImpactoDoDoador(idDoador: number) {
  const { data } = await apiDotnet.get<ImpactoDoador>(`/impacto/doadores/${idDoador}`);
  return data;
}

export async function listarDoacoesUrgentes(dias: number, bairro?: string) {
  const { data } = await apiDotnet.get<DoacaoUrgente[]>('/doacoes/urgentes', {
    params: { dias, bairro: bairro || undefined },
  });
  return data;
}
