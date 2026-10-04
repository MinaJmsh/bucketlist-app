import { ThemedText } from "@/components/themed-text";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { quickCategories } from "../../config/categories";
import { theme } from "../../config/theme";
import { BucketItem, NewBucketItem } from "../../lib/supabase";
import ConfirmDialog from "./ConfirmDialog";

type Period = "soon" | "someday";

const PERIODS: { key: Period; label: string }[] = [
  { key: "soon", label: "🌷 soon" },
  { key: "someday", label: "🌙 someday" },
];

interface DreamModalProps {
  visible: boolean;
  goal: BucketItem | null; // null = adding a new dream
  onClose: () => void;
  onSave: (values: NewBucketItem) => void;
  onDelete?: () => void;
  onComplete?: () => void;
}

export default function DreamModal({
  visible,
  goal,
  onClose,
  onSave,
  onDelete,
  onComplete,
}: DreamModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("travel");
  const [addedBy, setAddedBy] = useState("A");
  const [period, setPeriod] = useState<Period>("soon");
  const [confirming, setConfirming] = useState(false);

  const editing = !!goal;

  useEffect(() => {
    if (!visible) return;
    setConfirming(false);
    setTitle(goal?.title ?? "");
    setCategory(goal?.category ?? "travel");
    setAddedBy(goal?.added_by ?? "A");
    setPeriod(
      goal?.period === "year" || goal?.period === "someday"
        ? "someday"
        : "soon",
    );
  }, [visible, goal?.id]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), category, added_by: addedBy, period });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.sheet}>
          {/* Header: title + small icon buttons */}
          <View style={styles.headerRow}>
            <ThemedText style={styles.heading}>
              {editing ? "Edit this dream ✏️" : "Write a new dream ✨"}
            </ThemedText>
            <View style={styles.headerActions}>
              {editing && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setConfirming(true)}
                  accessibilityLabel="Tear out this dream"
                >
                  <Text style={styles.iconText}>✂️</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onClose}
                accessibilityLabel="Close"
              >
                <Text style={styles.iconText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What do you dream of?"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
              autoFocus={!editing}
            />

            <ThemedText style={styles.label}>When?</ThemedText>
            <View style={styles.pillRow}>
              {PERIODS.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  onPress={() => setPeriod(p.key)}
                  style={[styles.pill, period === p.key && styles.pillActive]}
                >
                  <ThemedText
                    style={[
                      styles.pillText,
                      period === p.key && styles.pillTextActive,
                    ]}
                  >
                    {p.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={styles.label}>Written by</ThemedText>
            <View style={styles.pillRow}>
              {[
                { key: "A", label: "mina" },
                { key: "B", label: "parsa" },
              ].map((who) => (
                <TouchableOpacity
                  key={who.key}
                  onPress={() => setAddedBy(who.key)}
                  style={[
                    styles.pill,
                    addedBy === who.key && styles.pillActive,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.pillText,
                      addedBy === who.key && styles.pillTextActive,
                    ]}
                  >
                    {who.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={styles.label}>Sticker</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              <View style={styles.categories}>
                {quickCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    style={[
                      styles.categoryButton,
                      category === cat.id && { backgroundColor: cat.color },
                    ]}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <ThemedText
                      style={[
                        styles.categoryText,
                        category === cat.id && styles.categoryTextActive,
                      ]}
                    >
                      {cat.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Footer */}
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.primaryButton, !title.trim() && { opacity: 0.5 }]}
              disabled={!title.trim()}
            >
              <ThemedText style={styles.primaryText}>
                {editing ? "Save changes" : "Write it down"}
              </ThemedText>
            </TouchableOpacity>

            {editing && (
              <TouchableOpacity
                onPress={() => onComplete?.()}
                style={styles.secondaryButton}
              >
                <ThemedText style={styles.secondaryText}>
                  🎉 We did it!
                </ThemedText>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <ConfirmDialog
          visible={confirming}
          title="Tear this dream out?"
          message="It'll be gone from the notebook."
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDelete?.();
          }}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFBEF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.xl,
    paddingBottom: 36,
    maxHeight: "92%",
    borderWidth: 2.5,
    borderBottomWidth: 0,
    borderColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  heading: {
    flex: 1,
    fontFamily: "IndieFlower",
    fontSize: 28,
    color: theme.colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  input: {
    borderRadius: 16,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  pillRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: theme.spacing.md,
  },
  pill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  pillTextActive: {
    color: "white",
  },
  categoriesScroll: {
    marginBottom: theme.spacing.lg,
  },
  categories: {
    flexDirection: "row",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "white",
  },
  primaryButton: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: theme.colors.primary,
  },
  primaryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 17,
  },
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 2.5,
    borderColor: theme.colors.border,
  },
  secondaryText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 17,
  },
});
