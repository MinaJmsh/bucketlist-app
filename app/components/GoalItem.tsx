import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
} from "react-native";
import { theme } from "../config/theme";
import { categories } from "../config/categories";

interface Goal {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  addedBy: string;
  reactions: string[];
  comments: string[];
}

interface GoalItemProps {
  goal: Goal;
  onToggle: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onComment: (id: string, comment: string) => void;
}

export default function GoalItem({
  goal,
  onToggle,
  onReact,
  onComment,
}: GoalItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [commentText, setCommentText] = useState("");
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const category = categories.find((c) => c.id === goal.category);

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

  const addComment = () => {
    if (commentText.trim()) {
      onComment(goal.id, commentText);
      setCommentText("");
    }
  };

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
              <Text style={styles.icon}>{category?.icon}</Text>
              <Text
                style={[styles.title, goal.completed && styles.titleCompleted]}
              >
                {goal.title}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      goal.addedBy === "A"
                        ? theme.colors.accent
                        : theme.colors.secondary,
                  },
                ]}
              >
                <Text style={styles.badgeText}>{goal.addedBy}</Text>
              </View>
              <Text style={styles.category}>{category?.name}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => setShowActions(!showActions)}>
            <Text style={styles.actionIcon}>💬</Text>
          </TouchableOpacity>
        </View>

        {showActions && (
          <View style={styles.actions}>
            <View style={styles.reactions}>
              {["❤️", "😂", "😍", "👍"].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => onReact(goal.id, emoji)}
                  style={[
                    styles.reactionButton,
                    goal.reactions.includes(emoji) &&
                      styles.reactionButtonActive,
                  ]}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {goal.comments.length > 0 && (
              <View style={styles.comments}>
                {goal.comments.map((comment, idx) => (
                  <Text key={idx} style={styles.comment}>
                    💭 {comment}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.commentInput}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Add a note..."
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.input}
              />
              <TouchableOpacity onPress={addComment} style={styles.addButton}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: theme.spacing.md,
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
    marginTop: 4,
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
  category: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  actionIcon: {
    fontSize: 20,
  },
  actions: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  reactions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  reactionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
  },
  reactionButtonActive: {
    backgroundColor: theme.colors.surface,
  },
  reactionEmoji: {
    fontSize: 18,
  },
  comments: {
    marginBottom: theme.spacing.sm,
  },
  comment: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  commentInput: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
