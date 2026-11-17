import { StatusDoacao, StatusReserva } from '@/types/api';

export function formatarData(iso: string | null | undefined) {
  if (!iso) {
    return '-';
  }
  const [ano, mes, dia] = iso.substring(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataHora(iso: string) {
  const data = new Date(iso);
  return `${formatarData(iso)} às ${String(data.getHours()).padStart(2, '0')}:${String(
    data.getMinutes(),
  ).padStart(2, '0')}`;
}

export function formatarNumero(valor: number, casas = 0) {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

export function aplicarMascaraData(texto: string) {
  const digitos = texto.replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

export function dataBrParaIso(texto: string) {
  const partes = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!partes) return null;
  const [, dia, mes, ano] = partes;
  const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
  if (data.getDate() !== Number(dia) || data.getMonth() !== Number(mes) - 1) return null;
  return `${ano}-${mes}-${dia}`;
}

export function diasAte(isoData: string) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const [ano, mes, dia] = isoData.substring(0, 10).split('-').map(Number);
  const alvo = new Date(ano, mes - 1, dia);
  return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

export const rotuloStatusDoacao: Record<StatusDoacao, string> = {
  DISPONIVEL: 'Disponível',
  RESERVADA: 'Reservada',
  CONCLUIDA: 'Entregue',
  CANCELADA: 'Cancelada',
  VENCIDA: 'Vencida',
};

export const tomStatusDoacao = {
  DISPONIVEL: 'sucesso',
  RESERVADA: 'info',
  CONCLUIDA: 'neutro',
  CANCELADA: 'erro',
  VENCIDA: 'erro',
} as const;

export const rotuloStatusReserva: Record<StatusReserva, string> = {
  PENDENTE: 'Aguardando retirada',
  CONCLUIDA: 'Retirada',
  CANCELADA: 'Cancelada',
};

export const tomStatusReserva = {
  PENDENTE: 'alerta',
  CONCLUIDA: 'sucesso',
  CANCELADA: 'erro',
} as const;
