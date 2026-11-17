import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { ChipFiltro } from '@/components/ChipFiltro';
import { MensagemErro } from '@/components/MensagemErro';
import { cores, espacamentos, raios, sombra, tipografia } from '@/theme';
import { Alimento, DoacaoRequest, SugestaoDoacao, Unidade } from '@/types/api';
import { aplicarMascaraData, dataBrParaIso, diasAte } from '@/utils/formatadores';

import { AssistenteIA } from './AssistenteIA';
import { SeletorAlimento } from './SeletorAlimento';

export type ItemFormulario = {
  chave: string;
  idAlimento: number | null;
  nomeAlimento: string;
  quantidade: string;
  unidade: Unidade;
  pesoKg: string;
  validade: string;
};

export type ValoresFormulario = {
  titulo: string;
  bairro: string;
  localRetirada: string;
  observacao: string;
  itens: ItemFormulario[];
};

type ErrosFormulario = {
  titulo?: string;
  bairro?: string;
  localRetirada?: string;
  itens?: string;
  porItem: Record<string, string>;
};

type FormularioDoacaoProps = {
  valoresIniciais: ValoresFormulario;
  textoBotao: string;
  exibirAssistente?: boolean;
  aoSalvar: (doacao: DoacaoRequest) => Promise<void>;
  erroEnvio: string | null;
};

const UNIDADES: Unidade[] = ['PCT', 'UN', 'KG', 'L'];

let contadorChaves = 0;
export function novoItem(parcial: Partial<ItemFormulario> = {}): ItemFormulario {
  contadorChaves += 1;
  return {
    chave: `item-${contadorChaves}`,
    idAlimento: null,
    nomeAlimento: '',
    quantidade: '',
    unidade: 'PCT',
    pesoKg: '',
    validade: '',
    ...parcial,
  };
}

function paraNumero(valor: string) {
  return Number(valor.replace(',', '.'));
}

