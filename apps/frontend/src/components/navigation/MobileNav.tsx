import { Menu, X } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Logo } from "@/design-system/brand";
import { cn } from "@/utils/cn";

type MobileNavItem = readonly [label: string, path: string];

type MobileNavProps = {
  navItems: readonly MobileNavItem[];
};

const buttonBase =
  "falcon-motion inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-center text-sm font-semibold leading-tight";

export function MobileNav({ navItems }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        aria-expanded={isOpen}
        aria-label="فتح قائمة التنقل"
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-white text-dark-900 shadow-subtle"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      {isOpen
        ? createPortal(
            <div className="fixed inset-0 z-modal" dir="rtl">
              <button
                aria-label="إغلاق القائمة"
                className="absolute inset-0 bg-dark-900/55 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
                type="button"
              />
              <div className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col gap-6 overflow-y-auto bg-white p-6 shadow-elevated">
                <div className="flex items-center justify-between">
                  <Logo language="ar" />
                  <button
                    aria-label="إغلاق القائمة"
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-section text-dark-900"
                    onClick={() => setIsOpen(false)}
                    type="button"
                  >
                    <X className="h-5 w-5" strokeWidth={1.75} />
                  </button>
                </div>
                <nav className="grid gap-1">
                  {navItems.map(([label, path]) => (
                    <Link
                      className="falcon-motion rounded-2xl px-4 py-3 text-base font-semibold text-dark-900 hover:bg-section"
                      key={path}
                      onClick={() => setIsOpen(false)}
                      to={path}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto grid gap-3">
                  <Link
                    className={cn(buttonBase, "border border-border-subtle bg-white text-dark-900 shadow-subtle")}
                    onClick={() => setIsOpen(false)}
                    to="/login"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    className={cn(buttonBase, "bg-dark-900 text-white shadow-subtle")}
                    onClick={() => setIsOpen(false)}
                    to="/register"
                  >
                    تسجيل حساب
                  </Link>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
