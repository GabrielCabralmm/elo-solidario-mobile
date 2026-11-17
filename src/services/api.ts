import { AxiosInstance, create } from 'axios';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const URL_API_JAVA: string = extra.apiJavaUrl;
export const URL_API_DOTNET: string = extra.apiDotnetUrl;

let tokenAtual: string | null = null;
let aoSessaoExpirar: (() => void) | null = null;

export function definirToken(token: string | null) {
  tokenAtual = token;
}

export function definirAcaoSessaoExpirada(acao: (() => void) | null) {
  aoSessaoExpirar = acao;
}

function criarCliente(baseURL: string): AxiosInstance {
  const cliente = create({
    baseURL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });

  cliente.interceptors.request.use((config) => {
    if (tokenAtual) {
      config.headers.Authorization = `Bearer ${tokenAtual}`;
    }
    return config;
  });

  cliente.interceptors.response.use(
    (resposta) => resposta,
    (erro) => {
      const rotaDeLogin = String(erro.config?.url ?? '').includes('/auth/');
      if (erro.response?.status === 401 && tokenAtual && !rotaDeLogin) {
        aoSessaoExpirar?.();
      }
      return Promise.reject(erro);
    },
  );

  return cliente;
}

export const apiJava = criarCliente(URL_API_JAVA);
export const apiDotnet = criarCliente(URL_API_DOTNET);
