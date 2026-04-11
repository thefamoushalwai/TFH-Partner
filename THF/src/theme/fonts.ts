/**
 * Inter font family constants.
 *
 * These map to the font variants loaded in app/_layout.tsx.
 * Always import from here rather than hardcoding font family strings.
 */
export const Fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

export type FontWeight = keyof typeof Fonts;
