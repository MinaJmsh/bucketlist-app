import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type TextStyle } from "react-native";

const PERSIAN_RE =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

// ---- tune these two to taste ----
const PERSIAN_SCALE = 0.85; // Persian size relative to the English size
const REGULAR_FONT = "PlaypenSansArabic_300Light"; // try _400Regular if too thin
const BOLD_FONT = "PlaypenSansArabic_600SemiBold";
// ---------------------------------

export function nodeToString(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToString).join("");
  return "";
}

// `style` must be the FULL style (including type styles like fontSize: 20),
// so the size can be scaled from the real value
export function persianFontStyle(
  text: string,
  style: StyleProp<TextStyle>,
): TextStyle | null {
  if (!PERSIAN_RE.test(text)) return null;

  const flat = StyleSheet.flatten(style) || {};
  const bold = flat.fontWeight === "bold" || Number(flat.fontWeight) >= 600;

  const out: TextStyle = {
    fontFamily: bold ? BOLD_FONT : REGULAR_FONT,
    fontWeight: "normal",
  };
  if (typeof flat.fontSize === "number") {
    out.fontSize = Math.round(flat.fontSize * PERSIAN_SCALE * 10) / 10;
  }
  // lineHeight is left as is, so lines keep the same spacing as English
  return out;
}
