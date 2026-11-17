import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Carregando } from '@/components/Carregando';
import { Etiqueta } from '@/components/Etiqueta';
import { MensagemErro } from '@/components/MensagemErro';
import { useAuth } from '@/contexts/AuthContext';
import { buscarImpacto, buscarImpactoDoDoador } from '@/services/impactoService';
import { cores, espacamentos, fontes, raios, sombra, tipografia } from '@/theme';
import { Impacto, ImpactoDoador } from '@/types/api';
import { mensagemDeErro } from '@/utils/erros';
import { formatarNumero } from '@/utils/formatadores';

export default function TelaImpacto() {
  const { usuario } = useAuth();
  const [impacto, setImpacto] = useState<Impacto | null>(null);
  const [meuImpacto, setMeuImpacto] = useState<ImpactoDoador | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setImpacto(await buscarImpacto());
      if (usuario?.perfil === 'DOADOR') {
        setMeuImpacto(await buscarImpactoDoDoador(usuario.id));
      }
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
  }, [usuario]);

  useFocusEffect(
    useCallback(() => {
      carregar().finally(() => setCarregando(false));
    }, [carregar]),
  );

  async function aoAtualizar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  if (carregando) return <Carregando mensagem="Calculando o impacto da rede..." />;

  const maiorKg = Math.max(
    1,
    ...(impacto?.porCategoria.map((categoria) => categoria.totalKg) ?? [1]),
  );

  return (
    <ScrollView
      contentContainerStyle={styles.conteudo}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={aoAtualizar}
          tintColor={cores.primaria}
        />
      }
    >
      {erro && <MensagemErro mensagem={erro} aoTentarNovamente={aoAtualizar} />}

      {impacto && (
        <>
          <View style={styles.destaque}>
            <Ionicons name="restaurant" size={28} color={cores.textoInverso} />
            <Text style={styles.destaqueNumero}>{formatarNumero(impacto.refeicoesEstimadas)}</Text>
            <Text style={styles.destaqueTexto}>refeições estimadas já chegaram a quem precisa</Text>
          </View>

          <View style={styles.grade}>
            <Indicador
              icone="scale"
              valor={`${formatarNumero(impacto.alimentosDestinadosKg, 1)} kg`}
              rotulo="de alimentos destinados"
            />
            <Indicador
              icone="flame"
              valor={formatarNumero(impacto.energiaEstimadaKcal)}
              rotulo="kcal estimadas"
            />
            <Indicador
              icone="checkmark-done"
              valor={String(impacto.doacoesConcluidas)}
              rotulo="doações entregues"
            />
            <Indicador
              icone="people"
              valor={String(impacto.beneficiariosAtendidos)}
              rotulo="beneficiários atendidos"
            />
          </View>

          <View style={styles.cartao}>
            <Text style={tipografia.subtitulo}>Por categoria</Text>
            {impacto.porCategoria.map((categoria) => (
              <View key={categoria.categoria} style={styles.categoria}>
                <View style={styles.linha}>
                  <Text style={tipografia.corpoDestaque}>{categoria.categoria}</Text>
                  <Text style={tipografia.legenda}>{formatarNumero(categoria.totalKg, 2)} kg</Text>
                </View>
                <View style={styles.trilho}>
                  <View
                    style={[styles.barra, { width: `${(categoria.totalKg / maiorKg) * 100}%` }]}
                    accessibilityLabel={`${categoria.categoria}: ${categoria.totalKg} kg`}
                  />
                </View>
              </View>
            ))}
          </View>

          <Text style={[tipografia.legenda, styles.nota]}>
            {impacto.doacoesDisponiveis} doações disponíveis agora. Refeições estimadas com 600 kcal
            cada.
          </Text>
        </>
      )}

      {meuImpacto && (
        <View style={styles.cartao}>
          <View style={styles.linha}>
            <Text style={tipografia.subtitulo}>Seu impacto</Text>
            <Etiqueta texto={`Selo ${meuImpacto.selo}`} tom="destaque" />
          </View>
          <Text style={tipografia.corpo}>
            Você já entregou {formatarNumero(meuImpacto.totalKgDoado, 2)} kg em{' '}
            {meuImpacto.doacoesConcluidas} doação(ões), cerca de{' '}
            {formatarNumero(meuImpacto.energiaEstimadaKcal)} kcal.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function Indicador({
  icone,
  valor,
  rotulo,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  valor: string;
  rotulo: string;
}) {
  return (
    <View style={styles.indicador}>
      <Ionicons name={icone} size={22} color={cores.primaria} />
      <Text style={styles.valor}>{valor}</Text>
      <Text style={tipografia.legenda}>{rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    padding: espacamentos.lg,
    gap: espacamentos.lg,
  },
  destaque: {
    backgroundColor: cores.primaria,
    borderRadius: raios.lg,
    padding: espacamentos.xl,
    gap: espacamentos.xs,
  },
  destaqueNumero: {
    fontFamily: fontes.extraNegrito,
    fontSize: 44,
    color: cores.textoInverso,
  },
  destaqueTexto: {
    ...tipografia.corpo,
    color: cores.primariaClara,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamentos.md,
  },
  indicador: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: espacamentos.lg,
    gap: 2,
    ...sombra,
  },
  valor: {
    fontFamily: fontes.extraNegrito,
    fontSize: 22,
    color: cores.texto,
  },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: espacamentos.lg,
    gap: espacamentos.md,
    ...sombra,
  },
  categoria: {
    gap: espacamentos.xs,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trilho: {
    height: 10,
    borderRadius: raios.pilula,
    backgroundColor: cores.primariaClara,
    overflow: 'hidden',
  },
  barra: {
    height: '100%',
    borderRadius: raios.pilula,
    backgroundColor: cores.destaque,
  },
  nota: {
    textAlign: 'center',
  },
});
