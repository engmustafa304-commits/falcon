import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  neutral: "bg-section text-slate-700",
  accent: "bg-accent-500/10 text-dark-900",
  success: "bg-success-500/10 text-emerald-700",
  warning: "bg-warning-500/10 text-amber-700",
  danger: "bg-danger-500/10 text-red-700"
};

export function Badge({
  children,
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
