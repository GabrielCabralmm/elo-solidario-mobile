import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { Carregando } from '@/components/Carregando';
import { CartaoDoacao } from '@/components/CartaoDoacao';
import { ChipFiltro } from '@/components/ChipFiltro';
import { EstadoVazio } from '@/components/EstadoVazio';
import { MensagemErro } from '@/components/MensagemErro';
import { useAuth } from '@/contexts/AuthContext';
import { listarCategorias } from '@/services/catalogoService';
import { listarDoacoes } from '@/services/doacaoService';
import { listarNotificacoes } from '@/services/notificacaoService';
import { cores, espacamentos, fontes, raios, sombra, tipografia } from '@/theme';
import { Categoria, Doacao } from '@/types/api';
import { mensagemDeErro } from '@/utils/erros';

export default function TelaVitrine() {
  const { usuario } = useAuth();
  const podeDoar = usuario?.perfil !== 'BENEFICIARIO';

  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [idCategoria, setIdCategoria] = useState<number | undefined>();
  const [bairro, setBairro] = useState('');
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [naoLidas, setNaoLidas] = useState(0);

  const carregar = useCallback(
    async (paginaDesejada: number) => {
      try {
        setErro(null);
        const resposta = await listarDoacoes({
          pagina: paginaDesejada,
          idCategoria,
          bairro: bairro.trim() || undefined,
        });
        setDoacoes((atuais) =>
          paginaDesejada === 0 ? resposta.content : [...atuais, ...resposta.content],
        );
        setPagina(paginaDesejada);
        setTemMais(paginaDesejada + 1 < resposta.page.totalPages);
      } catch (falha) {
        setErro(mensagemDeErro(falha));
      }
    },
    [idCategoria, bairro],
  );

  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      listarNotificacoes()
        .then((lista) => setNaoLidas(lista.filter((notificacao) => !notificacao.lida).length))
        .catch(() => setNaoLidas(0));
    }, []),
  );

  useEffect(() => {
    const espera = setTimeout(() => {
      setCarregando(true);
      carregar(0).finally(() => setCarregando(false));
    }, 350);
    return () => clearTimeout(espera);
  }, [carregar]);

  async function aoAtualizar() {
    setAtualizando(true);
    await carregar(0);
    setAtualizando(false);
  }

  async function aoChegarNoFim() {
    if (!temMais || carregandoMais || carregando) return;
    setCarregandoMais(true);
    await carregar(pagina + 1);
    setCarregandoMais(false);
  }

  const primeiroNome = usuario?.nome.split(' ')[0] ?? '';

  return (
    <SafeAreaView style={styles.tela} edges={['top']}>
      <View style={styles.cabecalho}>
        <View style={styles.saudacao}>
          <Text style={tipografia.legenda}>Olá, {primeiroNome}</Text>
          <Text style={tipografia.titulo}>
            {podeDoar ? 'O que vamos doar hoje?' : 'Alimentos perto de você'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Notificações, ${naoLidas} não lidas`}
          onPress={() => router.push('/notificacoes')}
          style={styles.sino}
          hitSlop={8}
        >
          <Ionicons name="notifications-outline" size={26} color={cores.texto} />
          {naoLidas > 0 && (
            <View style={styles.contador}>
              <Text style={styles.contadorTexto}>{naoLidas > 9 ? '9+' : naoLidas}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.filtros}>
        <CampoTexto
          rotulo="Bairro"
          icone="search-outline"
          placeholder="Filtrar por bairro"
          value={bairro}
          onChangeText={setBairro}
          autoCapitalize="words"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <ChipFiltro
            rotulo="Todas"
            selecionado={idCategoria === undefined}
            onPress={() => setIdCategoria(undefined)}
          />
          {categorias.map((categoria) => (
            <ChipFiltro
              key={categoria.id}
              rotulo={categoria.nome}
              selecionado={idCategoria === categoria.id}
              onPress={() => setIdCategoria(categoria.id)}
            />
          ))}
        </ScrollView>
      </View>

      {carregando ? (
        <Carregando mensagem="Buscando doações..." />
      ) : (
        <FlatList
          data={doacoes}
          keyExtractor={(doacao) => String(doacao.id)}
          renderItem={({ item }) => (
            <CartaoDoacao doacao={item} onPress={() => router.push(`/doacao/${item.id}`)} />
          )}
          contentContainerStyle={styles.lista}
          ItemSeparatorComponent={() => <View style={styles.separador} />}
          refreshControl={
            <RefreshControl
              refreshing={atualizando}
              onRefresh={aoAtualizar}
              tintColor={cores.primaria}
            />
          }
          onEndReached={aoChegarNoFim}
          onEndReachedThreshold={0.4}
          ListHeaderComponent={
            erro ? <MensagemErro mensagem={erro} aoTentarNovamente={aoAtualizar} /> : undefined
          }
          ListEmptyComponent={
            erro ? undefined : (
              <EstadoVazio
                titulo="Nenhuma doação disponível"
                mensagem="Tente outro bairro ou categoria, ou volte mais tarde."
              />
            )
          }
          ListFooterComponent={
            carregandoMais ? <Carregando mensagem="Carregando mais..." /> : undefined
          }
        />
      )}

      {podeDoar && (
        <View style={styles.acao}>
          <Botao
            titulo="Doar alimentos"
            icone="add-circle-outline"
            variante="destaque"
            onPress={() => router.push('/doacao/nova')}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: espacamentos.lg,
    paddingTop: espacamentos.md,
    gap: espacamentos.md,
  },
  saudacao: {
    flex: 1,
  },
  sino: {
    width: 48,
    height: 48,
    borderRadius: raios.pilula,
    backgroundColor: cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombra,
  },
  contador: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 3,
    backgroundColor: cores.destaque,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorTexto: {
    fontFamily: fontes.extraNegrito,
    fontSize: 10,
    color: cores.textoInverso,
  },
  filtros: {
    padding: espacamentos.lg,
    gap: espacamentos.md,
  },
  chips: {
    gap: espacamentos.sm,
  },
  lista: {
    paddingHorizontal: espacamentos.lg,
    paddingBottom: 96,
  },
  separador: {
    height: espacamentos.md,
  },
  acao: {
    position: 'absolute',
    left: espacamentos.lg,
    right: espacamentos.lg,
    bottom: espacamentos.lg,
  },
});
