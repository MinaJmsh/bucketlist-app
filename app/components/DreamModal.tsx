import { ThemedText } from "@/components/themed-text";
import {
  Flower2,
  Moon,
  PartyPopper,
  Pencil,
  Scissors,
  Sparkles,
  X,
} from "@sketchyicons/react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
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

const PERIODS: { key: Period; label: string; Icon: typeof Flower2 }[] = [
  { key: "soon", label: "soon", Icon: Flower2 },
  { key: "someday", label: "someday", Icon: Moon },
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

  const HeadingIcon = editing ? Pencil : Sparkles;

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
            <View style={styles.headingBox}>
              <HeadingIcon size={26} color={theme.colors.textPrimary} />
              <ThemedText style={styles.heading}>
                {editing ? "Edit this dream" : "Write a new dream"}
              </ThemedText>
            </View>
            <View style={styles.headerActions}>
              {editing && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setConfirming(true)}
                  accessibilityLabel="Tear out this dream"
                >
                  <Scissors size={18} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onClose}
                accessibilityLabel="Close"
              >
                <X size={18} color={theme.colors.textPrimary} />
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

            <View style={styles.optionsRow}>
              {PERIODS.map((p) => (
                <TouchableOpacity
                  key={p.key}
                  onPress={() => setPeriod(p.key)}
                  style={[
                    styles.optionButton,
                    period === p.key && styles.optionButtonActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <p.Icon
                    size={28}
                    color={
                      period === p.key
                        ? theme.colors.primary
                        : theme.colors.textPrimary
                    }
                  />

                  <ThemedText
                    style={[
                      styles.optionLabel,
                      period === p.key && styles.optionLabelActive,
                    ]}
                  >
                    {p.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={styles.label}>Written by</ThemedText>

            <View style={styles.optionsRow}>
              {[
                {
                  key: "A",
                  label: "mina",
                  image: require("../../assets/images/mina2.png"),
                },
                {
                  key: "B",
                  label: "parsa",
                  image: require("../../assets/images/parsa2.png"),
                },
              ].map((who) => (
                <TouchableOpacity
                  key={who.key}
                  onPress={() => setAddedBy(who.key)}
                  style={[
                    styles.optionButton,
                    addedBy === who.key && styles.optionButtonActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Image source={who.image} style={styles.personImage} />

                  <ThemedText
                    style={[
                      styles.optionLabel,
                      addedBy === who.key && styles.optionLabelActive,
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
                      category === cat.id && styles.categoryButtonActive,
                    ]}
                    activeOpacity={0.8}
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
                <PartyPopper size={20} color={theme.colors.textPrimary} />
                <ThemedText style={styles.secondaryText}>We did it!</ThemedText>
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
  headingBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heading: {
    flexShrink: 1,
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

  categoriesScroll: {
    marginBottom: theme.spacing.lg,
  },
  categories: {
    flexDirection: "row",
    gap: 8,
  },
  categoryButton: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 2.5,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },

  categoryButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "#F3F6EC",
  },

  categoryIcon: {
    fontSize: 28,
    marginBottom: 2,
  },

  categoryText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },

  categoryTextActive: {
    color: theme.colors.primary,
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
    borderWidth: 2.5,
    borderColor: theme.colors.border,
  },
  secondaryText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 17,
  },
  peopleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: theme.spacing.md,
  },

  personLabelActive: {
    color: theme.colors.primary,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: theme.spacing.md,
  },

  optionButton: {
    flex: 1,
    height: 88,
    borderRadius: 16,
    backgroundColor: "white",
    borderWidth: 2.5,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },

  optionButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: "#F3F6EC",
  },

  personImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginBottom: 0,
  },

  optionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },

  optionLabelActive: {
    color: theme.colors.primary,
  },
});
