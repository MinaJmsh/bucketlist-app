import { ThemedText } from "@/components/themed-text";
import {
  Camera,
  PartyPopper,
  Pencil,
  Pin,
  Scissors,
  X,
} from "@sketchyicons/react-native";
import { Image } from "expo-image";
import type { ImagePickerAsset } from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RULE_LINE } from "../../config/paper";
import { RATINGS, getRating } from "../../config/ratings";
import { theme } from "../../config/theme";
import { pickPhotos, uploadPhoto } from "../../lib/photos";
import { BucketItem } from "../../lib/supabase";
import ConfirmDialog from "./ConfirmDialog";
import WobblyBox, { WobblyCircle, WobblyLine } from "./ui/WobblyBox";

export interface MemoryValues {
  title: string;
  description: string;
  photos: string[];
  rating: number | null;
}

type PhotoItem = { uri: string; asset?: ImagePickerAsset };

const MAX_PHOTOS = 8;

// small fixed tilts so the photos look stuck on by hand
const PHOTO_TILTS = [-3, 2, -2, 3, -1.5, 2.5];

interface MemoryModalProps {
  visible: boolean;
  mode: "complete" | "edit";
  goal: BucketItem | null;
  onClose: () => void;
  onSave: (values: MemoryValues) => Promise<void>;
  onDelete?: () => void;
}

