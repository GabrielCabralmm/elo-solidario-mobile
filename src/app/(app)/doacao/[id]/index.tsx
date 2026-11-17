import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Aviso } from '@/components/Aviso';
import { Botao } from '@/components/Botao';
import { Carregando } from '@/components/Carregando';
import { Etiqueta } from '@/components/Etiqueta';
import { MensagemErro } from '@/components/MensagemErro';
import { useAuth } from '@/contexts/AuthContext';
import { buscarDoacao, excluirDoacao } from '@/services/doacaoService';
import {
  cancelarReserva,
  concluirReserva,
  listarReservasDaDoacao,
  reservarDoacao,
} from '@/services/reservaService';
import { chavesLocais, lerLocal, salvarLocal } from '@/storage/armazenamentoLocal';
import { cores, espacamentos, raios, sombra, tipografia } from '@/theme';
import { Conservacao, Doacao, Reserva } from '@/types/api';
import { confirmar } from '@/utils/confirmar';
import { ehErroDeConexao, mensagemDeErro } from '@/utils/erros';
import {
  diasAte,
  formatarData,
  formatarDataHora,
  formatarNumero,
  rotuloStatusDoacao,
  rotuloStatusReserva,
  tomStatusDoacao,
  tomStatusReserva,
} from '@/utils/formatadores';

const iconeConservacao: Record<Conservacao, keyof typeof Ionicons.glyphMap> = {
  AMBIENTE: 'sunny-outline',
  REFRIGERADO: 'thermometer-outline',
  CONGELADO: 'snow-outline',
};

