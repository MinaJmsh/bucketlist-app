import { ThemedText } from "@/components/themed-text";
import { Heart } from "@sketchyicons/react-native";
import React, { ComponentType, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, Pattern, Rect } from "react-native-svg";
import { theme } from "../../config/theme";
import { CornerSticker } from "./PaperDecor";
import WobblyBox from "./ui/WobblyBox";

export type MenuItem = {
  id: string;
  label: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  comingSoon?: boolean;
};

interface SideMenuProps {
  visible: boolean;
  items: MenuItem[];
  activeId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}

const DRAWER_WIDTH = Math.min(290, Dimensions.get("window").width * 0.78);
const TILTS = [-1.2, 0.8, -0.6, 1, -0.9];

// scrapbook paper look: tweak these
const KRAFT = "#EAD9BB"; // paper color
const KRAFT_DOT = "#cdb68b6f"; // dot pattern
const STITCH = "#B8604C"; // dashed stitching
const DOT_GAP = 18;

// kraft paper dots
function DotPaper() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="side-dots"
            width={DOT_GAP}
            height={DOT_GAP}
            patternUnits="userSpaceOnUse"
          >
            <Circle
              cx={DOT_GAP / 2}
              cy={DOT_GAP / 2}
              r={1.6}
              fill={KRAFT_DOT}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#side-dots)" />
      </Svg>
    </View>
  );
}

// running-stitch border, kept inside the safe areas
function Stitching({ top, bottom }: { top: number; bottom: number }) {
  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", top, bottom, left: 10, right: 12 }}
    >
      <Svg width="100%" height="100%">
        <Rect
          x={1}
          y={1}
          width="99%"
          height="99%"
          rx={10}
          fill="none"
          stroke={STITCH}
          strokeWidth={1.8}
          strokeDasharray="7 5"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

export default function SideMenu({
  visible,
  items,
  activeId,
  onClose,
  onSelect,
}: SideMenuProps) {
  const [mounted, setMounted] = useState(visible);
  const slide = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // the paper goes edge to edge; content stays inside these safe areas
  const topInset = Math.max(
    insets.top,
    Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0,
  );
  const bottomInset = Math.max(
    insets.bottom,
    Platform.OS === "android" ? 24 : 0,
  );

  useEffect(() => {
    if (visible) {
      setMounted(true);

      Animated.parallel([
        Animated.timing(slide, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(slide, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  // Preserve Android hardware-back behavior without a native Modal.
  useEffect(() => {
    if (!mounted || !visible || Platform.OS !== "android") {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onClose();
        return true;
      },
    );

    return () => subscription.remove();
  }, [mounted, visible, onClose]);

  if (!mounted) return null;

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.backdrop, { opacity: fade }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: slide }] }]}
      >
        <WobblyBox
          style={styles.page}
          fill={KRAFT}
          stroke={theme.colors.border}
          strokeWidth={2.5}
          seed={7}
        >
          <DotPaper />
          <Stitching top={topInset + 4} bottom={bottomInset + 4} />

          <View
            style={[
              styles.content,
              { paddingTop: topInset + 22, paddingBottom: bottomInset + 20 },
            ]}
          >
            {/* title on a little paper label */}
            {/* <View style={styles.label}>
              <ThemedText style={styles.title}>our notebook</ThemedText>
              <Sparkles size={18} color={theme.colors.textSecondary} />
            </View> */}

            <ThemedText style={styles.subtitle}>
              pick a page to flip to
            </ThemedText>

            <View style={styles.list}>
              {items.map((item, i) => {
                const Icon = item.icon;
                const active = item.id === activeId;

                return (
                  <View key={item.id}>
                    <Pressable
                      onPress={() => {
                        if (item.comingSoon) return;
                        onSelect(item.id);
                        onClose();
                      }}
                      style={[
                        styles.row,
                        {
                          transform: [
                            { rotate: `${TILTS[i % TILTS.length]}deg` },
                          ],
                        },
                        active && styles.rowActive,
                        item.comingSoon && styles.rowDim,
                      ]}
                    >
                      <Icon size={20} color={theme.colors.textPrimary} />

                      <ThemedText style={styles.rowLabel}>
                        {item.label}
                      </ThemedText>

                      {item.comingSoon && (
                        <View style={styles.soon}>
                          <ThemedText style={styles.soonText}>soon!</ThemedText>
                        </View>
                      )}
                    </Pressable>

                    {/* <WobblyLine
                      stroke={RULE_LINE}
                      strokeWidth={2}
                      seed={100 + i}
                    /> */}
                  </View>
                );
              })}
            </View>

            <View style={styles.footerRow}>
              <ThemedText style={styles.footer}>made with love</ThemedText>
              <Heart size={14} color={theme.colors.primary} />
            </View>
          </View>

          <CornerSticker
            stickerKey="side-menu-sticker"
            size={54}
            style={{ bottom: bottomInset - 6, right: -4 }}
          />
          <CornerSticker
            stickerKey="side-menu-sticker-top"
            size={46}
            style={{ top: topInset + 40, right: -2 }}
          />
        </WobblyBox>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(60, 40, 30, 0.35)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    paddingRight: 6,
  },
  page: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingLeft: 28,
    paddingRight: 24,
  },
  label: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFDF6",
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    transform: [{ rotate: "-2deg" }],
  },
  title: {
    fontFamily: "IndieFlower",
    fontSize: 24,
    lineHeight: 32,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontFamily: "IndieFlower",
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
    marginTop: 10,
    marginBottom: 14,
  },
  list: {
    gap: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  rowActive: {
    backgroundColor: "#b8604c62",
  },
  rowDim: {
    opacity: 0.6,
  },
  rowLabel: {
    flex: 1,
    fontFamily: "IndieFlower",
    fontSize: 18,
    lineHeight: 26,
    color: theme.colors.textPrimary,
  },
  soon: {
    backgroundColor: "#FFD6E0",
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 8,
    transform: [{ rotate: "6deg" }],
  },
  soonText: {
    fontFamily: "IndieFlower",
    fontSize: 12,
    lineHeight: 17,
    paddingRight: 1,
    color: theme.colors.textPrimary,
  },
  footerRow: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingRight: 40,
  },
  footer: {
    fontFamily: "IndieFlower",
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
    opacity: 0.8,
  },
});
