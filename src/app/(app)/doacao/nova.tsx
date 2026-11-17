import { router } from 'expo-router';
import { useState } from 'react';

import { FormularioDoacao, novoItem } from '@/components/doacao/FormularioDoacao';
import { useAuth } from '@/contexts/AuthContext';
import { criarDoacao } from '@/services/doacaoService';
import { chavesLocais } from '@/storage/armazenamentoLocal';
import { DoacaoRequest } from '@/types/api';
import { mensagemDeErro } from '@/utils/erros';

export default function TelaNovaDoacao() {
  const { usuario } = useAuth();
  const [erro, setErro] = useState<string | null>(null);

  async function aoSalvar(doacao: DoacaoRequest) {
    setErro(null);
    try {
      const criada = await criarDoacao(doacao);
      router.replace(`/doacao/${criada.id}`);
      return true;
    } catch (falha) {
      setErro(mensagemDeErro(falha));
      return false;
    }
  }

  return (
    <FormularioDoacao
      valoresIniciais={{
        titulo: '',
        bairro: usuario?.bairro ?? '',
        localRetirada: '',
        observacao: '',
        itens: [novoItem()],
      }}
      textoBotao="Publicar doação"
      exibirAssistente
      chaveRascunho={usuario ? chavesLocais.rascunho(usuario.id) : undefined}
      aoSalvar={aoSalvar}
      erroEnvio={erro}
    />
  );
}
