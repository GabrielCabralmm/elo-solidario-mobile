export type Perfil = 'DOADOR' | 'BENEFICIARIO' | 'ADMIN';
export type StatusDoacao = 'DISPONIVEL' | 'RESERVADA' | 'CONCLUIDA' | 'CANCELADA' | 'VENCIDA';
export type StatusReserva = 'PENDENTE' | 'CONCLUIDA' | 'CANCELADA';
export type Unidade = 'UN' | 'KG' | 'L' | 'PCT';
export type Conservacao = 'AMBIENTE' | 'REFRIGERADO' | 'CONGELADO';

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  telefone?: string | null;
  bairro: string;
};

export type TokenResponse = {
  token: string;
  tipo: string;
  expiraEmSegundos: number;
  usuario: Usuario;
};

export type RegistroRequest = {
  nome: string;
  email: string;
  senha: string;
  perfil: Exclude<Perfil, 'ADMIN'>;
  telefone?: string;
  bairro: string;
};

export type PaginaJava<T> = {
  content: T[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
};

export type PaginaDotnet<T> = {
  itens: T[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type Categoria = {
  id: number;
  nome: string;
  perecivel: boolean;
  quantidadeAlimentos: number;
};

export type Alimento = {
  id: number;
  nome: string;
  idCategoria: number;
  categoria: string;
  perecivel: boolean;
  conservacao: Conservacao;
  calorias100g: number;
  ativo: boolean;
  orientacaoConservacao: string;
};

export type ItemDoacao = {
  id: number;
  idAlimento: number;
  alimento: string;
  categoria: string;
  conservacao: Conservacao;
  quantidade: number;
  unidade: Unidade;
  pesoKg: number;
  dtValidade: string;
};

export type Doacao = {
  id: number;
  titulo: string;
  bairro: string;
  localRetirada: string;
  observacao: string | null;
  status: StatusDoacao;
  dtPublicacao: string;
  idDoador: number;
  doador: string;
  pesoTotalKg: number;
  venceEm: string | null;
  itens: ItemDoacao[];
};

export type ItemDoacaoRequest = {
  idAlimento: number;
  quantidade: number;
  unidade: Unidade;
  pesoKg: number;
  dtValidade: string;
};

export type DoacaoRequest = {
  titulo: string;
  bairro: string;
  localRetirada: string;
  observacao?: string;
  itens: ItemDoacaoRequest[];
};

export type Reserva = {
  id: number;
  idDoacao: number;
  doacao: string;
  localRetirada: string;
  idBeneficiario: number;
  beneficiario: string;
  status: StatusReserva;
  dtReserva: string;
  dtRetirada: string | null;
  observacao: string | null;
};

export type Notificacao = {
  id: number;
  tipo: 'RESERVA_CRIADA' | 'RESERVA_CONCLUIDA' | 'RESERVA_CANCELADA';
  mensagem: string;
  lida: boolean;
  dtCriacao: string;
  idReserva: number | null;
};

export type ItemSugerido = {
  idAlimento: number;
  alimento: string;
  categoria: string;
  conservacao: Conservacao;
  quantidade: number;
  unidade: Unidade;
  pesoKgEstimado: number;
};

export type SugestaoDoacao = {
  tituloSugerido: string;
  itens: ItemSugerido[];
  naoReconhecidos: string[];
  orientacoes: string[];
  aviso: string;
};

export type ImpactoCategoria = {
  categoria: string;
  itensEntregues: number;
  totalKg: number;
  totalKcal: number;
};

export type Impacto = {
  doacoesConcluidas: number;
  doacoesDisponiveis: number;
  alimentosDestinadosKg: number;
  energiaEstimadaKcal: number;
  beneficiariosAtendidos: number;
  refeicoesEstimadas: number;
  porCategoria: ImpactoCategoria[];
};

export type ImpactoDoador = {
  idDoador: number;
  nome: string;
  doacoesConcluidas: number;
  totalKgDoado: number;
  energiaEstimadaKcal: number;
  selo: string;
};

export type DoacaoUrgente = {
  idDoacao: number;
  titulo: string;
  bairro: string;
  localRetirada: string;
  alimentos: string;
  venceEm: string;
  diasParaVencer: number;
  alerta: string;
};
