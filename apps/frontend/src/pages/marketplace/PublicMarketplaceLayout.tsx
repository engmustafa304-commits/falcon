import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { MobileNav } from "@/components/navigation/MobileNav";
import { Logo } from "@/design-system/brand";
import { Button } from "@/design-system/primitives";

type PublicMarketplaceLayoutProps = {
  children: ReactNode;
};

const navItems = [
  ["الرئيسية", "/"],
  ["السيارات", "/cars"],
  ["المعارض", "/dealers"],
  ["العلامات", "/brands"],
  ["الفئات", "/categories"],
  ["المفضلة", "/favorites"],
  ["المقارنة", "/compare"],
  ["حسابي", "/account"]
] as const;

export function PublicMarketplaceLayout({ children }: PublicMarketplaceLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-dark-900">
      <header className="sticky top-0 z-sticky border-b border-border-subtle bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <Link to="/">
            <Logo language="ar" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
            {navItems.map(([label, path]) => (
              <Link className="falcon-motion hover:text-dark-900" key={path} to={path}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              className="hidden h-11 items-center gap-2 rounded-2xl bg-section px-4 text-sm font-semibold text-dark-900 disabled:cursor-not-allowed disabled:opacity-70 md:inline-flex"
              disabled
              title="اختيار المدينة سيتم ربطه بفلاتر البحث لاحقًا."
              type="button"
            >
              <MapPin className="h-4 w-4" strokeWidth={1.75} />
              المدينة
            </button>
            <Link
              aria-label="بحث"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-white text-dark-900 shadow-subtle"
              to="/cars"
            >
              <Search className="h-4 w-4" strokeWidth={1.75} />
            </Link>
            <Link className="hidden md:inline-flex" to="/login">
              <Button variant="secondary">تسجيل الدخول</Button>
            </Link>
            <Link className="hidden md:inline-flex" to="/register">
              <Button variant="primary">تسجيل حساب</Button>
            </Link>
            <MobileNav navItems={navItems} />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border-subtle bg-white px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-between md:text-right">
          <Logo language="ar" />
          <p className="text-sm leading-7 text-slate-500">
            Falcon Automotive Operating System
          </p>
        </div>
      </footer>
    </div>
  );
}
