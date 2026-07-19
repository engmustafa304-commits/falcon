import { Card } from "@/design-system/primitives";
import { customers } from "./dashboardData";
import { DashboardPageHeader, MetricCard, ResponsiveTable } from "./DashboardPrimitives";

const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

function parseArabicNumber(value: string) {
  return Number(
    value
      .split("")
      .map((char) => {
        const index = arabicDigits.indexOf(char);
        return index === -1 ? char : String(index);
      })
      .join("")
  );
}

function formatArabicNumber(value: number) {
  return new Intl.NumberFormat("ar-SA").format(value);
}

export function Customers() {
  const carsPurchased = customers.map((customer) => parseArabicNumber(customer[3]));
  const totalCarsPurchased = carsPurchased.reduce((sum, count) => sum + count, 0);
  const repeatCustomers = carsPurchased.filter((count) => count > 1).length;

  return (
    <div>
      <DashboardPageHeader
        subtitle="العملاء الذين اشتروا أو يحتاجون متابعة من فريق المعرض."
        title="العملاء"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="إجمالي العملاء"
          trend={`${formatArabicNumber(customers.length)} عميل مسجّل`}
          value={formatArabicNumber(customers.length)}
        />
        <MetricCard
          label="السيارات المباعة لهم"
          trend="عبر جميع العملاء"
          value={formatArabicNumber(totalCarsPurchased)}
        />
        <MetricCard
          label="عملاء متكررون"
          trend="اشتروا أكثر من سيارة"
          value={formatArabicNumber(repeatCustomers)}
        />
      </div>
      <Card className="mt-6 p-4 md:p-6">
        <ResponsiveTable
          headers={["الاسم", "رقم الهاتف", "البريد الإلكتروني", "عدد السيارات المشتراة", "آخر تواصل"]}
          rows={customers.map((customer) => customer)}
        />
      </Card>
    </div>
  );
}
