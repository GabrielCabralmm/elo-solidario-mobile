import { Stack } from 'expo-router';

import { cores, fontes } from '@/theme';

export default function LayoutAplicativo() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerTintColor: cores.primaria,
        headerTitleStyle: { fontFamily: fontes.negrito, color: cores.texto },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Screen name="(abas)" options={{ headerShown: false }} />
      <Stack.Screen name="doacao/nova" options={{ title: 'Nova doação' }} />
      <Stack.Screen name="doacao/[id]/index" options={{ title: 'Detalhes da doação' }} />
      <Stack.Screen name="doacao/[id]/editar" options={{ title: 'Editar doação' }} />
      <Stack.Screen name="notificacoes" options={{ title: 'Notificações' }} />
      <Stack.Screen name="sobre" options={{ title: 'Sobre o App' }} />
    </Stack>
  );
}
