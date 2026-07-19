import { Car, CheckCircle2, Edit3, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Input } from "@/design-system/primitives";
import { DashboardPageHeader, ResponsiveTable } from "@/pages/dashboard/DashboardPrimitives";
import {
  deleteAdminDealer,
  getAdminDealers,
  updateAdminDealer,
  updateAdminDealerVerification,
  type AdminDealer
} from "@/services/adminDealersApi";
import { createDealer } from "@/services/dealersApi";
import { adminDealers } from "./adminData";

export function ManageDealers() {
  const [dealers, setDealers] = useState<AdminDealer[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<AdminDealer | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDealers() {
      try {
        const apiDealers = await getAdminDealers();

        if (isMounted) {
          setDealers(apiDealers);
          setIsFallback(false);
        }
      } catch {
        if (isMounted) {
          setDealers([]);
          setIsFallback(true);
          setError("تعذر تحميل المعارض من API، لذلك يتم عرض البيانات التجريبية.");
        }
      }
    }

    void loadDealers();

    return () => {
      isMounted = false;
    };
  }, []);

  async function refreshDealers() {
    setDealers(await getAdminDealers());
    setIsFallback(false);
  }

  async function handleStaticDealerApproval(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = getTextField(formData, "name");
    const city = getTextField(formData, "city");

    if (!name || !city) {
      setError("اسم المعرض والمدينة حقول مطلوبة.");
      return;
    }

    setIsSaving(true);

    try {
      await createDealer({
        city,
        isVerified: true,
        name,
        tenantId: "local-dev"
      });
      await refreshDealers();
      setMessage("تمت إضافة المعرض بنجاح.");
      event.currentTarget.reset();
    } catch {
      setError("تعذر إضافة المعرض.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleVerification(dealer: AdminDealer) {
    setMessage(null);
    setError(null);

    try {
      const updatedDealer = await updateAdminDealerVerification(dealer.id, !dealer.isVerified);
      setDealers((currentDealers) => currentDealers.map((item) => (item.id === updatedDealer.id ? updatedDealer : item)));
      setMessage(updatedDealer.isVerified ? "تم توثيق المعرض بنجاح." : "تم إلغاء توثيق المعرض.");
    } catch {
      setError("تعذر تحديث حالة توثيق المعرض.");
    }
  }

  async function handleDeleteDealer(dealer: AdminDealer) {
    setMessage(null);
    setError(null);

    if (!window.confirm(`هل تريد حذف ${dealer.name ?? "هذا المعرض"}؟`)) {
      return;
    }

    try {
      await deleteAdminDealer(dealer.id);
      await refreshDealers();
      setSelectedDealer((currentDealer) => (currentDealer?.id === dealer.id ? null : currentDealer));
      setMessage("تم حذف المعرض بنجاح.");
    } catch {
      setError("تعذر حذف المعرض.");
    }
  }

  async function handleDealerUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!selectedDealer) {
      setError("اختر معرضًا لتعديل بياناته.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = getTextField(formData, "editName");
    const city = getTextField(formData, "editCity");
    const phone = getTextField(formData, "editPhone");

    if (!name || !city) {
      setError("اسم المعرض والمدينة حقول مطلوبة.");
      return;
    }

    setIsSaving(true);

    try {
      const updatedDealer = await updateAdminDealer(selectedDealer.id, {
        city,
        name,
        phone: phone || undefined
      });
      setDealers((currentDealers) => currentDealers.map((item) => (item.id === updatedDealer.id ? updatedDealer : item)));
      setSelectedDealer(updatedDealer);
      setMessage("تم تحديث بيانات المعرض بنجاح.");
    } catch {
      setError("تعذر تحديث بيانات المعرض.");
    } finally {
      setIsSaving(false);
    }
  }

  const rows =
    !isFallback
      ? dealers.map((dealer) => [
          dealer.name ?? "معرض Falcon",
          dealer.city ?? "الرياض",
          dealer.phone ?? "غير محدد",
          dealer.owner?.name ?? dealer.owner?.email ?? "غير مرتبط",
          `${dealer._count?.cars ?? 0}`,
          <Badge key={`${dealer.id}-status`} tone={dealer.isVerified ? "success" : "warning"}>{dealer.isVerified ? "معتمد" : "قيد المراجعة"}</Badge>,
          dealer.createdAt?.slice(0, 10) ?? "اليوم",
          <Actions
            dealer={dealer}
            key={`${dealer.id}-actions`}
            onDelete={handleDeleteDealer}
            onEdit={setSelectedDealer}
            onToggleVerification={handleToggleVerification}
          />
        ])
      : adminDealers.map(([name, city, cars, status, joined]) => [
          name,
          city,
          "غير محدد",
          "بيانات تجريبية",
          cars,
          <Badge key={`${name}-status`} tone={status === "معتمد" ? "success" : "warning"}>{status}</Badge>,
          joined,
          <FallbackActions key={`${name}-actions`} />
        ]);

  return (
    <div>
      <DashboardPageHeader
        action={
          <a className="w-full sm:w-auto" href="#dealer-review-form">
            <Button className="w-full sm:w-auto" variant="primary">مراجعة طلب جديد</Button>
          </a>
        }
        subtitle="إدارة سجلات المعارض وحالة التوثيق والإجراءات الإدارية."
        title="إدارة المعارض"
      />
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
        headers={["اسم المعرض", "المدينة", "الهاتف", "المالك", "السيارات", "التوثيق", "تاريخ الانضمام", "إجراءات"]}
        rows={rows}
      />
      {selectedDealer ? (
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-3">
            <Edit3 className="h-5 w-5 text-accent-500" strokeWidth={1.75} />
            <h3 className="text-xl font-semibold text-dark-900">تعديل بيانات المعرض</h3>
          </div>
          <form className="mt-5 grid gap-4" key={selectedDealer.id} onSubmit={handleDealerUpdate}>
            <div className="grid gap-4 md:grid-cols-3">
              <Input defaultValue={selectedDealer.name ?? ""} label="اسم المعرض" name="editName" placeholder="اسم المعرض" />
              <Input defaultValue={selectedDealer.city ?? ""} label="المدينة" name="editCity" placeholder="الرياض" />
              <Input defaultValue={selectedDealer.phone ?? ""} label="رقم الهاتف" name="editPhone" placeholder="+966 55 000 0000" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button isLoading={isSaving} type="submit" variant="primary">حفظ التعديلات</Button>
              <Button onClick={() => setSelectedDealer(null)} type="button" variant="secondary">إلغاء التعديل</Button>
            </div>
          </form>
        </Card>
      ) : null}
      <Card className="mt-6 p-6" id="dealer-review-form">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-accent-500" strokeWidth={1.75} />
          <h3 className="text-xl font-semibold text-dark-900">نموذج اعتماد معرض</h3>
        </div>
        <form className="mt-5 grid gap-4" onSubmit={handleStaticDealerApproval}>
          <div className="grid gap-4 md:grid-cols-3">
          <Input label="اسم المعرض" name="name" placeholder="اسم المعرض" />
          <Input label="المدينة" name="city" placeholder="الرياض" />
          <Input label="رقم السجل التجاري" name="commercialRegister" placeholder="1010xxxxxx" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button isLoading={isSaving} type="submit" variant="accent">اعتماد الطلب</Button>
            <Button
              onClick={() => {
                setError(null);
                setMessage("تم تسجيل رفض الطلب في الواجهة فقط. سيتم ربط مسار رفض الطلبات عند إضافة سير عمل مراجعة المعارض.");
              }}
              type="button"
              variant="secondary"
            >
              رفض الطلب
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Actions({
  dealer,
  onDelete,
  onEdit,
  onToggleVerification
}: {
  dealer: AdminDealer;
  onDelete: (dealer: AdminDealer) => void;
  onEdit: (dealer: AdminDealer) => void;
  onToggleVerification: (dealer: AdminDealer) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button className="h-10 px-3 text-xs" onClick={() => onToggleVerification(dealer)} variant="secondary">
        <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
        {dealer.isVerified ? "إلغاء التوثيق" : "توثيق"}
      </Button>
      <Button className="h-10 px-3 text-xs" onClick={() => onEdit(dealer)} variant="secondary">
        <Edit3 className="h-4 w-4" strokeWidth={1.75} />
        تعديل
      </Button>
      <Link to={`/admin/dashboard/dealers/${dealer.id}/cars`}>
        <Button className="h-10 px-3 text-xs" variant="secondary">
          <Car className="h-4 w-4" strokeWidth={1.75} />
          إدارة السيارات
        </Button>
      </Link>
      <Button className="h-10 px-3 text-xs" onClick={() => onDelete(dealer)} variant="secondary">
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        حذف
      </Button>
    </div>
  );
}

function FallbackActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button className="h-10 px-3 text-xs" disabled title="الإجراءات غير متاحة أثناء عرض البيانات التجريبية." variant="secondary">
        <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
        توثيق
      </Button>
      <Button className="h-10 px-3 text-xs" disabled title="الإجراءات غير متاحة أثناء عرض البيانات التجريبية." variant="secondary">
        <Trash2 className="h-4 w-4" strokeWidth={1.75} />
        حذف
      </Button>
    </div>
  );
}

function getTextField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
