import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { HouseLine } from 'phosphor-react-native';
import Animated, { Layout, SlideInLeft, SlideOutRight } from 'react-native-reanimated';

import { Header } from '../../components/Header';
import { HistoryCard, HistoryProps } from '../../components/HistoryCard';

import { styles } from './styles';
import { historyGetAll, historyRemove } from '../../storage/quizHistoryStorage';
import { Loading } from '../../components/Loading';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

export function History() {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryProps[]>([]);

  const { goBack } = useNavigation();

  async function fetchHistory() {
    const response = await historyGetAll();
    setHistory(response);
    setIsLoading(false);
  }

  async function remove(id: string) {
    await historyRemove(id);

    fetchHistory();
  }

  function handleRemove(id: string) {
    Alert.alert(
      'Remover',
      'Deseja remover esse registro?',
      [
        {
          text: 'Sim', onPress: () => remove(id)
        },
        { text: 'Não', style: 'cancel' }
      ]
    );

  }

  useEffect(() => {
    fetchHistory();
  }, []);

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <Header
        title="Histórico"
        subtitle={`Seu histórico de estudos${'\n'}realizados`}
        icon={HouseLine}
        onPress={goBack}
      />

      <ScrollView
        contentContainerStyle={styles.history}
        showsVerticalScrollIndicator={false}
      >
        {
          history.map((item) => (
            <AnimatedTouchableOpacity
              key={item.id}
              entering = {SlideInLeft}
              exiting = {SlideOutRight}
              layout = {Layout.springify()}
              onPress={() => handleRemove(item.id)}
            >
              <HistoryCard data={item} />
            </AnimatedTouchableOpacity>
          ))
        }
      </ScrollView>
    </View>
  );
}