export function FormularioDoacao({
  valoresIniciais,
  textoBotao,
  exibirAssistente = false,
  aoSalvar,
  erroEnvio,
}: FormularioDoacaoProps) {
  const [valores, setValores] = useState<ValoresFormulario>(valoresIniciais);
  const [erros, setErros] = useState<ErrosFormulario>({ porItem: {} });
  const [itemEmEdicao, setItemEmEdicao] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function alterar(campo: keyof Omit<ValoresFormulario, 'itens'>, valor: string) {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }

  function alterarItem(chave: string, parcial: Partial<ItemFormulario>) {
    setValores((atual) => ({
      ...atual,
      itens: atual.itens.map((item) => (item.chave === chave ? { ...item, ...parcial } : item)),
    }));
  }

  function removerItem(chave: string) {
    setValores((atual) => ({ ...atual, itens: atual.itens.filter((item) => item.chave !== chave) }));
  }

  function aoSelecionarAlimento(alimento: Alimento) {
    if (!itemEmEdicao) return;
    alterarItem(itemEmEdicao, { idAlimento: alimento.id, nomeAlimento: alimento.nome });
  }

  function aplicarSugestao(sugestao: SugestaoDoacao) {
    setValores((atual) => {
      const idsExistentes = new Set(atual.itens.map((item) => item.idAlimento));
      const itensPreenchidos = atual.itens.filter((item) => item.idAlimento !== null);
      const novos = sugestao.itens
        .filter((sugerido) => !idsExistentes.has(sugerido.idAlimento))
        .map((sugerido) =>
          novoItem({
            idAlimento: sugerido.idAlimento,
            nomeAlimento: sugerido.alimento,
            quantidade: String(sugerido.quantidade),
            unidade: sugerido.unidade,
            pesoKg: String(sugerido.pesoKgEstimado),
          }),
        );
      return {
        ...atual,
        titulo: atual.titulo || sugestao.tituloSugerido,
        itens: [...itensPreenchidos, ...novos],
      };
    });
  }

  function validar() {
    const novosErros: ErrosFormulario = { porItem: {} };
    if (valores.titulo.trim().length < 3) novosErros.titulo = 'Dê um título para a doação';
    if (!valores.bairro.trim()) novosErros.bairro = 'Informe o bairro';
    if (!valores.localRetirada.trim()) novosErros.localRetirada = 'Informe onde retirar';
    if (valores.itens.length === 0) novosErros.itens = 'Adicione pelo menos um alimento';

    const ids = new Set<number>();
    for (const item of valores.itens) {
      const iso = dataBrParaIso(item.validade);
      let mensagem: string | undefined;
      if (item.idAlimento === null) mensagem = 'Escolha o alimento';
      else if (ids.has(item.idAlimento)) mensagem = 'Alimento repetido';
      else if (!(paraNumero(item.quantidade) > 0)) mensagem = 'Informe a quantidade';
      else if (!(paraNumero(item.pesoKg) > 0)) mensagem = 'Informe o peso aproximado em kg';
      else if (!iso) mensagem = 'Informe a validade no formato DD/MM/AAAA';
      else if (diasAte(iso) < 0) mensagem = 'Não é permitido doar alimento vencido';
      if (item.idAlimento !== null) ids.add(item.idAlimento);
      if (mensagem) novosErros.porItem[item.chave] = mensagem;
    }

    setErros(novosErros);
    return (
      !novosErros.titulo &&
      !novosErros.bairro &&
      !novosErros.localRetirada &&
      !novosErros.itens &&
      Object.keys(novosErros.porItem).length === 0
    );
  }

  async function aoEnviar() {
    if (!validar()) return;
    setSalvando(true);
    try {
      await aoSalvar({
        titulo: valores.titulo.trim(),
        bairro: valores.bairro.trim(),
        localRetirada: valores.localRetirada.trim(),
        observacao: valores.observacao.trim() || undefined,
        itens: valores.itens.map((item) => ({
          idAlimento: item.idAlimento!,
          quantidade: paraNumero(item.quantidade),
          unidade: item.unidade,
          pesoKg: paraNumero(item.pesoKg),
          dtValidade: dataBrParaIso(item.validade)!,
        })),
      });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        {exibirAssistente && <AssistenteIA aoSugerir={aplicarSugestao} />}

        <CampoTexto
          rotulo="Título"
          placeholder="Ex.: Cesta básica"
          value={valores.titulo}
          onChangeText={(valor) => alterar('titulo', valor)}
          erro={erros.titulo}
          maxLength={100}
        />
        <CampoTexto
          rotulo="Bairro"
          icone="location-outline"
          value={valores.bairro}
          onChangeText={(valor) => alterar('bairro', valor)}
          erro={erros.bairro}
          maxLength={60}
        />
        <CampoTexto
          rotulo="Local de retirada"
          icone="navigate-outline"
          placeholder="Endereço ou ponto de referência"
          value={valores.localRetirada}
          onChangeText={(valor) => alterar('localRetirada', valor)}
          erro={erros.localRetirada}
          maxLength={150}
        />
        <CampoTexto
          rotulo="Observação (opcional)"
          placeholder="Ex.: produtos fechados, retirar até as 18h"
          value={valores.observacao}
          onChangeText={(valor) => alterar('observacao', valor)}
          maxLength={300}
        />

        <Text style={tipografia.subtitulo}>Alimentos</Text>
        {erros.itens && <Text style={styles.erro}>{erros.itens}</Text>}

        {valores.itens.map((item, indice) => (
          <View key={item.chave} style={styles.item}>
            <View style={styles.itemTopo}>
              <Text style={tipografia.rotulo}>Alimento {indice + 1}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remover alimento ${indice + 1}`}
                onPress={() => removerItem(item.chave)}
                hitSlop={12}
              >
                <Ionicons name="trash-outline" size={22} color={cores.erro} />
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Escolher alimento do catálogo"
              style={styles.seletor}
              onPress={() => setItemEmEdicao(item.chave)}
            >
              <Ionicons name="nutrition-outline" size={20} color={cores.primaria} />
              <Text
                style={[tipografia.corpo, styles.flex, !item.nomeAlimento && styles.placeholder]}
              >
                {item.nomeAlimento || 'Escolher do catálogo'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={cores.textoSecundario} />
            </Pressable>

            <View style={styles.linha}>
              <View style={styles.flex}>
                <CampoTexto
                  rotulo="Quantidade"
                  keyboardType="decimal-pad"
                  value={item.quantidade}
                  onChangeText={(valor) => alterarItem(item.chave, { quantidade: valor })}
                />
              </View>
              <View style={styles.flex}>
                <CampoTexto
                  rotulo="Peso (kg)"
                  keyboardType="decimal-pad"
                  value={item.pesoKg}
                  onChangeText={(valor) => alterarItem(item.chave, { pesoKg: valor })}
                />
              </View>
            </View>

            <View style={styles.unidades}>
              {UNIDADES.map((unidade) => (
                <ChipFiltro
                  key={unidade}
                  rotulo={unidade}
                  selecionado={item.unidade === unidade}
                  onPress={() => alterarItem(item.chave, { unidade })}
                />
              ))}
            </View>

            <CampoTexto
              rotulo="Validade"
              icone="calendar-outline"
              placeholder="DD/MM/AAAA"
              keyboardType="number-pad"
              value={item.validade}
              onChangeText={(valor) => alterarItem(item.chave, { validade: aplicarMascaraData(valor) })}
              erro={erros.porItem[item.chave]}
            />
          </View>
        ))}

        <Botao
          titulo="Adicionar alimento"
          icone="add"
          variante="secundario"
          onPress={() => setValores((atual) => ({ ...atual, itens: [...atual.itens, novoItem()] }))}
        />

        {erroEnvio && <MensagemErro mensagem={erroEnvio} />}
        <Botao titulo={textoBotao} icone="checkmark-circle-outline" onPress={aoEnviar} carregando={salvando} />
      </ScrollView>

      <SeletorAlimento
        visivel={itemEmEdicao !== null}
        aoFechar={() => setItemEmEdicao(null)}
        aoSelecionar={aoSelecionarAlimento}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  conteudo: {
    padding: espacamentos.lg,
    gap: espacamentos.lg,
    paddingBottom: espacamentos.xxl,
  },
  item: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: espacamentos.lg,
    gap: espacamentos.md,
    ...sombra,
  },
  itemTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seletor: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raios.md,
    paddingHorizontal: espacamentos.md,
  },
  placeholder: {
    color: cores.desabilitado,
  },
  linha: {
    flexDirection: 'row',
    gap: espacamentos.md,
  },
  unidades: {
    flexDirection: 'row',
    gap: espacamentos.sm,
  },
  erro: {
    ...tipografia.legenda,
    color: cores.erro,
  },
});
