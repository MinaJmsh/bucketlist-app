import { ThemedText } from "@/components/themed-text";
import React, { ComponentType, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { MARGIN_LINE, PAPER } from "../../config/paper";
import { theme } from "../../config/theme";
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

const DRAWER_WIDTH = Math.min(300, Dimensions.get("window").width * 0.8);
const TOP_INSET =
  Platform.OS === "ios" ? 54 : (StatusBar.currentHeight ?? 24) + 6;

// each row gets a tiny different tilt, like it was written by hand
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

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent // add if missing
      navigationBarTranslucent // add if missing
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: fade }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[styles.drawer, { transform: [{ translateX: slide }] }]}
        >
          <WobblyBox
            style={styles.page}
            fill={PAPER}
            stroke={theme.colors.border}
            strokeWidth={2.5}
            seed={7}
          >
            {/* washi tape holding the page up */}
            <View style={styles.tape} pointerEvents="none" />
            {/* margin line */}
            <View style={styles.marginLine} pointerEvents="none" />

            <View style={styles.content}>
              <ThemedText style={styles.title}>our notebook</ThemedText>
              <ThemedText style={styles.subtitle}>
                pick a page to flip to
              </ThemedText>

              <View style={styles.list}>
                {items.map((item, i) => {
                  const Icon = item.icon;
                  const active = item.id === activeId;
                  return (
                    <Pressable
                      key={item.id}
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
                      <Icon size={24} color={theme.colors.textPrimary} />
                      <ThemedText style={styles.rowLabel}>
                        {item.label}
                      </ThemedText>
                      {item.comingSoon && (
                        <View style={styles.sticker}>
                          <ThemedText style={styles.stickerText}>
                            soon!
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <ThemedText style={styles.footer}>made with love ♡</ThemedText>
            </View>
          </WobblyBox>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
    paddingBottom: 24,
    paddingRight: 6,
  },
  page: { flex: 1 },
  tape: {
    position: "absolute",
    top: -2,
    left: DRAWER_WIDTH / 2 - 52,
    width: 90,
    height: 24,
    backgroundColor: "rgba(244, 196, 120, 0.75)",
    transform: [{ rotate: "-3deg" }],
    zIndex: 3,
  },
  marginLine: {
    position: "absolute",
    top: 8,
    bottom: 8,
    left: 40,
    width: 2,
    backgroundColor: MARGIN_LINE,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingTop: 34,
    paddingLeft: 56,
    paddingRight: 18,
    paddingBottom: 20,
  },
  title: {
    fontFamily: "IndieFlower",
    fontSize: 30,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontFamily: "IndieFlower",
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 18,
  },
  list: { gap: 10 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  // highlighter-pen look
  rowActive: {
    backgroundColor: "rgba(255, 224, 102, 0.55)",
  },
  rowDim: { opacity: 0.6 },
  rowLabel: {
    flex: 1,
    fontFamily: "IndieFlower",
    fontSize: 22,
    color: theme.colors.textPrimary,
  },
  sticker: {
    backgroundColor: "#FFD6E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    transform: [{ rotate: "6deg" }],
  },
  stickerText: {
    fontFamily: "IndieFlower",
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  footer: {
    marginTop: "auto",
    fontFamily: "IndieFlower",
    fontSize: 16,
    textAlign: "center",
    color: theme.colors.textSecondary,
    opacity: 0.8,
  },
});
