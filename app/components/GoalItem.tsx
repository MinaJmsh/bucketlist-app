import { ThemedText } from "@/components/themed-text";
import React, { useRef } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getCategoryColor, getCategoryIcon } from "../../config/categories";
import { theme } from "../../config/theme";
import { BucketItem } from "../../lib/supabase";

interface GoalItemProps {
  goal: BucketItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function GoalItem({ goal, onToggle, onDelete }: GoalItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle(goal.id);
  };

  const handleDelete = () => {
    Alert.alert("Delete Dream", "Are you sure you want to delete this dream?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(goal.id),
      },
    ]);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const categoryColor = getCategoryColor(goal.category);
  const categoryIcon = getCategoryIcon(goal.category);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handlePress}
            style={[
              styles.checkbox,
              goal.completed && styles.checkboxCompleted,
            ]}
          >
            {goal.completed && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.icon}>{categoryIcon}</Text>
              <ThemedText
                style={[styles.title, goal.completed && styles.titleCompleted]}
              >
                {goal.title}
              </ThemedText>
            </View>
            <View style={styles.metaRow}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      goal.added_by === "A"
                        ? theme.colors.accent
                        : theme.colors.secondary,
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {goal.added_by === "A"
                    ? "M"
                    : goal.added_by === "B"
                    ? "P"
                    : goal.added_by}
                </Text>
              </View>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: categoryColor + "40" },
                ]}
              >
                <ThemedText
                  style={[styles.categoryText, { color: categoryColor }]}
                >
                  {goal.category}
                </ThemedText>
              </View>
            </View>
            <View style={styles.dateRow}>
              <ThemedText style={styles.dateText}>
                Created: {formatDate(goal.created_at)}
              </ThemedText>
              {goal.completed_at && (
                <ThemedText style={styles.dateText}>
                  • Completed: {formatDate(goal.completed_at)}
                </ThemedText>
              )}
            </View>
          </View>

          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: theme.spacing.md,
    // paddingVertical: theme.spacing.sm,
    paddingVertical: 4,

    marginBottom: theme.spacing.md,
    shadowColor: "rgba(0,0,0,0.1)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  checkmark: {
    color: "white",
    fontSize: 16,
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.textPrimary,
    flex: 1,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 8,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 4,
  },
  dateText: {
    fontSize: 10,
    lineHeight: 14,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
  },
});
