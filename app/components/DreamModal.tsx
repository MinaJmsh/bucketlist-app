import { ThemedText } from "@/components/themed-text";
import {
  Flower2,
  Moon,
  PartyPopper,
  Pencil,
  Scissors,
  Sparkles,
  X,
} from "@sketchyicons/react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { quickCategories } from "../../config/categories";
import { RULE_LINE } from "../../config/paper";
import { theme } from "../../config/theme";
import { BucketItem, NewBucketItem } from "../../lib/supabase";
import ConfirmDialog from "./ConfirmDialog";
import WobblyBox, { WobblyCircle, WobblyLine } from "./ui/WobblyBox";

type Period = "soon" | "someday";

const PERIODS: { key: Period; label: string; Icon: typeof Flower2 }[] = [
  { key: "soon", label: "soon", Icon: Flower2 },
  { key: "someday", label: "someday", Icon: Moon },
];

interface DreamModalProps {
  visible: boolean;
  goal: BucketItem | null; // null = adding a new dream
  onClose: () => void;
  onSave: (values: NewBucketItem) => void;
  onDelete?: () => void;
  onComplete?: () => void;
}

function Sticker({
  selected,
  tilt,
  seed,
  onPress,
  style,
  innerStyle,
  children,
}: {
  selected: boolean;
  tilt: number;
  seed: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>; // outer: width / flex
  innerStyle?: StyleProp<ViewStyle>; // inner: padding / alignment
  children: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        style,
        {
          opacity: selected ? 1 : 0.65,
          transform: [
            { rotate: `${selected ? tilt * 1.5 : tilt}deg` },
            { scale: selected ? 1.05 : 1 },
          ],
        },
      ]}
    >
      <WobblyBox
        style={[styles.stickerInner, innerStyle]}
        fill="white"
        stroke={selected ? theme.colors.primary : theme.colors.border}
        strokeWidth={selected ? 2.5 : 2}
        seed={seed}
      >
        {children}
      </WobblyBox>
      {selected && <View style={styles.stickerTape} />}
    </TouchableOpacity>
  );
}

