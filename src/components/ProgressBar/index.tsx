import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { styles } from './styles';

interface Props {
  total: number;
  current: number;
}

export function ProgressBar({ total, current }: Props) {
  const percentage = Math.round((current / total) * 100);
  const animatedPercentage = useSharedValue(percentage);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedPercentage.value}%`
    }
  })

  useEffect(() => {
    animatedPercentage.value = withTiming(percentage);
  }, [current])

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.progress, animatedProgressStyle]} />
    </View>
  );
}