import { ThemedText } from "@/components/themed-text";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "../../config/theme";

export interface MenuItem {
  id: string;
  label: string;
  emoji: string;
  onPress?: () => void;
  comingSoon?: boolean;
}

interface TopBarProps {
  title: string;
  items: MenuItem[];
  activeId: string;
}

export default function TopBar({ title, items, activeId }: TopBarProps) {
  const [open, setOpen] = useState(false);

  const handleItem = (item: MenuItem) => {
    setOpen(false);
    if (item.comingSoon) {
      setTimeout(
        () => Alert.alert("Coming soon 💌", `${item.label} is on its way!`),
        250,
      );
      return;
    }
    item.onPress?.();
  };

  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => setOpen(true)}
        accessibilityLabel="Open menu"
      >
        <Text style={styles.iconText}>🌸</Text>
      </TouchableOpacity>

      <ThemedText style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
        {title}
      </ThemedText>

      {/* spacer keeps the title centered */}
      <View style={styles.iconButton} />

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  item.id === activeId && styles.menuItemActive,
                ]}
                onPress={() => handleItem(item)}
              >
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
                <ThemedText
                  style={[
                    styles.menuLabel,
                    item.id === activeId && styles.menuLabelActive,
                  ]}
                >
                  {item.label}
                </ThemedText>
                {item.comingSoon && (
                  <ThemedText style={styles.soonTag}>soon</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: theme.colors.background,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 24,
  },
  title: {
    flex: 1,
    fontSize: 22,
    textAlign: "center",
    color: theme.colors.textPrimary,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  menu: {
    marginTop: 108,
    marginLeft: 16,
    width: 230,
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    borderWidth: 2.5,
    borderColor: theme.colors.border,
    padding: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  menuItemActive: {
    backgroundColor: theme.colors.background,
  },
  menuEmoji: {
    fontSize: 20,
  },
  menuLabel: {
    flex: 1,
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  menuLabelActive: {
    color: theme.colors.primary,
  },
  soonTag: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});
