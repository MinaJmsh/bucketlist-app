export const theme = {
  colors: {
    primary: "#809671", // Matcha
    secondary: "#B3B792", // Pistache
    accent: "#D2AB80", // Chai
    dark: "#725C3A", // Carob
    background: "#E5E0D8", // Almond
    surface: "#E5D2B8", // Vanilla
    textPrimary: "#2E2E2E",
    textSecondary: "#6F6F6F",
    border: "#DADADA",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    headline: {
      fontSize: 24,
      fontWeight: "600" as const,
      letterSpacing: -0.5,
    },
    subhead: {
      fontSize: 18,
      fontWeight: "500" as const,
      letterSpacing: -0.2,
    },
    body: {
      fontSize: 14,
      fontWeight: "400" as const,
      letterSpacing: 0,
    },
    caption: {
      fontSize: 12,
      fontWeight: "400" as const,
      letterSpacing: 0.1,
    },
  },
  shapes: {
    card: {
      cornerRadius: 20,
      shadow: {
        color: "rgba(0,0,0,0.1)",
        offset: [0, 4],
        blur: 12,
      },
    },
    button: {
      cornerRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    chip: {
      cornerRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
  },
};
