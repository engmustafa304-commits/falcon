import { Plus } from "lucide-react";
import { Badge, Button, Card, Input } from "@/design-system/primitives";
import { DashboardPageHeader, ResponsiveTable } from "@/pages/dashboard/DashboardPrimitives";
import { adminCategories } from "./adminData";

export function ManageCategories() {
  const rows = adminCategories.map(([name, description, cars, status]) => [
    name,
    description,
    cars,
    <Badge key={`${name}-status`} tone="success">{status}</Badge>,
    <div className="flex gap-2" key={`${name}-actions`}>
      <Button className="h-10 px-3 text-xs" disabled title="إدارة الفئات عبر API غير مفعلة بعد." variant="secondary">تعديل</Button>
      <Button className="h-10 px-3 text-xs" disabled title="إزالة الفئات عبر API غير مفعلة بعد." variant="secondary">إزالة</Button>
    </div>
  ]);

  return (
    <div>
      <DashboardPageHeader
        action={<Button className="w-full sm:w-auto" disabled title="إضافة الفئات عبر API غير مفعلة بعد." variant="primary"><Plus className="h-4 w-4" strokeWidth={1.75} /> إضافة فئة</Button>}
        subtitle="تنظيم فئات السيارات المستخدمة في البحث والتصفية وصفحات التصنيف."
        title="إدارة الفئات"
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <ResponsiveTable headers={["الفئة", "الوصف", "عدد السيارات", "الحالة", "إجراءات"]} rows={rows} />
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-dark-900">إضافة / تعديل فئة</h3>
          <div className="mt-5 grid gap-4">
            <Input label="اسم الفئة" placeholder="SUV" />
            <Input label="المعرف" placeholder="suv" />
            <label className="grid gap-2">
              <span className="text-sm font-medium text-dark-900">وصف الفئة</span>
              <textarea className="min-h-32 resize-none rounded-2xl border border-border-subtle bg-white p-4 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20" placeholder="وصف مختصر يساعد العملاء على اختيار الفئة." />
            </label>
            <Button disabled title="حفظ الفئات عبر API غير مفعل بعد." variant="accent">حفظ الفئة</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
