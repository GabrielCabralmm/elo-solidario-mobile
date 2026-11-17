import Constants from 'expo-constants';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { URL_API_DOTNET, URL_API_JAVA } from '@/services/api';
import { cores, espacamentos, fontes, raios, sombra, tipografia } from '@/theme';

const INTEGRANTES = [
  'Gabriel Cabral Mendes Mariano · RM563230 · 2TDSPO',
  'João Victor Santana dos Santos · RM566063 · 2TDSPX',
];

export default function TelaSobre() {
  const versao = Constants.expoConfig?.version ?? '-';
  const commit: string = Constants.expoConfig?.extra?.commitHash ?? 'desconhecido';

  return (
    <ScrollView contentContainerStyle={styles.conteudo}>
      <View style={styles.marca}>
        <View style={styles.logo}>
          <Image source={require('../../../assets/images/simbolo.png')} style={styles.simbolo} />
        </View>
        <Text style={styles.nome}>EloSolidário</Text>
        <Text style={tipografia.legenda}>Versão {versao}</Text>
      </View>

      <View style={styles.cartao}>
        <Text style={tipografia.rotulo}>Commit de referência</Text>
        <Text style={styles.hash} selectable>
          {commit.substring(0, 7)}
        </Text>
        <Text style={[tipografia.legenda, styles.hashCompleto]} selectable>
          {commit}
        </Text>
      </View>

      <View style={styles.cartao}>
        <Text style={tipografia.subtitulo}>Sobre o projeto</Text>
        <Text style={tipografia.corpo}>
          Rede comunitária que conecta quem tem alimentos sobrando a famílias e instituições que
          precisam, reduzindo a fome e o desperdício (ODS 2, 10 e 12).
        </Text>
        <Text style={tipografia.legenda}>Global Solution 2026/2 · CitizenTech · FIAP 2TDS</Text>
      </View>

      <View style={styles.cartao}>
        <Text style={tipografia.subtitulo}>Equipe</Text>
        {INTEGRANTES.map((integrante) => (
          <Text key={integrante} style={tipografia.corpo}>
            {integrante}
          </Text>
        ))}
      </View>

      <View style={styles.cartao}>
        <Text style={tipografia.subtitulo}>Serviços</Text>
        <Text style={tipografia.legenda}>API Java: {URL_API_JAVA}</Text>
        <Text style={tipografia.legenda}>API .NET: {URL_API_DOTNET}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    padding: espacamentos.lg,
    gap: espacamentos.lg,
  },
  marca: {
    alignItems: 'center',
    gap: espacamentos.xs,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simbolo: {
    width: 60,
    height: 60,
  },
  nome: {
    fontFamily: fontes.extraNegrito,
    fontSize: 26,
    color: cores.primaria,
  },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: espacamentos.lg,
    gap: espacamentos.sm,
    ...sombra,
  },
  hash: {
    fontFamily: fontes.extraNegrito,
    fontSize: 28,
    letterSpacing: 2,
    color: cores.destaque,
  },
  hashCompleto: {
    fontFamily: 'monospace',
  },
});
