import { Plus, Upload } from "lucide-react";
import { Badge, Button, Card, Input } from "@/design-system/primitives";
import { DashboardPageHeader, ResponsiveTable } from "@/pages/dashboard/DashboardPrimitives";
import { adminBrands } from "./adminData";

export function ManageBrands() {
  const rows = adminBrands.map(([slug, name, country, cars, status]) => [
    slug,
    name,
    country,
    cars,
    <Badge key={`${slug}-status`} tone="success">{status}</Badge>,
    <div className="flex gap-2" key={`${slug}-actions`}>
      <Button className="h-10 px-3 text-xs" disabled title="إدارة العلامات عبر API غير مفعلة بعد." variant="secondary">تعديل</Button>
      <Button className="h-10 px-3 text-xs" disabled title="إزالة العلامات عبر API غير مفعلة بعد." variant="secondary">إزالة</Button>
    </div>
  ]);

  return (
    <div>
      <DashboardPageHeader
        action={<Button className="w-full sm:w-auto" disabled title="إضافة العلامات عبر API غير مفعلة بعد." variant="primary"><Plus className="h-4 w-4" strokeWidth={1.75} /> إضافة علامة</Button>}
        subtitle="إدارة العلامات التجارية التي تظهر في تجربة البحث والتصفح."
        title="إدارة العلامات التجارية"
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <ResponsiveTable headers={["المعرف", "الاسم", "الدولة", "عدد السيارات", "الحالة", "إجراءات"]} rows={rows} />
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-dark-900">إضافة / تعديل علامة</h3>
          <div className="mt-5 grid gap-4">
            <Input label="اسم العلامة بالعربية" placeholder="لكزس" />
            <Input label="اسم العلامة بالإنجليزية" placeholder="Lexus" />
            <Input label="الدولة" placeholder="اليابان" />
            <label className="grid gap-2">
              <span className="text-sm font-medium text-dark-900">وصف قصير</span>
              <textarea className="min-h-28 resize-none rounded-2xl border border-border-subtle bg-white p-4 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20" placeholder="وصف يظهر في صفحة العلامة." />
            </label>
            <Button disabled title="رفع الشعارات للعلامات غير مفعل بعد." variant="secondary">
              <Upload className="h-4 w-4" strokeWidth={1.75} />
              رفع الشعار
            </Button>
            <Button disabled title="حفظ العلامات عبر API غير مفعل بعد." variant="accent">حفظ العلامة</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
