const HERO_BACKGROUND = "/images/hero/hero-background.webp";
const FALCON_LOGO = "/images/logo/logo-falcon.webp";

export const ASSETS = {
  hero: {
    background: HERO_BACKGROUND,
    complete: HERO_BACKGROUND,
    exploded: HERO_BACKGROUND,
    glow: HERO_BACKGROUND,
    placeholder: HERO_BACKGROUND,
    shadow: HERO_BACKGROUND
  },
  logo: {
    falcon: FALCON_LOGO
  },
  dashboard: {
    analytics: HERO_BACKGROUND,
    cars: HERO_BACKGROUND,
    leads: HERO_BACKGROUND,
    owner: HERO_BACKGROUND,
    profile: HERO_BACKGROUND
  },
  cars: [
    HERO_BACKGROUND,
    HERO_BACKGROUND,
    HERO_BACKGROUND,
    HERO_BACKGROUND,
    HERO_BACKGROUND,
    HERO_BACKGROUND
  ],
  dealers: [
    HERO_BACKGROUND,
    HERO_BACKGROUND,
    HERO_BACKGROUND,
    HERO_BACKGROUND
  ]
} as const;
