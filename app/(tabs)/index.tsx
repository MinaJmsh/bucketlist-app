import { ThemedText } from "@/components/themed-text";
import {
  ArrowDownAZ,
  BookOpen,
  CalendarArrowDown,
  CalendarArrowUp,
  Check,
  ChevronDown,
  Dices,
  Flower2,
  Funnel,
  FunnelX,
  Image,
  Lightbulb,
  Menu,
  Moon,
  NotebookPen,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Users,
} from "@sketchyicons/react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ImageSourcePropType,
  Modal,
  Platform,
  Pressable,
  Image as RNImage,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { quickCategories } from "../../config/categories";
import { MARGIN_LINE, PAPER, ROW_HEIGHT, RULE_LINE } from "../../config/paper";
import { theme } from "../../config/theme";
import { BucketItem, NewBucketItem, supabase } from "../../lib/supabase";
import DreamModal from "../components/DreamModal";
import GoalItem from "../components/GoalItem";
import MemoryModal, { MemoryValues } from "../components/MemoryModal";
import MemoryViewer from "../components/MemoryViewer";
import {
  BackgroundStickers,
  GinghamBackground,
  GridPaper,
  StickerLayer,
} from "../components/PaperDecor";
import Polaroid from "../components/Polaroid";
import SideMenu, { MenuItem } from "../components/SideMenu";
import WobblyBox, { WobblyLine } from "../components/ui/WobblyBox";

type Bucket = "soon" | "someday";
type PageTab = "dreams" | "memories";
type DreamSort = "newest" | "oldest" | "az";
type MemorySort = "recent" | "oldest" | "az" | "rating";

type IconType = React.ComponentType<{ size?: number; color?: string }>;

type SortOption<T extends string> = {
  key: T;
  label: string;
  Icon: IconType;
};

const DREAM_SORTS: SortOption<DreamSort>[] = [
  { key: "newest", label: "newest first", Icon: CalendarArrowDown },
  { key: "oldest", label: "oldest first", Icon: CalendarArrowUp },
  { key: "az", label: "A to Z", Icon: ArrowDownAZ },
];

const MEMORY_SORTS: SortOption<MemorySort>[] = [
  { key: "recent", label: "most recent", Icon: CalendarArrowDown },
  { key: "oldest", label: "oldest first", Icon: CalendarArrowUp },
  { key: "az", label: "A to Z", Icon: ArrowDownAZ },
  { key: "rating", label: "best rated", Icon: Star },
];

// filters: who wrote it + which sticker (category)
type WhoFilter = "all" | "A" | "B";
type Filters = { who: WhoFilter; cat: string };
const NO_FILTERS: Filters = { who: "all", cat: "all" };

const WHO_OPTIONS: {
  key: WhoFilter;
  label: string;
  Icon?: IconType;
  image?: ImageSourcePropType;
}[] = [
  { key: "all", label: "everyone", Icon: Users },
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
];

const matchesFilters = (g: BucketItem, f: Filters) =>
  (f.who === "all" || g.added_by === f.who) &&
  (f.cat === "all" || g.category === f.cat);

// legacy values (week/month/year) still work
const bucketOf = (g: BucketItem): Bucket =>
  g.period === "year" || g.period === "someday" ? "someday" : "soon";

const MENU_ITEMS: MenuItem[] = [
  { id: "dreams", label: "Our dreams", icon: BookOpen },
  { id: "games", label: "Games", icon: Dices, comingSoon: true },
  { id: "ideas", label: "Idea box", icon: Lightbulb, comingSoon: true },
];

const HOLES = 8;
const BORDER_WIDTH = 2.5;
const GRAY = "#E6E4DF"; // selected / active highlight

// iOS needs a beat between two modals; web/android don't
const modalDelay = Platform.OS === "ios" ? 350 : 0;

