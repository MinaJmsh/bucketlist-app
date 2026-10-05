import { ThemedText } from "@/components/themed-text";
import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
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

      {/* <Text style={styles.icon}>{getCategoryIcon(goal.category)}</Text> */}

      <ThemedText numberOfLines={1} style={styles.title}>
        {goal.title}
      </ThemedText>

      <Image
        source={
          goal.added_by === "A"
            ? require("../../assets/images/mina2.png")
            : require("../../assets/images/parsa2.png")
        }
        style={styles.personImage}
      />
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
  // badge: {
  //   width: 20,
  //   height: 20,
  //   borderRadius: 10,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  // badgeText: {
  //   fontSize: 10,
  //   fontWeight: "600",
  //   color: "white",
  personImage: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});
