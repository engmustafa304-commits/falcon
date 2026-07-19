import { Car, CircleDollarSign, TrendingUp } from "lucide-react";
import { Card } from "@/design-system/primitives";
import { salesTrend, visitsTrend } from "./dashboardData";
import { DashboardPageHeader, MetricCard, MiniBars } from "./DashboardPrimitives";

export function Reports() {
  return (
    <div>
      <DashboardPageHeader
        subtitle="مؤشرات وهمية تساعد في تصور تقارير المعرض داخل Falcon."
        title="التقارير والإحصائيات"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="إجمالي الإيرادات" trend="+١٨٪" value="٩.٨M ريال" />
        <MetricCard label="متوسط سعر البيع" trend="+٦٪" value="٣١٢K ريال" />
        <MetricCard label="أكثر السيارات مبيعًا" trend="SUV" value="لكزس LX" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <Car className="h-5 w-5 text-accent-500" strokeWidth={1.75} />
            <h3 className="text-xl font-semibold text-dark-900">السيارات المباعة شهريًا</h3>
          </div>
          <MiniBars data={salesTrend} />
        </Card>
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-accent-500" strokeWidth={1.75} />
            <h3 className="text-xl font-semibold text-dark-900">زيارات صفحة المعرض</h3>
          </div>
          <MiniBars data={visitsTrend} />
        </Card>
      </div>
      <Card className="mt-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent-500">تحليل سريع</p>
            <h3 className="mt-2 text-2xl font-semibold text-dark-900">نمو الطلب على السيارات الفاخرة</h3>
          </div>
          <CircleDollarSign className="h-12 w-12 text-accent-500" strokeWidth={1.5} />
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
          تشير البيانات الوهمية إلى ارتفاع الطلب على سيارات SUV والسيارات الفاخرة خلال آخر شهر.
        </p>
      </Card>
    </div>
  );
}
