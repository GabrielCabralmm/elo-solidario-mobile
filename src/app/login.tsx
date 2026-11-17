import { Link } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { MensagemErro } from '@/components/MensagemErro';
import { useAuth } from '@/contexts/AuthContext';
import { cores, espacamentos, fontes, tipografia } from '@/theme';
import { mensagemDeErro } from '@/utils/erros';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TelaLogin() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errosCampos, setErrosCampos] = useState<{ email?: string; senha?: string }>({});
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function validar() {
    const novosErros: typeof errosCampos = {};
    if (!REGEX_EMAIL.test(email.trim())) novosErros.email = 'Informe um e-mail válido';
    if (!senha) novosErros.senha = 'Informe sua senha';
    setErrosCampos(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function aoEntrar() {
    setErro(null);
    if (!validar()) return;
    setEnviando(true);
    try {
      await entrar(email, senha);
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView
        style={styles.tela}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <View style={styles.cabecalho}>
            <View style={styles.logo}>
              <Image source={require('../../assets/images/simbolo.png')} style={styles.simbolo} />
            </View>
            <Text style={styles.marca}>EloSolidário</Text>
            <Text style={[tipografia.corpo, styles.slogan]}>
              Quem tem alimento sobrando encontra quem precisa.
            </Text>
          </View>

          <View style={styles.formulario}>
            <CampoTexto
              rotulo="E-mail"
              icone="mail-outline"
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              erro={errosCampos.email}
            />
            <CampoTexto
              rotulo="Senha"
              icone="lock-closed-outline"
              placeholder="Sua senha"
              senha
              autoComplete="password"
              value={senha}
              onChangeText={setSenha}
              erro={errosCampos.senha}
              onSubmitEditing={aoEntrar}
            />
            {erro && <MensagemErro mensagem={erro} />}
            <Botao titulo="Entrar" onPress={aoEntrar} carregando={enviando} icone="log-in-outline" />
          </View>

          <View style={styles.rodape}>
            <Text style={tipografia.corpo}>Ainda não faz parte da rede?</Text>
            <Link href="/cadastro" style={styles.link}>
              Criar conta
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: espacamentos.xl,
    gap: espacamentos.xl,
  },
  cabecalho: {
    alignItems: 'center',
    gap: espacamentos.sm,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
  },
  simbolo: {
    width: 72,
    height: 72,
  },
  marca: {
    fontFamily: fontes.extraNegrito,
    fontSize: 32,
    color: cores.primaria,
  },
  slogan: {
    textAlign: 'center',
    color: cores.textoSecundario,
  },
  formulario: {
    gap: espacamentos.lg,
  },
  rodape: {
    alignItems: 'center',
    gap: espacamentos.xs,
  },
  link: {
    fontFamily: fontes.negrito,
    fontSize: 16,
    color: cores.destaque,
    padding: espacamentos.sm,
  },
});
