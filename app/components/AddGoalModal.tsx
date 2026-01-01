import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { NewBucketItem } from "../../lib/supabase";
import { quickCategories } from "../config/categories";
import { theme } from "../config/theme";

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (goal: NewBucketItem) => void;
}

export default function AddGoalModal({
  visible,
  onClose,
  onAdd,
}: AddGoalModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("travel");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [addedBy, setAddedBy] = useState("A");

  const handleAdd = () => {
    if (title.trim()) {
      onAdd({
        title: title.trim(),
        category:
          isCustom && customCategory.trim() ? customCategory.trim() : category,
        added_by: addedBy,
        period: "week",
      });
      // Reset form
      setTitle("");
      setCategory("travel");
      setCustomCategory("");
      setIsCustom(false);
      setAddedBy("A");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add a Dream</Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What do you dream of?"
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.input}
            autoFocus
          />

          <Text style={styles.label}>Added By</Text>
          <View style={styles.addedByContainer}>
            <TouchableOpacity
              onPress={() => setAddedBy("A")}
              style={[
                styles.addedByButton,
                addedBy === "A" && styles.addedByButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.addedByText,
                  addedBy === "A" && styles.addedByTextActive,
                ]}
              >
                Partner A
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAddedBy("B")}
              style={[
                styles.addedByButton,
                addedBy === "B" && styles.addedByButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.addedByText,
                  addedBy === "B" && styles.addedByTextActive,
                ]}
              >
                Partner B
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Category</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            <View style={styles.categories}>
              {quickCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => {
                    setCategory(cat.id);
                    setIsCustom(false);
                  }}
                  style={[
                    styles.categoryButton,
                    !isCustom &&
                      category === cat.id && {
                        backgroundColor: cat.color,
                      },
                  ]}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      !isCustom &&
                        category === cat.id &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setIsCustom(true)}
                style={[
                  styles.categoryButton,
                  isCustom && {
                    backgroundColor: theme.colors.dark,
                  },
                ]}
              >
                <Text style={styles.categoryIcon}>✏️</Text>
                <Text
                  style={[
                    styles.categoryText,
                    isCustom && styles.categoryTextActive,
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {isCustom && (
            <TextInput
              value={customCategory}
              onChangeText={setCustomCategory}
              placeholder="Enter custom category"
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.input, styles.customInput]}
            />
          )}

          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAdd}
              style={[styles.button, styles.addButton]}
              disabled={!title.trim()}
            >
              <Text style={styles.addButtonText}>Add Dream</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.xl,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  input: {
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  customInput: {
    marginTop: theme.spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  addedByContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: theme.spacing.md,
  },
  addedByButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: "center",
  },
  addedByButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  addedByText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  addedByTextActive: {
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
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryText: {
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "white",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
  },
  cancelButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  addButton: {
    backgroundColor: theme.colors.primary,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
