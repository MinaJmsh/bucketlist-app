import { Image } from "expo-image";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";
import { BG_STICKERS } from "../../config/bgStickers";
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

// stable number from any string (like an id + a suffix)
const hashString = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

/* ---------- one sticker stuck on a corner of something ---------- */

// Position it with `style` (top/right/bottom/left, usually negative so it
// overhangs the edge). Use it only on spots that never hold text.
export function CornerSticker({
  stickerKey,
  size = 60,
  style,
}: {
  stickerKey: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const h = hashString(stickerKey);
  const source = STICKERS[h % STICKERS.length];
  const tilt = (rand(h) - 0.5) * 50; // -25 to 25 degrees

  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          zIndex: 4,
          transform: [{ rotate: `${tilt}deg` }],
        },
        style,
      ]}
    >
      <Image
        source={source}
        contentFit="contain"
        style={{ width: size, height: size }}
      />
    </View>
  );
}

export function StickerLayer({
  count,
  seed = 0,
  height,
}: {
  count: number;
  seed?: number;
  // height of the area to decorate. When given, the stickers are spread
  // evenly over it (so they follow the content); without it they are
  // spaced at fixed distances like before.
  height?: number;
}) {
  // vertical slot each sticker gets when the height is known
  const step = height ? Math.max(60, (height - 60) / count) : 230;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const n = i + seed * 13;
        const source = STICKERS[Math.floor(rand(n + 1) * STICKERS.length)];
        const side = 4 + rand(n + 9) * 10;
        const size = 50 + rand(n + 5) * 22; // 48 to 70 px
        const top = height
          ? 20 + i * step + rand(n + 7) * step * 0.6
          : 30 + i * 230 + rand(n + 7) * 70;
        return (
          <View
            key={i}
            pointerEvents="none"
            style={{
              position: "absolute",
              top,
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

/* ---------- app background: gingham + scattered stickers ---------- */

// tweak these to change the gingham look
const GINGHAM_BASE = "#9AA07E"; // cream squares
const GINGHAM_STRIPE = "#E6E3D0"; // sage stripes
const GINGHAM_OPACITY = 0.4; // how strong the stripes are
const GINGHAM_TILE = 40; // size of one repeat (two checks wide)

// classic gingham: a vertical and a horizontal translucent stripe per tile,
// so the crossings come out darker
export function GinghamBackground() {
  const half = GINGHAM_TILE / 2;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="gingham"
            width={GINGHAM_TILE}
            height={GINGHAM_TILE}
            patternUnits="userSpaceOnUse"
          >
            <Rect
              x={0}
              y={0}
              width={GINGHAM_TILE}
              height={GINGHAM_TILE}
              fill={GINGHAM_BASE}
            />
            <Rect
              x={0}
              y={0}
              width={half}
              height={GINGHAM_TILE}
              fill={GINGHAM_STRIPE}
              fillOpacity={GINGHAM_OPACITY}
            />
            <Rect
              x={0}
              y={0}
              width={GINGHAM_TILE}
              height={half}
              fill={GINGHAM_STRIPE}
              fillOpacity={GINGHAM_OPACITY}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#gingham)" />
      </Svg>
    </View>
  );
}

// Stickers scattered over the whole screen. Put it BEFORE the page in the
// tree so the paper covers it: stickers only peek out around the edges and in
// the header. The first `headerCount` stickers go in the header band.
//
// To stop stickers piling up, each one is placed with "best candidate"
// sampling: try several random spots and keep the one farthest from the
// stickers already placed. Still random-looking, but evenly spread.
export function BackgroundStickers({
  count = 60,
  headerCount = 7,
  headerHeight = 170,
}: {
  count?: number;
  headerCount?: number;
  headerHeight?: number;
}) {
  const { width, height } = useWindowDimensions();

  const items = React.useMemo(() => {
    const placed: { cx: number; cy: number; r: number }[] = [];

    return Array.from({ length: count }).map((_, i) => {
      const n = i * 7 + 101;
      const size = 40 + rand(n + 5) * 24; // 40 to 64 px
      const yMin = 0;
      const yMax = i < headerCount ? headerHeight : height;

      let best = { left: 0, top: 0, cx: 0, cy: 0 };
      let bestGap = -Infinity;
      for (let k = 0; k < 14; k++) {
        const m = i * 53 + k * 17 + 7;
        const left = rand(m + 1) * (width - size);
        const top = yMin + rand(m + 2) * Math.max(1, yMax - yMin - size);
        const cx = left + size / 2;
        const cy = top + size / 2;
        // gap to the nearest placed sticker (negative = overlapping)
        let gap = Infinity;
        for (const q of placed) {
          gap = Math.min(
            gap,
            Math.hypot(cx - q.cx, cy - q.cy) - q.r - size / 2,
          );
        }
        if (gap > bestGap) {
          bestGap = gap;
          best = { left, top, cx, cy };
        }
      }
      placed.push({ cx: best.cx, cy: best.cy, r: size / 2 });

      return {
        key: i,
        source: BG_STICKERS[Math.floor(rand(n + 1) * BG_STICKERS.length)],
        size,
        top: best.top,
        left: best.left,
        rotate: (rand(n + 3) - 0.5) * 70,
      };
    });
  }, [count, headerCount, headerHeight, width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((it) => (
        <View
          key={it.key}
          style={{
            position: "absolute",
            top: it.top,
            left: it.left,
            transform: [{ rotate: `${it.rotate}deg` }],
          }}
        >
          <Image
            source={it.source}
            contentFit="contain"
            style={{ width: it.size, height: it.size }}
          />
        </View>
      ))}
    </View>
  );
}

// a piece of the gingham, shifted so it lines up with the full-screen one.
// offsetX/offsetY = where this patch sits on screen. id must be unique
// (web shares svg ids across the whole page).
export function GinghamPatch({
  id,
  offsetX,
  offsetY,
}: {
  id: string;
  offsetX: number;
  offsetY: number;
}) {
  const half = GINGHAM_TILE / 2;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id={id}
            x={-offsetX}
            y={-offsetY}
            width={GINGHAM_TILE}
            height={GINGHAM_TILE}
            patternUnits="userSpaceOnUse"
          >
            <Rect
              width={GINGHAM_TILE}
              height={GINGHAM_TILE}
              fill={GINGHAM_BASE}
            />
            <Rect
              width={half}
              height={GINGHAM_TILE}
              fill={GINGHAM_STRIPE}
              fillOpacity={GINGHAM_OPACITY}
            />
            <Rect
              width={GINGHAM_TILE}
              height={half}
              fill={GINGHAM_STRIPE}
              fillOpacity={GINGHAM_OPACITY}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
