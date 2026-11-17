import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Carregando } from '@/components/Carregando';
import { EstadoVazio } from '@/components/EstadoVazio';
import { MensagemErro } from '@/components/MensagemErro';
import { listarNotificacoes, marcarNotificacaoComoLida } from '@/services/notificacaoService';
import { cores, espacamentos, raios, tipografia } from '@/theme';
import { Notificacao } from '@/types/api';
import { mensagemDeErro } from '@/utils/erros';
import { formatarDataHora } from '@/utils/formatadores';

const iconePorTipo: Record<Notificacao['tipo'], keyof typeof Ionicons.glyphMap> = {
  RESERVA_CRIADA: 'hand-left',
  RESERVA_CONCLUIDA: 'checkmark-done-circle',
  RESERVA_CANCELADA: 'close-circle',
};

export default function TelaNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setNotificacoes(await listarNotificacoes());
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
  }, []);

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

  async function aoTocar(notificacao: Notificacao) {
    if (notificacao.lida) return;
    try {
      const atualizada = await marcarNotificacaoComoLida(notificacao.id);
      setNotificacoes((atuais) =>
        atuais.map((item) => (item.id === atualizada.id ? atualizada : item)),
      );
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
  }

  if (carregando) return <Carregando />;

  return (
    <FlatList
      data={notificacoes}
      keyExtractor={(notificacao) => String(notificacao.id)}
      contentContainerStyle={styles.lista}
      refreshControl={
        <RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} tintColor={cores.primaria} />
      }
      ListHeaderComponent={erro ? <MensagemErro mensagem={erro} aoTentarNovamente={aoAtualizar} /> : undefined}
      ListEmptyComponent={
        <EstadoVazio
          titulo="Sem notificações"
          mensagem="Você será avisado aqui quando alguém reservar ou retirar uma doação."
        />
      }
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityHint={item.lida ? undefined : 'Marca como lida'}
          onPress={() => aoTocar(item)}
          style={[styles.item, !item.lida && styles.naoLida]}
        >
          <Ionicons name={iconePorTipo[item.tipo]} size={26} color={cores.primaria} />
          <View style={styles.texto}>
            <Text style={item.lida ? tipografia.corpo : tipografia.corpoDestaque}>{item.mensagem}</Text>
            <Text style={tipografia.legenda}>{formatarDataHora(item.dtCriacao)}</Text>
          </View>
          {!item.lida && <View style={styles.ponto} />}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  lista: {
    padding: espacamentos.lg,
    gap: espacamentos.sm,
  },
  item: {
    flexDirection: 'row',
    gap: espacamentos.md,
    alignItems: 'flex-start',
    padding: espacamentos.lg,
    borderRadius: raios.lg,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  naoLida: {
    backgroundColor: cores.primariaClara,
    borderColor: cores.primariaClara,
  },
  texto: {
    flex: 1,
    gap: 2,
  },
  ponto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: cores.destaque,
    marginTop: 6,
  },
});
