import { ThemedText } from "@/components/themed-text";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getCategoryIcon } from "../../config/categories";
import { ROW_HEIGHT, RULE_LINE } from "../../config/paper";
import { theme } from "../../config/theme";
import { BucketItem } from "../../lib/supabase";

interface GoalItemProps {
  goal: BucketItem;
  onOpen: (goal: BucketItem) => void;
  onComplete: (goal: BucketItem) => void;
}

export default function GoalItem({ goal, onOpen, onComplete }: GoalItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onOpen(goal)}
      style={styles.row}
    >
      <TouchableOpacity
        onPress={() => onComplete(goal)}
        hitSlop={12}
        style={styles.checkbox}
      />

      <Text style={styles.icon}>{getCategoryIcon(goal.category)}</Text>

      <ThemedText numberOfLines={1} style={styles.title}>
        {goal.title}
      </ThemedText>

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
          {goal.added_by === "A" ? "M" : goal.added_by === "B" ? "P" : "?"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: RULE_LINE,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    flex: 1,
    fontFamily: "IndieFlower",
    fontSize: 21,
    color: theme.colors.textPrimary,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
});
