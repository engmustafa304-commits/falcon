import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ecfeff",
          100: "#cffafe",
          500: "#43BFC7",
          600: "#36B4BC",
          700: "#177982"
        },
        accent: {
          500: "#43BFC7",
          600: "#36B4BC"
        },
        dark: {
          900: "#0F172A"
        },
        surface: {
          50: "#F8FAFC",
          100: "#F1F5F9"
        },
        border: {
          subtle: "#E5E7EB"
        },
        section: "#F8FAFC",
        success: {
          500: "#10B981"
        },
        warning: {
          500: "#F59E0B"
        },
        danger: {
          500: "#EF4444"
        }
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(15, 23, 42, 0.04)",
        soft: "0 10px 30px rgba(15, 23, 42, 0.06)",
        elevated: "0 24px 60px rgba(15, 23, 42, 0.10)"
      },
      spacing: {
        "space-1": "0.5rem",
        "space-2": "1rem",
        "space-3": "1.5rem",
        "space-4": "2rem",
        "space-5": "2.5rem",
        "space-6": "3rem",
        "space-8": "4rem",
        "space-10": "5rem",
        "space-12": "6rem"
      },
      borderRadius: {
        brand: "1.5rem",
        "brand-lg": "2rem"
      },
      zIndex: {
        base: "0",
        raised: "10",
        sticky: "30",
        overlay: "50",
        modal: "70",
        toast: "90"
      },
      fontFamily: {
        sans: [
          "var(--font-arabic)",
          "var(--font-english)"
        ],
        arabic: [
          "var(--font-arabic)"
        ],
        english: [
          "var(--font-english)"
        ],
        heading: [
          "var(--font-arabic)"
        ],
        body: [
          "var(--font-arabic)"
        ]
      },
      fontSize: {
        hero: [
          "var(--type-hero-size)",
          {
            fontWeight: "var(--type-hero-weight)",
            lineHeight: "var(--type-hero-line-height)"
          }
        ],
        section: [
          "var(--type-section-size)",
          {
            fontWeight: "var(--type-section-weight)",
            lineHeight: "var(--type-section-line-height)"
          }
        ],
        title: [
          "var(--type-title-size)",
          {
            fontWeight: "var(--type-title-weight)",
            lineHeight: "var(--type-title-line-height)"
          }
        ],
        subtitle: [
          "var(--type-subtitle-size)",
          {
            fontWeight: "var(--type-subtitle-weight)",
            lineHeight: "var(--type-subtitle-line-height)"
          }
        ],
        body: [
          "var(--type-body-size)",
          {
            fontWeight: "var(--type-body-weight)",
            lineHeight: "var(--type-body-line-height)"
          }
        ],
        caption: [
          "var(--type-caption-size)",
          {
            fontWeight: "var(--type-caption-weight)",
            lineHeight: "var(--type-caption-line-height)"
          }
        ],
        button: [
          "var(--type-button-size)",
          {
            fontWeight: "var(--type-button-weight)",
            lineHeight: "var(--type-button-line-height)"
          }
        ],
        label: [
          "var(--type-label-size)",
          {
            fontWeight: "var(--type-label-weight)",
            lineHeight: "var(--type-label-line-height)"
          }
        ]
      }
    }
  },
  plugins: []
};

export default config;
