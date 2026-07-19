import { Edit3, ImagePlus, Plus, Star, Trash2 } from "lucide-react";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { Badge, Button, Card, ImageWithFallback, Input } from "@/design-system/primitives";
import {
  createCar,
  createCarImage,
  deleteCar,
  deleteCarImage,
  getBackendCarImageSrc,
  getCar,
  getCarImages,
  getMyDealerCars,
  setMainCarImage,
  updateCar,
  type BackendCar,
  type BackendCarImage,
  type CreateCarInput
} from "@/services/carsApi";
import { getMyDealer, type BackendDealerDetails } from "@/services/dealersApi";
import { uploadCarImage, uploadCarImageAsset } from "@/services/uploadsApi";
import { dashboardCars } from "./dashboardData";
import { DashboardPageHeader, ResponsiveTable } from "./DashboardPrimitives";

type DashboardCarRow = {
  addedAt: string;
  id?: string;
  imageSrc: string;
  model: string;
  name: string;
  price: string;
  status: "نشط" | "موقوف";
  year: string;
};

export function ManageCars() {
  const [dealer, setDealer] = useState<BackendDealerDetails | null>(null);
  const [cars, setCars] = useState<DashboardCarRow[]>([...dashboardCars]);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [listWarning, setListWarning] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedCar, setSelectedCar] = useState<BackendCar | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [managedImages, setManagedImages] = useState<BackendCarImage[]>([]);
  const [galleryMessage, setGalleryMessage] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const previewImageUrl = uploadedImageUrl ?? selectedCar?.imageUrl ?? null;

  async function refreshCarsList() {
    const dealerCars = await getMyDealerCars();

    if (dealerCars.length > 0) {
      setCars(dealerCars.map(mapBackendCarToDashboardRow));
      setIsFallback(false);
      setListWarning(null);
      return;
    }

    setCars([...dashboardCars]);
    setIsFallback(true);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardCars() {
      try {
        const dealerResponse = await getMyDealer();
        const carsResponse = await getMyDealerCars();

        if (!isMounted) {
          return;
        }

        setDealer(dealerResponse);
        const dealerCars = carsResponse.filter((car) => car.dealerId === dealerResponse.id || car.dealer?.id === dealerResponse.id);

        if (dealerCars.length > 0) {
          setCars(dealerCars.map(mapBackendCarToDashboardRow));
          setIsFallback(false);
          setListWarning(null);
        } else {
          setCars([...dashboardCars]);
          setIsFallback(true);
          setListWarning(null);
        }
      } catch {
        if (isMounted) {
          setCars([...dashboardCars]);
          setIsFallback(false);
          setDealer(null);
          setListWarning("لا يوجد معرض مرتبط بحسابك.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboardCars();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCarSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage(null);
    setFormError(null);
    setListWarning(null);
    setGalleryMessage(null);
    setGalleryError(null);

    if (!dealer?.id) {
      setFormError("لا يوجد معرض مرتبط بحسابك.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = getTextField(formData, "name");
    const brand = getTextField(formData, "brand");
    const model = getTextField(formData, "model");
    const city = getTextField(formData, "city");
    const transmission = getTextField(formData, "transmission");
    const fuel = getTextField(formData, "fuel");
    const imageUrl = uploadedImageUrl ?? getTextField(formData, "imageUrl");
    const year = getPositiveInteger(formData, "year");
    const price = getPositiveInteger(formData, "price");
    const mileage = getPositiveInteger(formData, "mileage", true);

    if (!name || !brand || !model || !city || !transmission || !fuel) {
      setFormError("يرجى تعبئة جميع الحقول المطلوبة.");
      return;
    }

    if (!year || !price || mileage === null) {
      setFormError("السنة والسعر والممشى يجب أن تكون أرقامًا صحيحة وموجبة.");
      return;
    }

    const payload: CreateCarInput = {
      brand,
      city,
      dealerId: selectedCar?.dealerId ?? undefined,
      fuel,
      imageUrl: imageUrl || undefined,
      mileage,
      model,
      name,
      price,
      status: "ACTIVE",
      transmission,
      year
    };

    setIsSubmitting(true);

    const wasEditing = Boolean(selectedCar?.id);

    try {
      const savedCar = selectedCar?.id ? await updateCar(selectedCar.id, payload) : await createCar(payload);
      setFormError(null);
      setIsFallback(false);
      setFormMessage(wasEditing ? "تم تحديث السيارة بنجاح." : "تمت إضافة السيارة بنجاح. يمكنك الآن إدارة صورها.");
      setSelectedCar(savedCar);
      setManagedImages(savedCar.images ?? []);
      setUploadedImageUrl(null);

      try {
        await refreshCarsList();
      } catch {
        setListWarning("تمت إضافة السيارة بنجاح، لكن تعذر تحديث القائمة تلقائيًا.");
      }
    } catch {
      setFormMessage(null);
      setFormError(wasEditing ? "تعذر تحديث السيارة." : "تعذر إضافة السيارة. تأكد من تشغيل backend API وأن بيانات النموذج صحيحة.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    setFormError(null);
    setFormMessage(null);
    setIsUploadingImage(true);

    try {
      const url = await uploadCarImage(file);
      setUploadedImageUrl(url);
    } catch {
      setUploadedImageUrl(null);
      setFormError("تعذر رفع صورة السيارة.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleDeleteCar(car: DashboardCarRow) {
    setFormMessage(null);
    setFormError(null);

    if (!car.id) {
      setListWarning("الحذف متاح للسيارات المحفوظة في API فقط.");
      return;
    }

    if (!window.confirm(`هل تريد حذف ${car.name}؟`)) {
      return;
    }

    try {
      await deleteCar(car.id);
      await refreshCarsList();
      setFormMessage("تم حذف السيارة بنجاح.");
    } catch {
      setListWarning("تعذر حذف السيارة.");
    }
  }

  async function handleEditCar(car: DashboardCarRow) {
    setFormMessage(null);
    setFormError(null);
    setListWarning(null);
    setUploadedImageUrl(null);
    setGalleryMessage(null);
    setGalleryError(null);
    setManagedImages([]);

    if (!car.id) {
      setListWarning("التعديل متاح للسيارات المحفوظة في API فقط.");
      return;
    }

    try {
      const apiCar = await getCar(car.id);
      setSelectedCar(apiCar);
      setManagedImages(apiCar.images ?? await getCarImages(apiCar.id));
    } catch {
      setListWarning("تعذر تحميل بيانات السيارة للتعديل.");
    }
  }

  function handleCancelEdit() {
    setSelectedCar(null);
    setUploadedImageUrl(null);
    setManagedImages([]);
    setGalleryMessage(null);
    setGalleryError(null);
    setFormError(null);
    setFormMessage(null);
  }

  async function handleGalleryUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);

    if (!selectedCar?.id || files.length === 0) {
      return;
    }

    setGalleryMessage(null);
    setGalleryError(null);
    setIsUploadingGallery(true);

    try {
      for (const [index, file] of files.entries()) {
        const uploadedImage = await uploadCarImageAsset(file);
        await createCarImage(selectedCar.id, {
          alt: selectedCar.name ?? "صورة سيارة",
          isMain: managedImages.length === 0 && index === 0,
          sortOrder: managedImages.length + index,
          storagePublicId: uploadedImage.publicId,
          url: uploadedImage.url
        });
      }

      await refreshManagedGallery(selectedCar.id);
      await refreshCarsList();
      setGalleryMessage("تم رفع صور السيارة بنجاح.");
      event.currentTarget.value = "";
    } catch {
      setGalleryError("تعذر رفع صور السيارة.");
    } finally {
      setIsUploadingGallery(false);
    }
  }

  async function handleSetMainImage(image: BackendCarImage) {
    if (!selectedCar?.id) {
      return;
    }

    setGalleryMessage(null);
    setGalleryError(null);

    if (!window.confirm("هل تريد حذف هذه الصورة من معرض السيارة؟")) {
      return;
    }

    try {
      await setMainCarImage(selectedCar.id, image.id);
      await refreshManagedGallery(selectedCar.id);
      await refreshCarsList();
      setGalleryMessage("تم تعيين الصورة الرئيسية بنجاح.");
    } catch {
      setGalleryError("تعذر تعيين الصورة الرئيسية.");
    }
  }

  async function handleDeleteGalleryImage(image: BackendCarImage) {
    if (!selectedCar?.id) {
      return;
    }

    setGalleryMessage(null);
    setGalleryError(null);

    try {
      await deleteCarImage(selectedCar.id, image.id);
      await refreshManagedGallery(selectedCar.id);
      await refreshCarsList();
      setGalleryMessage("تم حذف الصورة بنجاح.");
    } catch {
      setGalleryError("تعذر حذف الصورة.");
    }
  }

  async function refreshManagedGallery(carId: string) {
    const gallery = await getCarImages(carId);
    setManagedImages(gallery);
    setSelectedCar((currentCar) => currentCar ? { ...currentCar, images: gallery } : currentCar);
  }

  return (
    <div>
      <DashboardPageHeader
        action={
          <a className="w-full sm:w-auto" href="#manage-car-form">
            <Button className="w-full sm:w-auto" variant="accent"><Plus className="h-5 w-5" strokeWidth={1.75} />إضافة سيارة</Button>
          </a>
        }
        subtitle="إدارة السيارات المرتبطة بمعرضك وحالة ظهورها في Falcon."
        title="إدارة السيارات"
      />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-4 md:p-6">
          {isLoading ? (
            <p className="mb-4 rounded-2xl border border-accent-500/20 bg-accent-500/10 px-4 py-3 text-sm font-semibold text-dark-900">
              جاري تحميل سيارات المعرض...
            </p>
          ) : null}
          {listWarning ? (
            <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              {listWarning}
            </p>
          ) : null}
          {!dealer && !isLoading ? (
            <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              لا يوجد معرض مرتبط بحسابك.
            </p>
          ) : null}
          {isFallback ? (
            <p className="mb-4 rounded-2xl border border-accent-500/20 bg-accent-500/10 px-4 py-3 text-sm font-semibold text-dark-900">
              يتم عرض بيانات تجريبية لأن قاعدة البيانات فارغة.
            </p>
          ) : null}
          <ResponsiveTable
            headers={["السيارة", "السنة", "السعر", "الحالة", "تاريخ الإضافة", "إجراءات"]}
            rows={cars.map((car) => [
              <span className="inline-flex items-center gap-3" key={car.name}>
                <span className="h-12 w-14 overflow-hidden rounded-2xl bg-section">
                  <ImageWithFallback alt={car.name} className="h-full w-full object-cover" src={car.imageSrc} />
                </span>
                <span>
                  <span className="block font-semibold">{car.name}</span>
                  <span className="text-xs text-slate-500">{car.model}</span>
                </span>
              </span>,
              car.year,
              car.price,
              <Badge key={car.status} tone={car.status === "نشط" ? "success" : "warning"}>{car.status}</Badge>,
              car.addedAt,
              <span className="inline-flex gap-2" key={`${car.name}-actions`}>
                <Button
                  className="min-h-11 rounded-2xl px-3 py-2"
                  onClick={() => void handleEditCar(car)}
                  variant="secondary"
                >
                  <Edit3 className="h-4 w-4" strokeWidth={1.75} />تعديل
                </Button>
                <Button className="min-h-11 rounded-2xl px-3 py-2" onClick={() => void handleDeleteCar(car)} variant="secondary"><Trash2 className="h-4 w-4" strokeWidth={1.75} />حذف</Button>
              </span>
            ])}
          />
        </Card>
        <Card className="p-6" id="manage-car-form">
          <h3 className="text-xl font-semibold text-dark-900">نموذج إضافة / تعديل سيارة</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            {selectedCar ? "تعديل بيانات السيارة المحددة وحفظها في API المحلي." : "يرسل النموذج السيارة إلى API المحلي عند توفر معرض."}
          </p>
          <form className="mt-6 grid gap-4" key={selectedCar?.id ?? "add-car"} onSubmit={handleCarSubmit}>
            <Input defaultValue={selectedCar?.name ?? ""} label="اسم السيارة" name="name" placeholder="Mercedes E300 AMG" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input defaultValue={selectedCar?.brand ?? ""} label="الماركة" name="brand" placeholder="Mercedes" required />
              <Input defaultValue={selectedCar?.model ?? ""} label="الموديل" name="model" placeholder="E300 AMG" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input defaultValue={selectedCar?.year ?? ""} label="السنة" min={1} name="year" placeholder="2025" required type="number" />
              <Input defaultValue={selectedCar?.price ?? ""} label="السعر" min={1} name="price" placeholder="375000" required step={1} type="number" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input defaultValue={selectedCar?.mileage ?? 0} label="الممشى" min={0} name="mileage" placeholder="12000" required step={1} type="number" />
              <Input defaultValue={selectedCar?.city ?? ""} label="المدينة" name="city" placeholder="الرياض" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input defaultValue={selectedCar?.transmission ?? ""} label="القير" name="transmission" placeholder="أوتوماتيك" required />
              <Input defaultValue={selectedCar?.fuel ?? ""} label="الوقود" name="fuel" placeholder="بنزين" required />
            </div>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-dark-900">صورة السيارة</span>
              <input
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                className="falcon-motion h-12 w-full rounded-2xl border border-border-subtle bg-white px-4 py-3 text-sm text-dark-900 outline-none file:ml-4 file:rounded-xl file:border-0 file:bg-section file:px-3 file:py-1 file:text-sm file:font-semibold file:text-dark-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                disabled={isUploadingImage || isSubmitting}
                onChange={handleImageUpload}
                type="file"
              />
            </label>
            {isUploadingImage ? (
              <p className="rounded-2xl border border-accent-500/20 bg-accent-500/10 px-4 py-3 text-sm font-semibold text-dark-900">
                جاري رفع صورة السيارة...
              </p>
            ) : null}
            {previewImageUrl ? (
              <div className="rounded-2xl border border-border-subtle bg-section p-3">
                <div className="aspect-[16/9] overflow-hidden rounded-xl bg-white">
                  <ImageWithFallback
                    alt="معاينة صورة السيارة"
                    className="h-full w-full object-cover"
                    src={previewImageUrl}
                  />
                </div>
                <p className="mt-3 break-all text-xs font-semibold text-slate-500">{previewImageUrl}</p>
              </div>
            ) : null}
            <Input defaultValue={selectedCar?.imageUrl ?? ""} label="رابط صورة السيارة" name="imageUrl" placeholder="/images/cars/car-01.webp" />
            {formMessage ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {formMessage}
              </p>
            ) : null}
            {formError ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                {formError}
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button disabled={!dealer} isLoading={isSubmitting} type="submit" variant="primary">
                {selectedCar ? "حفظ التعديلات" : "حفظ السيارة"}
              </Button>
              {selectedCar ? (
                <Button onClick={handleCancelEdit} type="button" variant="secondary">
                  إلغاء التعديل
                </Button>
              ) : null}
            </div>
          </form>
          <div className="mt-6 rounded-3xl border border-border-subtle bg-section p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-base font-semibold text-dark-900">معرض صور السيارة</h4>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  ارفع عدة صور، ثم اختر الصورة الرئيسية التي تظهر في البطاقات العامة.
                </p>
              </div>
              <Badge tone={managedImages.length > 0 ? "success" : "neutral"}>{managedImages.length} صورة</Badge>
            </div>
            {selectedCar?.id ? (
              <div className="mt-4 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-dark-900">إضافة صور متعددة</span>
                  <input
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="falcon-motion min-h-12 w-full rounded-2xl border border-border-subtle bg-white px-4 py-3 text-sm text-dark-900 outline-none file:ml-4 file:rounded-xl file:border-0 file:bg-section file:px-3 file:py-1 file:text-sm file:font-semibold file:text-dark-900 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    disabled={isUploadingGallery}
                    multiple
                    onChange={handleGalleryUpload}
                    type="file"
                  />
                </label>
                {isUploadingGallery ? (
                  <p className="rounded-2xl border border-accent-500/20 bg-accent-500/10 px-4 py-3 text-sm font-semibold text-dark-900">
                    جاري رفع صور السيارة...
                  </p>
                ) : null}
                {galleryMessage ? (
                  <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    {galleryMessage}
                  </p>
                ) : null}
                {galleryError ? (
                  <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                    {galleryError}
                  </p>
                ) : null}
                {managedImages.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {managedImages.map((image) => (
                      <div className="rounded-2xl border border-border-subtle bg-white p-2" key={image.id}>
                        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-section">
                          <ImageWithFallback alt={image.alt ?? selectedCar.name ?? "صورة سيارة"} className="h-full w-full object-cover" src={image.url} />
                        </div>
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <Button
                            className="min-h-10 flex-1 rounded-2xl px-3 py-2"
                            disabled={image.isMain}
                            onClick={() => void handleSetMainImage(image)}
                            type="button"
                            variant={image.isMain ? "accent" : "secondary"}
                          >
                            <Star className="h-4 w-4" strokeWidth={1.75} />
                            {image.isMain ? "رئيسية" : "تعيين كرئيسية"}
                          </Button>
                          <Button
                            className="min-h-10 rounded-2xl px-3 py-2"
                            onClick={() => void handleDeleteGalleryImage(image)}
                            type="button"
                            variant="secondary"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                            حذف
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-white p-6 text-center">
                    <ImagePlus className="h-8 w-8 text-accent-500" strokeWidth={1.75} />
                    <p className="mt-3 text-sm font-semibold text-dark-900">لا توجد صور إضافية بعد.</p>
                    <p className="mt-1 text-xs leading-6 text-slate-500">تبقى صورة الرابط القديمة مستخدمة كخيار احتياطي.</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-border-subtle bg-white px-4 py-3 text-sm font-semibold text-slate-600">
                احفظ السيارة أولًا لتفعيل إدارة معرض الصور.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function mapBackendCarToDashboardRow(car: BackendCar, index: number): DashboardCarRow {
  const brand = car.brand ?? "Falcon";
  const model = car.model ?? "Vehicle";

  return {
    addedAt: new Date().toISOString().slice(0, 10),
    id: car.id,
    imageSrc: getBackendCarImageSrc(car, index),
    model,
    name: car.name ?? `${brand} ${model}`.trim(),
    price: `${new Intl.NumberFormat("ar-SA").format(car.price ?? 0)} ريال`,
    status: "نشط",
    year: String(car.year ?? new Date().getFullYear())
  };
}

function getTextField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getPositiveInteger(formData: FormData, key: string, allowZero = false) {
  const rawValue = getTextField(formData, key);
  const value = Number(rawValue);

  if (!Number.isInteger(value)) {
    return null;
  }

  if (allowZero ? value < 0 : value <= 0) {
    return null;
  }

  return value;
}
