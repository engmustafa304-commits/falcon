import { PauseCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Badge } from "@/design-system/primitives";
import { DashboardPageHeader, ResponsiveTable } from "@/pages/dashboard/DashboardPrimitives";
import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminUser
} from "@/services/adminUsersApi";
import type { AuthRole } from "@/services/authApi";
import { adminUsers } from "./adminData";

const roleOptions: AuthRole[] = ["SUPER_ADMIN", "ADMIN", "DEALER_OWNER", "DEALER_MANAGER", "CUSTOMER"];

export function ManageUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshUsers() {
    const response = await getAdminUsers();
    setUsers(response);
    setIsFallback(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        const response = await getAdminUsers();

        if (isMounted) {
          setUsers(response);
          setIsFallback(false);
        }
      } catch {
        if (isMounted) {
          setUsers([]);
          setIsFallback(true);
          setError("تعذر تحميل المستخدمين من API، لذلك يتم عرض بيانات تجريبية.");
        }
      }
    }

    void loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleRoleChange(user: AdminUser, role: AuthRole) {
    setMessage(null);
    setError(null);

    try {
      const updatedUser = await updateAdminUserRole(user.id, role);
      setUsers((currentUsers) => currentUsers.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
      setMessage("تم تحديث صلاحية المستخدم بنجاح.");
    } catch {
      setError("تعذر تحديث صلاحية المستخدم.");
    }
  }

  async function handleToggleStatus(user: AdminUser) {
    setMessage(null);
    setError(null);

    try {
      const updatedUser = await updateAdminUserStatus(user.id, !user.isActive);
      setUsers((currentUsers) => currentUsers.map((item) => (item.id === updatedUser.id ? updatedUser : item)));
      setMessage(updatedUser.isActive ? "تم تفعيل المستخدم." : "تم تعطيل المستخدم.");
    } catch {
      setError("تعذر تحديث حالة المستخدم.");
    }
  }

  async function handleDeleteUser(user: AdminUser) {
    setMessage(null);
    setError(null);

    if (!window.confirm(`هل تريد حذف المستخدم ${user.email}؟`)) {
      return;
    }

    try {
      await deleteAdminUser(user.id);
      await refreshUsers();
      setMessage("تم حذف المستخدم بنجاح.");
    } catch {
      setError("تعذر حذف المستخدم.");
    }
  }

  const realRows = users.map((user) => [
    user.name,
    user.email,
    user.phone ?? "غير محدد",
    <select
      className="min-h-10 rounded-2xl border border-border-subtle bg-white px-3 text-xs font-semibold text-dark-900 outline-none focus:border-accent-500"
      defaultValue={user.role}
      key={`${user.id}-role`}
      onChange={(event) => void handleRoleChange(user, event.currentTarget.value as AuthRole)}
    >
      {roleOptions.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>,
    <Badge key={`${user.id}-status`} tone={user.isActive ? "success" : "warning"}>
      {user.isActive ? "نشط" : "معطل"}
    </Badge>,
    formatDate(user.createdAt),
    <div className="flex gap-2" key={`${user.id}-actions`}>
      <Button className="h-10 px-3 text-xs" onClick={() => void handleToggleStatus(user)} variant="secondary">
        <PauseCircle className="h-4 w-4" strokeWidth={1.75} />
        {user.isActive ? "تعطيل" : "تفعيل"}
      </Button>
      <Button className="h-10 px-3 text-xs" onClick={() => void handleDeleteUser(user)} variant="secondary">
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        حذف
      </Button>
    </div>
  ]);

  const fallbackRows = adminUsers.map((user) => [
    user[0],
    user[1],
    user[2],
    "CUSTOMER",
    <Badge key={`${user[1]}-status`} tone="success">نشط</Badge>,
    user[4],
    <div className="flex gap-2" key={`${user[1]}-actions`}>
      <Button className="h-10 px-3 text-xs" disabled title="الإجراءات غير متاحة أثناء عرض البيانات التجريبية." variant="secondary">
        <PauseCircle className="h-4 w-4" strokeWidth={1.75} />
        تعليق
      </Button>
      <Button className="h-10 px-3 text-xs" disabled title="الإجراءات غير متاحة أثناء عرض البيانات التجريبية." variant="secondary">
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        حذف
      </Button>
    </div>
  ]);

  return (
    <div>
      <DashboardPageHeader
        subtitle="إدارة حسابات المستخدمين ومراقبة النشاط الأساسي داخل المنصة."
        title="إدارة المستخدمين"
      />
      {message ? (
        <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          {error}
        </p>
      ) : null}
      {isFallback ? (
        <p className="mb-4 rounded-2xl border border-accent-500/20 bg-accent-500/10 px-4 py-3 text-sm font-semibold text-dark-900">
          يتم عرض بيانات تجريبية لأن API غير متاح.
        </p>
      ) : null}
      <ResponsiveTable
        headers={["الاسم", "البريد الإلكتروني", "رقم الهاتف", "الصلاحية", "الحالة", "تاريخ الإنشاء", "إجراءات"]}
        rows={isFallback ? fallbackRows : realRows}
      />
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "غير محدد";
  }

  return new Intl.DateTimeFormat("ar-SA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}
