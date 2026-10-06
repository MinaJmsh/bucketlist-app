import React, { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";

// Seeded random so the wobble stays the same on every re-render
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function wobblyPath(w: number, h: number, seed: number, rough: number) {
  const r = rng(seed);
  const pad = rough * 2 + 2;
  const x0 = pad,
    y0 = pad,
    x1 = w - pad,
    y1 = h - pad;

  const corners: [number, number][] = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];

  let d = `M ${x0} ${y0}`;
  let dir = 1;

  for (let i = 0; i < 4; i++) {
    const [ax, ay] = corners[i];
    const [bx, by] = corners[(i + 1) % 4];
    const len = Math.hypot(bx - ax, by - ay);
    const segs = Math.max(2, Math.round(len / 50));
    // Unit normal: wobble pushes the line sideways only
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;

    for (let s = 0; s < segs; s++) {
      const tMid = (s + 0.5) / segs;
      const tEnd = (s + 1) / segs;

      // Alternate direction each bump, with some random strength
      dir *= -1;
      const off = dir * rough * 1.5 * (0.6 + 0.4 * r());
      const cx = ax + (bx - ax) * tMid + nx * off;
      const cy = ay + (by - ay) * tMid + ny * off;
      const ex = ax + (bx - ax) * tEnd;
      const ey = ay + (by - ay) * tEnd;
      d += ` Q ${cx} ${cy} ${ex} ${ey}`;
    }
  }
  return d + " Z";
}

interface WobblyBoxProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  roughness?: number; // how wiggly (px)
  seed?: number; // change for a different squiggle
}

export default function WobblyBox({
  children,
  style,
  stroke = "#5a4a42",
  fill = "transparent",
  strokeWidth = 2,
  roughness = 0.9,
  seed = 1,
}: WobblyBoxProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  const d = useMemo(() => {
    if (!size.w || !size.h) return null;
    return wobblyPath(size.w, size.h, seed, roughness);
  }, [size, seed, roughness]);

  return (
    <View onLayout={onLayout} style={style}>
      {d && (
        <Svg
          width={size.w}
          height={size.h}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </Svg>
      )}
      {children}
    </View>
  );
}
