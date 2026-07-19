import { Badge, Card, ImageWithFallback } from "@/design-system/primitives";
import { getDealerAnalytics, type DealerAnalytics } from "@/services/analyticsApi";
import { useEffect, useState } from "react";
import { dashboardCars, dashboardMetrics, salesTrend } from "./dashboardData";
import { DashboardPageHeader, MetricCard, MiniBars, ResponsiveTable } from "./DashboardPrimitives";

export function DashboardHome() {
  const [analytics, setAnalytics] = useState<DealerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      try {
        const response = await getDealerAnalytics();

        if (isMounted) {
          setAnalytics(response);
          setLoadError(null);
        }
      } catch {
        if (isMounted) {
          setAnalytics(null);
          setLoadError("تعذر تحميل التحليلات الحقيقية، لذلك يتم عرض بيانات تجريبية مؤقتاً.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = analytics ? buildDealerMetrics(analytics) : dashboardMetrics;
  const latestCarRows = analytics ? buildLatestCarRows(analytics) : buildFallbackCarRows();
  const latestLeadRows = analytics ? buildLatestLeadRows(analytics) : [];

  return (
    <div>
      <DashboardPageHeader
        subtitle="ملخص سريع لأداء معرضك على Falcon."
        title="نظرة عامة"
      />
      {isLoading ? (
        <DataNotice message="جاري تحميل تحليلات المعرض..." />
      ) : null}
      {loadError ? (
        <DataNotice message={loadError} tone="warning" />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, trend]) => (
          <MetricCard key={label} label={label} trend={trend} value={value} />
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-dark-900">أداء المبيعات آخر ٣٠ يوم</h3>
            <p className="mt-2 text-sm text-slate-500">بيانات وهمية لغرض العرض فقط.</p>
          </div>
          <MiniBars data={salesTrend} />
        </Card>
        <Card className="p-6">
          <h3 className="mb-5 text-xl font-semibold text-dark-900">آخر السيارات المضافة</h3>
          <ResponsiveTable
            headers={["السيارة", "الموديل", "السنة", "حالة الإعلان"]}
            rows={latestCarRows}
          />
        </Card>
      </div>
      {analytics ? (
        <Card className="mt-6 p-6">
          <h3 className="mb-5 text-xl font-semibold text-dark-900">آخر العملاء المحتملين</h3>
          <ResponsiveTable
            headers={["العميل", "الهاتف", "السيارة", "الحالة", "تاريخ الطلب"]}
            rows={latestLeadRows}
          />
        </Card>
      ) : null}
    </div>
  );
}

function buildDealerMetrics(analytics: DealerAnalytics): [string, string, string][] {
  return [
    ["عدد السيارات الحالية", formatNumber(analytics.totalCars), `${formatNumber(analytics.activeCars)} نشطة`],
    ["السيارات المباعة", formatNumber(analytics.soldCars), "حسب حالة الإعلان"],
    ["طلبات التمويل", formatNumber(analytics.totalFinanceRequests), `${formatNumber(analytics.reviewingFinanceRequests)} قيد المراجعة`],
    ["العملاء المحتملون", formatNumber(analytics.totalLeads), `${formatNumber(analytics.newLeads)} جديد`],
    ["المفضلات", formatNumber(analytics.totalFavoritesForDealerCars), "على سيارات المعرض"],
    ["إضافات المقارنة", formatNumber(analytics.totalCompareAddsForDealerCars), "على سيارات المعرض"]
  ];
}

function buildLatestCarRows(analytics: DealerAnalytics) {
  if (analytics.latestCars.length === 0) {
    return [["لا توجد سيارات بعد", "غير محدد", "غير محدد", <Badge key="empty" tone="warning">فارغ</Badge>]];
  }

  return analytics.latestCars.map((car) => [
    car.name ?? "سيارة Falcon",
    car.model ?? "غير محدد",
    String(car.year ?? "غير محدد"),
    <Badge key={car.id} tone={car.status === "ACTIVE" ? "success" : car.status === "SOLD" ? "neutral" : "warning"}>
      {getCarStatusLabel(car.status)}
    </Badge>
  ]);
}

function buildFallbackCarRows() {
  return dashboardCars.slice(0, 5).map((car) => [
    <span className="inline-flex items-center gap-3" key={car.name}>
      <span className="h-12 w-14 overflow-hidden rounded-2xl bg-section">
        <ImageWithFallback alt={car.name} className="h-full w-full object-cover" src={car.imageSrc} />
      </span>
      {car.name}
    </span>,
    car.model,
    car.year,
    <Badge key={car.status} tone={car.status === "نشط" ? "success" : "warning"}>{car.status}</Badge>
  ]);
}

function buildLatestLeadRows(analytics: DealerAnalytics) {
  if (analytics.latestLeads.length === 0) {
    return [["لا توجد طلبات بعد", "غير محدد", "غير محدد", <Badge key="empty-lead" tone="warning">فارغ</Badge>, "غير محدد"]];
  }

  return analytics.latestLeads.map((lead) => [
    lead.name,
    lead.phone,
    lead.car?.name ?? "غير محدد",
    <Badge key={lead.id} tone={lead.status === "NEW" ? "accent" : lead.status === "WON" ? "success" : "neutral"}>
      {getLeadStatusLabel(lead.status)}
    </Badge>,
    lead.createdAt?.slice(0, 10) ?? "غير محدد"
  ]);
}

function DataNotice({
  message,
  tone = "info"
}: {
  message: string;
  tone?: "info" | "warning";
}) {
  return (
    <p className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
      tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-accent-500/20 bg-accent-500/10 text-dark-900"
    }`}>
      {message}
    </p>
  );
}

function getCarStatusLabel(status?: string) {
  const labels: Record<string, string> = {
    ACTIVE: "نشط",
    DRAFT: "مسودة",
    SOLD: "مباع",
    SUSPENDED: "موقوف"
  };

  return status ? labels[status] ?? status : "غير محدد";
}

function getLeadStatusLabel(status?: string) {
  const labels: Record<string, string> = {
    CONTACTED: "تم التواصل",
    LOST: "مفقود",
    NEW: "جديد",
    WON: "ناجح"
  };

  return status ? labels[status] ?? status : "غير محدد";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ar-SA").format(value);
}
