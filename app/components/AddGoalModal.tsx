import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { theme } from "../config/theme";
import { categories } from "../config/categories";

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (goal: { title: string; category: string }) => void;
}

export default function AddGoalModal({
  visible,
  onClose,
  onAdd,
}: AddGoalModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("travel");

  const handleAdd = () => {
    if (title.trim()) {
      onAdd({ title, category });
      setTitle("");
      setCategory("travel");
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
          />

          <Text style={styles.label}>Category</Text>

          <View style={styles.categories}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[
                  styles.categoryButton,
                  category === cat.id && {
                    backgroundColor: cat.color,
                  },
                ]}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: theme.spacing.lg,
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
