import { ThemedText } from "@/components/themed-text";
import { Heart, Sparkles } from "@sketchyicons/react-native";
import { Image } from "expo-image";
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
import { MARGIN_LINE, PAPER, RULE_LINE } from "../../config/paper";
import { theme } from "../../config/theme";
import { pickTape } from "../../config/washi";
import { CornerSticker } from "./PaperDecor";
import WobblyBox, { WobblyLine } from "./ui/WobblyBox";

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
const TOP_INSET =
  Platform.OS === "ios" ? 54 : (StatusBar.currentHeight ?? 24) + 6;
const HOLES = 7;
const TILTS = [-1.2, 0.8, -0.6, 1, -0.9];

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

  const bottomInset = Math.max(
    insets.bottom,
    Platform.OS === "android" ? 24 : 0,
  );

  const tape = pickTape("side-menu");

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
        style={[
          styles.drawer,
          {
            paddingBottom: 20 + bottomInset,
            transform: [{ translateX: slide }],
          },
        ]}
      >
        <WobblyBox
          style={styles.page}
          fill={PAPER}
          stroke={theme.colors.border}
          strokeWidth={2.5}
          seed={7}
        >
          <View style={styles.holes} pointerEvents="none">
            {Array.from({ length: HOLES }).map((_, i) => (
              <View key={i} style={styles.hole} />
            ))}
          </View>

          <View style={styles.marginLine} pointerEvents="none" />

          <Image
            source={tape.source}
            contentFit="contain"
            pointerEvents="none"
            style={[
              styles.tape,
              { transform: [{ rotate: `${tape.rotate}deg` }] },
            ]}
          />

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <ThemedText style={styles.title}>our notebook</ThemedText>
              <Sparkles size={18} color={theme.colors.textSecondary} />
            </View>

            <WobblyLine
              stroke={theme.colors.border}
              strokeWidth={2}
              seed={91}
            />

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

                    <WobblyLine
                      stroke={RULE_LINE}
                      strokeWidth={2}
                      seed={100 + i}
                    />
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
            style={{ bottom: -6, right: -4 }}
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
    paddingTop: TOP_INSET - 14,
    paddingRight: 6,
  },
  page: {
    flex: 1,
  },
  tape: {
    position: "absolute",
    top: -8,
    alignSelf: "center",
    width: 100,
    height: 28,
    zIndex: 3,
  },
  holes: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 10,
    justifyContent: "space-around",
    paddingVertical: 28,
  },
  hole: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: "#D9CDB4",
  },
  marginLine: {
    position: "absolute",
    top: 8,
    bottom: 8,
    left: 36,
    width: 2,
    backgroundColor: MARGIN_LINE,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingTop: 30,
    paddingLeft: 48,
    paddingRight: 16,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    marginTop: 4,
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
    backgroundColor: "rgba(255, 224, 102, 0.55)",
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
