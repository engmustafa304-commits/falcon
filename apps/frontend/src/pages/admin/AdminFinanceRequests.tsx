import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Button, Card } from "@/design-system/primitives";
import { DashboardPageHeader, ResponsiveTable } from "@/pages/dashboard/DashboardPrimitives";
import {
  deleteAdminFinanceRequest,
  getAdminFinanceRequests,
  updateAdminFinanceRequestStatus,
  type FinanceRequest,
  type FinanceRequestStatus
} from "@/services/financeRequestsApi";

const statusLabels: Record<FinanceRequestStatus, string> = {
  APPROVED: "مقبول",
  NEW: "جديد",
  REJECTED: "مرفوض",
  REVIEWING: "قيد المراجعة"
};

const statusTone = {
  APPROVED: "success",
  NEW: "accent",
  REJECTED: "danger",
  REVIEWING: "warning"
} as const;

const fallbackRequests = [
  ["سارة العتيبي", "+966 55 112 3344", "معرض الخليج", "Mercedes E300 AMG", "جديد"],
  ["محمد الحربي", "+966 54 551 1020", "دار الخليج", "Lexus LX 600", "قيد المراجعة"]
] as const;

export function AdminFinanceRequests() {
  const [requests, setRequests] = useState<FinanceRequest[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshRequests() {
    const response = await getAdminFinanceRequests();
    setRequests(response);
    setIsFallback(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      try {
        const response = await getAdminFinanceRequests();

        if (isMounted) {
          setRequests(response);
          setIsFallback(false);
        }
      } catch {
        if (isMounted) {
          setRequests([]);
          setIsFallback(true);
          setError("تعذر تحميل طلبات التمويل من API، لذلك يتم عرض بيانات تجريبية.");
        }
      }
    }

    void loadRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleStatusChange(request: FinanceRequest, status: FinanceRequestStatus) {
    setMessage(null);
    setError(null);

    try {
      const updatedRequest = await updateAdminFinanceRequestStatus(request.id, status);
      setRequests((currentRequests) =>
        currentRequests.map((item) => (item.id === updatedRequest.id ? updatedRequest : item))
      );
      setMessage("تم تحديث حالة طلب التمويل.");
    } catch {
      setError("تعذر تحديث حالة طلب التمويل.");
    }
  }

  async function handleDelete(request: FinanceRequest) {
    setMessage(null);
    setError(null);

    if (!window.confirm(`هل تريد حذف طلب تمويل ${request.customerName}؟`)) {
      return;
    }

    try {
      await deleteAdminFinanceRequest(request.id);
      await refreshRequests();
      setMessage("تم حذف طلب التمويل بنجاح.");
    } catch {
      setError("تعذر حذف طلب التمويل.");
    }
  }

  const realRows = requests.map((request) => [
    request.customerName,
    request.phone,
    request.email ?? "غير محدد",
    request.dealer?.name ?? "غير مرتبط",
    getCarName(request),
    formatCurrency(request.monthlyIncome),
    formatCurrency(request.downPayment),
    <Badge key={`${request.id}-status`} tone={statusTone[request.status]}>{statusLabels[request.status]}</Badge>,
    formatDate(request.createdAt),
    <span className="inline-flex flex-wrap gap-2" key={`${request.id}-actions`}>
      <select
        className="min-h-10 rounded-2xl border border-border-subtle bg-white px-3 text-xs font-semibold text-dark-900 outline-none focus:border-accent-500"
        defaultValue={request.status}
        onChange={(event) => void handleStatusChange(request, event.currentTarget.value as FinanceRequestStatus)}
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <Button className="h-10 px-3 text-xs" onClick={() => void handleDelete(request)} variant="secondary">
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        حذف
      </Button>
    </span>
  ]);

  const fallbackRows = fallbackRequests.map(([name, phone, dealer, car, status]) => [
    name,
    phone,
    "example@falcon.sa",
    dealer,
    car,
    "18,000 ريال",
    "75,000 ريال",
    <Badge key={`${name}-status`} tone={status === "قيد المراجعة" ? "warning" : "accent"}>{status}</Badge>,
    "تجريبي",
    <Button className="h-10 px-3 text-xs" disabled key={`${name}-delete`} title="الإجراءات غير متاحة أثناء عرض البيانات التجريبية." variant="secondary">
      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      حذف
    </Button>
  ]);

  return (
    <div>
      <DashboardPageHeader
        subtitle="كل طلبات التمويل الواردة من العملاء عبر Falcon."
        title="طلبات التمويل"
      />
      <Card className="p-4 md:p-6">
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
          headers={["الاسم", "الهاتف", "البريد", "المعرض", "السيارة", "الدخل", "الدفعة", "الحالة", "التاريخ", "إجراءات"]}
          rows={isFallback ? fallbackRows : realRows}
        />
      </Card>
    </div>
  );
}

function getCarName(request: FinanceRequest) {
  if (!request.car) {
    return "غير محدد";
  }

  return `${request.car.name ?? request.car.brand ?? "سيارة"} ${request.car.year ?? ""}`.trim();
}

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) {
    return "غير محدد";
  }

  return `${new Intl.NumberFormat("ar-SA").format(value)} ريال`;
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
