import { cn } from "@/utils/cn";
import { BrandMark } from "./BrandMark";
import { BrandWordmark } from "./BrandWordmark";

type LogoProps = {
  language?: "en" | "ar";
  markOnly?: boolean;
  className?: string;
};

export function Logo({ className, language = "en", markOnly = false }: LogoProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-3", className)}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <BrandMark className="h-10 w-10 shrink-0" />
      {markOnly ? null : <BrandWordmark language={language} />}
    </div>
  );
}
