import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Tag({ children, className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-lg bg-section px-2 text-xs font-medium text-slate-600",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
