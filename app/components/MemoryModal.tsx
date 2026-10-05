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
import { theme } from "../../config/theme";
import { pickPhotos, uploadPhoto } from "../../lib/photos";
import { BucketItem } from "../../lib/supabase";
import ConfirmDialog from "./ConfirmDialog";

export interface MemoryValues {
  title: string;
  description: string;
  photos: string[];
}

type PhotoItem = { uri: string; asset?: ImagePickerAsset };

const MAX_PHOTOS = 8;

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

  useEffect(() => {
    if (!visible) return;
    setTitle(goal?.title ?? "");
    setDescription(goal?.description ?? "");
    setPhotos((goal?.photos ?? []).map((uri) => ({ uri })));
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
        <View style={styles.sheet}>
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
                  style={styles.iconButton}
                  onPress={() => setConfirming(true)}
                  accessibilityLabel="Tear out this memory"
                >
                  <Scissors size={18} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onClose}
                disabled={saving}
                accessibilityLabel="Close"
              >
                <X size={18} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ThemedText style={styles.label}>Title</ThemedText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What did we do?"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
            />

            <ThemedText style={styles.label}>Our little note</ThemedText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="How was it? What do we want to remember?"
              placeholderTextColor={theme.colors.textSecondary}
              style={[styles.input, styles.noteInput]}
              multiline
              textAlignVertical="top"
            />

            <ThemedText style={styles.label}>
              Photos ({photos.length}/{MAX_PHOTOS})
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photoStrip}
              contentContainerStyle={styles.photoStripContent}
            >
              <TouchableOpacity style={styles.addPhoto} onPress={addPhotos}>
                <Camera size={26} color={theme.colors.textSecondary} />
                <ThemedText style={styles.addPhotoText}>add</ThemedText>
              </TouchableOpacity>
              {photos.map((p, i) => (
                <View key={p.uri + i} style={styles.thumbFrame}>
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
          </ScrollView>
        </View>

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
    backgroundColor: "#FFFBEF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.xl,
    paddingBottom: 36,
    maxHeight: "92%",
    borderWidth: 2.5,
    borderBottomWidth: 0,
    borderColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
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
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderRadius: 16,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  noteInput: {
    minHeight: 96,
  },
  photoStrip: {
    marginBottom: theme.spacing.lg,
  },
  photoStripContent: {
    gap: 10,
    paddingTop: 6,
    paddingRight: 6,
  },
  addPhoto: {
    width: 84,
    height: 96,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    backgroundColor: "white",
  },
  addPhotoText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  thumbFrame: {
    backgroundColor: "white",
    padding: 5,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  thumb: {
    width: 74,
    height: 74,
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
  },
  errorText: {
    color: "#D9534F",
    textAlign: "center",
    marginBottom: 10,
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
