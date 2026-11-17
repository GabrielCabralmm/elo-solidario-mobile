import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/components/Botao';
import { CampoTexto } from '@/components/CampoTexto';
import { ChipFiltro } from '@/components/ChipFiltro';
import { MensagemErro } from '@/components/MensagemErro';
import { useAuth } from '@/contexts/AuthContext';
import { cores, espacamentos, tipografia } from '@/theme';
import { RegistroRequest } from '@/types/api';
import { mensagemDeErro } from '@/utils/erros';

type Campos = Omit<RegistroRequest, 'perfil'> & { confirmarSenha: string };
type ErrosCampos = Partial<Record<keyof Campos, string>>;

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TelaCadastro() {
  const { cadastrar } = useAuth();
  const [perfil, setPerfil] = useState<RegistroRequest['perfil']>('BENEFICIARIO');
  const [campos, setCampos] = useState<Campos>({
    nome: '',
    email: '',
    telefone: '',
    bairro: '',
    senha: '',
    confirmarSenha: '',
  });
  const [errosCampos, setErrosCampos] = useState<ErrosCampos>({});
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function alterar(campo: keyof Campos, valor: string) {
    setCampos((atual) => ({ ...atual, [campo]: valor }));
  }

  function validar() {
    const novosErros: ErrosCampos = {};
    if (campos.nome.trim().length < 3) novosErros.nome = 'Informe seu nome completo';
    if (!REGEX_EMAIL.test(campos.email.trim())) novosErros.email = 'Informe um e-mail válido';
    if (!campos.bairro.trim()) novosErros.bairro = 'Informe seu bairro';
    if (campos.senha.length < 6) novosErros.senha = 'A senha deve ter pelo menos 6 caracteres';
    if (campos.confirmarSenha !== campos.senha)
      novosErros.confirmarSenha = 'As senhas não conferem';
    setErrosCampos(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function aoCadastrar() {
    setErro(null);
    if (!validar()) return;
    setEnviando(true);
    try {
      await cadastrar({
        nome: campos.nome.trim(),
        email: campos.email.trim().toLowerCase(),
        senha: campos.senha,
        telefone: campos.telefone?.trim() || undefined,
        bairro: campos.bairro.trim(),
        perfil,
      });
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
            <Text style={tipografia.titulo}>Criar conta</Text>
            <Text style={tipografia.legenda}>Escolha como você quer participar da rede.</Text>
          </View>

          <View style={styles.perfis}>
            <ChipFiltro
              rotulo="Quero receber"
              selecionado={perfil === 'BENEFICIARIO'}
              onPress={() => setPerfil('BENEFICIARIO')}
            />
            <ChipFiltro
              rotulo="Quero doar"
              selecionado={perfil === 'DOADOR'}
              onPress={() => setPerfil('DOADOR')}
            />
          </View>

          <CampoTexto
            rotulo="Nome"
            icone="person-outline"
            placeholder="Nome completo ou do estabelecimento"
            value={campos.nome}
            onChangeText={(valor) => alterar('nome', valor)}
            erro={errosCampos.nome}
          />
          <CampoTexto
            rotulo="E-mail"
            icone="mail-outline"
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={campos.email}
            onChangeText={(valor) => alterar('email', valor)}
            erro={errosCampos.email}
          />
          <CampoTexto
            rotulo="Telefone (opcional)"
            icone="call-outline"
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
            value={campos.telefone}
            onChangeText={(valor) => alterar('telefone', valor)}
          />
          <CampoTexto
            rotulo="Bairro"
            icone="location-outline"
            placeholder="Ex.: Mooca"
            value={campos.bairro}
            onChangeText={(valor) => alterar('bairro', valor)}
            erro={errosCampos.bairro}
          />
          <CampoTexto
            rotulo="Senha"
            icone="lock-closed-outline"
            placeholder="Mínimo de 6 caracteres"
            senha
            value={campos.senha}
            onChangeText={(valor) => alterar('senha', valor)}
            erro={errosCampos.senha}
          />
          <CampoTexto
            rotulo="Confirmar senha"
            icone="lock-closed-outline"
            placeholder="Repita a senha"
            senha
            value={campos.confirmarSenha}
            onChangeText={(valor) => alterar('confirmarSenha', valor)}
            erro={errosCampos.confirmarSenha}
          />

          {erro && <MensagemErro mensagem={erro} />}
          <Botao titulo="Cadastrar" onPress={aoCadastrar} carregando={enviando} icone="checkmark" />
          <Botao titulo="Já tenho conta" onPress={() => router.back()} variante="texto" />
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
    padding: espacamentos.xl,
    gap: espacamentos.lg,
  },
  cabecalho: {
    gap: espacamentos.xs,
  },
  perfis: {
    flexDirection: 'row',
    gap: espacamentos.sm,
  },
});
