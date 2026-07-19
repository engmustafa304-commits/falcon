import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type SectionContainerProps = {
  children: ReactNode;
  className?: string;
};

export function SectionContainer({ children, className }: SectionContainerProps) {
  return (
    <section className={cn("px-5 py-12 sm:px-8 lg:px-10", className)}>
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}
