import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { ALTURA_MINIMA_TOQUE, cores, espacamentos, fontes, raios, tipografia } from '@/theme';

type CampoTextoProps = TextInputProps & {
  rotulo: string;
  erro?: string;
  icone?: keyof typeof Ionicons.glyphMap;
  senha?: boolean;
};

export function CampoTexto({
  rotulo,
  erro,
  icone,
  senha = false,
  style,
  ...props
}: CampoTextoProps) {
  const [focado, setFocado] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const corBorda = erro ? cores.erro : focado ? cores.primaria : cores.borda;

  return (
    <View style={styles.container}>
      <Text style={tipografia.rotulo}>{rotulo}</Text>
      <View style={[styles.caixa, { borderColor: corBorda }]}>
        {icone && <Ionicons name={icone} size={20} color={cores.textoSecundario} />}
        <TextInput
          accessibilityLabel={rotulo}
          placeholderTextColor={cores.desabilitado}
          secureTextEntry={senha && !senhaVisivel}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          style={[styles.entrada, style]}
          {...props}
        />
        {senha && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setSenhaVisivel((valor) => !valor)}
            hitSlop={12}
          >
            <Ionicons
              name={senhaVisivel ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={cores.textoSecundario}
            />
          </Pressable>
        )}
      </View>
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: espacamentos.xs,
  },
  caixa: {
    minHeight: ALTURA_MINIMA_TOQUE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    borderWidth: 1.5,
    borderRadius: raios.md,
    backgroundColor: cores.superficie,
    paddingHorizontal: espacamentos.md,
  },
  entrada: {
    flex: 1,
    fontFamily: fontes.regular,
    fontSize: 15,
    color: cores.texto,
    paddingVertical: espacamentos.sm,
  },
  erro: {
    ...tipografia.legenda,
    color: cores.erro,
  },
});
