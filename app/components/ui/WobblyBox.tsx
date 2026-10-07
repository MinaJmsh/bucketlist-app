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

// turn any string (like an id) into a stable seed number
export const hashSeed = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

// the outline always sits BEHIND the content, so icons and text stay visible
const behind = {
  ...StyleSheet.absoluteFillObject,
  zIndex: -1,
};

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

/* ---------- Box (cards, sheets, buttons, pages) ---------- */

interface WobblyBoxProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  roughness?: number;
  seed?: number;
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
        <Svg width={size.w} height={size.h} style={behind} pointerEvents="none">
          <Path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </Svg>
      )}
      {children}
    </View>
  );
}

/* ---------- Circle (checkboxes, round icon buttons) ---------- */

interface WobblyCircleProps {
  size: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  roughness?: number;
  seed?: number;
}

export function WobblyCircle({
  size,
  children,
  style,
  stroke = "#5a4a42",
  fill = "transparent",
  strokeWidth = 2,
  roughness = 0.8,
  seed = 1,
}: WobblyCircleProps) {
  const d = useMemo(() => {
    const r = rng(seed);
    const n = 10;
    const c = size / 2;
    const base = c - strokeWidth - roughness;
    const pts: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const rad = base + (r() - 0.5) * 2 * roughness;
      pts.push([c + Math.cos(a) * rad, c + Math.sin(a) * rad]);
    }
    const mid = (a: number[], b: number[]) => [
      (a[0] + b[0]) / 2,
      (a[1] + b[1]) / 2,
    ];
    const start = mid(pts[n - 1], pts[0]);
    let path = `M ${start[0]} ${start[1]}`;
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const m = mid(p, pts[(i + 1) % n]);
      path += ` Q ${p[0]} ${p[1]} ${m[0]} ${m[1]}`;
    }
    return path + " Z";
  }, [size, strokeWidth, roughness, seed]);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Svg width={size} height={size} style={behind} pointerEvents="none">
        <Path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      </Svg>
      {children}
    </View>
  );
}

/* ---------- Line (notebook rules, input underlines) ---------- */

const LINE_H = 6;

interface WobblyLineProps {
  style?: StyleProp<ViewStyle>;
  stroke?: string;
  strokeWidth?: number;
  roughness?: number;
  seed?: number;
}

export function WobblyLine({
  style,
  stroke = "#D9CDB4",
  strokeWidth = 1.5,
  roughness = 1.2,
  seed = 1,
}: WobblyLineProps) {
  const [w, setW] = useState(0);

  const d = useMemo(() => {
    if (!w) return null;
    const r = rng(seed);
    const segs = Math.max(2, Math.round(w / 50));
    const mid = LINE_H / 2;
    let dir = 1;
    let path = `M 0 ${mid}`;
    for (let i = 0; i < segs; i++) {
      dir *= -1;
      const off = dir * roughness * 1.5 * (0.6 + 0.4 * r());
      const xa = (w / segs) * i;
      const xb = (w / segs) * (i + 1);
      path += ` Q ${(xa + xb) / 2} ${mid + off} ${xb} ${mid}`;
    }
    return path;
  }, [w, roughness, seed]);

  return (
    <View
      style={[{ height: LINE_H }, style]}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      pointerEvents="none"
    >
      {d && (
        <Svg width={w} height={LINE_H}>
          <Path
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        </Svg>
      )}
    </View>
  );
}
