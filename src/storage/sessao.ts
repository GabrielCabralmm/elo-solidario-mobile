import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { Usuario } from '@/types/api';

const CHAVE_TOKEN = 'elo.token';
const CHAVE_USUARIO = 'elo.usuario';

async function salvar(chave: string, valor: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(chave, valor);
    return;
  }
  await SecureStore.setItemAsync(chave, valor);
}

async function ler(chave: string) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(chave);
  }
  return SecureStore.getItemAsync(chave);
}

async function remover(chave: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(chave);
    return;
  }
  await SecureStore.deleteItemAsync(chave);
}

export async function salvarSessao(token: string, usuario: Usuario) {
  await salvar(CHAVE_TOKEN, token);
  await salvar(CHAVE_USUARIO, JSON.stringify(usuario));
}

export async function lerSessao() {
  const [token, usuarioJson] = await Promise.all([ler(CHAVE_TOKEN), ler(CHAVE_USUARIO)]);
  if (!token || !usuarioJson) {
    return null;
  }
  return { token, usuario: JSON.parse(usuarioJson) as Usuario };
}

export async function limparSessao() {
  await Promise.all([remover(CHAVE_TOKEN), remover(CHAVE_USUARIO)]);
}
