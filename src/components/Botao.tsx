import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ALTURA_MINIMA_TOQUE, cores, espacamentos, raios, tipografia } from '@/theme';

type Variante = 'primario' | 'secundario' | 'destaque' | 'perigo' | 'texto';

type BotaoProps = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  icone?: keyof typeof Ionicons.glyphMap;
  carregando?: boolean;
  desabilitado?: boolean;
};

const estilosPorVariante: Record<Variante, { fundo: string; texto: string; borda: string }> = {
  primario: { fundo: cores.primaria, texto: cores.textoInverso, borda: cores.primaria },
  secundario: { fundo: cores.superficie, texto: cores.primaria, borda: cores.primaria },
  destaque: { fundo: cores.destaque, texto: cores.textoInverso, borda: cores.destaque },
  perigo: { fundo: cores.superficie, texto: cores.erro, borda: cores.erro },
  texto: { fundo: 'transparent', texto: cores.primaria, borda: 'transparent' },
};

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  carregando = false,
  desabilitado = false,
}: BotaoProps) {
  const estilo = estilosPorVariante[variante];
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      onPress={onPress}
      disabled={inativo}
      style={({ pressed }) => [
        styles.botao,
        { backgroundColor: estilo.fundo, borderColor: estilo.borda },
        inativo && styles.inativo,
        pressed && styles.pressionado,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={estilo.texto} />
      ) : (
        <View style={styles.conteudo}>
          {icone && <Ionicons name={icone} size={20} color={estilo.texto} />}
          <Text style={[tipografia.botao, { color: estilo.texto }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: ALTURA_MINIMA_TOQUE,
    borderRadius: raios.md,
    borderWidth: 1.5,
    paddingHorizontal: espacamentos.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
  },
  inativo: {
    opacity: 0.55,
  },
  pressionado: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
