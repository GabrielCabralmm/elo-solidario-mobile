import { isAxiosError } from 'axios';

type CorpoErro = {
  mensagem?: string;
  campos?: { campo: string; mensagem: string }[];
  detail?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

export function ehErroDeConexao(erro: unknown) {
  return isAxiosError(erro) && !erro.response;
}

export function mensagemDeErro(erro: unknown): string {
  if (!isAxiosError(erro)) {
    return 'Algo deu errado. Tente novamente.';
  }

  if (erro.code === 'ECONNABORTED') {
    return 'O servidor demorou para responder. Verifique sua conexão e tente novamente.';
  }
  if (!erro.response) {
    return 'Não foi possível conectar ao servidor. Verifique sua internet.';
  }

  const corpo = erro.response.data as CorpoErro | undefined;
  const status = erro.response.status;

  if (corpo?.campos?.length) {
    return corpo.campos.map((campo) => campo.mensagem).join('\n');
  }
  if (corpo?.errors) {
    return Object.values(corpo.errors).flat().join('\n');
  }
  if (corpo?.mensagem) {
    return corpo.mensagem;
  }
  if (corpo?.detail) {
    return corpo.detail;
  }
  if (status === 429) {
    return 'Muitas tentativas em pouco tempo. Aguarde um minuto e tente de novo.';
  }
  if (status === 403) {
    return 'Seu perfil não tem permissão para esta ação.';
  }
  if (status >= 500) {
    return 'O servidor está com instabilidade. Tente novamente em instantes.';
  }
  return 'Não foi possível concluir a operação.';
}
