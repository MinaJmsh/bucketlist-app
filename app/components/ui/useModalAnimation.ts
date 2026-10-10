import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  InteractionManager,
  useWindowDimensions,
} from "react-native";

// Drives the open/close animation of an in-tree overlay (no native Modal).
// `mounted` stays true until the exit animation has finished.
// `onOpened` runs once the opening animation is done (good for focusing inputs).
export function useModalAnimation(visible: boolean, onOpened?: () => void) {
  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const { height } = useWindowDimensions();

  const onOpenedRef = useRef(onOpened);
  onOpenedRef.current = onOpened;

  useEffect(() => {
    progress.stopAnimation();

    if (visible) {
      setMounted(true);

      // Let the content mount and lay out first, then animate. Starting the
      // animation in the same frame as the heavy first render is what
      // makes the opening feel harsh.
      const handle = InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          Animated.timing(progress, {
            toValue: 1,
            duration: 380,
            // soft landing: fast start, long gentle settle
            easing: Easing.bezier(0.22, 1, 0.36, 1),
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) onOpenedRef.current?.();
          });
        });
      });

      return () => handle.cancel();
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible]);

  // dim background fades in/out
  const backdropStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp" as const,
    }),
  };

  // bottom sheet slides up from below the screen
  const slideStyle = {
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [height, 0],
          extrapolate: "clamp" as const,
        }),
      },
    ],
  };

  // centered card pops in: fades, grows slightly, drifts up
  const popStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 0.6, 1],
      outputRange: [0, 1, 1],
      extrapolate: "clamp" as const,
    }),
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
          extrapolate: "clamp" as const,
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.92, 1],
          extrapolate: "clamp" as const,
        }),
      },
    ],
  };

  return { mounted, progress, backdropStyle, slideStyle, popStyle };
}
