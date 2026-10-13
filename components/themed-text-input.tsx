import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";

import { persianFontStyle } from "@/lib/persian-font";

export const ThemedTextInput = forwardRef<TextInput, TextInputProps>(
  function ThemedTextInput({ style, value, defaultValue, ...rest }, ref) {
    const text = value ?? defaultValue ?? "";
    return (
      <TextInput
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        style={[style, persianFontStyle(text, style)]}
        {...rest}
      />
    );
  },
);
