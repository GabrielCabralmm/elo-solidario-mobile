import { Image, StyleSheet, Text, View } from 'react-native';

import { espacamentos, tipografia } from '@/theme';

import { Botao } from './Botao';

type EstadoVazioProps = {
  titulo: string;
  mensagem: string;
  acao?: { titulo: string; onPress: () => void };
};

export function EstadoVazio({ titulo, mensagem, acao }: EstadoVazioProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/cesta.png')}
        style={styles.imagem}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <Text style={[tipografia.subtitulo, styles.centro]}>{titulo}</Text>
      <Text style={[tipografia.legenda, styles.centro]}>{mensagem}</Text>
      {acao && <Botao titulo={acao.titulo} onPress={acao.onPress} variante="secundario" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: espacamentos.md,
    padding: espacamentos.xl,
  },
  imagem: {
    width: 180,
    height: 126,
    opacity: 0.9,
  },
  centro: {
    textAlign: 'center',
  },
});
