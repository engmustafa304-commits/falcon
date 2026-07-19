import type { FormEvent } from "react";
import { useState } from "react";
import { Button, Card, Input } from "@/design-system/primitives";
import { DashboardPageHeader } from "@/pages/dashboard/DashboardPrimitives";

export function AdminSettings() {
  const [message, setMessage] = useState<string | null>(null);

  function handleSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("إعدادات المنصة ثابتة حاليًا. سيتم ربطها بواجهة إدارة الإعدادات لاحقًا.");
  }

  return (
    <div>
      <DashboardPageHeader
        subtitle="إعدادات ثابتة تمهد لإدارة المنصة والصلاحيات مستقبلًا."
        title="الإعدادات"
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-dark-900">إعدادات المنصة</h3>
          <form className="mt-6 grid gap-4" onSubmit={handleSettingsSubmit}>
            <Input defaultValue="Falcon" label="اسم المنصة" />
            <Input defaultValue="https://falcon.sa" label="الرابط الرئيسي" />
            <Input defaultValue="support@falcon.sa" label="بريد الدعم" type="email" />
            <Input defaultValue="+966 9200 00000" label="رقم التواصل" />
            <label className="grid gap-2">
              <span className="text-sm font-medium text-dark-900">رسالة تشغيلية</span>
              <textarea className="min-h-32 resize-none rounded-2xl border border-border-subtle bg-white p-4 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20" defaultValue="منصة Falcon لإدارة وتشغيل قطاع السيارات." />
            </label>
            {message ? (
              <p className="rounded-2xl border border-accent-500/20 bg-accent-500/10 px-4 py-3 text-sm font-semibold text-dark-900">
                {message}
              </p>
            ) : null}
            <Button className="w-full sm:w-auto" type="submit" variant="primary">حفظ الإعدادات</Button>
          </form>
        </Card>
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-dark-900">الصلاحيات والأدوار</h3>
          <div className="mt-6 grid gap-3">
            {["Platform Owner", "Operations Admin", "Content Manager", "Support Agent"].map((role) => (
              <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-section p-4" key={role}>
                <span className="text-sm font-semibold text-dark-900">{role}</span>
                <Button className="h-10 px-3 text-xs" disabled title="إدارة صلاحيات الأدوار غير مفعلة بعد." variant="secondary">إدارة</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
