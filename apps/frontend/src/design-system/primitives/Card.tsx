import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function Card({ children, className, ...props }: CardProps) {
  return (
    <article
      className={cn(
        "rounded-brand-lg border border-border-subtle bg-white p-6 shadow-subtle",
        className
      )}
      {...props}
    >
      {children}
    </article>
  );
}
