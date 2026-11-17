import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ColorValue } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { cores, fontes } from '@/theme';

type NomeIcone = keyof typeof Ionicons.glyphMap;

function iconeDaAba(ativo: NomeIcone, inativo: NomeIcone) {
  function IconeAba({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? ativo : inativo} size={24} color={color as string} />;
  }
  return IconeAba;
}

export default function LayoutAbas() {
  const { usuario } = useAuth();
  const ehBeneficiario = usuario?.perfil === 'BENEFICIARIO';

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: cores.fundo },
        headerTitleStyle: { fontFamily: fontes.negrito, color: cores.texto },
        headerShadowVisible: false,
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarLabelStyle: { fontFamily: fontes.semiBold, fontSize: 12, lineHeight: 16 },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarStyle: { backgroundColor: cores.superficie, borderTopColor: cores.borda },
        sceneStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Doações',
          headerShown: false,
          tabBarIcon: iconeDaAba('basket', 'basket-outline'),
        }}
      />
      <Tabs.Screen
        name="urgentes"
        options={{
          title: 'Vence logo',
          tabBarIcon: iconeDaAba('time', 'time-outline'),
        }}
      />
      <Tabs.Screen
        name="atividade"
        options={{
          title: ehBeneficiario ? 'Minhas reservas' : 'Minhas doações',
          tabBarLabel: ehBeneficiario ? 'Reservas' : 'Minhas',
          tabBarIcon: iconeDaAba('receipt', 'receipt-outline'),
        }}
      />
      <Tabs.Screen
        name="impacto"
        options={{
          title: 'Impacto da rede',
          tabBarLabel: 'Impacto',
          tabBarIcon: iconeDaAba('leaf', 'leaf-outline'),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Meu perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: iconeDaAba('person-circle', 'person-circle-outline'),
        }}
      />
    </Tabs>
  );
}
