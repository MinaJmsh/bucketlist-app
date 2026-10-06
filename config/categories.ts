import {
  Dumbbell,
  Heart,
  MapPin,
  Moon,
  Pin,
  ShoppingBag,
  Sparkles,
  Trees,
  Utensils,
} from "@sketchyicons/react-native";
import type { ComponentType } from "react";
import { theme } from "./theme";

export type CategoryIcon = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

export const quickCategories: {
  id: string;
  name: string;
  icon: CategoryIcon;
  color: string;
}[] = [
  { id: "food", name: "Food", icon: Utensils, color: theme.colors.accent },
  { id: "place", name: "Place", icon: MapPin, color: theme.colors.primary },
  {
    id: "romance",
    name: "Romance",
    icon: Heart,
    color: theme.colors.secondary,
  },
  { id: "nature", name: "Nature", icon: Trees, color: theme.colors.primary },
  {
    id: "activities",
    name: "Activities",
    icon: Sparkles,
    color: theme.colors.accent,
  },
  { id: "cozy", name: "Cozy", icon: Moon, color: theme.colors.dark },
  {
    id: "challenges",
    name: "Challenges",
    icon: Dumbbell,
    color: theme.colors.secondary,
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: ShoppingBag,
    color: theme.colors.dark,
  },
  { id: "others", name: "Others", icon: Pin, color: theme.colors.primary },
];

// Get color for any category
export const getCategoryColor = (category: string) => {
  const quickCategory = quickCategories.find((c) => c.id === category);
  if (quickCategory) return quickCategory.color;

  const colors = [
    theme.colors.primary,
    theme.colors.accent,
    theme.colors.secondary,
    theme.colors.dark,
  ];
  const index =
    Math.abs(
      category.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0),
    ) % colors.length;
  return colors[index];
};

// Get icon component for category (falls back to a pin)
export const getCategoryIcon = (category: string): CategoryIcon =>
  quickCategories.find((c) => c.id === category)?.icon ?? Pin;