// Tab that springs up in size when it becomes active
function TabButton({
  active,
  onPress,
  children,
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(active ? 1.06 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: active ? 1.06 : 1,
      friction: 5,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [active]);

  return (
    <Animated.View style={{ transform: [{ scale }], zIndex: active ? 2 : 1 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.tab, active && styles.tabActive]}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Shared shell for the filter + sort dropdowns: a wobbly button that opens a
// wobbly paper menu floating ON TOP of the page (in a Modal, so nothing below
// it moves).
function MenuButton({
  Icon,
  label,
  highlighted,
  seed,
  menuWidth,
  children,
}: {
  Icon: IconType;
  label: string;
  highlighted?: boolean;
  seed: number;
  menuWidth: number;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const buttonRef = useRef<View>(null);
  const { width: screenW, height: screenH } = useWindowDimensions();

  // measure where the button is on screen, then open the menu under it
  const openMenu = () => {
    buttonRef.current?.measureInWindow((x, y, w, h) => {
      setAnchor({ x, y, w, h });
      setOpen(true);
    });
  };

  const top = anchor.y + anchor.h + 4;
  const left = Math.min(Math.max(8, anchor.x), screenW - menuWidth - 8);
  const maxMenuHeight = Math.max(160, Math.min(380, screenH - top - 24));

  return (
    <>
      <View ref={buttonRef} collapsable={false}>
        <TouchableOpacity activeOpacity={0.8} onPress={openMenu}>
          <WobblyBox
            style={styles.menuButton}
            fill={highlighted ? GRAY : "white"}
            stroke={theme.colors.border}
            strokeWidth={2}
            seed={seed}
          >
            <View style={styles.menuButtonInner}>
              <Icon size={16} color={theme.colors.textPrimary} />
              <ThemedText style={styles.menuButtonText}>{label}</ThemedText>
              <View style={open ? styles.caretOpen : undefined}>
                <ChevronDown size={14} color={theme.colors.textSecondary} />
              </View>
            </View>
          </WobblyBox>
        </TouchableOpacity>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent // <- add this line
        onRequestClose={() => setOpen(false)}
      >
        {/* tap anywhere outside the menu to close it */}
        <Pressable style={styles.menuBackdrop} onPress={() => setOpen(false)}>
          <Pressable
            onPress={() => {}}
            style={{ position: "absolute", top, left }}
          >
            <WobblyBox
              style={{ width: menuWidth }}
              fill="white"
              stroke={theme.colors.border}
              strokeWidth={2}
              seed={seed + 1}
            >
              <ScrollView
                style={{ maxHeight: maxMenuHeight }}
                contentContainerStyle={styles.menuInner}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {children(() => setOpen(false))}
              </ScrollView>
            </WobblyBox>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// one row in a menu; the picked row gets a gray highlight and a check
function MenuRow({
  Icon,
  image,
  label,
  active,
  onPress,
}: {
  Icon?: IconType;
  image?: ImageSourcePropType;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.menuRow, active && styles.menuRowActive]}
    >
      <View style={styles.menuRowIcon}>
        {image ? (
          <RNImage source={image} style={styles.menuHead} />
        ) : Icon ? (
          <Icon size={16} color={theme.colors.textPrimary} />
        ) : null}
      </View>
      <ThemedText style={styles.menuRowText}>{label}</ThemedText>
      {active && <Check size={14} color={theme.colors.textSecondary} />}
    </TouchableOpacity>
  );
}

function SortDropdown<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SortOption<T>[];
  value: T;
  onChange: (key: T) => void;
}) {
  const current = options.find((o) => o.key === value) ?? options[0];
  return (
    <MenuButton
      Icon={current.Icon}
      label={current.label}
      seed={71}
      menuWidth={180}
    >
      {(close) =>
        options.map((o, i) => (
          <View key={o.key}>
            {i > 0 && (
              <WobblyLine stroke={RULE_LINE} strokeWidth={2} seed={80 + i} />
            )}
            <MenuRow
              Icon={o.Icon}
              label={o.label}
              active={o.key === value}
              onPress={() => {
                onChange(o.key);
                close();
              }}
            />
          </View>
        ))
      }
    </MenuButton>
  );
}

function FilterDropdown({
  value,
  onChange,
  seed,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
  seed: number;
}) {
  const count = (value.who !== "all" ? 1 : 0) + (value.cat !== "all" ? 1 : 0);
  const who = WHO_OPTIONS.find((w) => w.key === value.who);
  const cat = quickCategories.find((c) => c.id === value.cat);
  const label =
    count === 0
      ? "filters"
      : count === 2
        ? "2 filters"
        : value.who !== "all"
          ? (who?.label ?? "1 filter")
          : (cat?.name ?? "1 filter");

  return (
    <MenuButton
      Icon={Funnel}
      label={label}
      highlighted={count > 0}
      seed={seed}
      menuWidth={210}
    >
      {() => (
        <>
          <ThemedText style={styles.menuHeading}>written by</ThemedText>
          {WHO_OPTIONS.map((w) => (
            <MenuRow
              key={w.key}
              Icon={w.Icon}
              image={w.image}
              label={w.label}
              active={value.who === w.key}
              onPress={() => onChange({ ...value, who: w.key })}
            />
          ))}

          <WobblyLine stroke={RULE_LINE} strokeWidth={2} seed={seed + 10} />

          <ThemedText style={styles.menuHeading}>sticker</ThemedText>
          <MenuRow
            Icon={Sparkles}
            label="all stickers"
            active={value.cat === "all"}
            onPress={() => onChange({ ...value, cat: "all" })}
          />
          {quickCategories.map((c) => (
            <MenuRow
              key={c.id}
              Icon={c.icon}
              label={c.name}
              active={value.cat === c.id}
              onPress={() => onChange({ ...value, cat: c.id })}
            />
          ))}

          {count > 0 && (
            <>
              <WobblyLine stroke={RULE_LINE} strokeWidth={2} seed={seed + 11} />
              <MenuRow
                Icon={FunnelX}
                label="clear filters"
                onPress={() => onChange(NO_FILTERS)}
              />
            </>
          )}
        </>
      )}
    </MenuButton>
  );
}

export default function Index() {
  const [goals, setGoals] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageTab, setPageTab] = useState<PageTab>("dreams");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dreamSort, setDreamSort] = useState<DreamSort>("newest");
  const [memorySort, setMemorySort] = useState<MemorySort>("recent");
  const [dreamFilters, setDreamFilters] = useState<Filters>(NO_FILTERS);
  const [memoryFilters, setMemoryFilters] = useState<Filters>(NO_FILTERS);
  // real height of the memories page content, so stickers can follow it
  const [memoriesHeight, setMemoriesHeight] = useState(0);

  const [dreamModal, setDreamModal] = useState<{
    open: boolean;
    goal: BucketItem | null;
  }>({ open: false, goal: null });

  const [memoryModal, setMemoryModal] = useState<{
    open: boolean;
    mode: "complete" | "edit";
    goal: BucketItem | null;
  }>({ open: false, mode: "complete", goal: null });

  // which memory's scrapbook page is open
  const [viewerId, setViewerId] = useState<string | null>(null);
  // when editing from the scrapbook page, come back to it afterwards
  const returnToViewer = useRef<string | null>(null);

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

  const openDream = (goal: BucketItem) => setDreamModal({ open: true, goal });
  const openComplete = (goal: BucketItem) =>
    setMemoryModal({ open: true, mode: "complete", goal });
  const openMemoryEditor = (goal: BucketItem) =>
    setMemoryModal({ open: true, mode: "edit", goal });

  // scrapbook page -> edit sheet
  const editFromViewer = () => {
    const goal = goals.find((g) => g.id === viewerId);
    if (!goal) return;
    returnToViewer.current = goal.id;
    setViewerId(null);
    setTimeout(() => openMemoryEditor(goal), modalDelay);
  };

  // edit sheet closed (saved or cancelled) -> go back to the scrapbook page
  const closeMemoryModal = () => {
    setMemoryModal((m) => ({ ...m, open: false }));
    const id = returnToViewer.current;
    returnToViewer.current = null;
    if (id) setTimeout(() => setViewerId(id), modalDelay);
  };

  const viewerGoal = goals.find((g) => g.id === viewerId) ?? null;
  const stickerArea = Math.max(0, memoriesHeight - 110);

  // ---------- sorting ----------
  const time = (s: string | null | undefined) => new Date(s || 0).getTime();
  const byTitle = (a: BucketItem, b: BucketItem) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" });

  const sortDreams = (list: BucketItem[]) => {
    const arr = [...list];
    if (dreamSort === "az") return arr.sort(byTitle);
    if (dreamSort === "oldest")
      return arr.sort((a, b) => time(a.created_at) - time(b.created_at));
    return arr.sort((a, b) => time(b.created_at) - time(a.created_at));
  };

  const sortMemories = (list: BucketItem[]) => {
    const arr = [...list];
    if (memorySort === "az") return arr.sort(byTitle);
    if (memorySort === "oldest")
      return arr.sort((a, b) => time(a.completed_at) - time(b.completed_at));
    if (memorySort === "rating")
      return arr.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    return arr.sort((a, b) => time(b.completed_at) - time(a.completed_at));
  };

  const allActive = goals.filter((g) => !g.completed);
  const allMemories = goals.filter((g) => g.completed);
  const activeGoals = allActive.filter((g) => matchesFilters(g, dreamFilters));
  const memories = sortMemories(
    allMemories.filter((g) => matchesFilters(g, memoryFilters)),
  );
  const soonGoals = sortDreams(
    activeGoals.filter((g) => bucketOf(g) === "soon"),
  );
  const somedayGoals = sortDreams(
    activeGoals.filter((g) => bucketOf(g) === "someday"),
  );

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

  const renderDreamSection = (
    title: string,
    Icon: typeof Flower2,
    items: BucketItem[],
  ) =>
    items.length > 0 && (
      <View>
        <View style={styles.sectionHeader}>
          <Icon size={18} color={theme.colors.textPrimary} />
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
      {/* app background: gingham + stickers, drawn first so the paper covers it */}
      <GinghamBackground />
      <BackgroundStickers />

      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuOpen(true)} hitSlop={12}>
          <Menu size={30} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>MAP BUCKETLIST</ThemedText>
      </View>

      <View style={styles.notebook}>
        {/* Folder tabs sticking out of the page */}
        <View style={styles.tabRow}>
          <TabButton
            active={pageTab === "dreams"}
            onPress={() => setPageTab("dreams")}
          >
            <NotebookPen
              size={18}
              color={
                pageTab === "dreams"
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary
              }
            />
            <ThemedText
              style={[
                styles.tabText,
                pageTab === "dreams" && styles.tabTextActive,
              ]}
            >
              Dreams {allActive.length}
            </ThemedText>
          </TabButton>

          <TabButton
            active={pageTab === "memories"}
            onPress={() => setPageTab("memories")}
          >
            <Image
              size={18}
              color={
                pageTab === "memories"
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary
              }
            />
            <ThemedText
              style={[
                styles.tabText,
                pageTab === "memories" && styles.tabTextActive,
              ]}
            >
              Memories {allMemories.length}
            </ThemedText>
          </TabButton>
        </View>

        {/* The page */}
        <WobblyBox
          style={styles.page}
          fill={PAPER}
          stroke={theme.colors.border}
          strokeWidth={BORDER_WIDTH}
          seed={33}
        >
          <View style={styles.pageClip}>
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
                {allActive.length === 0 && (
                  <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyText}>
                      nothing written yet...{"\n"}tap + to add our first dream
                    </ThemedText>
                    <Pencil
                      size={28}
                      color={theme.colors.textSecondary}
                      style={styles.emptyIcon}
                    />
                  </View>
                )}

                {allActive.length > 0 && (
                  <View style={styles.toolbar}>
                    <FilterDropdown
                      value={dreamFilters}
                      onChange={setDreamFilters}
                      seed={73}
                    />
                    <SortDropdown
                      options={DREAM_SORTS}
                      value={dreamSort}
                      onChange={setDreamSort}
                    />
                  </View>
                )}

                {allActive.length > 0 && activeGoals.length === 0 && (
                  <View style={styles.noMatch}>
                    <ThemedText style={styles.emptyText}>
                      no dreams match these filters...
                    </ThemedText>
                  </View>
                )}

                {renderDreamSection("Soon", Flower2, soonGoals)}
                {renderDreamSection("Someday", Moon, somedayGoals)}

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
                onContentSizeChange={(_, h) => setMemoriesHeight(h)}
              >
                {allMemories.length === 0 ? (
                  <View style={styles.emptyState}>
                    <ThemedText style={styles.emptyText}>
                      no polaroids yet...{"\n"}finish a dream to stick one here
                    </ThemedText>
                    <Image
                      size={28}
                      color={theme.colors.textSecondary}
                      style={styles.emptyIcon}
                    />
                  </View>
                ) : (
                  <>
                    <View style={[styles.toolbar, styles.toolbarMemories]}>
                      <FilterDropdown
                        value={memoryFilters}
                        onChange={setMemoryFilters}
                        seed={75}
                      />
                      <SortDropdown
                        options={MEMORY_SORTS}
                        value={memorySort}
                        onChange={setMemorySort}
                      />
                    </View>

                    {memories.length === 0 ? (
                      <View style={styles.noMatch}>
                        <ThemedText style={styles.emptyText}>
                          no memories match these filters...
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
                              onPress={(g) => setViewerId(g.id)}
                            />
                          ))}
                        </View>
                        <ThemedText style={styles.hint}>
                          tap a polaroid to open its page
                        </ThemedText>
                      </>
                    )}
                  </>
                )}
                <StickerLayer
                  // roughly one sticker per 170px of polaroids, spread over
                  // the real content height (minus the empty bottom padding)
                  count={Math.max(4, Math.round(stickerArea / 170))}
                  height={stickerArea || undefined}
                />
              </ScrollView>
            )}
          </View>
        </WobblyBox>
      </View>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setDreamModal({ open: true, goal: null })}
      >
        <Plus size={30} color="white" />
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
          if (goal) setTimeout(() => openComplete(goal), modalDelay);
        }}
      />

      <MemoryViewer
        visible={!!viewerGoal}
        goal={viewerGoal}
        onClose={() => setViewerId(null)}
        onEdit={editFromViewer}
      />

      <MemoryModal
        visible={memoryModal.open}
        mode={memoryModal.mode}
        goal={memoryModal.goal}
        onClose={closeMemoryModal}
        onSave={saveMemory}
        onDelete={() => {
          // torn out: don't go back to its (now empty) scrapbook page
          returnToViewer.current = null;
          if (memoryModal.goal) deleteGoal(memoryModal.goal.id);
          setMemoryModal((m) => ({ ...m, open: false }));
        }}
      />

      <SideMenu
        visible={menuOpen}
        items={MENU_ITEMS}
        activeId="dreams"
        onClose={() => setMenuOpen(false)}
        onSelect={() => {}}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingTop:
      Platform.OS === "ios" ? 64 : (StatusBar.currentHeight ?? 24) + 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontFamily: "IndieFlower",
    fontSize: 22,
    color: theme.colors.textPrimary,
  },
  notebook: {
    flex: 1,
    marginHorizontal: 14,
    marginBottom: 14,
    zIndex: 0,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    paddingLeft: 14,
    marginBottom: -6, // overlaps the wobbly top line so the active tab covers it
    zIndex: 2,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginBottom: 2, // inactive tabs sit on the line
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 2.5,
    borderColor: theme.colors.border,
    backgroundColor: "#EADFC8",
  },
  tabActive: {
    backgroundColor: PAPER,
    borderBottomWidth: 0,
    marginBottom: 0, // reaches over the line so tab and page look joined
    paddingBottom: 15,
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
  },
  pageClip: {
    position: "absolute",
    top: 6,
    bottom: 6,
    left: 6,
    right: 6,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "IndieFlower",
    fontSize: 20,
    color: theme.colors.textPrimary,
  },

  // filter + sort dropdowns
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    minHeight: ROW_HEIGHT,
    marginBottom: 4,
  },
  toolbarMemories: {
    marginBottom: 24, // breathing room above the first polaroid
  },
  menuButton: {
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  menuButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  menuButtonText: {
    fontFamily: "IndieFlower",
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  caretOpen: {
    transform: [{ rotate: "180deg" }],
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  menuInner: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  menuHeading: {
    fontFamily: "IndieFlower",
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginBottom: 2,
    paddingHorizontal: 8,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  menuRowActive: {
    backgroundColor: GRAY,
  },
  menuRowIcon: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  menuHead: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  menuRowText: {
    flex: 1,
    fontFamily: "IndieFlower",
    fontSize: 15,
    color: theme.colors.textPrimary,
  },
  noMatch: {
    alignItems: "center",
    paddingVertical: 28,
  },

  polaroidGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "flex-start", // don't stretch shorter polaroids
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    textAlign: "center",
    color: theme.colors.textSecondary,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 17,
    lineHeight: 24,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  emptyIcon: {
    marginTop: 10,
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
    elevation: 20,
    zIndex: 20,
  },
});
