import {
  BarChart3,
  Banknote,
  Car,
  FolderTree,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Moon,
  Settings,
  ShieldCheck,
  Tags,
  Users
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Logo } from "@/design-system/brand";
import { Badge, Button } from "@/design-system/primitives";
import { logout } from "@/services/authApi";
import { cn } from "@/utils/cn";
import { adminProfile } from "./adminData";

const navItems = [
  ["نظرة عامة", "/admin/dashboard", LayoutDashboard],
  ["إدارة المعارض", "/admin/dashboard/dealers", ShieldCheck],
  ["إدارة السيارات", "/admin/dashboard/cars", Car],
  ["العملاء المحتملون", "/admin/dashboard/leads", MessageCircle],
  ["طلبات التمويل", "/admin/dashboard/finance-requests", Banknote],
  ["إدارة المستخدمين", "/admin/dashboard/users", Users],
  ["إدارة العلامات التجارية", "/admin/dashboard/brands", Tags],
  ["إدارة الفئات", "/admin/dashboard/categories", FolderTree],
  ["التقارير والإحصائيات", "/admin/dashboard/reports", BarChart3],
  ["الإعدادات", "/admin/dashboard/settings", Settings]
] as const;

export function AdminDashboardLayout() {
  return (
    <div className="min-h-screen bg-section text-dark-900 lg:[direction:ltr]">
      <div className="grid min-h-screen lg:grid-cols-[19rem_1fr]">
        <aside className="hidden border-r border-border-subtle bg-white p-5 lg:block lg:[direction:rtl]">
          <AdminSidebar />
        </aside>
        <div className="min-w-0 lg:[direction:rtl]">
          <AdminTopbar />
          <nav className="border-b border-border-subtle bg-white px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {navItems.map(([label, path, Icon]) => (
                <AdminNavLink compact icon={Icon} key={path} label={label} path={path} />
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

function AdminSidebar() {
  return (
    <div className="sticky top-5 flex h-[calc(100vh-2.5rem)] flex-col">
      <Logo language="ar" />
      <div className="mt-8 rounded-brand-lg bg-dark-900 p-4 text-white shadow-subtle">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500 text-sm font-bold text-dark-900">
            {adminProfile.avatarInitials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{adminProfile.name}</p>
            <p className="mt-1 text-xs font-medium text-white/60">{adminProfile.role}</p>
          </div>
        </div>
        <Badge className="mt-4 bg-white/10 text-white" tone="neutral">صلاحيات المنصة</Badge>
      </div>
      <nav className="mt-6 grid gap-2">
        {navItems.map(([label, path, Icon]) => (
          <AdminNavLink icon={Icon} key={path} label={label} path={path} />
        ))}
      </nav>
      <div className="mt-auto rounded-[1.5rem] border border-border-subtle bg-section p-4">
        <p className="text-sm font-semibold text-dark-900">Falcon Admin OS</p>
        <p className="mt-2 text-xs leading-6 text-slate-500">
          نموذج ثابت لإدارة المنصة والمعارض والمحتوى التشغيلي.
        </p>
      </div>
    </div>
  );
}

function AdminNavLink({
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
      end={path === "/admin/dashboard"}
      to={path}
    >
      <Icon className="h-4 w-4 text-accent-500" strokeWidth={1.75} />
      {label}
    </NavLink>
  );
}

function AdminTopbar() {
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-sticky border-b border-border-subtle bg-white/92 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 lg:hidden">
          <Button aria-label="فتح القائمة" className="h-11 w-11 rounded-2xl px-0" variant="secondary">
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </Button>
          <Logo language="ar" />
        </div>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-slate-500">لوحة إدارة المنصة</p>
          <h1 className="mt-1 text-2xl font-semibold text-dark-900">Falcon Platform Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <Button className="hidden h-11 rounded-2xl px-4 md:inline-flex" disabled title="الوضع الداكن غير مفعل في هذه المرحلة." variant="secondary">
            <Moon className="h-4 w-4" strokeWidth={1.75} />
            الوضع
          </Button>
          <button className="flex h-11 items-center gap-2 rounded-2xl border border-border-subtle bg-white px-3 shadow-subtle" onClick={handleLogout} title="تسجيل الخروج" type="button">
            <span className="hidden text-sm font-semibold text-dark-900 sm:inline">{adminProfile.name}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-500/10 text-xs font-bold text-dark-900">
              {adminProfile.avatarInitials}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
