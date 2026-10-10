import { ThemedText } from "@/components/themed-text";
import { Scissors } from "@sketchyicons/react-native";
import { Image } from "expo-image";
import React from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { PAPER } from "../../config/paper";
import { theme } from "../../config/theme";
import { pickTape } from "../../config/washi";
import { useModalAnimation } from "./ui/useModalAnimation";
import WobblyBox from "./ui/WobblyBox";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Render this as the LAST child inside a modal's overlay so it sits on top.
export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Tear out",
  cancelLabel = "Keep it",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { mounted, backdropStyle, popStyle } = useModalAnimation(visible);

  if (!mounted) return null;

  // random washi tape, stable for a given dialog title
  const tape = pickTape(title);

  return (
    <View style={styles.root} pointerEvents={visible ? "auto" : "none"}>
      {/* dim background fades in */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
        pointerEvents="none"
      />

      {/* the card pops in */}
      <Animated.View style={[styles.cardWrap, popStyle]}>
        <WobblyBox
          style={styles.card}
          fill={PAPER}
          stroke={theme.colors.border}
          strokeWidth={2.5}
          seed={21}
        >
          <Image
            source={tape.source}
            contentFit="contain"
            style={[
              styles.tape,
              { transform: [{ rotate: `${tape.rotate}deg` }] },
            ]}
            pointerEvents="none"
          />
          <Scissors
            size={28}
            color={theme.colors.textPrimary}
            style={{ marginBottom: 4 }}
          />
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.buttonWrap}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <WobblyBox
                style={styles.button}
                fill="white"
                stroke={theme.colors.border}
                strokeWidth={2.5}
                seed={22}
              >
                <ThemedText style={styles.cancelText}>{cancelLabel}</ThemedText>
              </WobblyBox>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonWrap}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <WobblyBox
                style={styles.button}
                fill="#D9534F"
                stroke="#D9534F"
                strokeWidth={2.5}
                seed={23}
              >
                <ThemedText style={styles.confirmText}>
                  {confirmLabel}
                </ThemedText>
              </WobblyBox>
            </TouchableOpacity>
          </View>
        </WobblyBox>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    zIndex: 10,
    elevation: 1001,
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  // animated wrapper: owns the width limits
  cardWrap: {
    width: "100%",
    maxWidth: 320,
  },
  card: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 18,
    alignItems: "center",
  },
  // washi tape image (rotation is set in the component)
  tape: {
    position: "absolute",
    top: -14,
    alignSelf: "center",
    width: 90,
    height: 30,
    zIndex: 2,
  },
  title: {
    fontFamily: "IndieFlower",
    fontSize: 22,
    lineHeight: 30,
    textAlign: "center",
    color: theme.colors.textPrimary,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  buttons: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  buttonWrap: {
    flex: 1,
  },
  button: {
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 20,
  },
  confirmText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 20,
  },
});
