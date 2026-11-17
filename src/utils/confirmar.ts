import { Alert, Platform } from 'react-native';

export function confirmar(titulo: string, mensagem: string, textoConfirmar = 'Confirmar') {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensagem}`));
  }

  return new Promise<boolean>((resolver) => {
    Alert.alert(titulo, mensagem, [
      { text: 'Voltar', style: 'cancel', onPress: () => resolver(false) },
      { text: textoConfirmar, onPress: () => resolver(true) },
    ]);
  });
}
