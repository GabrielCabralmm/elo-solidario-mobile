import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { cores, espacamentos, raios, tipografia } from '@/theme';

import { Botao } from './Botao';

type MensagemErroProps = {
  mensagem: string;
  aoTentarNovamente?: () => void;
};

export function MensagemErro({ mensagem, aoTentarNovamente }: MensagemErroProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={styles.linha}>
        <Ionicons name="alert-circle" size={22} color={cores.erro} />
        <Text style={[tipografia.corpo, styles.texto]}>{mensagem}</Text>
      </View>
      {aoTentarNovamente && (
        <Botao
          titulo="Tentar novamente"
          onPress={aoTentarNovamente}
          variante="perigo"
          icone="refresh"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: cores.erroClaro,
    borderRadius: raios.md,
    padding: espacamentos.lg,
    gap: espacamentos.md,
    margin: espacamentos.lg,
  },
  linha: {
    flexDirection: 'row',
    gap: espacamentos.sm,
    alignItems: 'flex-start',
  },
  texto: {
    flex: 1,
    color: cores.erro,
  },
});
