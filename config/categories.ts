import { theme } from "./theme";

export const quickCategories = [
  {
    id: "travel",
    name: "Travel",
    icon: "🗺️",
    color: theme.colors.primary,
  },
  {
    id: "food",
    name: "Food",
    icon: "🍝",
    color: theme.colors.accent,
  },
  {
    id: "challenges",
    name: "Challenges",
    icon: "💪",
    color: theme.colors.secondary,
  },
  {
    id: "cozy",
    name: "Cozy Nights",
    icon: "🌙",
    color: theme.colors.dark,
  },
];

// Get color for any category
export const getCategoryColor = (category: string) => {
  const quickCategory = quickCategories.find((c) => c.id === category);
  if (quickCategory) return quickCategory.color;

  // Generate a consistent color for custom categories
  const colors = [
    theme.colors.primary,
    theme.colors.accent,
    theme.colors.secondary,
    theme.colors.dark,
  ];
  const index =
    Math.abs(
      category.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    ) % colors.length;
  return colors[index];
};

// Get icon for category
export const getCategoryIcon = (category: string) => {
  const quickCategory = quickCategories.find((c) => c.id === category);
  return quickCategory?.icon || "📌";
};
