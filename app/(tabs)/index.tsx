import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BucketItem, NewBucketItem, supabase } from "../../lib/supabase";
import AddGoalModal from "../components/AddGoalModal";
import GoalItem from "../components/GoalItem";
import ProgressRing from "../components/ProgressRing";
import { theme } from "../config/theme";

type Period = "week" | "month" | "year";

export default function Index() {
  const [goals, setGoals] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activePeriod, setActivePeriod] = useState<Period>("week");

  // Load goals from Supabase
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

  // Filter goals by active period
  const periodGoals = goals.filter((g) => g.period === activePeriod);
  const completedGoals = periodGoals.filter((g) => g.completed);
  const activeGoals = periodGoals.filter((g) => !g.completed);
  const progress =
    periodGoals.length > 0
      ? (completedGoals.length / periodGoals.length) * 100
      : 0;

  const toggleGoal = async (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;

    const newCompleted = !goal.completed;
    const updates = {
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from("bucket_items")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setGoals(goals.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    } catch (error) {
      console.error("Error toggling goal:", error);
      Alert.alert("Error", "Failed to update item");
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bucket_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setGoals(goals.filter((g) => g.id !== id));
    } catch (error) {
      console.error("Error deleting goal:", error);
      Alert.alert("Error", "Failed to delete item");
    }
  };

  const addNewGoal = async (newGoal: NewBucketItem) => {
    try {
      const { data, error } = await supabase
        .from("bucket_items")
        .insert([
          {
            ...newGoal,
            period: activePeriod,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setGoals([data, ...goals]);
    } catch (error) {
      console.error("Error adding goal:", error);
      Alert.alert("Error", "Failed to add item");
    }
  };

  const displayGoals = activeTab === "active" ? activeGoals : completedGoals;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your bucket list...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MAP BUCKETLIST</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Main Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.mainStats}>
              <View style={styles.leftStat}>
                <Text style={styles.statIcon}>❤️</Text>
                <Text style={styles.statNumber}>{completedGoals.length}</Text>
                <Text style={styles.statLabel}>DREAMS{"\n"}COMPLETE</Text>
              </View>

              <View style={styles.rightStat}>
                <ProgressRing progress={progress} />
                <TouchableOpacity style={styles.normalButton}>
                  <Text style={styles.normalText}>
                    {activeGoals.length} TO GO
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            {/* Mini Stats */}
            <View style={styles.miniStats}>
              <View style={styles.miniStatCard}>
                <Text style={styles.miniStatValue}>
                  {completedGoals.length}
                </Text>
                <Text style={styles.miniStatLabel}>Done</Text>
              </View>
              <View style={styles.miniStatCard}>
                <Text style={styles.miniStatValue}>{activeGoals.length}</Text>
                <Text style={styles.miniStatLabel}>Active</Text>
              </View>
              <View style={styles.miniStatCard}>
                <Text style={styles.miniStatValue}>{periodGoals.length}</Text>
                <Text style={styles.miniStatLabel}>Total</Text>
              </View>
            </View>
          </View>

          {/* Time Period Buttons */}
          <View style={styles.periodButtons}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                activePeriod === "week" && styles.periodActive,
              ]}
              onPress={() => setActivePeriod("week")}
            >
              <Text
                style={[
                  styles.periodText,
                  activePeriod === "week" && styles.periodTextActive,
                ]}
              >
                THIS WEEK
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                activePeriod === "month" && styles.periodActive,
              ]}
              onPress={() => setActivePeriod("month")}
            >
              <Text
                style={[
                  styles.periodText,
                  activePeriod === "month" && styles.periodTextActive,
                ]}
              >
                THIS MONTH
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                activePeriod === "year" && styles.periodActive,
              ]}
              onPress={() => setActivePeriod("year")}
            >
              <Text
                style={[
                  styles.periodText,
                  activePeriod === "year" && styles.periodTextActive,
                ]}
              >
                THIS YEAR
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => setActiveTab("active")}
              style={[styles.tab, activeTab === "active" && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "active" && styles.tabTextActive,
                ]}
              >
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("memories")}
              style={[styles.tab, activeTab === "memories" && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "memories" && styles.tabTextActive,
                ]}
              >
                Memories
              </Text>
            </TouchableOpacity>
          </View>

          {displayGoals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyText}>
                {activeTab === "active"
                  ? "No active dreams yet. Tap + to add one!"
                  : "No completed dreams yet. Start checking them off!"}
              </Text>
            </View>
          ) : (
            displayGoals.map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                onToggle={toggleGoal}
                onDelete={deleteGoal}
              />
            ))
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.plusIcon}>+</Text>
      </TouchableOpacity>

      <AddGoalModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addNewGoal}
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    letterSpacing: 1.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2.5,
    borderColor: theme.colors.border,
  },
  mainStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  leftStat: {
    flex: 1,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 42,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  rightStat: {
    alignItems: "center",
    justifyContent: "center",
  },
  normalButton: {
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  normalText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  progressBar: {
    height: 14,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  },
  miniStats: {
    flexDirection: "row",
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    alignItems: "center",
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  miniStatLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  periodButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    alignItems: "center",
  },
  periodActive: {
    backgroundColor: theme.colors.border,
    borderColor: theme.colors.border,
  },
  periodText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  periodTextActive: {
    color: theme.colors.surface,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.border,
  },
  tabText: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 14,
  },
  tabTextActive: {
    color: "white",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
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
