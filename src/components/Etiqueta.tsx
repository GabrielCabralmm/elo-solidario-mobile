import { StyleSheet, Text, View } from 'react-native';

import { cores, espacamentos, fontes, raios } from '@/theme';

type Tom = 'sucesso' | 'alerta' | 'erro' | 'info' | 'neutro' | 'destaque';

const tons: Record<Tom, { fundo: string; texto: string }> = {
  sucesso: { fundo: cores.sucessoClaro, texto: cores.sucesso },
  alerta: { fundo: cores.alertaClaro, texto: cores.alerta },
  erro: { fundo: cores.erroClaro, texto: cores.erro },
  info: { fundo: cores.infoClaro, texto: cores.info },
  neutro: { fundo: cores.primariaClara, texto: cores.primariaEscura },
  destaque: { fundo: cores.destaqueClaro, texto: '#9A4A0B' },
};

export function Etiqueta({ texto, tom = 'neutro' }: { texto: string; tom?: Tom }) {
  const estilo = tons[tom];
  return (
    <View style={[styles.etiqueta, { backgroundColor: estilo.fundo }]}>
      <Text style={[styles.texto, { color: estilo.texto }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  etiqueta: {
    alignSelf: 'flex-start',
    borderRadius: raios.pilula,
    paddingHorizontal: espacamentos.sm + 2,
    paddingVertical: 3,
  },
  texto: {
    fontFamily: fontes.negrito,
    fontSize: 12,
  },
});
