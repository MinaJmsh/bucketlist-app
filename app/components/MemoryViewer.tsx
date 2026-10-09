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
import React, { useState } from "react";
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
import { pickTape } from "../../config/washi";
import { BucketItem } from "../../lib/supabase";
import CameraViewer from "./CameraViewer";
import { CornerSticker, GridPaper } from "./PaperDecor";
import WobblyBox, { WobblyCircle, WobblyLine, hashSeed } from "./ui/WobblyBox";

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

// one washi tape piece, random but stable for a given key
function Tape({ tapeKey, style }: { tapeKey: string; style: object }) {
  const tape = pickTape(tapeKey);
  return (
    <Image
      source={tape.source}
      contentFit="contain"
      style={[style, { transform: [{ rotate: `${tape.rotate}deg` }] }]}
    />
  );
}

// date / rating tags: plain highlighter-style pills
function Tag({
  color,
  tilt,
  children,
}: {
  color: string;
  tilt: number;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.tag,
        { backgroundColor: color, transform: [{ rotate: `${tilt}deg` }] },
      ]}
    >
      {children}
    </View>
  );
}

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
  // which photo is open in the camera view (null = camera closed)
  const [cameraIndex, setCameraIndex] = useState<number | null>(null);

  if (!goal) return null;

  const photos = goal.photos ?? [];
  const color = getCategoryColor(goal.category);
  const CategoryIcon = getCategoryIcon(goal.category);
  const days =
    goal.completed_at && goal.created_at
      ? daysBetween(goal.created_at, goal.completed_at)
      : 0;
  const writer =
    goal.added_by === "A" ? "mina" : goal.added_by === "B" ? "parsa" : "";
  const DaysIcon = days >= 1 ? Hourglass : Zap;
  const rating = getRating(goal.rating);
  const seed = hashSeed(goal.id);

  const handleClose = () => {
    setCameraIndex(null);
    onClose();
  };

  const handleEdit = () => {
    setCameraIndex(null);
    onEdit();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // Android back button: close the camera first, then the page
      onRequestClose={() =>
        cameraIndex !== null ? setCameraIndex(null) : handleClose()
      }
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.overlay}>
        <WobblyBox
          style={styles.card}
          fill={PAPER}
          stroke={theme.colors.border}
          strokeWidth={2.5}
          seed={seed}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            accessibilityLabel="Close"
          >
            <WobblyCircle
              size={38}
              fill="white"
              stroke={theme.colors.border}
              seed={seed + 1}
            >
              <X size={18} color={theme.colors.textPrimary} />
            </WobblyCircle>
          </TouchableOpacity>

          {/* everything that scrolls is clipped INSIDE the wobbly outline */}
          <View style={styles.clip}>
            <GridPaper />
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <Tape tapeKey={goal.id + "top"} style={styles.topTape} />

              <ThemedText style={styles.title}>{goal.title}</ThemedText>

              {/* date tags */}
              <View style={styles.tagRow}>
                <Tag color={theme.colors.accent + "55"} tilt={-2}>
                  <Sprout size={14} color={theme.colors.textPrimary} />
                  <ThemedText style={styles.tagText}>
                    dreamed up {formatDate(goal.created_at)}
                  </ThemedText>
                </Tag>
                <Tag color={theme.colors.secondary + "55"} tilt={2}>
                  <PartyPopper size={14} color={theme.colors.textPrimary} />
                  <ThemedText style={styles.tagText}>
                    done {formatDate(goal.completed_at)}
                  </ThemedText>
                </Tag>
                <Tag color={theme.colors.primary + "33"} tilt={-1}>
                  <DaysIcon size={14} color={theme.colors.textPrimary} />
                  <ThemedText style={styles.tagText}>
                    {days >= 1
                      ? `${days} ${days === 1 ? "day" : "days"} of dreaming`
                      : "done the same day!"}
                  </ThemedText>
                </Tag>
                {rating && (
                  <Tag color={rating.color + "33"} tilt={1.5}>
                    <rating.Icon size={14} color={rating.color} />
                    <ThemedText style={styles.tagText}>
                      {rating.label}
                    </ThemedText>
                  </Tag>
                )}
              </View>

              {/* polaroids: tap one to open it in the camera */}
              <View style={styles.polaroidArea}>
                {photos.length > 0 ? (
                  photos.map((uri, i) => (
                    <TouchableOpacity
                      key={uri + i}
                      activeOpacity={0.9}
                      onPress={() => setCameraIndex(i)}
                      style={[
                        styles.polaroidShadow,
                        photos.length === 1 && styles.polaroidSingle,
                        {
                          transform: [
                            { rotate: `${TILTS[i % TILTS.length]}deg` },
                          ],
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.shadowRect,
                          { backgroundColor: "white" },
                        ]}
                      />
                      <WobblyBox
                        style={styles.polaroid}
                        fill="white"
                        stroke={theme.colors.border}
                        strokeWidth={1.5}
                        seed={seed + 10 + i}
                      >
                        <Tape
                          tapeKey={goal.id + "photo" + i}
                          style={styles.tape}
                        />
                        <Image
                          source={{ uri }}
                          style={styles.photo}
                          contentFit="cover"
                        />
                        <ThemedText style={styles.photoCaption}>
                          {i === 0 ? goal.title : ""}
                        </ThemedText>
                        {/* sticker on the photo's top-right corner (no text there) */}
                        {i % 2 === 0 && (
                          <CornerSticker
                            stickerKey={goal.id + "ps" + i}
                            style={{ top: -10, right: -10 }}
                          />
                        )}
                      </WobblyBox>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View
                    style={[
                      styles.polaroidShadow,
                      styles.polaroidSingle,
                      { transform: [{ rotate: "-3deg" }] },
                    ]}
                  >
                    <View
                      style={[styles.shadowRect, { backgroundColor: "white" }]}
                    />
                    <WobblyBox
                      style={styles.polaroid}
                      fill="white"
                      stroke={theme.colors.border}
                      strokeWidth={1.5}
                      seed={seed + 10}
                    >
                      <Tape tapeKey={goal.id + "photo0"} style={styles.tape} />
                      <View
                        style={[
                          styles.photo,
                          styles.noPhoto,
                          { backgroundColor: color + "40" },
                        ]}
                      >
                        <CategoryIcon size={60} color={color} />
                      </View>
                      <ThemedText style={styles.photoCaption}>
                        {goal.title}
                      </ThemedText>
                      <CornerSticker
                        stickerKey={goal.id + "ps0"}
                        style={{ top: -10, right: -10 }}
                      />
                    </WobblyBox>
                  </View>
                )}
              </View>

              {/* sticky note */}
              <View style={styles.noteShadow}>
                <View
                  style={[styles.shadowRect, { backgroundColor: "#FFF6B8" }]}
                />
                <WobblyBox
                  style={styles.note}
                  fill="#FFF6B8"
                  stroke="#E3D170"
                  strokeWidth={1.5}
                  seed={seed + 30}
                >
                  <Tape tapeKey={goal.id + "note"} style={styles.noteTape} />
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
                  {/* bottom-left corner: the signature is right-aligned, so it's free */}
                  <CornerSticker
                    stickerKey={goal.id + "ns"}
                    size={48}
                    style={{ bottom: -14, left: -10 }}
                  />
                </WobblyBox>
              </View>
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <WobblyLine
              style={styles.footerLine}
              stroke={theme.colors.border}
              strokeWidth={2}
              seed={seed + 40}
            />
            <TouchableOpacity onPress={handleEdit} activeOpacity={0.8}>
              <WobblyBox
                style={styles.editButton}
                fill={theme.colors.primary}
                stroke={theme.colors.primary}
                strokeWidth={2.5}
                seed={seed + 41}
              >
                <Pencil size={18} color="white" />
                <ThemedText style={styles.editText}>Edit this page</ThemedText>
              </WobblyBox>
            </TouchableOpacity>
          </View>
        </WobblyBox>

        {/* camera view: last child so it sits on top of everything */}
        <CameraViewer
          photos={photos}
          startIndex={cameraIndex}
          onClose={() => setCameraIndex(null)}
        />
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
  },
  // clips the grid + scrolling content to sit inside the wobbly outline
  clip: {
    flexShrink: 1,
    margin: 7,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 5,
  },
  scroll: {
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: 20, // a bit of room so corner stickers aren't clipped
    paddingTop: 40,
    paddingBottom: 30,
  },
  // washi tape images (rotation is set per tape in <Tape />)
  topTape: {
    position: "absolute",
    top: 8,
    alignSelf: "center",
    width: 110,
    height: 32,
  },
  title: {
    fontFamily: "IndieFlower",
    fontSize: 24,
    lineHeight: 46,
    textAlign: "center",
    color: theme.colors.textPrimary,
    marginBottom: 10,
    paddingHorizontal: 24, // keeps long titles clear of the close button
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginBottom: 20,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    flexShrink: 1, // lets the tag shrink to the row width
    maxWidth: "100%",
  },
  tagText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingRight: 2, // Android measures text slightly narrow; this stops the last letter being clipped
    color: theme.colors.textPrimary,
  },
  polaroidArea: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start", // don't stretch shorter polaroids
    gap: 14,
    marginBottom: 26,
  },
  polaroidShadow: {
    width: "46%",
  },
  polaroidSingle: {
    width: "76%",
  },
  // inset rectangle that only carries the shadow; it sits fully inside the
  // wobbly outline, so only the soft shadow shows outside the line
  shadowRect: {
    position: "absolute",
    top: 5,
    left: 5,
    right: 5,
    bottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  polaroid: {
    padding: 9,
    paddingBottom: 10,
  },
  tape: {
    position: "absolute",
    top: -12,
    alignSelf: "center",
    width: 70,
    height: 26,
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
  photoCaption: {
    fontFamily: "IndieFlower",
    fontSize: 14,
    lineHeight: 19,
    minHeight: 19,
    textAlign: "center",
    color: theme.colors.textPrimary,
    marginTop: 6,
  },
  noteShadow: {
    transform: [{ rotate: "1deg" }],
  },
  note: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 24, // keeps the bottom-left sticker clear of the text
  },
  noteTape: {
    position: "absolute",
    top: -14,
    alignSelf: "center",
    width: 80,
    height: 26,
    zIndex: 2,
  },
  noteHeading: {
    fontFamily: "IndieFlower",
    fontSize: 18,
    lineHeight: 24,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  noteText: {
    fontFamily: "IndieFlower",
    fontSize: 16,
    lineHeight: 23,
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
    marginTop: 10,
  },
  noteSign: {
    flexShrink: 1,
    fontFamily: "IndieFlower",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "right",
    color: theme.colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  footerLine: {
    marginBottom: 10,
  },
  editButton: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  editText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 20,
  },
});
