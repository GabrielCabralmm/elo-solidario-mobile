import { RegistroRequest, TokenResponse, Usuario } from '@/types/api';

import { apiJava } from './api';

export async function entrar(email: string, senha: string) {
  const { data } = await apiJava.post<TokenResponse>('/auth/login', { email, senha });
  return data;
}

export async function cadastrar(dados: RegistroRequest) {
  const { data } = await apiJava.post<TokenResponse>('/auth/registrar', dados);
  return data;
}

export async function buscarUsuarioLogado() {
  const { data } = await apiJava.get<Usuario>('/auth/me');
  return data;
}
