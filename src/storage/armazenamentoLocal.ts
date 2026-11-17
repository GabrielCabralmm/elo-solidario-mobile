import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIXO = 'elo:';

export type RegistroLocal<T> = {
  salvoEm: string;
  dados: T;
};

export const chavesLocais = {
  vitrine: 'vitrine',
  doacao: (id: number) => `doacao:${id}`,
  rascunho: (idUsuario: number) => `rascunho:${idUsuario}`,
};

export async function salvarLocal<T>(chave: string, dados: T) {
  const registro: RegistroLocal<T> = { salvoEm: new Date().toISOString(), dados };
  await AsyncStorage.setItem(PREFIXO + chave, JSON.stringify(registro));
}

export async function lerLocal<T>(chave: string) {
  const valor = await AsyncStorage.getItem(PREFIXO + chave);
  return valor ? (JSON.parse(valor) as RegistroLocal<T>) : null;
}

export async function removerLocal(chave: string) {
  await AsyncStorage.removeItem(PREFIXO + chave);
}

export async function limparDadosLocais() {
  const chaves = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(chaves.filter((chave) => chave.startsWith(PREFIXO)));
}
