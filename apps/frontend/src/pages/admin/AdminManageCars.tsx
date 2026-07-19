import { Edit3, Search, Trash2 } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge, Button, Card, ImageWithFallback, Input } from "@/design-system/primitives";
import { DashboardPageHeader, ResponsiveTable } from "@/pages/dashboard/DashboardPrimitives";
import {
  deleteAdminCar,
  getAdminCars,
  updateAdminCar,
  updateAdminCarStatus,
  type AdminCar,
  type AdminCarStatus
} from "@/services/adminCarsApi";
import { createCar } from "@/services/carsApi";
import { getBackendCarImageSrc } from "@/services/carsApi";
import { adminCars } from "./adminData";

const statusOptions: AdminCarStatus[] = ["DRAFT", "ACTIVE", "SUSPENDED", "SOLD"];
const statusLabels: Record<AdminCarStatus, string> = {
  ACTIVE: "نشط",
  DRAFT: "مسودة",
  SOLD: "مباع",
  SUSPENDED: "موقوف"
};

export function AdminManageCars() {
  const { dealerId } = useParams();
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [selectedCar, setSelectedCar] = useState<AdminCar | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filters, setFilters] = useState({
    dealer: "",
    query: "",
    status: "",
    brand: ""
  });

  async function refreshCars() {
    const response = await getAdminCars({ dealerId });
    setCars(response);
    setIsFallback(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadCars() {
      try {
        const response = await getAdminCars({ dealerId });

        if (isMounted) {
          setCars(response);
          setIsFallback(false);
        }
      } catch {
        if (isMounted) {
          setCars([]);
          setIsFallback(true);
          setError("تعذر تحميل السيارات من API، لذلك يتم عرض البيانات التجريبية.");
        }
      }
    }

    void loadCars();

    return () => {
      isMounted = false;
    };
  }, [dealerId]);

  async function handleStatusChange(car: AdminCar, status: AdminCarStatus) {
    setMessage(null);
    setError(null);

    try {
      const updatedCar = await updateAdminCarStatus(car.id, status);
      setCars((currentCars) => currentCars.map((item) => (item.id === updatedCar.id ? updatedCar : item)));
      setSelectedCar((currentCar) => (currentCar?.id === updatedCar.id ? updatedCar : currentCar));
      setMessage("تم تحديث حالة السيارة بنجاح.");
    } catch {
      setError("تعذر تحديث حالة السيارة.");
    }
  }

  async function handleDeleteCar(car: AdminCar) {
    setMessage(null);
    setError(null);

    if (!window.confirm(`هل تريد حذف ${car.name ?? "هذه السيارة"}؟`)) {
      return;
    }

    try {
      await deleteAdminCar(car.id);
      await refreshCars();
      setSelectedCar((currentCar) => (currentCar?.id === car.id ? null : currentCar));
      setMessage("تم حذف السيارة بنجاح.");
    } catch {
      setError("تعذر حذف السيارة.");
    }
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setFilters({
      dealer: getTextField(formData, "filterDealer"),
      query: getTextField(formData, "filterQuery"),
      status: getTextField(formData, "filterStatus"),
      brand: getTextField(formData, "filterBrand")
    });
  }

  async function handleCarUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!selectedCar) {
      setError("اختر سيارة لتعديل بياناتها.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = getTextField(formData, "name");
    const brand = getTextField(formData, "brand");
    const model = getTextField(formData, "model");
    const city = getTextField(formData, "city");
    const price = getPositiveInteger(formData, "price");
    const year = getPositiveInteger(formData, "year");

    if (!name || !brand || !model || !city) {
      setError("اسم السيارة والماركة والموديل والمدينة حقول مطلوبة.");
      return;
    }

    if (!price || !year) {
      setError("السنة والسعر يجب أن تكون أرقامًا صحيحة وموجبة.");
      return;
    }

    setIsSaving(true);

    try {
      const updatedCar = await updateAdminCar(selectedCar.id, {
        brand,
        city,
        model,
        name,
        price,
        year
      });
      setCars((currentCars) => currentCars.map((item) => (item.id === updatedCar.id ? updatedCar : item)));
      setSelectedCar(updatedCar);
      setMessage("تم تحديث بيانات السيارة بنجاح.");
    } catch {
      setError("تعذر تحديث بيانات السيارة.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateDealerCar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!dealerId) {
      setError("اختر معرضًا لإضافة سيارة له.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = getTextField(formData, "createName");
    const brand = getTextField(formData, "createBrand");
    const model = getTextField(formData, "createModel");
    const city = getTextField(formData, "createCity");
    const price = getPositiveInteger(formData, "createPrice");
    const year = getPositiveInteger(formData, "createYear");
    const mileage = getPositiveInteger(formData, "createMileage") ?? 0;

    if (!name || !brand || !model || !city || !price || !year) {
      setError("اسم السيارة والماركة والموديل والمدينة والسنة والسعر حقول مطلوبة.");
      return;
    }

    setIsSaving(true);

    try {
      await createCar({
        brand,
        city,
        dealerId,
        fuel: "غير محدد",
        mileage,
        model,
        name,
        price,
        status: "DRAFT",
        transmission: "غير محدد",
        year
      });
      await refreshCars();
      event.currentTarget.reset();
      setMessage("تمت إضافة السيارة للمعرض كمسودة.");
    } catch {
      setError("تعذر إضافة السيارة للمعرض.");
    } finally {
      setIsSaving(false);
    }
  }

  const visibleCars = cars.filter((car) => {
    const query = filters.query.toLowerCase();
    const brand = filters.brand.toLowerCase();
    const dealer = filters.dealer.toLowerCase();
    const status = filters.status.toLowerCase();

    return (
      (!query || `${car.name ?? ""} ${car.model ?? ""}`.toLowerCase().includes(query)) &&
      (!brand || (car.brand ?? "").toLowerCase().includes(brand)) &&
      (!dealer || (car.dealer?.name ?? "").toLowerCase().includes(dealer)) &&
      (!status || statusLabels[car.status ?? "DRAFT"].toLowerCase().includes(status) || (car.status ?? "").toLowerCase().includes(status))
    );
  });

  const realRows = visibleCars.map((car, index) => [
    <span className="inline-flex min-w-56 items-center gap-3" key={`${car.id}-name`}>
      <span className="h-12 w-16 overflow-hidden rounded-2xl bg-section">
        <ImageWithFallback alt={car.name ?? "سيارة"} className="h-full w-full object-cover" src={getBackendCarImageSrc(car, index)} />
      </span>
      <span>
        <span className="block font-semibold">{car.name ?? "سيارة Falcon"}</span>
        <span className="text-xs text-slate-500">{car.city ?? "غير محدد"}</span>
      </span>
    </span>,
    car.brand ?? "غير محدد",
    car.model ?? "غير محدد",
    String(car.year ?? "غير محدد"),
    `${new Intl.NumberFormat("ar-SA").format(car.price ?? 0)} ريال`,
    car.city ?? "غير محدد",
    car.dealer?.name ?? "غير مرتبط",
    <select
      className="min-h-10 rounded-2xl border border-border-subtle bg-white px-3 text-xs font-semibold text-dark-900 outline-none focus:border-accent-500"
      defaultValue={car.status ?? "DRAFT"}
      key={`${car.id}-status`}
      onChange={(event) => void handleStatusChange(car, event.currentTarget.value as AdminCarStatus)}
    >
      {statusOptions.map((status) => (
        <option key={status} value={status}>
          {statusLabels[status]}
        </option>
      ))}
    </select>,
    car.createdAt?.slice(0, 10) ?? "غير محدد",
    <Actions car={car} key={`${car.id}-actions`} onDelete={handleDeleteCar} onEdit={setSelectedCar} />
  ]);

  const fallbackRows = adminCars.map(([name, brand, model, year, price, status, dealer]) => [
    name,
    brand,
    model,
    year,
    price,
    "الرياض",
    dealer,
    <Badge key={`${name}-status`} tone={status === "نشط" ? "success" : status === "موقوف" ? "danger" : "warning"}>{status}</Badge>,
    "تجريبي",
    <FallbackActions key={`${name}-actions`} />
  ]);

  return (
    <div>
      <DashboardPageHeader
        subtitle="مراجعة وإدارة إعلانات السيارات المنشورة على مستوى المنصة."
        title={dealerId ? "إدارة سيارات المعرض" : "إدارة السيارات"}
      />
      <Card className="mb-6 p-4">
        <form className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]" onSubmit={handleFilterSubmit}>
          <Input label="بحث" name="filterQuery" placeholder="اسم السيارة أو المعرض" />
          <Input label="الماركة" name="filterBrand" placeholder="Mercedes" />
          <Input label="المعرض" name="filterDealer" placeholder="معرض الخليج" />
          <Input label="الحالة" name="filterStatus" placeholder="نشط" />
          <Button className="w-full self-end md:w-auto" variant="primary">
            <Search className="h-4 w-4" strokeWidth={1.75} />
            تصفية
          </Button>
        </form>
      </Card>
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
      {dealerId ? (
        <Card className="mb-6 p-5">
          <h3 className="text-lg font-semibold text-dark-900">إضافة سيارة لهذا المعرض</h3>
          <form className="mt-4 grid gap-4 md:grid-cols-4" onSubmit={handleCreateDealerCar}>
            <Input label="اسم السيارة" name="createName" placeholder="Mercedes E300" />
            <Input label="الماركة" name="createBrand" placeholder="Mercedes" />
            <Input label="الموديل" name="createModel" placeholder="E300" />
            <Input label="المدينة" name="createCity" placeholder="الرياض" />
            <Input label="السنة" min={1} name="createYear" placeholder="2025" type="number" />
            <Input label="السعر" min={1} name="createPrice" placeholder="375000" type="number" />
            <Input label="الممشى" min={0} name="createMileage" placeholder="0" type="number" />
            <Button className="self-end" isLoading={isSaving} type="submit" variant="accent">إضافة كمسودة</Button>
          </form>
        </Card>
      ) : null}
      <ResponsiveTable
        headers={["السيارة", "الماركة", "الموديل", "السنة", "السعر", "المدينة", "المعرض", "الحالة", "تاريخ الإنشاء", "إجراءات"]}
        rows={isFallback ? fallbackRows : realRows}
      />
      {selectedCar ? (
        <Card className="mt-6 p-6">
          <div className="flex items-center gap-3">
            <Edit3 className="h-5 w-5 text-accent-500" strokeWidth={1.75} />
            <h3 className="text-xl font-semibold text-dark-900">تعديل بيانات السيارة</h3>
          </div>
          <form className="mt-5 grid gap-4" key={selectedCar.id} onSubmit={handleCarUpdate}>
            <div className="grid gap-4 md:grid-cols-3">
              <Input defaultValue={selectedCar.name ?? ""} label="اسم السيارة" name="name" placeholder="Mercedes E300 AMG" />
              <Input defaultValue={selectedCar.brand ?? ""} label="الماركة" name="brand" placeholder="Mercedes" />
              <Input defaultValue={selectedCar.model ?? ""} label="الموديل" name="model" placeholder="E300" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Input defaultValue={selectedCar.year ?? ""} label="السنة" min={1} name="year" placeholder="2025" type="number" />
              <Input defaultValue={selectedCar.price ?? ""} label="السعر" min={1} name="price" placeholder="375000" type="number" />
              <Input defaultValue={selectedCar.city ?? ""} label="المدينة" name="city" placeholder="الرياض" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button isLoading={isSaving} type="submit" variant="primary">حفظ التعديلات</Button>
              <Button onClick={() => setSelectedCar(null)} type="button" variant="secondary">إلغاء التعديل</Button>
            </div>
          </form>
        </Card>
      ) : null}
    </div>
  );
}

function Actions({
  car,
  onDelete,
  onEdit
}: {
  car: AdminCar;
  onDelete: (car: AdminCar) => void;
  onEdit: (car: AdminCar) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button className="h-10 px-3 text-xs" onClick={() => onEdit(car)} variant="secondary">
        <Edit3 className="h-4 w-4" strokeWidth={1.75} />
        تعديل
      </Button>
      <Button className="h-10 px-3 text-xs" onClick={() => onDelete(car)} variant="secondary">
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
        <Edit3 className="h-4 w-4" strokeWidth={1.75} />
        تعديل
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

function getPositiveInteger(formData: FormData, key: string) {
  const value = Number(getTextField(formData, key));

  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}
