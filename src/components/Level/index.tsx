import { useEffect } from 'react';
import { Pressable, PressableProps, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  Easing,
  interpolateColor } from 'react-native-reanimated';

import { THEME } from '../../styles/theme';
import { styles } from './styles';

const TYPE_COLORS = {
  EASY: THEME.COLORS.BRAND_LIGHT,
  HARD: THEME.COLORS.DANGER_LIGHT,
  MEDIUM: THEME.COLORS.WARNING_LIGHT,
}

type Props = PressableProps & {
  title: string;
  isChecked?: boolean;
  type?: keyof typeof TYPE_COLORS;
}

export function Level({ title, type = 'EASY', isChecked = false, ...rest }: Props) {
  const scale = useSharedValue(1);
  const checked = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
      backgroundColor: interpolateColor(
        checked.value,
        [0, 1],
        ['transparent', COLOR]
      )
    }
  })

  const COLOR = TYPE_COLORS[type];

  function onPressIn() {
    scale.value = withTiming(1.1, {duration: 400, easing: Easing.bounce});
  }
  
  function onPressOut() {
    scale.value = withSpring(1);
  }

  useEffect(() => {
    checked.value = isChecked ? 1 : 0;
  }, [isChecked])

  return (
    <Pressable 
      {...rest}
      onPressIn={onPressIn}
      onPressOut={onPressOut}  
    >
      <Animated.View style={
        [
          styles.container,
          { borderColor: COLOR },
          animatedContainerStyle
        ]
      }>
        <Text style={
          [
            styles.title,
            { color: isChecked ? THEME.COLORS.GREY_100 : COLOR }
          ]}>
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
}