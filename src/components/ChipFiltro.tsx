import { Pressable, StyleSheet, Text } from 'react-native';

import { cores, espacamentos, fontes, raios } from '@/theme';

type ChipFiltroProps = {
  rotulo: string;
  selecionado: boolean;
  onPress: () => void;
};

export function ChipFiltro({ rotulo, selecionado, onPress }: ChipFiltroProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: selecionado }}
      onPress={onPress}
      style={[styles.chip, selecionado && styles.selecionado]}
    >
      <Text style={[styles.texto, selecionado && styles.textoSelecionado]}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: espacamentos.md,
    borderRadius: raios.pilula,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  selecionado: {
    backgroundColor: cores.primaria,
    borderColor: cores.primaria,
  },
  texto: {
    fontFamily: fontes.semiBold,
    fontSize: 14,
    color: cores.texto,
  },
  textoSelecionado: {
    color: cores.textoInverso,
  },
});
