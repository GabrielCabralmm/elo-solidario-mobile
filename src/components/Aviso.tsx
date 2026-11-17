import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { cores, espacamentos, raios, tipografia } from '@/theme';

type Tom = 'sucesso' | 'info' | 'alerta';

const tons: Record<Tom, { fundo: string; cor: string; icone: keyof typeof Ionicons.glyphMap }> = {
  sucesso: { fundo: cores.sucessoClaro, cor: cores.sucesso, icone: 'checkmark-circle' },
  info: { fundo: cores.infoClaro, cor: cores.info, icone: 'information-circle' },
  alerta: { fundo: cores.alertaClaro, cor: cores.alerta, icone: 'warning' },
};

export function Aviso({ mensagem, tom = 'info' }: { mensagem: string; tom?: Tom }) {
  const estilo = tons[tom];
  return (
    <View
      style={[styles.aviso, { backgroundColor: estilo.fundo }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={estilo.icone} size={20} color={estilo.cor} />
      <Text style={[tipografia.corpo, styles.texto, { color: estilo.cor }]}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: {
    flexDirection: 'row',
    gap: espacamentos.sm,
    alignItems: 'flex-start',
    borderRadius: raios.md,
    padding: espacamentos.md,
  },
  texto: {
    flex: 1,
  },
});
