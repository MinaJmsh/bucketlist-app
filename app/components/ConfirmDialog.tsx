import { ThemedText } from "@/components/themed-text";
import { Scissors } from "@sketchyicons/react-native";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { PAPER } from "../../config/paper";
import { theme } from "../../config/theme";
import { pickTape } from "../../config/washi";
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
  if (!visible) return null;

  // random washi tape, stable for a given dialog title
  const tape = pickTape(title);

  return (
    <View style={styles.backdrop}>
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
          size={32}
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
              <ThemedText style={styles.confirmText}>{confirmLabel}</ThemedText>
            </WobblyBox>
          </TouchableOpacity>
        </View>
      </WobblyBox>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    zIndex: 10,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 20,
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
    fontSize: 26,
    textAlign: "center",
    color: theme.colors.textPrimary,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 18,
  },
  buttons: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  buttonWrap: {
    flex: 1,
  },
  button: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  confirmText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
