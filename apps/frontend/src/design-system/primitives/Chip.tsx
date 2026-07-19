import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Chip({ children, className, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center rounded-full border border-border-subtle bg-white px-4 text-sm font-medium text-dark-900 shadow-subtle",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
