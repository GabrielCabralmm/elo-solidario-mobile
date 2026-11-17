import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { MensagemErro } from '@/components/MensagemErro';
import { sugerirDoacao } from '@/services/assistenteService';
import { cores, espacamentos, fontes, raios, tipografia } from '@/theme';
import { SugestaoDoacao } from '@/types/api';
import { mensagemDeErro } from '@/utils/erros';

type AssistenteIAProps = {
  aoSugerir: (sugestao: SugestaoDoacao) => void;
};

export function AssistenteIA({ aoSugerir }: AssistenteIAProps) {
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sugestao, setSugestao] = useState<SugestaoDoacao | null>(null);

  async function aoPedirSugestao() {
    if (texto.trim().length < 5) {
      setErro('Descreva os alimentos com um pouco mais de detalhe.');
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await sugerirDoacao(texto.trim());
      setSugestao(resposta);
      aoSugerir(resposta);
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.caixa}>
      <View style={styles.titulo}>
        <Ionicons name="sparkles" size={20} color={cores.destaque} />
        <Text style={tipografia.subtitulo}>Preencher com IA</Text>
      </View>
      <Text style={tipografia.legenda}>
        Escreva do seu jeito o que você quer doar e a IA monta a lista com os alimentos do catálogo.
      </Text>
      <TextInput
        accessibilityLabel="Descrição dos alimentos"
        style={styles.entrada}
        multiline
        maxLength={500}
        placeholder="Ex.: tenho 3 pacotes de arroz, 2 de feijão e 1 litro de óleo"
        placeholderTextColor={cores.desabilitado}
        value={texto}
        onChangeText={setTexto}
      />
      <Botao
        titulo="Sugerir itens"
        icone="sparkles-outline"
        variante="destaque"
        onPress={aoPedirSugestao}
        carregando={carregando}
      />
      {erro && <MensagemErro mensagem={erro} />}
      {sugestao && (
        <View style={styles.resultado}>
          <Aviso
            tom="sucesso"
            mensagem={`${sugestao.itens.length} alimento(s) adicionado(s) abaixo. Informe a validade de cada um.`}
          />
          {sugestao.naoReconhecidos.length > 0 && (
            <Aviso
              tom="alerta"
              mensagem={`Não encontramos no catálogo: ${sugestao.naoReconhecidos.join(', ')}.`}
            />
          )}
          {sugestao.orientacoes.map((orientacao) => (
            <View key={orientacao} style={styles.orientacao}>
              <Ionicons name="bulb-outline" size={16} color={cores.primaria} />
              <Text style={[tipografia.legenda, styles.flex]}>{orientacao}</Text>
            </View>
          ))}
          <Text style={[tipografia.legenda, styles.aviso]}>{sugestao.aviso}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    backgroundColor: cores.destaqueClaro,
    borderRadius: raios.lg,
    padding: espacamentos.lg,
    gap: espacamentos.md,
  },
  titulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
  },
  entrada: {
    minHeight: 90,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.borda,
    padding: espacamentos.md,
    fontFamily: fontes.regular,
    fontSize: 15,
    color: cores.texto,
    textAlignVertical: 'top',
  },
  resultado: {
    gap: espacamentos.sm,
  },
  orientacao: {
    flexDirection: 'row',
    gap: espacamentos.sm,
    alignItems: 'flex-start',
  },
  flex: {
    flex: 1,
  },
  aviso: {
    fontStyle: 'italic',
  },
});
