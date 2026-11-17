import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CampoTexto } from '@/components/CampoTexto';
import { Carregando } from '@/components/Carregando';
import { MensagemErro } from '@/components/MensagemErro';
import { listarAlimentos } from '@/services/catalogoService';
import { ALTURA_MINIMA_TOQUE, cores, espacamentos, raios, tipografia } from '@/theme';
import { Alimento } from '@/types/api';
import { mensagemDeErro } from '@/utils/erros';

type SeletorAlimentoProps = {
  visivel: boolean;
  aoFechar: () => void;
  aoSelecionar: (alimento: Alimento) => void;
};

export function SeletorAlimento({ visivel, aoFechar, aoSelecionar }: SeletorAlimentoProps) {
  const [busca, setBusca] = useState('');
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!visivel) return;
    const espera = setTimeout(() => {
      setCarregando(true);
      setErro(null);
      listarAlimentos(busca.trim())
        .then(setAlimentos)
        .catch((falha) => setErro(mensagemDeErro(falha)))
        .finally(() => setCarregando(false));
    }, 300);
    return () => clearTimeout(espera);
  }, [busca, visivel]);

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={aoFechar}>
      <SafeAreaView style={styles.tela}>
        <View style={styles.topo}>
          <Text style={tipografia.subtitulo}>Escolha o alimento</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar"
            onPress={aoFechar}
            hitSlop={12}
          >
            <Ionicons name="close" size={28} color={cores.texto} />
          </Pressable>
        </View>
        <View style={styles.busca}>
          <CampoTexto
            rotulo="Buscar no catálogo"
            icone="search-outline"
            placeholder="Ex.: arroz"
            value={busca}
            onChangeText={setBusca}
            autoFocus
          />
        </View>
        {erro && <MensagemErro mensagem={erro} />}
        {carregando ? (
          <Carregando mensagem="Buscando alimentos..." />
        ) : (
          <FlatList
            data={alimentos}
            keyExtractor={(alimento) => String(alimento.id)}
            contentContainerStyle={styles.lista}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.opcao, pressed && styles.pressionado]}
                onPress={() => {
                  aoSelecionar(item);
                  aoFechar();
                }}
              >
                <View style={styles.opcaoTexto}>
                  <Text style={tipografia.corpoDestaque}>{item.nome}</Text>
                  <Text style={tipografia.legenda}>
                    {item.categoria} · {item.conservacao.toLowerCase()}
                  </Text>
                </View>
                <Ionicons name="add-circle-outline" size={24} color={cores.primaria} />
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={[tipografia.legenda, styles.vazio]}>Nenhum alimento encontrado.</Text>
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: espacamentos.lg,
  },
  busca: {
    paddingHorizontal: espacamentos.lg,
  },
  lista: {
    padding: espacamentos.lg,
    gap: espacamentos.sm,
  },
  opcao: {
    minHeight: ALTURA_MINIMA_TOQUE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    padding: espacamentos.md,
    borderRadius: raios.md,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  pressionado: {
    backgroundColor: cores.primariaClara,
  },
  opcaoTexto: {
    flex: 1,
  },
  vazio: {
    textAlign: 'center',
    padding: espacamentos.xl,
  },
});
