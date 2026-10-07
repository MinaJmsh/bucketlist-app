import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";
import { GRID_LINE } from "../../config/paper";
import { STICKERS } from "../../config/stickers";

export function GridPaper() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <Path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke={GRID_LINE}
              strokeWidth="1.2"
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grid)" />
      </Svg>
    </View>
  );
}

// tiny seeded "random" so stickers stay put between renders
const rand = (n: number) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export function StickerLayer({
  count,
  seed = 0,
}: {
  count: number;
  seed?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const n = i + seed * 13;
        const source = STICKERS[Math.floor(rand(n + 1) * STICKERS.length)];
        const side = 4 + rand(n + 9) * 10;
        const size = 50 + rand(n + 5) * 22; // 48 to 70 px
        return (
          <View
            key={i}
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 30 + i * 230 + rand(n + 7) * 70,
              ...(i % 2 === 1 ? { left: side } : { right: side }),
              transform: [{ rotate: `${(rand(n + 3) - 0.5) * 50}deg` }],
            }}
          >
            <Image
              source={source}
              contentFit="contain"
              style={{ width: size, height: size }}
            />
          </View>
        );
      })}
    </>
  );
}
