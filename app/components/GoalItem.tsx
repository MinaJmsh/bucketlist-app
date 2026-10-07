import { ThemedText } from "@/components/themed-text";
import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { getCategoryIcon } from "../../config/categories";
import { ROW_HEIGHT, RULE_LINE } from "../../config/paper";
import { theme } from "../../config/theme";
import { BucketItem } from "../../lib/supabase";
import { WobblyCircle, WobblyLine, hashSeed } from "./ui/WobblyBox";

interface GoalItemProps {
  goal: BucketItem;
  onOpen: (goal: BucketItem) => void;
  onComplete: (goal: BucketItem) => void;
}

export default function GoalItem({ goal, onOpen, onComplete }: GoalItemProps) {
  const CategoryIcon = getCategoryIcon(goal.category);
  const seed = hashSeed(goal.id);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onOpen(goal)}
      style={styles.row}
    >
      <TouchableOpacity onPress={() => onComplete(goal)} hitSlop={12}>
        <WobblyCircle
          size={24}
          stroke={theme.colors.border}
          strokeWidth={2}
          seed={seed}
        />
      </TouchableOpacity>

      <ThemedText numberOfLines={1} style={styles.title}>
        {goal.title}
      </ThemedText>

      <CategoryIcon size={20} strokeWidth={1.5} />
      <Image
        source={
          goal.added_by === "A"
            ? require("../../assets/images/mina2.png")
            : require("../../assets/images/parsa2.png")
        }
        style={styles.personImage}
      />

      {/* wobbly notebook rule */}
      <WobblyLine
        style={styles.rule}
        stroke={RULE_LINE}
        strokeWidth={1.5}
        seed={seed + 7}
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
  },
  rule: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -3,
  },
  title: {
    flex: 1,
    fontFamily: "IndieFlower",
    fontSize: 21,
    color: theme.colors.textPrimary,
  },
  personImage: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});
