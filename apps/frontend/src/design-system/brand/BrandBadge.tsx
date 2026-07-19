import { cn } from "@/utils/cn";
import { BrandMark } from "./BrandMark";

type BrandBadgeProps = {
  label?: string;
  className?: string;
};

export function BrandBadge({
  className,
  label = "Automotive Operating System"
}: BrandBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-3 py-1.5 text-xs font-medium text-dark-900 shadow-subtle",
        className
      )}
    >
      <BrandMark className="h-5 w-5" />
      {label}
    </span>
  );
}
