import { ThemedText } from "@/components/themed-text";
import { Scissors } from "@sketchyicons/react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { PAPER } from "../../config/paper";
import { theme } from "../../config/theme";

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

  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <View style={styles.tape} />
        <Scissors
          size={32}
          color={theme.colors.textPrimary}
          style={{ marginBottom: 4 }}
        />
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <ThemedText style={styles.cancelText}>{cancelLabel}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.confirmButton]}
            onPress={onConfirm}
          >
            <ThemedText style={styles.confirmText}>{confirmLabel}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: PAPER,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: theme.colors.border,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    alignItems: "center",
  },
  tape: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    width: 60,
    height: 20,
    backgroundColor: theme.colors.accent + "99",
    borderRadius: 3,
    transform: [{ rotate: "-2deg" }],
  },
  emoji: {
    fontSize: 32,
    lineHeight: 40,
    marginBottom: 4,
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

  button: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButton: {
    backgroundColor: "white",
    borderWidth: 2.5,
    borderColor: theme.colors.border,
  },

  cancelText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },

  confirmButton: {
    backgroundColor: "#D9534F",
    borderWidth: 2.5,
    borderColor: "#D9534F",
  },

  confirmText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
