import { falconTokens } from "@falcon/design-tokens";

export const tokens = falconTokens;

export const colorSwatches = [
  { name: "Accent", token: "accent", value: tokens.colors.accent },
  { name: "Accent End", token: "accentEnd", value: tokens.colors.accentEnd },
  { name: "Dark", token: "dark", value: tokens.colors.dark },
  { name: "Background", token: "background", value: tokens.colors.background },
  { name: "Section", token: "section", value: tokens.colors.section },
  { name: "Border", token: "border", value: tokens.colors.border },
  { name: "Success", token: "success", value: tokens.colors.success },
  { name: "Warning", token: "warning", value: tokens.colors.warning },
  { name: "Danger", token: "danger", value: tokens.colors.danger }
] as const;
