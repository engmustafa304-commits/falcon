import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Button, Card, Input } from "@/design-system/primitives";
import { getMyDealer, updateMyDealer, type BackendDealerDetails } from "@/services/dealersApi";
import { DashboardPageHeader } from "./DashboardPrimitives";
import { dealerProfile } from "./dashboardData";

export function Settings() {
  const [dealer, setDealer] = useState<BackendDealerDetails | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDealer() {
      try {
        const dealerProfile = await getMyDealer();

        if (isMounted) {
          setDealer(dealerProfile);
        }
      } catch {
        if (isMounted) {
          setError("لا يوجد معرض مرتبط بحسابك.");
        }
      }
    }

    void loadDealer();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleDealerSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!dealer?.id) {
      setError("لا يوجد معرض مرتبط بحسابك.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = getFormText(formData, "name");
    const city = getFormText(formData, "city");
    const phone = getFormText(formData, "phone");

    if (!name || !city) {
      setError("اسم المعرض والمدينة حقول مطلوبة.");
      return;
    }

    setIsSaving(true);

    try {
      const updatedDealer = await updateMyDealer({
        city,
        name,
        phone: phone || undefined
      });
      setDealer(updatedDealer);
      setMessage("تم تحديث بيانات المعرض بنجاح.");
    } catch {
      setError("تعذر تحديث بيانات المعرض.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <DashboardPageHeader
        subtitle="نماذج ثابتة لتعديل معلومات المعرض وحساب المستخدم."
        title="الإعدادات"
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-dark-900">معلومات المعرض</h3>
          <form className="mt-6 grid gap-4" key={dealer?.id ?? "dealer-settings"} onSubmit={handleDealerSettingsSubmit}>
            <Input defaultValue={dealer?.name ?? dealerProfile.name} label="اسم المعرض" name="name" />
            <Input defaultValue={dealer?.city ?? "الرياض"} label="المدينة" name="city" />
            <Input defaultValue="طريق الملك فهد، الرياض" label="العنوان" name="address" />
            <label className="grid gap-2">
              <span className="text-sm font-medium text-dark-900">وصف قصير</span>
              <textarea className="min-h-32 resize-none rounded-2xl border border-border-subtle bg-white p-4 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20" defaultValue="معرض متخصص في السيارات الفاخرة والجديدة والمستعملة." />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input defaultValue="٩ صباحًا - ١٠ مساءً" label="ساعات العمل" />
              <Input defaultValue="@falcon_dealer" label="إنستغرام" />
            </div>
            <Input defaultValue={dealer?.phone ?? "+966 55 245 8890"} label="واتساب" name="phone" />
            {message ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {message}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                {error}
              </p>
            ) : null}
            <Button className="w-full sm:w-auto" isLoading={isSaving} type="submit" variant="primary">حفظ معلومات المعرض</Button>
          </form>
        </Card>
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-dark-900">إعدادات الحساب</h3>
          <form
            className="mt-6 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("إعدادات الحساب غير مرتبطة بواجهة API بعد.");
            }}
          >
            <Input defaultValue="manager@gulf-motors.sa" label="البريد الإلكتروني" type="email" />
            <Input label="كلمة المرور الحالية" placeholder="••••••••" type="password" />
            <Input label="كلمة المرور الجديدة" placeholder="••••••••" type="password" />
            <Button className="w-full sm:w-auto" type="submit" variant="accent">تحديث الحساب</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function getFormText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
