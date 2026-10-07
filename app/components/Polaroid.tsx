import { ThemedText } from "@/components/themed-text";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getCategoryColor, getCategoryIcon } from "../../config/categories";
import { getRating } from "../../config/ratings";
import { theme } from "../../config/theme";
import { pickTape } from "../../config/washi";
import { BucketItem } from "../../lib/supabase";

const TILTS = [-3, 2, -1.5, 3, -2.5, 1.5];

interface PolaroidProps {
  goal: BucketItem;
  index: number;
  onPress: (goal: BucketItem) => void;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function Polaroid({ goal, index, onPress }: PolaroidProps) {
  const tilt = TILTS[index % TILTS.length];
  const photos = goal.photos ?? [];
  const color = getCategoryColor(goal.category);
  const CategoryIcon = getCategoryIcon(goal.category);
  const rating = getRating(goal.rating);
  // random but stable per memory
  const tape = pickTape(goal.id);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(goal)}
      style={[styles.wrap, { transform: [{ rotate: `${tilt}deg` }] }]}
    >
      <Image
        source={tape.source}
        contentFit="contain"
        style={[styles.tape, { transform: [{ rotate: `${tape.rotate}deg` }] }]}
        pointerEvents="none"
      />

      {photos.length > 0 ? (
        <View style={styles.photoBox}>
          <Image
            source={{ uri: photos[0] }}
            style={styles.photo}
            contentFit="cover"
          />
          {photos.length > 1 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>+{photos.length - 1}</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.photoBox, { backgroundColor: color + "40" }]}>
          <CategoryIcon size={44} color={color} />
        </View>
      )}

      <ThemedText style={styles.caption} numberOfLines={2}>
        {goal.title}
      </ThemedText>
      <View style={styles.dateRow}>
        {rating && <rating.Icon size={14} color={rating.color} />}
        <ThemedText style={styles.date}>
          {formatDate(goal.completed_at)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "47%",
    backgroundColor: "white",
    padding: 10,
    paddingBottom: 14,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  tape: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    width: 80,
    height: 28,
    zIndex: 2,
  },
  photoBox: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  countBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  caption: {
    fontFamily: "IndieFlower",
    fontSize: 17,
    lineHeight: 20,
    textAlign: "center",
    color: theme.colors.textPrimary,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 4,
  },
  date: {
    fontSize: 11,
    textAlign: "center",
    color: theme.colors.textSecondary,
  },
});
