import { isAxiosError } from 'axios';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { definirAcaoSessaoExpirada, definirToken } from '@/services/api';
import * as authService from '@/services/authService';
import { lerSessao, limparSessao, salvarSessao } from '@/storage/sessao';
import { RegistroRequest, TokenResponse, Usuario } from '@/types/api';

type AuthContextoValor = {
  usuario: Usuario | null;
  carregandoSessao: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (dados: RegistroRequest) => Promise<void>;
  sair: () => Promise<void>;
};

const AuthContexto = createContext<AuthContextoValor | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  const sair = useCallback(async () => {
    definirToken(null);
    await limparSessao();
    setUsuario(null);
  }, []);

  const iniciarSessao = useCallback(async ({ token, usuario: dados }: TokenResponse) => {
    definirToken(token);
    await salvarSessao(token, dados);
    setUsuario(dados);
  }, []);

  useEffect(() => {
    definirAcaoSessaoExpirada(() => {
      sair();
    });

    async function restaurarSessao() {
      try {
        const sessao = await lerSessao();
        if (sessao) {
          definirToken(sessao.token);
          setUsuario(sessao.usuario);
          const atualizado = await authService.buscarUsuarioLogado();
          setUsuario(atualizado);
        }
      } catch (erro) {
        if (isAxiosError(erro) && erro.response?.status === 401) {
          await sair();
        }
      } finally {
        setCarregandoSessao(false);
      }
    }

    restaurarSessao();
    return () => definirAcaoSessaoExpirada(null);
  }, [sair]);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      await iniciarSessao(await authService.entrar(email.trim().toLowerCase(), senha));
    },
    [iniciarSessao],
  );

  const cadastrar = useCallback(
    async (dados: RegistroRequest) => {
      await iniciarSessao(await authService.cadastrar(dados));
    },
    [iniciarSessao],
  );

  const valor = useMemo(
    () => ({ usuario, carregandoSessao, entrar, cadastrar, sair }),
    [usuario, carregandoSessao, entrar, cadastrar, sair],
  );

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContexto);
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return contexto;
}
