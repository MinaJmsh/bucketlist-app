import { ThemedText } from "@/components/themed-text";
import {
  Heart,
  Hourglass,
  PartyPopper,
  Pencil,
  Save,
  Sprout,
  X,
  Zap,
} from "@sketchyicons/react-native";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import { getCategoryColor, getCategoryIcon } from "../../config/categories";
import { PAPER } from "../../config/paper";
import { getRating } from "../../config/ratings";
import { theme } from "../../config/theme";
import { pickTape } from "../../config/washi";
import { BucketItem } from "../../lib/supabase";
import { CornerSticker, GridPaper } from "./PaperDecor";
import { useModalAnimation } from "./ui/useModalAnimation";
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

// One washi tape piece, stable for a given key.
// `native` uses react-native's Image, which view-shot can capture reliably.
function Tape({
  tapeKey,
  style,
  native,
}: {
  tapeKey: string;
  style: object;
  native?: boolean;
}) {
  const tape = pickTape(tapeKey);
  const transform = [{ rotate: `${tape.rotate}deg` }];

  if (native) {
    return (
      <RNImage
        source={tape.source as any}
        resizeMode="contain"
        style={[style, { transform }]}
      />
    );
  }

  return (
    <Image
      source={tape.source}
      contentFit="contain"
      style={[style, { transform }]}
    />
  );
}

