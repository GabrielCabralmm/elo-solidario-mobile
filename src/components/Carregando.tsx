import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { cores, espacamentos, tipografia } from '@/theme';

export function Carregando({ mensagem = 'Carregando...' }: { mensagem?: string }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={mensagem}>
      <ActivityIndicator size="large" color={cores.primaria} />
      <Text style={tipografia.legenda}>{mensagem}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacamentos.md,
    padding: espacamentos.xl,
  },
});
