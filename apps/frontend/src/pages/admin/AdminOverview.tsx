import { Badge, Card } from "@/design-system/primitives";
import { DashboardPageHeader, MetricCard, MiniBars, ResponsiveTable } from "@/pages/dashboard/DashboardPrimitives";
import { getAdminAnalytics, type AdminAnalytics } from "@/services/analyticsApi";
import { useEffect, useState } from "react";
import { adminCars, adminDealers, adminMetrics, dealerGrowth, recentPlatformActivity } from "./adminData";

export function AdminOverview() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      try {
        const response = await getAdminAnalytics();

        if (isMounted) {
          setAnalytics(response);
          setLoadError(null);
        }
      } catch {
        if (isMounted) {
          setAnalytics(null);
          setLoadError("تعذر تحميل تحليلات المنصة الحقيقية، لذلك يتم عرض بيانات تجريبية مؤقتاً.");
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

  const metrics = analytics ? buildAdminMetrics(analytics) : adminMetrics;
  const activityRows = analytics ? buildAdminActivityRows(analytics) : recentPlatformActivity;
  const dealerRows = analytics ? buildLatestDealerRows(analytics) : adminDealers.slice(0, 4);
  const carRows = analytics ? buildLatestCarRows(analytics) : adminCars.slice(0, 4);

  return (
    <div>
      <DashboardPageHeader
        subtitle="نظرة تشغيلية على أداء منصة Falcon عبر المعارض والسيارات والمستخدمين."
        title="نظرة عامة"
      />
      {isLoading ? (
        <DataNotice message="جاري تحميل تحليلات المنصة..." />
      ) : null}
      {loadError ? (
        <DataNotice message={loadError} tone="warning" />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, trend]) => (
          <MetricCard key={label} label={label} trend={trend} value={value} />
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-dark-900">نمو المعارض خلال 12 شهرًا</h3>
              <p className="mt-2 text-sm leading-7 text-slate-500">مؤشر وهمي لتوضيح نمو التسجيلات الجديدة.</p>
            </div>
            <Badge tone="accent">+22%</Badge>
          </div>
          <MiniBars className="mt-5" data={dealerGrowth} />
        </Card>
        <Card className="p-5">
          <h3 className="text-xl font-semibold text-dark-900">آخر نشاط على المنصة</h3>
          <div className="mt-5 grid gap-3">
            {activityRows.map(([label, detail, time]) => (
              <div className="rounded-2xl border border-border-subtle bg-section p-4" key={`${label}-${detail}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-dark-900">{label}</p>
                    <p className="mt-1 text-xs text-slate-500">{detail}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-accent-500">{time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-dark-900">أحدث المعارض المضافة</h3>
          <ResponsiveTable headers={["اسم المعرض", "المدينة", "السيارات", "الحالة", "تاريخ الانضمام"]} rows={dealerRows} />
        </div>
        <div>
          <h3 className="mb-3 text-lg font-semibold text-dark-900">أحدث السيارات المضافة</h3>
          <ResponsiveTable headers={["السيارة", "الماركة", "الموديل", "السنة", "السعر", "الحالة", "المعرض"]} rows={carRows} />
        </div>
      </div>
      {analytics ? (
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-semibold text-dark-900">أحدث العملاء المحتملين</h3>
          <ResponsiveTable headers={["العميل", "الهاتف", "المعرض", "السيارة", "الحالة"]} rows={buildLatestLeadRows(analytics)} />
        </div>
      ) : null}
    </div>
  );
}

function buildAdminMetrics(analytics: AdminAnalytics): [string, string, string][] {
  return [
    ["إجمالي المستخدمين", formatNumber(analytics.totalUsers), "كل الحسابات"],
    ["إجمالي المعارض", formatNumber(analytics.totalDealers), `${formatNumber(analytics.verifiedDealers)} موثق`],
    ["السيارات المعروضة", formatNumber(analytics.totalCars), `${formatNumber(analytics.activeCars)} نشطة`],
    ["العملاء المحتملون", formatNumber(analytics.totalLeads), "طلبات التواصل"],
    ["طلبات التمويل", formatNumber(analytics.totalFinanceRequests), "على مستوى المنصة"],
    ["المفضلات", formatNumber(analytics.totalFavorites), "إجمالي الحفظ"],
    ["المقارنات", formatNumber(analytics.totalCompareItems), "إضافات المقارنة"]
  ];
}

function buildAdminActivityRows(analytics: AdminAnalytics): [string, string, string][] {
  const rows: [string, string, string][] = [];

  if (analytics.latestUsers[0]) {
    rows.push(["مستخدم جديد", analytics.latestUsers[0].name, analytics.latestUsers[0].createdAt?.slice(0, 10) ?? "اليوم"]);
  }

  if (analytics.latestDealers[0]) {
    rows.push(["معرض جديد", analytics.latestDealers[0].name ?? "معرض Falcon", analytics.latestDealers[0].createdAt?.slice(0, 10) ?? "اليوم"]);
  }

  if (analytics.latestCars[0]) {
    rows.push(["سيارة جديدة", analytics.latestCars[0].name ?? "سيارة Falcon", analytics.latestCars[0].createdAt?.slice(0, 10) ?? "اليوم"]);
  }

  if (analytics.latestLeads[0]) {
    rows.push(["طلب تواصل", analytics.latestLeads[0].name, analytics.latestLeads[0].createdAt?.slice(0, 10) ?? "اليوم"]);
  }

  return rows.length > 0 ? rows : [["لا يوجد نشاط حديث", "ابدأ بإضافة بيانات حقيقية", "الآن"]];
}

function buildLatestDealerRows(analytics: AdminAnalytics) {
  if (analytics.latestDealers.length === 0) {
    return [["لا توجد معارض", "غير محدد", "0", <Badge key="empty-dealer" tone="warning">فارغ</Badge>, "غير محدد"]];
  }

  return analytics.latestDealers.map((dealer) => [
    dealer.name ?? "معرض Falcon",
    dealer.city ?? "غير محدد",
    formatNumber(dealer._count?.cars ?? 0),
    <Badge key={dealer.id} tone={dealer.isVerified ? "success" : "warning"}>{dealer.isVerified ? "معتمد" : "قيد المراجعة"}</Badge>,
    dealer.createdAt?.slice(0, 10) ?? "غير محدد"
  ]);
}

function buildLatestCarRows(analytics: AdminAnalytics) {
  if (analytics.latestCars.length === 0) {
    return [["لا توجد سيارات", "غير محدد", "غير محدد", "غير محدد", "0 ريال", <Badge key="empty-car" tone="warning">فارغ</Badge>, "غير مرتبط"]];
  }

  return analytics.latestCars.map((car) => [
    car.name ?? "سيارة Falcon",
    car.brand ?? "غير محدد",
    car.model ?? "غير محدد",
    String(car.year ?? "غير محدد"),
    `${formatNumber(car.price ?? 0)} ريال`,
    <Badge key={car.id} tone={car.status === "ACTIVE" ? "success" : car.status === "SOLD" ? "neutral" : "warning"}>
      {getCarStatusLabel(car.status)}
    </Badge>,
    car.dealer?.name ?? "غير مرتبط"
  ]);
}

function buildLatestLeadRows(analytics: AdminAnalytics) {
  if (analytics.latestLeads.length === 0) {
    return [["لا توجد طلبات", "غير محدد", "غير مرتبط", "غير محدد", <Badge key="empty-lead" tone="warning">فارغ</Badge>]];
  }

  return analytics.latestLeads.map((lead) => [
    lead.name,
    lead.phone,
    lead.dealer?.name ?? "غير مرتبط",
    lead.car?.name ?? "غير محدد",
    <Badge key={lead.id} tone={lead.status === "NEW" ? "accent" : lead.status === "WON" ? "success" : "neutral"}>
      {getLeadStatusLabel(lead.status)}
    </Badge>
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
