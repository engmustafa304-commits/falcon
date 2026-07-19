import type { ReactNode } from "react";
import { Logo } from "@/design-system/brand";

type PageShellProps = {
  children: ReactNode;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-white text-dark-900">
      <header className="border-b border-border-subtle bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Logo language="ar" />
          <span className="rounded-full bg-section px-3 py-1.5 text-xs font-semibold text-slate-600">
            Design Foundation
          </span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
