import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { Carregando } from '@/components/Carregando';
import { CartaoDoacao } from '@/components/CartaoDoacao';
import { Etiqueta } from '@/components/Etiqueta';
import { EstadoVazio } from '@/components/EstadoVazio';
import { MensagemErro } from '@/components/MensagemErro';
import { useAuth } from '@/contexts/AuthContext';
import { listarMinhasDoacoes } from '@/services/doacaoService';
import { cancelarReserva, listarMinhasReservas } from '@/services/reservaService';
import { cores, espacamentos, raios, sombra, tipografia } from '@/theme';
import { Doacao, Reserva } from '@/types/api';
import { confirmar } from '@/utils/confirmar';
import { mensagemDeErro } from '@/utils/erros';
import { formatarDataHora, rotuloStatusReserva, tomStatusReserva } from '@/utils/formatadores';

export default function TelaAtividade() {
  const { usuario } = useAuth();
  const ehBeneficiario = usuario?.perfil === 'BENEFICIARIO';

  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [cancelando, setCancelando] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      if (ehBeneficiario) {
        setReservas((await listarMinhasReservas()).content);
      } else {
        setDoacoes((await listarMinhasDoacoes()).content);
      }
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
  }, [ehBeneficiario]);

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

  async function aoCancelar(reserva: Reserva) {
    const ok = await confirmar(
      'Cancelar reserva',
      `A doação "${reserva.doacao}" volta para a vitrine.`,
      'Cancelar reserva',
    );
    if (!ok) return;
    setCancelando(reserva.id);
    try {
      await cancelarReserva(reserva.id);
      await carregar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    } finally {
      setCancelando(null);
    }
  }

  if (carregando) {
    return <Carregando />;
  }

  const atualizar = (
    <RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} tintColor={cores.primaria} />
  );
  const cabecalhoErro = erro ? (
    <MensagemErro mensagem={erro} aoTentarNovamente={aoAtualizar} />
  ) : undefined;

  if (ehBeneficiario) {
    return (
      <FlatList
        data={reservas}
        keyExtractor={(reserva) => String(reserva.id)}
        contentContainerStyle={styles.lista}
        refreshControl={atualizar}
        ListHeaderComponent={cabecalhoErro}
        ListEmptyComponent={
          <EstadoVazio
            titulo="Você ainda não reservou nada"
            mensagem="Encontre alimentos disponíveis na vitrine."
            acao={{ titulo: 'Ver doações', onPress: () => router.navigate('/') }}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cartao}>
            <Pressable
              accessibilityRole="button"
              accessibilityHint="Abre os detalhes da doação"
              style={({ pressed }) => [styles.areaToque, pressed && styles.pressionado]}
              onPress={() => router.push(`/doacao/${item.idDoacao}`)}
            >
              <View style={styles.linha}>
                <Text style={[tipografia.subtitulo, styles.flex]}>{item.doacao}</Text>
                <Etiqueta
                  texto={rotuloStatusReserva[item.status]}
                  tom={tomStatusReserva[item.status]}
                />
              </View>
              <Text style={tipografia.corpo}>Retirar em: {item.localRetirada}</Text>
              <Text style={tipografia.legenda}>
                Reservado em {formatarDataHora(item.dtReserva)}
              </Text>
              {item.dtRetirada && (
                <Text style={tipografia.legenda}>
                  Retirado em {formatarDataHora(item.dtRetirada)}
                </Text>
              )}
            </Pressable>
            {item.status === 'PENDENTE' && (
              <Botao
                titulo="Cancelar reserva"
                variante="perigo"
                icone="close-circle-outline"
                onPress={() => aoCancelar(item)}
                carregando={cancelando === item.id}
              />
            )}
          </View>
        )}
      />
    );
  }

  return (
    <FlatList
      data={doacoes}
      keyExtractor={(doacao) => String(doacao.id)}
      contentContainerStyle={styles.lista}
      refreshControl={atualizar}
      ListHeaderComponent={
        <View style={styles.cabecalho}>
          {cabecalhoErro}
          <Botao
            titulo="Nova doação"
            icone="add-circle-outline"
            variante="destaque"
            onPress={() => router.push('/doacao/nova')}
          />
        </View>
      }
      ListEmptyComponent={
        <EstadoVazio
          titulo="Nenhuma doação publicada"
          mensagem="Tem alimento sobrando? Publique em menos de um minuto, com ajuda da IA."
        />
      }
      renderItem={({ item }) => (
        <CartaoDoacao doacao={item} onPress={() => router.push(`/doacao/${item.id}`)} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    padding: espacamentos.lg,
    gap: espacamentos.md,
  },
  cabecalho: {
    gap: espacamentos.md,
  },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: espacamentos.lg,
    gap: espacamentos.sm,
    ...sombra,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamentos.sm,
  },
  flex: {
    flex: 1,
  },
  areaToque: {
    gap: espacamentos.sm,
  },
  pressionado: {
    opacity: 0.7,
  },
});
