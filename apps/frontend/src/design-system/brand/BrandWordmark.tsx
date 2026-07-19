import { cn } from "@/utils/cn";

type BrandWordmarkProps = {
  language?: "en" | "ar";
  className?: string;
};

export function BrandWordmark({
  className,
  language = "en"
}: BrandWordmarkProps) {
  return (
    <span
      className={cn(
        "text-xl font-semibold tracking-normal text-dark-900",
        language === "ar" ? "font-arabic" : "font-english",
        className
      )}
      dir={language === "ar" ? "rtl" : "ltr"}
      lang={language === "ar" ? "ar" : "en"}
    >
      {language === "ar" ? "فالكون" : "Falcon"}
    </span>
  );
}
