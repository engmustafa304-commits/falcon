import {
  BarChart3,
  Banknote,
  Car,
  LayoutDashboard,
  Menu,
  Moon,
  Settings,
  UserRound,
  Users
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Logo } from "@/design-system/brand";
import { Badge, Button, ImageWithFallback } from "@/design-system/primitives";
import { logout } from "@/services/authApi";
import { cn } from "@/utils/cn";
import { dealerProfile } from "./dashboardData";

const navItems = [
  ["نظرة عامة", "/dealer/dashboard", LayoutDashboard],
  ["إدارة السيارات", "/dealer/dashboard/cars", Car],
  ["العملاء المحتملون", "/dealer/dashboard/leads", UserRound],
  ["طلبات التمويل", "/dealer/dashboard/finance-requests", Banknote],
  ["العملاء", "/dealer/dashboard/customers", Users],
  ["التقارير والإحصائيات", "/dealer/dashboard/reports", BarChart3],
  ["الإعدادات", "/dealer/dashboard/settings", Settings]
] as const;

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-section text-dark-900 lg:[direction:ltr]">
      <div className="grid min-h-screen lg:grid-cols-[18rem_1fr]">
        <aside className="hidden border-r border-border-subtle bg-white p-5 lg:block lg:[direction:rtl]">
          <DashboardSidebar />
        </aside>
        <div className="min-w-0 lg:[direction:rtl]">
          <DashboardTopbar />
          <nav className="border-b border-border-subtle bg-white px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {navItems.map(([label, path, Icon]) => (
                <DashboardNavLink compact icon={Icon} key={path} label={label} path={path} />
              ))}
            </div>
          </nav>
          <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function DashboardSidebar() {
  return (
    <div className="sticky top-5 flex h-[calc(100vh-2.5rem)] flex-col">
      <Logo language="ar" />
      <div className="mt-8 rounded-brand-lg bg-section p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white">
            <ImageWithFallback
              alt={dealerProfile.name}
              className="h-full w-full object-cover"
              src={dealerProfile.logo}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-dark-900">{dealerProfile.name}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{dealerProfile.city}</p>
          </div>
        </div>
        <Badge className="mt-4" tone="accent">{dealerProfile.status}</Badge>
      </div>
      <nav className="mt-6 grid gap-2">
        {navItems.map(([label, path, Icon]) => (
          <DashboardNavLink icon={Icon} key={path} label={label} path={path} />
        ))}
      </nav>
      <div className="mt-auto rounded-[1.5rem] border border-border-subtle bg-section p-4">
        <p className="text-sm font-semibold text-dark-900">Falcon Dealer OS</p>
        <p className="mt-2 text-xs leading-6 text-slate-500">
          نموذج ثابت لإدارة المعرض والسيارات والعملاء.
        </p>
      </div>
    </div>
  );
}

function DashboardNavLink({
  compact = false,
  icon: Icon,
  label,
  path
}: {
  compact?: boolean;
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
}) {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "inline-flex min-h-11 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition",
          compact ? "shrink-0 border border-border-subtle bg-white" : "",
          isActive ? "bg-dark-900 text-white" : "text-slate-600 hover:bg-section hover:text-dark-900"
        )
      }
      end={path === "/dealer/dashboard"}
      to={path}
    >
      <Icon className="h-4 w-4 text-accent-500" strokeWidth={1.75} />
      {label}
    </NavLink>
  );
}

function DashboardTopbar() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-sticky border-b border-border-subtle bg-white/92 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 lg:hidden">
          <Button className="h-11 w-11 rounded-2xl px-0" variant="secondary" aria-label="فتح القائمة">
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </Button>
          <Logo language="ar" />
        </div>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-slate-500">لوحة المعرض</p>
          <h1 className="mt-1 text-2xl font-semibold text-dark-900">{dealerProfile.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <Button className="hidden h-11 rounded-2xl px-4 md:inline-flex" disabled title="الوضع الداكن غير مفعل في هذه المرحلة." variant="secondary">
            <Moon className="h-4 w-4" strokeWidth={1.75} />
            الوضع
          </Button>
          <button className="flex h-11 items-center gap-2 rounded-2xl border border-border-subtle bg-white px-3 shadow-subtle" onClick={handleLogout} title="تسجيل الخروج" type="button">
            <span className="hidden text-sm font-semibold text-dark-900 sm:inline">مدير المعرض</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-500/10 text-sm font-semibold text-dark-900">
              م
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
