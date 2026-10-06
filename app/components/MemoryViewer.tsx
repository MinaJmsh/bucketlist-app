import { ThemedText } from "@/components/themed-text";
import {
  Heart,
  Hourglass,
  PartyPopper,
  Pencil,
  Sprout,
  X,
  Zap,
} from "@sketchyicons/react-native";
import { Image } from "expo-image";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { getCategoryColor, getCategoryIcon } from "../../config/categories";
import { PAPER } from "../../config/paper";
import { getRating } from "../../config/ratings";
import { theme } from "../../config/theme";
import { BucketItem } from "../../lib/supabase";
import { GridPaper, StickerLayer } from "./PaperDecor";

const TILTS = [-4, 3, -2, 4, -3, 2];

const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

// small stable number from the id so each page gets its own stickers
const seedFrom = (id: string) =>
  id.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0) % 40;

interface MemoryViewerProps {
  visible: boolean;
  goal: BucketItem | null;
  onClose: () => void;
  onEdit: () => void;
}

export default function MemoryViewer({
  visible,
  goal,
  onClose,
  onEdit,
}: MemoryViewerProps) {
  if (!goal) return null;

  const photos = goal.photos ?? [];
  const color = getCategoryColor(goal.category);
  // const icon = getCategoryIcon(goal.category);
  const CategoryIcon = getCategoryIcon(goal.category);
  const days =
    goal.completed_at && goal.created_at
      ? daysBetween(goal.created_at, goal.completed_at)
      : 0;
  const writer =
    goal.added_by === "A" ? "mina" : goal.added_by === "B" ? "parsa" : "";
  const DaysIcon = days >= 1 ? Hourglass : Zap;
  const rating = getRating(goal.rating);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <GridPaper />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close"
          >
            <X size={18} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topTape} />

            <ThemedText style={styles.title}>{goal.title}</ThemedText>

            {/* date tags */}
            <View style={styles.tagRow}>
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.colors.accent + "55",
                    transform: [{ rotate: "-2deg" }],
                  },
                ]}
              >
                <Sprout size={14} color={theme.colors.textPrimary} />
                <ThemedText style={styles.tagText}>
                  dreamed up {formatDate(goal.created_at)}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.colors.secondary + "55",
                    transform: [{ rotate: "2deg" }],
                  },
                ]}
              >
                <PartyPopper size={14} color={theme.colors.textPrimary} />
                <ThemedText style={styles.tagText}>
                  done {formatDate(goal.completed_at)}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.colors.primary + "33",
                    transform: [{ rotate: "-1deg" }],
                  },
                ]}
              >
                <DaysIcon size={14} color={theme.colors.textPrimary} />
                <ThemedText style={styles.tagText}>
                  {days >= 1
                    ? `${days} ${days === 1 ? "day" : "days"} of dreaming`
                    : "done the same day!"}
                </ThemedText>
              </View>
              {rating && (
                <View
                  style={[
                    styles.tag,
                    {
                      backgroundColor: rating.color + "33",
                      transform: [{ rotate: "1.5deg" }],
                    },
                  ]}
                >
                  <rating.Icon size={14} color={rating.color} />
                  <ThemedText style={styles.tagText}>{rating.label}</ThemedText>
                </View>
              )}
            </View>

            {/* polaroids */}
            <View style={styles.polaroidArea}>
              {photos.length > 0 ? (
                photos.map((uri, i) => (
                  <View
                    key={uri + i}
                    style={[
                      styles.polaroid,
                      photos.length === 1 && styles.polaroidSingle,
                      {
                        transform: [
                          { rotate: `${TILTS[i % TILTS.length]}deg` },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.tape} />
                    <Image
                      source={{ uri }}
                      style={styles.photo}
                      contentFit="cover"
                    />
                    <ThemedText style={styles.photoCaption}>
                      {i === 0 ? goal.title : ""}
                    </ThemedText>
                  </View>
                ))
              ) : (
                <View
                  style={[
                    styles.polaroid,
                    styles.polaroidSingle,
                    { transform: [{ rotate: "-3deg" }] },
                  ]}
                >
                  <View style={styles.tape} />
                  <View
                    style={[
                      styles.photo,
                      styles.noPhoto,
                      { backgroundColor: color + "40" },
                    ]}
                  >
                    <CategoryIcon size={60} color={color} />{" "}
                  </View>
                  <ThemedText style={styles.photoCaption}>
                    {goal.title}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* sticky note */}
            <View style={styles.note}>
              <View style={styles.noteTape} />
              <ThemedText style={styles.noteHeading}>
                our little note
              </ThemedText>
              {goal.description ? (
                <ThemedText style={styles.noteText}>
                  {goal.description}
                </ThemedText>
              ) : (
                <ThemedText style={[styles.noteText, styles.noteEmpty]}>
                  nothing written yet... tap edit to add a note
                </ThemedText>
              )}
              {!!writer && (
                <View style={styles.signRow}>
                  <ThemedText style={styles.noteSign}>
                    — dreamed up by {writer}
                  </ThemedText>
                  <Heart size={14} color={theme.colors.textSecondary} />
                </View>
              )}
            </View>

            <StickerLayer count={4} seed={seedFrom(goal.id)} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Pencil size={18} color="white" />
              <ThemedText style={styles.editText}>Edit this page</ThemedText>
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
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "90%",
    backgroundColor: PAPER,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 5,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 40,
    paddingBottom: 26,
  },
  topTape: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    width: 90,
    height: 24,
    backgroundColor: theme.colors.accent + "99",
    borderRadius: 3,
    transform: [{ rotate: "-1.5deg" }],
  },
  title: {
    fontFamily: "IndieFlower",
    fontSize: 32,
    lineHeight: 38,
    textAlign: "center",
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  polaroidArea: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
    marginBottom: 26,
  },
  polaroid: {
    width: "46%",
    backgroundColor: "white",
    padding: 8,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  polaroidSingle: {
    width: "76%",
  },
  tape: {
    position: "absolute",
    top: -9,
    alignSelf: "center",
    width: 48,
    height: 18,
    backgroundColor: theme.colors.secondary + "99",
    borderRadius: 3,
    transform: [{ rotate: "2deg" }],
    zIndex: 2,
  },
  photo: {
    width: "100%",
    aspectRatio: 1,
  },
  noPhoto: {
    alignItems: "center",
    justifyContent: "center",
  },
  noPhotoIcon: {
    fontSize: 60,
  },
  photoCaption: {
    fontFamily: "IndieFlower",
    fontSize: 16,
    lineHeight: 20,
    minHeight: 20,
    textAlign: "center",
    color: theme.colors.textPrimary,
    marginTop: 8,
  },
  note: {
    backgroundColor: "#FFF6B8",
    padding: 18,
    paddingTop: 22,
    borderRadius: 4,
    transform: [{ rotate: "1deg" }],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  noteTape: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    width: 56,
    height: 18,
    backgroundColor: theme.colors.accent + "99",
    borderRadius: 3,
    transform: [{ rotate: "-2deg" }],
  },
  noteHeading: {
    fontFamily: "IndieFlower",
    fontSize: 22,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  noteText: {
    fontFamily: "IndieFlower",
    fontSize: 20,
    lineHeight: 28,
    color: theme.colors.textPrimary,
  },
  noteEmpty: {
    opacity: 0.55,
  },
  signRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  noteSign: {
    fontFamily: "IndieFlower",
    fontSize: 16,
    textAlign: "right",
    color: theme.colors.textSecondary,
  },
  footer: {
    padding: 14,
    paddingTop: 10,
    backgroundColor: PAPER,
    borderTopWidth: 2,
    borderTopColor: theme.colors.border,
  },
  editButton: {
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
  },
  editText: {
    color: "white",
    fontWeight: "600",
    fontSize: 17,
  },
});
