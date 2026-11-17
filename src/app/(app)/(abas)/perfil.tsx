import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { Etiqueta } from '@/components/Etiqueta';
import { useAuth } from '@/contexts/AuthContext';
import {
  ALTURA_MINIMA_TOQUE,
  cores,
  espacamentos,
  fontes,
  raios,
  sombra,
  tipografia,
} from '@/theme';
import { confirmar } from '@/utils/confirmar';

const rotuloPerfil = {
  DOADOR: 'Doador',
  BENEFICIARIO: 'Beneficiário',
  ADMIN: 'Administrador',
} as const;

export default function TelaPerfil() {
  const { usuario, sair } = useAuth();
  const [saindo, setSaindo] = useState(false);

  if (!usuario) return null;

  const iniciais = usuario.nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');

  async function aoSair() {
    const ok = await confirmar('Sair', 'Deseja encerrar sua sessão neste aparelho?', 'Sair');
    if (!ok) return;
    setSaindo(true);
    await sair();
  }

  return (
    <ScrollView contentContainerStyle={styles.conteudo}>
      <View style={styles.cartaoPerfil}>
        <View style={styles.avatar}>
          <Text style={styles.iniciais}>{iniciais}</Text>
        </View>
        <Text style={tipografia.subtitulo}>{usuario.nome}</Text>
        <Etiqueta texto={rotuloPerfil[usuario.perfil]} tom="destaque" centralizada />
      </View>

      <View style={styles.cartao}>
        <Dado icone="mail-outline" rotulo="E-mail" valor={usuario.email} />
        <Dado icone="location-outline" rotulo="Bairro" valor={usuario.bairro} />
        {usuario.telefone ? (
          <Dado icone="call-outline" rotulo="Telefone" valor={usuario.telefone} />
        ) : null}
      </View>

      <View style={styles.cartao}>
        <ItemMenu
          icone="notifications-outline"
          titulo="Notificações"
          onPress={() => router.push('/notificacoes')}
        />
        <ItemMenu
          icone="information-circle-outline"
          titulo="Sobre o App"
          onPress={() => router.push('/sobre')}
        />
      </View>

      <Botao
        titulo="Sair da conta"
        icone="log-out-outline"
        variante="perigo"
        onPress={aoSair}
        carregando={saindo}
      />
    </ScrollView>
  );
}

function Dado({
  icone,
  rotulo,
  valor,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  valor: string;
}) {
  return (
    <View style={styles.dado}>
      <Ionicons name={icone} size={20} color={cores.primaria} />
      <View>
        <Text style={tipografia.legenda}>{rotulo}</Text>
        <Text style={tipografia.corpoDestaque}>{valor}</Text>
      </View>
    </View>
  );
}

function ItemMenu({
  icone,
  titulo,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.itemMenu, pressed && styles.pressionado]}
    >
      <Ionicons name={icone} size={22} color={cores.primaria} />
      <Text style={[tipografia.corpoDestaque, styles.flex]}>{titulo}</Text>
      <Ionicons name="chevron-forward" size={20} color={cores.textoSecundario} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    padding: espacamentos.lg,
    gap: espacamentos.lg,
  },
  cartaoPerfil: {
    alignItems: 'center',
    gap: espacamentos.sm,
    paddingVertical: espacamentos.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iniciais: {
    fontFamily: fontes.extraNegrito,
    fontSize: 32,
    color: cores.textoInverso,
  },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: espacamentos.lg,
    gap: espacamentos.md,
    ...sombra,
  },
  dado: {
    flexDirection: 'row',
    gap: espacamentos.md,
    alignItems: 'center',
  },
  itemMenu: {
    minHeight: ALTURA_MINIMA_TOQUE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
  },
  pressionado: {
    opacity: 0.7,
  },
  flex: {
    flex: 1,
  },
});
