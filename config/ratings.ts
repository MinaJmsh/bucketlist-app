import { Angry, Frown, Laugh, Meh, Smile } from "@sketchyicons/react-native";
import type { ComponentType } from "react";
import { theme } from "./theme";

export type RatingIcon = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

export const RATINGS: {
  value: number;
  label: string;
  Icon: RatingIcon;
  color: string;
}[] = [
  { value: 1, label: "never again", Icon: Angry, color: "#D9534F" },
  { value: 2, label: "not great", Icon: Frown, color: theme.colors.dark },
  { value: 3, label: "it was ok", Icon: Meh, color: theme.colors.accent },
  {
    value: 4,
    label: "really good",
    Icon: Smile,
    color: theme.colors.secondary,
  },
  { value: 5, label: "the best!", Icon: Laugh, color: theme.colors.primary },
];

export const getRating = (value?: number | null) =>
  RATINGS.find((r) => r.value === value) ?? null;
