import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Carregando } from '@/components/Carregando';
import { ChipFiltro } from '@/components/ChipFiltro';
import { Etiqueta } from '@/components/Etiqueta';
import { EstadoVazio } from '@/components/EstadoVazio';
import { MensagemErro } from '@/components/MensagemErro';
import { useAuth } from '@/contexts/AuthContext';
import { listarDoacoesUrgentes } from '@/services/impactoService';
import { cores, espacamentos, raios, sombra, tipografia } from '@/theme';
import { DoacaoUrgente } from '@/types/api';
import { mensagemDeErro } from '@/utils/erros';
import { formatarData } from '@/utils/formatadores';

const PRAZOS = [
  { dias: 1, rotulo: 'Até amanhã' },
  { dias: 3, rotulo: 'Até 3 dias' },
  { dias: 7, rotulo: 'Até 7 dias' },
  { dias: 15, rotulo: 'Até 15 dias' },
];

export default function TelaUrgentes() {
  const { usuario } = useAuth();
  const [dias, setDias] = useState(7);
  const [soMeuBairro, setSoMeuBairro] = useState(false);
  const [doacoes, setDoacoes] = useState<DoacaoUrgente[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setDoacoes(await listarDoacoesUrgentes(dias, soMeuBairro ? usuario?.bairro : undefined));
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
  }, [dias, soMeuBairro, usuario]);

  useFocusEffect(
    useCallback(() => {
      setCarregando(true);
      carregar().finally(() => setCarregando(false));
    }, [carregar]),
  );

  async function aoAtualizar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <Text style={tipografia.legenda}>
          Doações disponíveis que vencem em breve. Retire primeiro o que corre risco de ser jogado fora.
        </Text>
        <View style={styles.chips}>
          {PRAZOS.map((prazo) => (
            <ChipFiltro
              key={prazo.dias}
              rotulo={prazo.rotulo}
              selecionado={dias === prazo.dias}
              onPress={() => setDias(prazo.dias)}
            />
          ))}
        </View>
        <ChipFiltro
          rotulo={`Só no meu bairro (${usuario?.bairro})`}
          selecionado={soMeuBairro}
          onPress={() => setSoMeuBairro((valor) => !valor)}
        />
      </View>

      {carregando ? (
        <Carregando mensagem="Procurando alimentos perto do vencimento..." />
      ) : (
        <FlatList
          data={doacoes}
          keyExtractor={(doacao) => String(doacao.idDoacao)}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} tintColor={cores.primaria} />
          }
          ListHeaderComponent={erro ? <MensagemErro mensagem={erro} aoTentarNovamente={aoAtualizar} /> : undefined}
          ListEmptyComponent={
            erro ? undefined : (
              <EstadoVazio
                titulo="Nada vencendo nesse prazo"
                mensagem="Ótima notícia: nenhuma doação disponível corre risco de desperdício agora."
              />
            )
          }
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.cartao, pressed && styles.pressionado]}
              onPress={() => router.push(`/doacao/${item.idDoacao}`)}
            >
              <View style={[styles.contagem, item.diasParaVencer <= 1 && styles.contagemUrgente]}>
                <Text style={styles.numero}>{item.diasParaVencer}</Text>
                <Text style={styles.unidade}>{item.diasParaVencer === 1 ? 'dia' : 'dias'}</Text>
              </View>
              <View style={styles.texto}>
                <Etiqueta texto={item.alerta} tom={item.diasParaVencer <= 1 ? 'erro' : 'alerta'} />
                <Text style={tipografia.corpoDestaque}>{item.titulo}</Text>
                <Text style={tipografia.legenda} numberOfLines={1}>
                  {item.alimentos}
                </Text>
                <View style={styles.info}>
                  <Ionicons name="location-outline" size={14} color={cores.textoSecundario} />
                  <Text style={tipografia.legenda}>
                    {item.bairro} · vence {formatarData(item.venceEm)}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  topo: {
    padding: espacamentos.lg,
    gap: espacamentos.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamentos.sm,
  },
  lista: {
    paddingHorizontal: espacamentos.lg,
    paddingBottom: espacamentos.xl,
    gap: espacamentos.md,
  },
  cartao: {
    flexDirection: 'row',
    gap: espacamentos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: espacamentos.lg,
    ...sombra,
  },
  pressionado: {
    opacity: 0.9,
  },
  contagem: {
    width: 64,
    borderRadius: raios.md,
    backgroundColor: cores.alertaClaro,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espacamentos.sm,
  },
  contagemUrgente: {
    backgroundColor: cores.erroClaro,
  },
  numero: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 26,
    color: cores.texto,
  },
  unidade: {
    ...tipografia.legenda,
  },
  texto: {
    flex: 1,
    gap: 3,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
