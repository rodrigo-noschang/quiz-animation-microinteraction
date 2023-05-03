import { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, 
    { useSharedValue, 
    useAnimatedStyle, 
    withSequence, 
    withTiming,
    runOnJS 
} from "react-native-reanimated";
import { Canvas, Rect, BlurMask } from "@shopify/react-native-skia";

import { THEME } from '../../styles/theme';

const STATUS_COLORS = ['transparent', THEME.COLORS.BRAND_LIGHT, THEME.COLORS.DANGER_LIGHT];

type Props = {
    status: number
}

export function OverlayFeedback({ status }: Props) {
    const opacity = useSharedValue(0);

    const { width, height } = useWindowDimensions();

    const opacityAnimation = useAnimatedStyle(() => {
        return {
            opacity: opacity.value
        }
    })

    useEffect(() => {
        opacity.value = withSequence(
            withTiming(1),
            withTiming(0)
        )
    }, [status]);

    return (
        <Animated.View style = {[{ width, height, position: 'absolute' }, opacityAnimation]}>
            <Canvas style = {{flex: 1}}>
                <Rect 
                    x = {0}
                    y = {0}
                    width = {width}
                    height = {height}
                    color = {STATUS_COLORS[status]}
                >
                    <BlurMask blur = {50}/>
                </Rect>
            </Canvas>
        </Animated.View>
    )

}