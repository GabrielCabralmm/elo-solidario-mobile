import { TextStyle } from 'react-native';

import { cores } from './cores';

export const fontes = {
  regular: 'Nunito_400Regular',
  semiBold: 'Nunito_600SemiBold',
  negrito: 'Nunito_700Bold',
  extraNegrito: 'Nunito_800ExtraBold',
} as const;

export const tipografia = {
  titulo: { fontFamily: fontes.extraNegrito, fontSize: 26, lineHeight: 32, color: cores.texto },
  subtitulo: { fontFamily: fontes.negrito, fontSize: 18, lineHeight: 24, color: cores.texto },
  corpo: { fontFamily: fontes.regular, fontSize: 15, lineHeight: 22, color: cores.texto },
  corpoDestaque: { fontFamily: fontes.semiBold, fontSize: 15, lineHeight: 22, color: cores.texto },
  legenda: {
    fontFamily: fontes.regular,
    fontSize: 13,
    lineHeight: 18,
    color: cores.textoSecundario,
  },
  rotulo: { fontFamily: fontes.negrito, fontSize: 13, lineHeight: 18, color: cores.texto },
  botao: { fontFamily: fontes.negrito, fontSize: 16, lineHeight: 22 },
} satisfies Record<string, TextStyle>;
