import { ThemedText } from "@/components/themed-text";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MARGIN_LINE, PAPER, ROW_HEIGHT } from "../../config/paper";
import { theme } from "../../config/theme";
import { BucketItem, NewBucketItem, supabase } from "../../lib/supabase";
import DreamModal from "../components/DreamModal";
import GoalItem from "../components/GoalItem";
import MemoryModal, { MemoryValues } from "../components/MemoryModal";
import { GridPaper, StickerLayer } from "../components/PaperDecor";
import Polaroid from "../components/Polaroid";
import TopBar, { MenuItem } from "../components/TopBar";

type Bucket = "soon" | "someday";
type PageTab = "dreams" | "memories";

// legacy values (week/month/year) still work
const bucketOf = (g: BucketItem): Bucket =>
  g.period === "year" || g.period === "someday" ? "someday" : "soon";

const MENU_ITEMS: MenuItem[] = [
  { id: "dreams", label: "Our dreams", emoji: "📖" },
  { id: "games", label: "Games", emoji: "🎲", comingSoon: true },
  { id: "ideas", label: "Idea box", emoji: "💡", comingSoon: true },
];

const HOLES = 8;

export default function Index() {
  const [goals, setGoals] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageTab, setPageTab] = useState<PageTab>("dreams");

  const [dreamModal, setDreamModal] = useState<{
    open: boolean;
    goal: BucketItem | null;
  }>({ open: false, goal: null });

  const [memoryModal, setMemoryModal] = useState<{
    open: boolean;
    mode: "complete" | "edit";
    goal: BucketItem | null;
  }>({ open: false, mode: "complete", goal: null });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bucket_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error loading goals:", error);
      Alert.alert("Error", "Failed to load bucket list items");
    } finally {
      setLoading(false);
    }
  };

  // generic update helper (throws so callers can show their own message)
  const patchGoal = async (id: string, patch: Partial<BucketItem>) => {
    const updates = { ...patch, updated_at: new Date().toISOString() };
    const { error } = await supabase
      .from("bucket_items")
      .update(updates)
      .eq("id", id);
    if (error) throw error;
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    );
  };

  const addGoal = async (values: NewBucketItem) => {
    try {
      const { data, error } = await supabase
        .from("bucket_items")
        .insert([values])
        .select()
        .single();
      if (error) throw error;
      setGoals((prev) => [data, ...prev]);
      setPageTab("dreams");
    } catch (error) {
      console.error("Error adding goal:", error);
      Alert.alert("Error", "Failed to add item");
    }
  };

  const saveDream = async (values: NewBucketItem) => {
    const goal = dreamModal.goal;
    if (!goal) return addGoal(values);
    try {
      await patchGoal(goal.id, values);
    } catch (error) {
      console.error("Error updating dream:", error);
      Alert.alert("Error", "Failed to update dream");
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("bucket_items")
        .delete()
        .eq("id", id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error(
          "No rows deleted. Check the delete policy in Supabase.",
        );
      }

      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      console.error("Error deleting goal:", error);
      Alert.alert("Error", "Couldn't tear that one out. Try again?");
    }
  };

  const saveMemory = async (values: MemoryValues) => {
    const goal = memoryModal.goal;
    if (!goal) return;
    if (memoryModal.mode === "complete") {
      await patchGoal(goal.id, {
        ...values,
        completed: true,
        completed_at: new Date().toISOString(),
      });
      setPageTab("memories");
    } else {
      await patchGoal(goal.id, values);
    }
  };

  const moveBackToDreams = async (goal: BucketItem) => {
    try {
      await patchGoal(goal.id, { completed: false, completed_at: null });
      setMemoryModal((m) => ({ ...m, open: false }));
      setPageTab("dreams");
    } catch (error) {
      console.error("Error moving back:", error);
      Alert.alert("Error", "Failed to update item");
    }
  };

  const openDream = (goal: BucketItem) => setDreamModal({ open: true, goal });
  const openComplete = (goal: BucketItem) =>
    setMemoryModal({ open: true, mode: "complete", goal });
  const openMemory = (goal: BucketItem) =>
    setMemoryModal({ open: true, mode: "edit", goal });

  const activeGoals = goals.filter((g) => !g.completed);
  const memories = goals
    .filter((g) => g.completed)
    .sort(
      (a, b) =>
        new Date(b.completed_at || 0).getTime() -
        new Date(a.completed_at || 0).getTime(),
    );
  const soonGoals = activeGoals.filter((g) => bucketOf(g) === "soon");
  const somedayGoals = activeGoals.filter((g) => bucketOf(g) === "someday");

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>
          Opening your notebook...
        </ThemedText>
      </View>
    );
  }

  const renderDreamSection = (title: string, items: BucketItem[]) =>
    items.length > 0 && (
      <View>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
        </View>
        {items.map((goal) => (
          <GoalItem
            key={goal.id}
            goal={goal}
            onOpen={openDream}
            onComplete={openComplete}
          />
        ))}
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />

      <TopBar title="MAP BUCKETLIST" items={MENU_ITEMS} activeId="dreams" />

      <View style={styles.notebook}>
        {/* Folder tabs sticking out of the page */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setPageTab("dreams")}
            style={[styles.tab, pageTab === "dreams" && styles.tabActive]}
          >
            <ThemedText
              style={[
                styles.tabText,
                pageTab === "dreams" && styles.tabTextActive,
              ]}
            >
              📝 Dreams {activeGoals.length}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPageTab("memories")}
            style={[styles.tab, pageTab === "memories" && styles.tabActive]}
          >
            <ThemedText
              style={[
                styles.tabText,
                pageTab === "memories" && styles.tabTextActive,
              ]}
            >
              📸 Memories {memories.length}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* The page */}
        <View style={styles.page}>
          {pageTab === "memories" ? (
            <GridPaper />
          ) : (
            <View style={styles.marginLine} pointerEvents="none" />
          )}
          <View style={styles.holes} pointerEvents="none">
            {Array.from({ length: HOLES }).map((_, i) => (
              <View key={i} style={styles.hole} />
            ))}
          </View>

          {pageTab === "dreams" ? (
            <ScrollView
              contentContainerStyle={styles.dreamsContent}
              showsVerticalScrollIndicator={false}
            >
              {activeGoals.length === 0 && (
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyText}>
                    nothing written yet...{"\n"}tap + to add our first dream ✏️
                  </ThemedText>
                </View>
              )}

              {renderDreamSection("🌷 Soon", soonGoals)}
              {renderDreamSection("🌙 Someday", somedayGoals)}

              {activeGoals.length > 0 && (
                <ThemedText style={styles.hint}>
                  tap a line to edit · tap the circle when we've done it
                </ThemedText>
              )}
            </ScrollView>
          ) : (
            <ScrollView
              contentContainerStyle={styles.memoriesContent}
              showsVerticalScrollIndicator={false}
            >
              {memories.length === 0 ? (
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyText}>
                    no polaroids yet...{"\n"}finish a dream to stick one here 📸
                  </ThemedText>
                </View>
              ) : (
                <>
                  <View style={styles.polaroidGrid}>
                    {memories.map((goal, i) => (
                      <Polaroid
                        key={goal.id}
                        goal={goal}
                        index={i}
                        onPress={openMemory}
                      />
                    ))}
                  </View>
                  <ThemedText style={styles.hint}>
                    tap a polaroid to edit
                  </ThemedText>
                </>
              )}
              <StickerLayer
                count={Math.max(2, Math.ceil(memories.length / 2) + 1)}
              />
            </ScrollView>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setDreamModal({ open: true, goal: null })}
      >
        <Text style={styles.plusIcon}>+</Text>
      </TouchableOpacity>

      <DreamModal
        visible={dreamModal.open}
        goal={dreamModal.goal}
        onClose={() => setDreamModal((m) => ({ ...m, open: false }))}
        onSave={saveDream}
        onDelete={() => {
          if (dreamModal.goal) deleteGoal(dreamModal.goal.id);
          setDreamModal((m) => ({ ...m, open: false }));
        }}
        onComplete={() => {
          const goal = dreamModal.goal;
          setDreamModal((m) => ({ ...m, open: false }));
          if (goal) {
            // iOS needs a beat between two sheets; web/android don't
            setTimeout(
              () => openComplete(goal),
              Platform.OS === "ios" ? 350 : 0,
            );
          }
        }}
      />

      <MemoryModal
        visible={memoryModal.open}
        mode={memoryModal.mode}
        goal={memoryModal.goal}
        onClose={() => setMemoryModal((m) => ({ ...m, open: false }))}
        onSave={saveMemory}
        onUndo={() => memoryModal.goal && moveBackToDreams(memoryModal.goal)}
        onDelete={() => {
          if (memoryModal.goal) deleteGoal(memoryModal.goal.id);
          setMemoryModal((m) => ({ ...m, open: false }));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  notebook: {
    flex: 1,
    marginHorizontal: 14,
    marginBottom: 14,
  },
  tabRow: {
    flexDirection: "row",
    gap: 6,
    paddingLeft: 14,
    marginBottom: -2.5,
    zIndex: 2,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 2.5,
    borderColor: theme.colors.border,
    backgroundColor: "#EADFC8",
  },
  tabActive: {
    backgroundColor: PAPER,
    borderBottomWidth: 0,
    paddingBottom: 11.5,
  },
  tabText: {
    fontSize: 17,
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.textPrimary,
  },
  page: {
    flex: 1,
    backgroundColor: PAPER,
    borderWidth: 2.5,
    borderColor: theme.colors.border,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  marginLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 52,
    width: 2,
    backgroundColor: MARGIN_LINE,
    opacity: 0.8,
  },
  holes: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 14,
    justifyContent: "space-around",
    paddingVertical: 18,
  },
  hole: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: "#D9CDB4",
  },
  dreamsContent: {
    paddingLeft: 66,
    paddingRight: 18,
    paddingTop: 10,
    paddingBottom: 120,
  },
  memoriesContent: {
    paddingLeft: 40,
    paddingRight: 18,
    paddingTop: 28,
    paddingBottom: 120,
  },
  sectionHeader: {
    height: ROW_HEIGHT,
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: "IndieFlower",
    fontSize: 26,
    color: theme.colors.textPrimary,
  },
  polaroidGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  hint: {
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
    color: theme.colors.textSecondary,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 20,
    lineHeight: 28,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    right: 28,
    bottom: 50,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  plusIcon: {
    fontSize: 32,
    color: "white",
    fontWeight: "300",
    marginTop: -2,
  },
});
