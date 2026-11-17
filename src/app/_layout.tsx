import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { cores, fontes } from '@/theme';

SplashScreen.preventAutoHideAsync();

function NavegacaoRaiz() {
  const { usuario, carregandoSessao } = useAuth();

  useEffect(() => {
    if (!carregandoSessao) {
      SplashScreen.hideAsync();
    }
  }, [carregandoSessao]);

  if (carregandoSessao) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerTintColor: cores.primaria,
        headerTitleStyle: { fontFamily: fontes.negrito, color: cores.texto },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!usuario}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function LayoutRaiz() {
  const [fontesCarregadas] = useFonts({
    [fontes.regular]: require('../../assets/fonts/Nunito_400Regular.ttf'),
    [fontes.semiBold]: require('../../assets/fonts/Nunito_600SemiBold.ttf'),
    [fontes.negrito]: require('../../assets/fonts/Nunito_700Bold.ttf'),
    [fontes.extraNegrito]: require('../../assets/fonts/Nunito_800ExtraBold.ttf'),
  });

  if (!fontesCarregadas) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <NavegacaoRaiz />
    </AuthProvider>
  );
}
