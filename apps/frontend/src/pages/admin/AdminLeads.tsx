import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, Button, Card } from "@/design-system/primitives";
import { DashboardPageHeader, ResponsiveTable } from "@/pages/dashboard/DashboardPrimitives";
import {
  deleteAdminLead,
  getAdminLeads,
  updateAdminLeadStatus,
  type Lead,
  type LeadStatus
} from "@/services/leadsApi";
import { leads as fallbackLeads } from "@/pages/dashboard/dashboardData";

const statusLabels: Record<LeadStatus, string> = {
  CONTACTED: "قيد التواصل",
  LOST: "خاسر",
  NEW: "جديد",
  WON: "تم التحويل"
};

const statusTone = {
  CONTACTED: "warning",
  LOST: "danger",
  NEW: "accent",
  WON: "success"
} as const;

const sourceLabels = {
  CAR_DETAIL: "صفحة السيارة",
  DEALER_PAGE: "صفحة المعرض",
  FINANCE_REQUEST: "طلب تمويل",
  WHATSAPP_CLICK: "واتساب"
} as const;

export function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshLeads() {
    const response = await getAdminLeads();
    setLeads(response);
    setIsFallback(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadLeads() {
      try {
        const response = await getAdminLeads();

        if (isMounted) {
          setLeads(response);
          setIsFallback(false);
        }
      } catch {
        if (isMounted) {
          setLeads([]);
          setIsFallback(true);
          setError("تعذر تحميل العملاء المحتملين من API، لذلك يتم عرض البيانات التجريبية.");
        }
      }
    }

    void loadLeads();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleStatusChange(lead: Lead, status: LeadStatus) {
    setMessage(null);
    setError(null);

    try {
      const updatedLead = await updateAdminLeadStatus(lead.id, status);
      setLeads((currentLeads) => currentLeads.map((item) => (item.id === updatedLead.id ? updatedLead : item)));
      setMessage("تم تحديث حالة العميل المحتمل.");
    } catch {
      setError("تعذر تحديث حالة العميل المحتمل.");
    }
  }

  async function handleDeleteLead(lead: Lead) {
    setMessage(null);
    setError(null);

    if (!window.confirm(`هل تريد حذف طلب ${lead.name}؟`)) {
      return;
    }

    try {
      await deleteAdminLead(lead.id);
      await refreshLeads();
      setMessage("تم حذف العميل المحتمل بنجاح.");
    } catch {
      setError("تعذر حذف العميل المحتمل.");
    }
  }

  const realRows = leads.map((lead) => [
    lead.name,
    lead.phone,
    lead.email ?? "غير محدد",
    lead.dealer?.name ?? "غير مرتبط",
    getLeadCarName(lead),
    sourceLabels[lead.source],
    <Badge key={`${lead.id}-status`} tone={statusTone[lead.status]}>{statusLabels[lead.status]}</Badge>,
    formatDate(lead.createdAt),
    <span className="inline-flex flex-wrap gap-2" key={`${lead.id}-actions`}>
      <select
        className="min-h-10 rounded-2xl border border-border-subtle bg-white px-3 text-xs font-semibold text-dark-900 outline-none focus:border-accent-500"
        defaultValue={lead.status}
        onChange={(event) => void handleStatusChange(lead, event.currentTarget.value as LeadStatus)}
      >
        {Object.entries(statusLabels).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <Button className="h-10 px-3 text-xs" onClick={() => void handleDeleteLead(lead)} variant="secondary">
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        حذف
      </Button>
    </span>
  ]);

  const fallbackRows = fallbackLeads.map(([name, phone, email, date, car, status]) => [
    name,
    phone,
    email,
    "بيانات تجريبية",
    car,
    "بيانات تجريبية",
    <Badge key={`${name}-status`} tone={status === "تم التحويل" ? "success" : status === "قيد التواصل" ? "warning" : "accent"}>{status}</Badge>,
    date,
    <Button className="h-10 px-3 text-xs" disabled key={`${name}-delete`} title="الإجراءات غير متاحة أثناء عرض البيانات التجريبية." variant="secondary">
      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
      حذف
    </Button>
  ]);

  return (
    <div>
      <DashboardPageHeader
        subtitle="متابعة كل طلبات التواصل الواردة من السوق وصفحات السيارات والمعارض."
        title="العملاء المحتملون"
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
          headers={["الاسم", "الهاتف", "البريد الإلكتروني", "المعرض", "السيارة", "المصدر", "الحالة", "تاريخ الطلب", "إجراءات"]}
          rows={isFallback ? fallbackRows : realRows}
        />
      </Card>
    </div>
  );
}

function getLeadCarName(lead: Lead) {
  if (!lead.car) {
    return "غير محدد";
  }

  return `${lead.car.name ?? lead.car.brand ?? "سيارة"} ${lead.car.year ?? ""}`.trim();
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
