import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espacamentos, raios, sombra, tipografia } from '@/theme';
import { Doacao } from '@/types/api';
import {
  diasAte,
  formatarData,
  formatarNumero,
  rotuloStatusDoacao,
  tomStatusDoacao,
} from '@/utils/formatadores';

import { Etiqueta } from './Etiqueta';

type CartaoDoacaoProps = {
  doacao: Doacao;
  onPress: () => void;
};

export function CartaoDoacao({ doacao, onPress }: CartaoDoacaoProps) {
  const alimentos = doacao.itens.map((item) => item.alimento).join(', ');
  const dias = doacao.venceEm ? diasAte(doacao.venceEm) : null;
  const venceEmBreve = doacao.status === 'DISPONIVEL' && dias !== null && dias <= 3;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${doacao.titulo}, ${alimentos}, ${doacao.bairro}`}
      onPress={onPress}
      style={({ pressed }) => [styles.cartao, pressed && styles.pressionado]}
    >
      <View style={styles.topo}>
        <Text style={[tipografia.subtitulo, styles.titulo]} numberOfLines={2}>
          {doacao.titulo}
        </Text>
        <Etiqueta texto={rotuloStatusDoacao[doacao.status]} tom={tomStatusDoacao[doacao.status]} />
      </View>

      <Text style={tipografia.corpo} numberOfLines={2}>
        {alimentos}
      </Text>

      <View style={styles.infos}>
        <Info icone="location-outline" texto={doacao.bairro} />
        <Info icone="scale-outline" texto={`${formatarNumero(doacao.pesoTotalKg, 1)} kg`} />
        <Info icone="person-outline" texto={doacao.doador} />
      </View>

      {doacao.venceEm && (
        <View style={[styles.validade, venceEmBreve && styles.validadeUrgente]}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={venceEmBreve ? cores.alerta : cores.textoSecundario}
          />
          <Text style={[tipografia.legenda, venceEmBreve && styles.textoUrgente]}>
            {venceEmBreve ? textoVencimento(dias!) : `Validade: ${formatarData(doacao.venceEm)}`}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function textoVencimento(dias: number) {
  if (dias < 0) return 'Vencido';
  if (dias === 0) return 'Vence hoje';
  return `Vence em ${dias} dia${dias === 1 ? '' : 's'}`;
}

function Info({ icone, texto }: { icone: keyof typeof Ionicons.glyphMap; texto: string }) {
  return (
    <View style={styles.info}>
      <Ionicons name={icone} size={15} color={cores.textoSecundario} />
      <Text style={tipografia.legenda} numberOfLines={1}>
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: espacamentos.lg,
    gap: espacamentos.sm,
    ...sombra,
  },
  pressionado: {
    opacity: 0.9,
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: espacamentos.sm,
  },
  titulo: {
    flex: 1,
  },
  infos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacamentos.md,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  validade: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.xs,
    paddingTop: espacamentos.xs,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  validadeUrgente: {
    borderTopColor: cores.alertaClaro,
  },
  textoUrgente: {
    color: cores.alerta,
    fontFamily: 'Nunito_700Bold',
  },
});