// Date / rating tags.
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
        {
          backgroundColor: color,
          transform: [{ rotate: `${tilt}deg` }],
        },
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
  goal: goalProp,
  onClose,
  onEdit,
}: MemoryViewerProps) {
  const { mounted, backdropStyle, popStyle } = useModalAnimation(visible);

  // The parent sets goal to null the moment it closes. Keep the last one so
  // the page doesn't go blank while the closing animation is still playing.
  const lastGoal = useRef<BucketItem | null>(null);
  if (goalProp) lastGoal.current = goalProp;
  const goal = goalProp ?? lastGoal.current;

  // Handle Android's hardware back button without a native Modal.
  useEffect(() => {
    if (!visible || !goalProp) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onClose();
        return true;
      },
    );

    return () => subscription.remove();
  }, [visible, goalProp, onClose]);

  // ---- Save as image -------------------------------------------------------
  // The visible page is a ScrollView clipped to the screen, so capturing it
  // only gives what's on screen. Instead, when saving we render a full-height
  // copy of the page off-screen (no scrolling, no clipping) and capture that.
  const shotRef = useRef<View>(null);
  const loadedPhotos = useRef(0);
  const [saving, setSaving] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [pageWidth, setPageWidth] = useState(0);

  const waitForPhotos = (count: number) =>
    new Promise<void>((resolve) => {
      const start = Date.now();
      const tick = () => {
        if (loadedPhotos.current >= count || Date.now() - start > 5000) {
          resolve();
        } else {
          setTimeout(tick, 100);
        }
      };
      tick();
    });

  const handleSave = async () => {
    if (saving || !goal) return;

    setSaving(true);

    try {
      const perm = await MediaLibrary.requestPermissionsAsync(true);
      if (!perm.granted) {
        Alert.alert(
          "Permission needed",
          "Allow photo access to save this page.",
        );
        return;
      }

      loadedPhotos.current = 0;
      setCapturing(true);

      // wait for the off-screen copy to mount and its photos to load
      await waitForPhotos((goal.photos ?? []).length);
      await new Promise((r) => setTimeout(r, 400));

      const uri = await captureRef(shotRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Saved", "This page is in your photos.");
    } catch (e) {
      Alert.alert("Couldn't save", "Something went wrong saving the image.");
    } finally {
      setCapturing(false);
      setSaving(false);
    }
  };
  // --------------------------------------------------------------------------

  if (!mounted || !goal) return null;

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

  // The page content. Used twice: in the visible ScrollView (native = false)
  // and in the off-screen capture copy (native = true).
  const renderBody = (native: boolean) => {
    // Android sorts elevated views above their non-elevated siblings when it
    // draws into a bitmap, so the elevated shadow rect would cover the photos,
    // note text and stickers in the saved image. For the saved copy, use a flat
    // grey rect (no elevation) as the fake shadow instead.
    const shadow = (bg: string) =>
      native
        ? [styles.shadowRect, styles.shadowFlat]
        : [styles.shadowRect, { backgroundColor: bg }];

    return (
      <>
        <Tape
          tapeKey={goal.id + "top"}
          style={styles.topTape}
          native={native}
        />

        <ThemedText style={styles.title}>{goal.title}</ThemedText>

        {/* Date tags */}
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
              <ThemedText style={styles.tagText}>{rating.label}</ThemedText>
            </Tag>
          )}
        </View>

        {/* Polaroids stay exactly as scrapbook decorations.
          They are Views, not TouchableOpacity, so they cannot be opened. */}
        <View style={styles.polaroidArea}>
          {photos.length > 0 ? (
            photos.map((uri, i) => (
              <View
                key={uri + i}
                style={[
                  styles.polaroidShadow,
                  photos.length === 1 && styles.polaroidSingle,
                  {
                    transform: [{ rotate: `${TILTS[i % TILTS.length]}deg` }],
                  },
                ]}
              >
                <View style={shadow("white")} />

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
                    native={native}
                  />

                  {native ? (
                    <RNImage
                      source={{ uri }}
                      style={styles.photo}
                      resizeMode="cover"
                      onLoad={() => {
                        loadedPhotos.current += 1;
                      }}
                      onError={() => {
                        loadedPhotos.current += 1;
                      }}
                    />
                  ) : (
                    <Image
                      source={{ uri }}
                      style={styles.photo}
                      contentFit="cover"
                    />
                  )}

                  <ThemedText style={styles.photoCaption}>
                    {i === 0 ? goal.title : ""}
                  </ThemedText>

                  {i % 2 === 0 && (
                    <CornerSticker
                      stickerKey={goal.id + "ps" + i}
                      style={{ top: -10, right: -10 }}
                    />
                  )}
                </WobblyBox>
              </View>
            ))
          ) : (
            <View
              style={[
                styles.polaroidShadow,
                styles.polaroidSingle,
                { transform: [{ rotate: "-3deg" }] },
              ]}
            >
              <View style={shadow("white")} />

              <WobblyBox
                style={styles.polaroid}
                fill="white"
                stroke={theme.colors.border}
                strokeWidth={1.5}
                seed={seed + 10}
              >
                <Tape
                  tapeKey={goal.id + "photo0"}
                  style={styles.tape}
                  native={native}
                />

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

        {/* Sticky note */}
        <View style={styles.noteShadow}>
          <View style={shadow("#FFF6B8")} />

          <WobblyBox
            style={styles.note}
            fill="#FFF6B8"
            stroke="#E3D170"
            strokeWidth={1.5}
            seed={seed + 30}
          >
            <Tape
              tapeKey={goal.id + "note"}
              style={styles.noteTape}
              native={native}
            />

            <ThemedText style={styles.noteHeading}>our little note</ThemedText>

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

            <CornerSticker
              stickerKey={goal.id + "ns"}
              size={48}
              style={{ bottom: -14, left: -10 }}
            />
          </WobblyBox>
        </View>
      </>
    );
  };

  return (
    <View style={styles.overlay} pointerEvents={visible ? "auto" : "none"}>
      {/* dim background */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
        pointerEvents="none"
      />

      {/* the page pops in */}
      <Animated.View style={[styles.cardWrap, popStyle]}>
        <WobblyBox
          style={styles.card}
          fill={PAPER}
          stroke={theme.colors.border}
          strokeWidth={2.5}
          seed={seed}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
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

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
            accessibilityLabel="Save as image"
          >
            <WobblyCircle
              size={38}
              fill="white"
              stroke={theme.colors.border}
              seed={seed + 2}
            >
              {saving ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.textPrimary}
                />
              ) : (
                <Save size={18} color={theme.colors.textPrimary} />
              )}
            </WobblyCircle>
          </TouchableOpacity>

          {/* Scrollable content stays inside the wobbly outline. */}
          <View
            style={styles.clip}
            onLayout={(e) => setPageWidth(e.nativeEvent.layout.width)}
          >
            <GridPaper />

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {renderBody(false)}
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <WobblyLine
              style={styles.footerLine}
              stroke={theme.colors.border}
              strokeWidth={2}
              seed={seed + 40}
            />

            <TouchableOpacity onPress={onEdit} activeOpacity={0.8}>
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
      </Animated.View>

      {/* Full-height copy of the page, rendered off-screen only while saving. */}
      {capturing && (
        <View
          ref={shotRef}
          collapsable={false}
          pointerEvents="none"
          style={[styles.captureRoot, { width: pageWidth || 340 }]}
        >
          <GridPaper />
          <View style={styles.content}>{renderBody(true)}</View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  // animated wrapper: owns the size limits
  cardWrap: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "90%",
  },
  card: {
    flexShrink: 1,
  },
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
  saveButton: {
    position: "absolute",
    top: 14,
    right: 60, // 14 (close offset) + 38 (circle) + 8 gap
    zIndex: 5,
  },
  // off-screen, natural height, solid paper background
  captureRoot: {
    position: "absolute",
    top: 0,
    left: -5000,
    backgroundColor: PAPER,
    overflow: "hidden",
  },
  scroll: {
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
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
    paddingHorizontal: 24,
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
    flexShrink: 1,
    maxWidth: "100%",
  },
  tagText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingRight: 2,
    color: theme.colors.textPrimary,
  },
  polaroidArea: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 26,
  },
  polaroidShadow: {
    width: "46%",
  },
  polaroidSingle: {
    width: "76%",
  },
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
  shadowFlat: {
    top: 7,
    left: 7,
    right: 3,
    bottom: 3,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: "rgba(0,0,0,0.12)",
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
    paddingBottom: 24,
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
