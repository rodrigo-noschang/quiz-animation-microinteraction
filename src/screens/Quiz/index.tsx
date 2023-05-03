import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, 
  useSharedValue, 
  withSequence,
  withTiming,
  interpolate, 
  Easing,
  useAnimatedScrollHandler,
  Extrapolate,
  runOnJS} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { useNavigation, useRoute } from '@react-navigation/native';

import { styles } from './styles';
import { THEME } from '../../styles/theme';

import { QUIZ } from '../../data/quiz';
import { historyAdd } from '../../storage/quizHistoryStorage';
import { getCurrentPoints, updatePoints, clearCurrentPoints } from '../../storage/quizPoints';

import { Loading } from '../../components/Loading';
import { Question } from '../../components/Question';
import { QuizHeader } from '../../components/QuizHeader';
import { ProgressBar } from '../../components/ProgressBar';
import { ConfirmButton } from '../../components/ConfirmButton';
import { OutlineButton } from '../../components/OutlineButton';

interface Params {
  id: string;
}

type QuizProps = typeof QUIZ[0];

const CARD_INCLINATION = 10;
const CARD_SKIP_AREA = (-200);

export function Quiz() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quiz, setQuiz] = useState<QuizProps>({} as QuizProps);
  const [alternativeSelected, setAlternativeSelected] = useState<null | number>(null);

  const shake = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const cardPosition = useSharedValue(0);

  const { navigate } = useNavigation();

  const route = useRoute();
  const { id } = route.params as Params;


  function handleSkipConfirm() {
    Alert.alert('Pular', 'Deseja realmente pular a questão?', [
      { text: 'Sim', onPress: () => handleNextQuestion() },
      { text: 'Não', onPress: () => { } }
    ]);
  }

  async function handleFinished() {
    const points = await getCurrentPoints();

    await historyAdd({
      id: new Date().getTime().toString(),
      title: quiz.title,
      level: quiz.level,
      points,
      questions: quiz.questions.length
    });

    await clearCurrentPoints();

    navigate('finish', {
      points: String(points),
      total: String(quiz.questions.length),
    });
  }

  function handleNextQuestion() {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prevState => prevState + 1)
    } else {
      handleFinished();
    }
  }

  async function handleConfirm() {
    if (alternativeSelected === null) {
      return handleSkipConfirm();
    }
    
    if (quiz.questions[currentQuestion].correct === alternativeSelected) {
      await updatePoints(1);
    } else {
      shakeAnimation();
    }

    setAlternativeSelected(null);

    handleNextQuestion();
  }

  async function resetPointsCountAndReturnHome() {
    await clearCurrentPoints();
    navigate('home');
  }

  function handleStop() {
    Alert.alert('Parar', 'Deseja parar agora?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => await resetPointsCountAndReturnHome()
      },
    ]);

    return true;
  }

  function shakeAnimation() {
    shake.value = withSequence(
      withTiming(3, {duration: 400, easing: Easing.bounce}), 
      withTiming(0)
    );
  }

  const shakeStyleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{
        translateX: interpolate(
          shake.value,
          [0, 0.5, 1, 1.5, 2, 2.5, 3],
          [0, -15, 0, -15, 0, 15, 0]
        )
      }]
    }
  })

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    }
  })

  const fixedProgressBarStyles = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      zIndex: 1,
      paddingTop: 50,
      backgroundColor: THEME.COLORS.GREY_500,
      width: '110%',
      left: '-5%',
      opacity: interpolate(scrollY.value, [50, 90], [0, 1], Extrapolate.CLAMP),
      transform: [
        {translateY: interpolate(scrollY.value, [50, 90], [-40, 0], Extrapolate.CLAMP)}
      ]
    }
  })

  const disappearingHeader = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [60, 90], [1, 0])
    }
  })

  const dragStyle = useAnimatedStyle(() => {
    const rotateZ = cardPosition.value / CARD_INCLINATION;

    return {
      transform: [
        { translateX: cardPosition.value < 0 ? cardPosition.value : interpolate(cardPosition.value, [0, 10], [0, 10], Extrapolate.CLAMP) },
        { rotateZ: cardPosition.value < 0 ? `${rotateZ}deg` : `${interpolate(cardPosition.value, [0, 10], [0, 1], Extrapolate.CLAMP)}deg` }
      ]
    }
  })

  const onPan = Gesture.Pan()
    .activateAfterLongPress(100)
    .onUpdate((event) => {
      if (event.translationX < 0) {
        cardPosition.value = event.translationX;
      } else {
        cardPosition.value = withTiming(10);
      }
    })
    .onEnd((event) => {
      if (event.translationX < CARD_SKIP_AREA) {
        runOnJS(handleSkipConfirm)();
      }
      
      cardPosition.value = withTiming(0)
    })

  useEffect(() => {
    const quizSelected = QUIZ.filter(item => item.id === id)[0];
    setQuiz(quizSelected);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <Animated.View style = {fixedProgressBarStyles}>
        <Text style = {styles.title}> 
          {quiz.title} 
        </Text>

        <ProgressBar 
          current = {currentQuestion + 1}
          total = {quiz.questions.length}
        />

      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.question}
        onScroll={scrollHandler}
        scrollEventThrottle = {16}
      >
        <Animated.View style = {[styles.quizHeader, disappearingHeader]}>
          <QuizHeader
            title={quiz.title}
            currentQuestion={currentQuestion + 1}
            totalOfQuestions={quiz.questions.length}
          />
        </Animated.View>

      {/* Tire o style = {shakeStyleAnimation} porque tava muita animação uma em cima da outra, então ele não faz o shake quando erramos a pergunta mais */}

        <GestureDetector gesture = {onPan}>
          <Animated.View style = {dragStyle}> 
            <Question
              key={quiz.questions[currentQuestion].title}
              question={quiz.questions[currentQuestion]}
              alternativeSelected={alternativeSelected}
              setAlternativeSelected={setAlternativeSelected}
            />
          </Animated.View>
        </GestureDetector>

        <View style={styles.footer}>
          <OutlineButton title="Parar" onPress={handleStop} />
          <ConfirmButton onPress={handleConfirm} />
        </View>
      </Animated.ScrollView>
    </View >
  );
}