export default function DreamModal({
  visible,
  goal,
  onClose,
  onSave,
  onDelete,
  onComplete,
}: DreamModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("food");
  const [addedBy, setAddedBy] = useState("A");
  const [period, setPeriod] = useState<Period>("soon");
  const [confirming, setConfirming] = useState(false);
  const insets = useSafeAreaInsets();

  const editing = !!goal;

  useEffect(() => {
    if (!visible) return;
    setConfirming(false);
    setTitle(goal?.title ?? "");
    setCategory(goal?.category ?? "food");
    setAddedBy(goal?.added_by ?? "A");
    setPeriod(
      goal?.period === "year" || goal?.period === "someday"
        ? "someday"
        : "soon",
    );
  }, [visible, goal?.id]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), category, added_by: addedBy, period });
    onClose();
  };

  const HeadingIcon = editing ? Pencil : Sparkles;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent // add if missing
      navigationBarTranslucent // add if missing
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <WobblyBox
          style={[styles.sheet, { paddingBottom: 26 + insets.bottom }]}
          fill="#FFFBEF"
          stroke={theme.colors.border}
          strokeWidth={2.5}
          seed={5}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headingBox}>
              <HeadingIcon size={20} color={theme.colors.textPrimary} />
              <ThemedText style={styles.heading}>
                {editing ? "Edit this dream" : "Write a new dream"}
              </ThemedText>
            </View>
            <View style={styles.headerActions}>
              {editing && (
                <TouchableOpacity
                  onPress={() => setConfirming(true)}
                  accessibilityLabel="Tear out this dream"
                >
                  <WobblyCircle
                    size={32}
                    fill="white"
                    stroke={theme.colors.border}
                    seed={11}
                  >
                    <Scissors size={15} color={theme.colors.textPrimary} />
                  </WobblyCircle>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} accessibilityLabel="Close">
                <WobblyCircle
                  size={32}
                  fill="white"
                  stroke={theme.colors.border}
                  seed={12}
                >
                  <X size={15} color={theme.colors.textPrimary} />
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
            <View style={styles.field}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="What do you dream of?"
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.input}
                autoFocus={!editing}
              />
              <WobblyLine stroke={RULE_LINE} strokeWidth={2} seed={31} />
            </View>

            <ThemedText style={styles.label}>When?</ThemedText>
            <View style={styles.optionsRow}>
              {PERIODS.map((p, i) => (
                <Sticker
                  key={p.key}
                  selected={period === p.key}
                  tilt={i % 2 === 0 ? -2 : 2}
                  seed={50 + i}
                  onPress={() => setPeriod(p.key)}
                  style={styles.flexOne}
                  innerStyle={styles.optionInner}
                >
                  <p.Icon
                    size={20}
                    color={
                      period === p.key
                        ? theme.colors.primary
                        : theme.colors.textPrimary
                    }
                  />
                  <ThemedText
                    style={[
                      styles.optionLabel,
                      period === p.key && styles.optionLabelActive,
                    ]}
                  >
                    {p.label}
                  </ThemedText>
                </Sticker>
              ))}
            </View>

            <ThemedText style={styles.label}>Written by</ThemedText>
            <View style={styles.optionsRow}>
              {[
                {
                  key: "A",
                  label: "mina",
                  image: require("../../assets/images/mina2.png"),
                },
                {
                  key: "B",
                  label: "parsa",
                  image: require("../../assets/images/parsa2.png"),
                },
              ].map((who, i) => (
                <Sticker
                  key={who.key}
                  selected={addedBy === who.key}
                  tilt={i % 2 === 0 ? 2 : -2}
                  seed={60 + i}
                  onPress={() => setAddedBy(who.key)}
                  style={styles.flexOne}
                  innerStyle={styles.polaroidInner}
                >
                  <Image source={who.image} style={styles.personImage} />
                  <ThemedText
                    style={[
                      styles.optionLabel,
                      addedBy === who.key && styles.optionLabelActive,
                    ]}
                  >
                    {who.label}
                  </ThemedText>
                </Sticker>
              ))}
            </View>

            <ThemedText style={styles.label}>Sticker</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categories}
            >
              {quickCategories.map((cat, i) => (
                <Sticker
                  key={cat.id}
                  selected={category === cat.id}
                  tilt={[-3, 2, -2, 3][i % 4]}
                  seed={70 + i}
                  onPress={() => setCategory(cat.id)}
                  style={styles.categorySticker}
                  innerStyle={styles.categoryInner}
                >
                  <cat.icon
                    size={20}
                    color={
                      category === cat.id
                        ? theme.colors.primary
                        : theme.colors.textPrimary
                    }
                  />
                  <ThemedText
                    style={[
                      styles.categoryText,
                      category === cat.id && styles.categoryTextActive,
                    ]}
                  >
                    {cat.name}
                  </ThemedText>
                </Sticker>
              ))}
            </ScrollView>
          </ScrollView>

          {/* Footer: always visible */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.primaryButton, !title.trim() && { opacity: 0.5 }]}
              disabled={!title.trim()}
            >
              <ThemedText style={styles.primaryText}>
                {editing ? "Save changes" : "Write it down"}
              </ThemedText>
            </TouchableOpacity>

            {editing && (
              <TouchableOpacity
                onPress={() => onComplete?.()}
                style={styles.secondaryWrap}
                activeOpacity={0.8}
              >
                <WobblyBox
                  style={styles.secondaryButton}
                  fill="white"
                  stroke={theme.colors.border}
                  strokeWidth={2.5}
                  seed={41}
                >
                  <PartyPopper size={17} color={theme.colors.textPrimary} />
                  <ThemedText style={styles.secondaryText}>
                    We did it!
                  </ThemedText>
                </WobblyBox>
              </TouchableOpacity>
            )}
          </View>
        </WobblyBox>

        <ConfirmDialog
          visible={confirming}
          title="Tear this dream out?"
          message="It'll be gone from the notebook."
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
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: 26,
    marginBottom: -6, // hides the wobbly bottom edge just below the screen
    maxHeight: "92%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  headingBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heading: {
    flexShrink: 1,
    fontFamily: "IndieFlower",
    fontSize: 22,
    color: theme.colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    gap: 6,
  },

  // form
  formScroll: {
    flexShrink: 1,
  },
  field: {
    marginBottom: theme.spacing.sm,
  },
  input: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    fontFamily: "IndieFlower",
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  label: {
    fontFamily: "IndieFlower",
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    paddingTop: 4,
    paddingHorizontal: 4,
    marginBottom: theme.spacing.sm,
  },
  flexOne: {
    flex: 1,
  },
  categoriesScroll: {
    marginBottom: theme.spacing.xs,
  },
  categories: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 6,
  },
  optionLabel: {
    fontFamily: "IndieFlower",
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  optionLabelActive: {
    color: theme.colors.primary,
  },
  categoryText: {
    fontFamily: "IndieFlower",
    fontSize: 13,
    color: theme.colors.textPrimary,
    marginTop: 1,
  },
  categoryTextActive: {
    color: theme.colors.primary,
  },
  personImage: {
    width: 34,
    height: 34,
    resizeMode: "contain",
  },

  // sticker look (the outline itself is drawn by WobblyBox)
  stickerInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  stickerTape: {
    position: "absolute",
    top: -7,
    alignSelf: "center",
    width: 34,
    height: 13,
    backgroundColor: theme.colors.accent + "99",
    borderRadius: 3,
    transform: [{ rotate: "-2deg" }],
    zIndex: 2,
  },
  optionInner: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 2,
  },
  polaroidInner: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 2,
  },
  categorySticker: {
    width: 68,
  },
  categoryInner: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  // footer
  footer: {
    paddingTop: 8,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: theme.colors.primary,
  },
  primaryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryWrap: {
    marginTop: 8,
  },
  secondaryButton: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  secondaryText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
    fontSize: 15,
  },
});
