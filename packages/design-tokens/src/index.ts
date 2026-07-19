export const falconTokens = {
  colors: {
    accent: "#43BFC7",
    accentEnd: "#36B4BC",
    dark: "#0F172A",
    background: "#FFFFFF",
    section: "#F8FAFC",
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    muted: "#64748B",
    soft: "#F1F5F9"
  },
  typography: {
    arabic: "Alexandria",
    english: "Inter",
    fallback: "ui-sans-serif, system-ui, sans-serif"
  },
  spacing: {
    "1": "0.5rem",
    "2": "1rem",
    "3": "1.5rem",
    "4": "2rem",
    "5": "2.5rem",
    "6": "3rem",
    "8": "4rem",
    "10": "5rem",
    "12": "6rem"
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
    full: "9999px"
  },
  shadows: {
    subtle: "0 1px 2px rgba(15, 23, 42, 0.04)",
    soft: "0 10px 30px rgba(15, 23, 42, 0.06)",
    elevated: "0 24px 60px rgba(15, 23, 42, 0.10)"
  },
  zIndex: {
    base: 0,
    raised: 10,
    sticky: 30,
    overlay: 50,
    modal: 70,
    toast: 90
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px"
  }
} as const;

export const falconColors = falconTokens.colors;

export type FalconTokens = typeof falconTokens;
