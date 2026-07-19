import { Badge, Card } from "@/design-system/primitives";
import { DashboardPageHeader, ResponsiveTable } from "./DashboardPrimitives";
import { useEffect, useState } from "react";
import {
  getDealerFinanceRequests,
  updateDealerFinanceRequestStatus,
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
  ["سارة العتيبي", "+966 55 112 3344", "Mercedes E300 AMG", "75,000 ريال", "60 شهر", "جديد"],
  ["محمد الحربي", "+966 54 551 1020", "Lexus LX 600", "120,000 ريال", "48 شهر", "قيد المراجعة"]
] as const;

export function FinanceRequests() {
  const [requests, setRequests] = useState<FinanceRequest[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRequests() {
      try {
        const response = await getDealerFinanceRequests();

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
      const updatedRequest = await updateDealerFinanceRequestStatus(request.id, status);
      setRequests((currentRequests) =>
        currentRequests.map((item) => (item.id === updatedRequest.id ? updatedRequest : item))
      );
      setMessage("تم تحديث حالة طلب التمويل.");
    } catch {
      setError("تعذر تحديث حالة طلب التمويل.");
    }
  }

  const realRows = requests.map((request) => [
    request.customerName,
    request.phone,
    request.email ?? "غير محدد",
    getCarName(request),
    formatCurrency(request.monthlyIncome),
    formatCurrency(request.downPayment),
    request.financingPeriod ? `${request.financingPeriod} شهر` : "غير محدد",
    <Badge key={`${request.id}-status`} tone={statusTone[request.status]}>{statusLabels[request.status]}</Badge>,
    formatDate(request.createdAt),
    <select
      className="min-h-10 rounded-2xl border border-border-subtle bg-white px-3 text-xs font-semibold text-dark-900 outline-none focus:border-accent-500"
      defaultValue={request.status}
      key={`${request.id}-actions`}
      onChange={(event) => void handleStatusChange(request, event.currentTarget.value as FinanceRequestStatus)}
    >
      {Object.entries(statusLabels).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  ]);

  const fallbackRows = fallbackRequests.map(([name, phone, car, downPayment, period, status]) => [
    name,
    phone,
    "example@falcon.sa",
    car,
    "18,000 ريال",
    downPayment,
    period,
    <Badge key={`${name}-status`} tone={status === "قيد المراجعة" ? "warning" : "accent"}>{status}</Badge>,
    "تجريبي",
    "تغيير الحالة"
  ]);

  return (
    <div>
      <DashboardPageHeader
        subtitle="طلبات التمويل الواردة من صفحات السيارات والمتابعة الأولية لحالة كل طلب."
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
          headers={["الاسم", "الهاتف", "البريد", "السيارة", "الدخل", "الدفعة", "المدة", "الحالة", "التاريخ", "إجراءات"]}
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
