import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { Carregando } from '@/components/Carregando';
import {
  FormularioDoacao,
  novoItem,
  ValoresFormulario,
} from '@/components/doacao/FormularioDoacao';
import { MensagemErro } from '@/components/MensagemErro';
import { atualizarDoacao, buscarDoacao } from '@/services/doacaoService';
import { DoacaoRequest } from '@/types/api';
import { mensagemDeErro } from '@/utils/erros';
import { formatarData } from '@/utils/formatadores';

export default function TelaEditarDoacao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [valores, setValores] = useState<ValoresFormulario | null>(null);
  const [erroCarregar, setErroCarregar] = useState<string | null>(null);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  useEffect(() => {
    buscarDoacao(Number(id))
      .then((doacao) =>
        setValores({
          titulo: doacao.titulo,
          bairro: doacao.bairro,
          localRetirada: doacao.localRetirada,
          observacao: doacao.observacao ?? '',
          itens: doacao.itens.map((item) =>
            novoItem({
              idAlimento: item.idAlimento,
              nomeAlimento: item.alimento,
              quantidade: String(item.quantidade),
              unidade: item.unidade,
              pesoKg: String(item.pesoKg),
              validade: formatarData(item.dtValidade),
            }),
          ),
        }),
      )
      .catch((falha) => setErroCarregar(mensagemDeErro(falha)));
  }, [id]);

  async function aoSalvar(doacao: DoacaoRequest) {
    setErroEnvio(null);
    try {
      await atualizarDoacao(Number(id), doacao);
      router.back();
    } catch (falha) {
      setErroEnvio(mensagemDeErro(falha));
    }
  }

  if (erroCarregar) return <MensagemErro mensagem={erroCarregar} />;
  if (!valores) return <Carregando mensagem="Carregando doação..." />;

  return (
    <FormularioDoacao
      valoresIniciais={valores}
      textoBotao="Salvar alterações"
      aoSalvar={aoSalvar}
      erroEnvio={erroEnvio}
    />
  );
}
