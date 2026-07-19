import { useEffect } from "react";

const SITE_NAME = "Falcon";
const DEFAULT_DESCRIPTION =
  "Falcon منصة عربية للسيارات والمعارض تجمع البحث، المقارنة، التواصل، التمويل، وإدارة المعارض في تجربة واحدة.";
const DEFAULT_IMAGE = "/images/hero/hero-background.webp";

export type SeoProps = {
  canonical?: string;
  description?: string;
  image?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  title?: string;
  type?: "website" | "article" | "product" | "profile";
};

export function Seo({
  canonical,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  structuredData,
  title = SITE_NAME,
  type = "website"
}: SeoProps) {
  useEffect(() => {
    const previousTitle = document.title;
    const titleText = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonicalUrl = getAbsoluteUrl(canonical ?? window.location.pathname);
    const imageUrl = getAbsoluteUrl(image);

    document.title = titleText;
    setMetaTag("name", "description", description);
    setMetaTag("name", "robots", "index, follow");
    setMetaTag("property", "og:site_name", SITE_NAME);
    setMetaTag("property", "og:title", titleText);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:image", imageUrl);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:type", type);
    setMetaTag("property", "og:locale", "ar_SA");
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", titleText);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", imageUrl);
    setCanonicalLink(canonicalUrl);

    const structuredDataElement = setStructuredData(structuredData);

    return () => {
      document.title = previousTitle;
      structuredDataElement?.remove();
    };
  }, [canonical, description, image, structuredData, title, type]);

  return null;
}

function getAbsoluteUrl(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const origin = typeof window === "undefined" ? "https://falcon.local" : window.location.origin;
  return new URL(value, origin).toString();
}

function setMetaTag(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    element.setAttribute("data-falcon-seo", "true");
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function setCanonicalLink(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    element.setAttribute("data-falcon-seo", "true");
    document.head.appendChild(element);
  }

  element.href = href;
}

function setStructuredData(structuredData?: Record<string, unknown> | Record<string, unknown>[]) {
  if (!structuredData) {
    return null;
  }

  const element = document.createElement("script");
  element.type = "application/ld+json";
  element.setAttribute("data-falcon-seo-jsonld", "true");
  element.textContent = JSON.stringify(structuredData);
  document.head.appendChild(element);
  return element;
}