export default function MemoryModal({
  visible,
  mode,
  goal,
  onClose,
  onSave,
  onDelete,
}: MemoryModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) return;
    setTitle(goal?.title ?? "");
    setDescription(goal?.description ?? "");
    setPhotos((goal?.photos ?? []).map((uri) => ({ uri })));
    setRating(goal?.rating ?? null);
    setSaving(false);
    setConfirming(false);
    setError("");
  }, [visible, goal?.id]);

  const addPhotos = async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    try {
      const assets = await pickPhotos(remaining);
      setPhotos((prev) => [
        ...prev,
        ...assets.map((asset) => ({ uri: asset.uri, asset })),
      ]);
    } catch (e) {
      console.error("Error picking photos:", e);
      setError("Couldn't open your photos. Check permissions?");
    }
  };

  const removePhoto = (index: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    try {
      setSaving(true);
      setError("");
      const urls = await Promise.all(
        photos.map((p) =>
          p.asset ? uploadPhoto(p.asset) : Promise.resolve(p.uri),
        ),
      );
      await onSave({
        title: title.trim(),
        description: description.trim(),
        photos: urls,
        rating,
      });
      onClose();
    } catch (e) {
      console.error("Error saving memory:", e);
      setError("Couldn't save this memory. Try again?");
    } finally {
      setSaving(false);
    }
  };

  const isComplete = mode === "complete";
  const HeadingIcon = isComplete ? PartyPopper : Pencil;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <WobblyBox
          style={styles.sheet}
          fill="#FFFBEF"
          stroke={theme.colors.border}
          strokeWidth={2.5}
          seed={6}
        >
          {/* Header: title + small icon buttons */}
          <View style={styles.headerRow}>
            <View style={styles.headingBox}>
              <View style={styles.headingLine}>
                <HeadingIcon size={26} color={theme.colors.textPrimary} />
                <ThemedText style={styles.heading}>
                  {isComplete ? "We did it!" : "Edit this memory"}
                </ThemedText>
              </View>
              <ThemedText style={styles.subheading}>
                {isComplete
                  ? "Write a little note and stick some photos in."
                  : "Change the story or swap the photos."}
              </ThemedText>
            </View>
            <View style={styles.headerActions}>
              {!isComplete && (
                <TouchableOpacity
                  onPress={() => setConfirming(true)}
                  accessibilityLabel="Tear out this memory"
                >
                  <WobblyCircle
                    size={40}
                    fill="white"
                    stroke={theme.colors.border}
                    seed={13}
                  >
                    <Scissors size={18} color={theme.colors.textPrimary} />
                  </WobblyCircle>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                disabled={saving}
                accessibilityLabel="Close"
              >
                <WobblyCircle
                  size={40}
                  fill="white"
                  stroke={theme.colors.border}
                  seed={14}
                >
                  <X size={18} color={theme.colors.textPrimary} />
                </WobblyCircle>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form: scrolls if needed */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.formScroll}
          >
            <ThemedText style={styles.label}>Title</ThemedText>
            <View style={styles.field}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="What did we do?"
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.input}
              />
              <WobblyLine stroke={RULE_LINE} strokeWidth={2} seed={32} />
            </View>

            <ThemedText style={styles.label}>Our little note</ThemedText>
            <View style={styles.field}>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="How was it? What do we want to remember?"
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.noteInput}
                multiline
                scrollEnabled={false}
                textAlignVertical="top"
              />
              <WobblyLine stroke={RULE_LINE} strokeWidth={2} seed={33} />
            </View>

            <ThemedText style={styles.label}>How was it?</ThemedText>
            <View style={styles.ratingRow}>
              {RATINGS.map((r) => {
                const active = rating === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    // tap the selected face again to clear it
                    onPress={() => setRating(active ? null : r.value)}
                    hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
                    activeOpacity={0.7}
                    accessibilityLabel={r.label}
                    style={[
                      styles.ratingFace,
                      {
                        opacity: rating === null || active ? 1 : 0.4,
                        transform: [
                          { scale: active ? 1.25 : 1 },
                          { rotate: active ? "-6deg" : "0deg" },
                        ],
                      },
                    ]}
                  >
                    <r.Icon
                      size={30}
                      color={active ? r.color : theme.colors.textSecondary}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            <ThemedText style={styles.ratingCaption}>
              {getRating(rating)?.label ?? "tap a face"}
            </ThemedText>

            <ThemedText style={styles.label}>
              Photos ({photos.length}/{MAX_PHOTOS})
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photoStrip}
              contentContainerStyle={styles.photoStripContent}
            >
              <TouchableOpacity
                style={styles.addPhoto}
                onPress={addPhotos}
                activeOpacity={0.8}
              >
                <Camera size={24} color={theme.colors.textSecondary} />
                <ThemedText style={styles.addPhotoText}>add</ThemedText>
              </TouchableOpacity>
              {photos.map((p, i) => (
                <View
                  key={p.uri + i}
                  style={[
                    styles.thumbFrame,
                    {
                      transform: [
                        { rotate: `${PHOTO_TILTS[i % PHOTO_TILTS.length]}deg` },
                      ],
                    },
                  ]}
                >
                  <View style={styles.thumbTape} />
                  <Image
                    source={{ uri: p.uri }}
                    style={styles.thumb}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() => removePhoto(i)}
                    hitSlop={8}
                  >
                    <X size={12} color="white" strokeWidth={3} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </ScrollView>

          {/* Footer: always visible */}
          <View style={styles.footer}>
            {!!error && (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            )}
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.primaryButton, !title.trim() && { opacity: 0.5 }]}
              disabled={!title.trim() || saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  {isComplete && <Pin size={18} color="white" />}
                  <ThemedText style={styles.primaryText}>
                    {isComplete ? "Stick it in" : "Save changes"}
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>
        </WobblyBox>

        <ConfirmDialog
          visible={confirming}
          title="Tear this page out?"
          message="This memory will be gone from the scrapbook for good."
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false);
            onDelete?.();
          }}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 30,
    marginBottom: -6, // hides the wobbly bottom edge just below the screen
    maxHeight: "92%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  headingBox: {
    flex: 1,
    paddingRight: 8,
  },
  headingLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heading: {
    flexShrink: 1,
    fontFamily: "IndieFlower",
    fontSize: 28,
    color: theme.colors.textPrimary,
  },
  subheading: {
    fontFamily: "IndieFlower",
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },

  // form
  formScroll: {
    flexShrink: 1,
  },
  label: {
    fontFamily: "IndieFlower",
    fontSize: 20,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  field: {
    marginBottom: theme.spacing.md,
  },
  input: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    fontFamily: "IndieFlower",
    fontSize: 22,
    color: theme.colors.textPrimary,
  },
  noteInput: {
    minHeight: 78,
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 4,
    fontFamily: "IndieFlower",
    fontSize: 20,
    lineHeight: 26,
    color: theme.colors.textPrimary,
  },

  // rating
  ratingRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  ratingFace: {
    padding: 4,
  },
  ratingCaption: {
    fontFamily: "IndieFlower",
    fontSize: 18,
    textAlign: "center",
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: theme.spacing.sm,
  },

  // photos
  photoStrip: {
    marginBottom: theme.spacing.sm,
  },
  photoStripContent: {
    gap: 14,
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  addPhoto: {
    width: 72,
    height: 84,
    borderRadius: 4,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    backgroundColor: "transparent",
  },
  addPhotoText: {
    fontFamily: "IndieFlower",
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  thumbFrame: {
    backgroundColor: "white",
    padding: 5,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 3,
  },
  thumbTape: {
    position: "absolute",
    top: -8,
    alignSelf: "center",
    width: 36,
    height: 14,
    backgroundColor: theme.colors.secondary + "99",
    borderRadius: 3,
    transform: [{ rotate: "2deg" }],
    zIndex: 2,
  },
  thumb: {
    width: 64,
    height: 64,
  },
  removePhoto: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },

  // footer
  footer: {
    paddingTop: 10,
  },
  errorText: {
    color: "#D9534F",
    textAlign: "center",
    marginBottom: 8,
  },
  primaryButton: {
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.primary,
  },
  primaryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 17,
  },
});