export default function TelaDetalheDoacao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { usuario } = useAuth();

  const [doacao, setDoacao] = useState<Doacao | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [salvoOfflineEm, setSalvoOfflineEm] = useState<string | null>(null);

  const ehResponsavel =
    !!doacao && (doacao.idDoador === usuario?.id || usuario?.perfil === 'ADMIN');
  const ehBeneficiario = usuario?.perfil === 'BENEFICIARIO';

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setSalvoOfflineEm(null);
      const dados = await buscarDoacao(Number(id));
      setDoacao(dados);
      await salvarLocal(chavesLocais.doacao(dados.id), dados);
      if (dados.idDoador === usuario?.id || usuario?.perfil === 'ADMIN') {
        setReservas(await listarReservasDaDoacao(dados.id));
      }
    } catch (falha) {
      const salva = ehErroDeConexao(falha)
        ? await lerLocal<Doacao>(chavesLocais.doacao(Number(id)))
        : null;
      if (salva) {
        setDoacao(salva.dados);
        setSalvoOfflineEm(salva.salvoEm);
      } else {
        setErro(mensagemDeErro(falha));
      }
    } finally {
      setCarregando(false);
    }
  }, [id, usuario]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function executar(chave: string, acao: () => Promise<void>, mensagemSucesso?: string) {
    setProcessando(chave);
    setErro(null);
    setSucesso(null);
    try {
      await acao();
      if (mensagemSucesso) setSucesso(mensagemSucesso);
      await carregar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    } finally {
      setProcessando(null);
    }
  }

  async function aoReservar() {
    if (!doacao) return;
    const ok = await confirmar(
      'Reservar doação',
      `Você se compromete a retirar "${doacao.titulo}" em: ${doacao.localRetirada}.`,
      'Reservar',
    );
    if (!ok) return;
    await executar(
      'reservar',
      async () => {
        await reservarDoacao(doacao.id);
      },
      'Reserva feita! O doador foi avisado. Acompanhe em "Reservas".',
    );
  }

  async function aoExcluir() {
    if (!doacao) return;
    const ok = await confirmar('Excluir doação', 'Esta ação não pode ser desfeita.', 'Excluir');
    if (!ok) return;
    setProcessando('excluir');
    try {
      await excluirDoacao(doacao.id);
      router.back();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
      setProcessando(null);
    }
  }

  async function aoConcluir(reserva: Reserva) {
    const ok = await confirmar(
      'Confirmar retirada',
      `${reserva.beneficiario} já retirou os alimentos?`,
      'Confirmar',
    );
    if (!ok) return;
    await executar(
      `concluir-${reserva.id}`,
      async () => {
        await concluirReserva(reserva.id);
      },
      'Retirada confirmada. Obrigado por doar!',
    );
  }

  async function aoCancelar(reserva: Reserva) {
    const ok = await confirmar(
      'Cancelar reserva',
      'A doação volta para a vitrine e pode ser reservada por outra pessoa.',
      'Cancelar reserva',
    );
    if (!ok) return;
    await executar(
      `cancelar-${reserva.id}`,
      async () => {
        await cancelarReserva(reserva.id);
      },
      'Reserva cancelada. A doação voltou para a vitrine.',
    );
  }

  if (carregando) {
    return <Carregando mensagem="Carregando doação..." />;
  }

  if (!doacao) {
    return (
      <MensagemErro mensagem={erro ?? 'Doação não encontrada.'} aoTentarNovamente={carregar} />
    );
  }

  const dias = doacao.venceEm ? diasAte(doacao.venceEm) : null;

  return (
    <ScrollView contentContainerStyle={styles.conteudo}>
      <View style={styles.cabecalho}>
        <Etiqueta texto={rotuloStatusDoacao[doacao.status]} tom={tomStatusDoacao[doacao.status]} />
        <Text style={tipografia.titulo}>{doacao.titulo}</Text>
        <Text style={tipografia.legenda}>
          Publicada por {doacao.doador} em {formatarData(doacao.dtPublicacao)}
        </Text>
      </View>

      {salvoOfflineEm && (
        <Aviso
          tom="alerta"
          mensagem={`Sem conexão. Dados salvos no aparelho em ${formatarDataHora(salvoOfflineEm)}.`}
        />
      )}
      {sucesso && <Aviso mensagem={sucesso} tom="sucesso" />}
      {erro && <MensagemErro mensagem={erro} />}

      <View style={styles.cartao}>
        <Linha icone="location-outline" rotulo="Bairro" valor={doacao.bairro} />
        <Linha icone="navigate-outline" rotulo="Local de retirada" valor={doacao.localRetirada} />
        <Linha
          icone="scale-outline"
          rotulo="Peso total"
          valor={`${formatarNumero(doacao.pesoTotalKg, 2)} kg`}
        />
        {dias !== null && (
          <Linha
            icone="calendar-outline"
            rotulo="Primeiro vencimento"
            valor={`${formatarData(doacao.venceEm)}${dias >= 0 ? ` (em ${dias} dia${dias === 1 ? '' : 's'})` : ' (vencido)'}`}
          />
        )}
        {doacao.observacao && (
          <Linha icone="chatbox-ellipses-outline" rotulo="Observação" valor={doacao.observacao} />
        )}
      </View>

      <Text style={tipografia.subtitulo}>Alimentos ({doacao.itens.length})</Text>
      {doacao.itens.map((item) => (
        <View key={item.id} style={styles.item}>
          <View style={styles.iconeItem}>
            <Ionicons name={iconeConservacao[item.conservacao]} size={22} color={cores.primaria} />
          </View>
          <View style={styles.itemTexto}>
            <Text style={tipografia.corpoDestaque}>{item.alimento}</Text>
            <Text style={tipografia.legenda}>
              {formatarNumero(item.quantidade, item.quantidade % 1 ? 1 : 0)} {item.unidade} ·{' '}
              {formatarNumero(item.pesoKg, 2)} kg · validade {formatarData(item.dtValidade)}
            </Text>
          </View>
        </View>
      ))}

      {ehBeneficiario && doacao.status === 'DISPONIVEL' && (
        <Botao
          titulo="Quero reservar"
          icone="hand-left-outline"
          onPress={aoReservar}
          carregando={processando === 'reservar'}
        />
      )}

      {ehResponsavel && doacao.status === 'DISPONIVEL' && (
        <View style={styles.acoes}>
          <Botao
            titulo="Editar doação"
            icone="create-outline"
            variante="secundario"
            onPress={() => router.push(`/doacao/${doacao.id}/editar`)}
          />
          <Botao
            titulo="Excluir doação"
            icone="trash-outline"
            variante="perigo"
            onPress={aoExcluir}
            carregando={processando === 'excluir'}
          />
        </View>
      )}

      {ehResponsavel && reservas.length > 0 && (
        <View style={styles.secao}>
          <Text style={tipografia.subtitulo}>Reservas</Text>
          {reservas.map((reserva) => (
            <View key={reserva.id} style={styles.cartao}>
              <View style={styles.linhaReserva}>
                <Text style={[tipografia.corpoDestaque, styles.itemTexto]}>
                  {reserva.beneficiario}
                </Text>
                <Etiqueta
                  texto={rotuloStatusReserva[reserva.status]}
                  tom={tomStatusReserva[reserva.status]}
                />
              </View>
              <Text style={tipografia.legenda}>
                Reservado em {formatarDataHora(reserva.dtReserva)}
              </Text>
              {reserva.observacao && <Text style={tipografia.corpo}>“{reserva.observacao}”</Text>}
              {reserva.status === 'PENDENTE' && (
                <View style={styles.acoes}>
                  <Botao
                    titulo="Confirmar retirada"
                    icone="checkmark-done"
                    onPress={() => aoConcluir(reserva)}
                    carregando={processando === `concluir-${reserva.id}`}
                  />
                  <Botao
                    titulo="Cancelar reserva"
                    variante="texto"
                    onPress={() => aoCancelar(reserva)}
                    carregando={processando === `cancelar-${reserva.id}`}
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Linha({
  icone,
  rotulo,
  valor,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  valor: string;
}) {
  return (
    <View style={styles.linha}>
      <Ionicons name={icone} size={20} color={cores.primaria} />
      <View style={styles.itemTexto}>
        <Text style={tipografia.legenda}>{rotulo}</Text>
        <Text style={tipografia.corpoDestaque}>{valor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    padding: espacamentos.lg,
    gap: espacamentos.lg,
    paddingBottom: espacamentos.xxl,
  },
  cabecalho: {
    gap: espacamentos.xs,
  },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: espacamentos.lg,
    gap: espacamentos.md,
    ...sombra,
  },
  linha: {
    flexDirection: 'row',
    gap: espacamentos.md,
    alignItems: 'flex-start',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.md,
    padding: espacamentos.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  iconeItem: {
    width: 40,
    height: 40,
    borderRadius: raios.pilula,
    backgroundColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTexto: {
    flex: 1,
  },
  acoes: {
    gap: espacamentos.sm,
  },
  secao: {
    gap: espacamentos.md,
  },
  linhaReserva: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
  },
});
