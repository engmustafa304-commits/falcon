import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/design-system/primitives";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
  type NotificationType
} from "@/services/notificationsApi";

const notificationTypeLabels: Record<NotificationType, string> = {
  CAR: "سيارة",
  DEALER: "معرض",
  ERROR: "خطأ",
  FINANCE: "تمويل",
  INFO: "معلومة",
  LEAD: "عميل",
  SUCCESS: "نجاح",
  WARNING: "تنبيه"
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  useEffect(() => {
    void refreshNotifications();
  }, []);

  async function refreshNotifications() {
    setIsLoading(true);
    setError(null);

    try {
      setNotifications(await getNotifications());
    } catch {
      setError("تعذر تحميل الإشعارات.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkRead(notification: AppNotification) {
    if (notification.isRead) {
      return;
    }

    try {
      const updatedNotification = await markNotificationRead(notification.id);
      setNotifications((currentNotifications) =>
        currentNotifications.map((item) => item.id === updatedNotification.id ? updatedNotification : item)
      );
    } catch {
      setError("تعذر تحديث الإشعار.");
    }
  }

  async function handleMarkAllRead() {
    try {
      setNotifications(await markAllNotificationsRead());
    } catch {
      setError("تعذر تحديث الإشعارات.");
    }
  }

  async function handleDeleteNotification(notification: AppNotification) {
    try {
      await deleteNotification(notification.id);
      setNotifications((currentNotifications) => currentNotifications.filter((item) => item.id !== notification.id));
    } catch {
      setError("تعذر حذف الإشعار.");
    }
  }

  return (
    <div className="relative">
      <Button
        aria-label="الإشعارات"
        className="relative h-11 w-11 rounded-2xl px-0"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        variant="secondary"
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {unreadCount > 0 ? (
          <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-dark-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </Button>
      {isOpen ? (
        <div className="absolute left-0 z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-border-subtle bg-white text-right shadow-soft">
          <div className="flex items-center justify-between gap-3 border-b border-border-subtle p-4">
            <div>
              <p className="text-sm font-semibold text-dark-900">الإشعارات</p>
              <p className="mt-1 text-xs text-slate-500">{unreadCount} غير مقروء</p>
            </div>
            <Button className="h-10 rounded-2xl px-3 text-xs" onClick={handleMarkAllRead} variant="secondary">
              <CheckCheck className="h-4 w-4" strokeWidth={1.75} />
              قراءة الكل
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {isLoading ? (
              <p className="rounded-2xl bg-section px-4 py-3 text-sm font-semibold text-dark-900">جاري تحميل الإشعارات...</p>
            ) : null}
            {error ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{error}</p>
            ) : null}
            {!isLoading && notifications.length === 0 ? (
              <p className="rounded-2xl bg-section px-4 py-6 text-center text-sm font-semibold text-slate-500">لا توجد إشعارات حالياً.</p>
            ) : null}
            <div className="grid gap-2">
              {notifications.map((notification) => (
                <article
                  className={`rounded-2xl border p-4 ${
                    notification.isRead
                      ? "border-border-subtle bg-white"
                      : "border-accent-500/20 bg-accent-500/10"
                  }`}
                  key={notification.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-dark-900">{notification.title}</p>
                        <span className="rounded-full bg-section px-2 py-1 text-[11px] font-bold text-slate-600">
                          {notificationTypeLabels[notification.type]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{notification.message}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-400">{formatDate(notification.createdAt)}</p>
                    </div>
                    <button
                      aria-label="حذف الإشعار"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-section hover:text-dark-900"
                      onClick={() => void handleDeleteNotification(notification)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                  {!notification.isRead ? (
                    <button
                      className="mt-3 text-xs font-bold text-accent-500"
                      onClick={() => void handleMarkRead(notification)}
                      type="button"
                    >
                      تحديد كمقروء
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
