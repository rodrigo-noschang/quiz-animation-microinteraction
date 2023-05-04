import { useEffect } from 'react';
import { Text, View, BackHandler, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Button } from '../../components/Button';
import { Stars } from '../../components/Stars';

import { styles } from './styles';

interface Params {
  total: string;
  points: string;
}

export function Finish() {
  const route = useRoute();
  const { points, total } = route.params as Params;

  const { navigate } = useNavigation();

  function handleStop() {
    Alert.alert('Sair', 'Deseja voltar para o início?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () => navigate('home')
      },
    ]);

    return true;
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleStop);

    return () => backHandler.remove();
  }, [])

  return (
    <View style={styles.container}>

      <Stars />

      <View style={styles.message}>
        <Text style={styles.title}>
          Parabéns!
        </Text>

        <Text style={styles.subtitle}>
          Você acertou {points} de {total} questões
        </Text>
      </View>

      <Button
        title="Ir para o início"
        onPress={() => navigate('home')}
      />
    </View>
  );
}