import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";
import { nodeToString, persianFontStyle } from "@/lib/persian-font";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  children,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  const baseStyle = [
    { color },
    { fontFamily: "IndieFlower_400Regular" },
    type === "default" && styles.default,
    type === "title" && styles.title,
    type === "defaultSemiBold" && styles.defaultSemiBold,
    type === "subtitle" && styles.subtitle,
    type === "link" && styles.link,
    style,
  ];

  return (
    <Text
      allowFontScaling={false}
      style={[baseStyle, persianFontStyle(nodeToString(children), baseStyle)]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  default: { fontSize: 20, lineHeight: 30 },
  defaultSemiBold: { fontSize: 20, lineHeight: 30 },
  title: { fontSize: 40, lineHeight: 52, letterSpacing: 1 },
  subtitle: { fontSize: 28, lineHeight: 36 },
  link: { fontSize: 20, lineHeight: 30, color: "#0a7ea4" },
});
