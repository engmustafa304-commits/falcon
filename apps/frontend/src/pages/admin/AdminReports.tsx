import { Badge, Card } from "@/design-system/primitives";
import { DashboardPageHeader, MetricCard, MiniBars } from "@/pages/dashboard/DashboardPrimitives";
import { categorySalesTrend, inactiveDealersTrend, revenueTrend } from "./adminData";

const reportMetrics = [
  ["إجمالي الإيرادات", "42.8M ريال", "+18%"],
  ["متوسط سعر البيع", "212,000 ريال", "+6%"],
  ["المعارض النشطة", "1,120", "90% من الإجمالي"],
  ["أكثر فئة مبيعًا", "SUV", "34% من المبيعات"]
] as const;

export function AdminReports() {
  return (
    <div>
      <DashboardPageHeader
        subtitle="مؤشرات وهمية عالية المستوى لمراقبة صحة المنصة والنمو التجاري."
        title="التقارير والإحصائيات"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {reportMetrics.map(([label, value, trend]) => (
          <MetricCard key={label} label={label} trend={trend} value={value} />
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl font-semibold text-dark-900">الإيرادات الشهرية</h3>
            <Badge tone="accent">بيانات وهمية</Badge>
          </div>
          <MiniBars className="mt-5" data={revenueTrend} />
        </Card>
        <Card className="p-5">
          <h3 className="text-xl font-semibold text-dark-900">المعارض غير النشطة</h3>
          <MiniBars className="mt-5" data={inactiveDealersTrend} />
        </Card>
        <Card className="p-5 xl:col-span-3">
          <h3 className="text-xl font-semibold text-dark-900">أنواع السيارات الأكثر مبيعًا</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-6">
            {["SUV", "سيدان", "بيك أب", "كهربائية", "رياضية", "هجينة"].map((label, index) => (
              <div className="rounded-2xl bg-section p-4 text-center" key={label}>
                <div className="mx-auto flex h-24 w-10 items-end justify-center rounded-full bg-white">
                  <div
                    className="w-full rounded-full bg-accent-500"
                    style={{ height: `${categorySalesTrend[index]}%` }}
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-dark-900">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
