import {
  Banknote,
  CalendarDays,
  Car,
  ChevronDown,
  CircleDollarSign,
  Fuel,
  Gauge,
  MessageCircle,
  Palette,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SavedCarActions } from "@/components/cars/SavedCarActions";
import { Seo } from "@/components/seo/Seo";
import { ASSETS } from "@/config/assets";
import {
  Badge,
  Button,
  Card,
  CarImageCard,
  Chip,
  ImageWithFallback,
  SectionContainer
} from "@/design-system/primitives";
import { getCar, type BackendCar } from "@/services/carsApi";
import { createFinanceRequest } from "@/services/financeRequestsApi";
import { createLead } from "@/services/leadsApi";
import { marketplaceCars } from "./marketplaceData";
import { PublicMarketplaceLayout } from "./PublicMarketplaceLayout";

type VehicleDetails = {
  badge: "وسيط فالكون" | "معرض موثق";
  carId?: string;
  city: string;
  dealerId?: string;
  dealerPhone?: string | null;
  description: string;
  falconScore: string;
  gallery: readonly string[];
  name: string;
  price: string;
  specs: readonly [string, string, typeof Car][];
};

const fallbackVehicle: VehicleDetails = {
  badge: "وسيط فالكون",
  city: "الرياض",
  description:
    "هذه السيارة تجمع بين الفخامة والأداء اليومي الهادئ، مع تجهيزات متقدمة وتجربة قيادة مريحة. عبر Falcon تحصل على تجربة أوضح تشمل دعم العملاء، خيارات تمويل ميسرة، ومساعدة في التواصل مع الجهة المالكة للسيارة.",
  falconScore: "9.2",
  gallery: ASSETS.cars,
  name: "مرسيدس E300 AMG 2025",
  price: "٣٧٥٬٠٠٠ ريال",
  specs: [
    ["الماركة", "مرسيدس", Car],
    ["الموديل", "E300 AMG", Sparkles],
    ["سنة الصنع", "2025", CalendarDays],
    ["الممشى", "١٢٬٥٠٠ كم", Gauge],
    ["القير", "أوتوماتيك", Wrench],
    ["الوقود", "بنزين", Fuel],
    ["اللون الخارجي / الداخلي", "أسود / بيج", Palette],
    ["عدد الأبواب", "٤ أبواب", Car],
    ["حالة السيارة", "مستعملة ممتازة", ShieldCheck]
  ]
} as const;

const featureSections = [
  {
    icon: Wrench,
    items: ["محرك تيربو ٢.٠ لتر", "قوة ٢٥٥ حصان", "عزم ٣٧٠ نيوتن متر", "ناقل حركة أوتوماتيك ٩ سرعات"],
    title: "المواصفات الفنية"
  },
  {
    icon: Sparkles,
    items: ["نظام ملاحة", "شاشة لمس عالية الدقة", "مكيف هواء متعدد المناطق", "مقاعد جلد فاخرة"],
    title: "وسائل الراحة والتجهيزات"
  },
  {
    icon: ShieldCheck,
    items: ["وسائد هوائية متعددة", "نظام ABS", "مساعد البقاء في المسار", "تنبيه النقطة العمياء"],
    title: "الأمان"
  }
] as const;

const financeDetails = [
  ["الدفعة الأولى", "٧٥٬٠٠٠ ريال"],
  ["مدة التمويل", "٦٠ شهر"],
  ["نسبة الفائدة", "٣.٩٪"],
  ["القسط الشهري المتوقع", "٥٬٨٩٠ ريال"]
] as const;

export function CarDetailsPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<VehicleDetails>(fallbackVehicle);
  const relatedCars = marketplaceCars.slice(1, 4);

  useEffect(() => {
    let isMounted = true;

    async function loadVehicle() {
      if (!id) {
        return;
      }

      try {
        const apiCar = await getCar(id);

        if (isMounted) {
          setVehicle(mapBackendCarToVehicleDetails(apiCar));
        }
      } catch {
        if (isMounted) {
          setVehicle(fallbackVehicle);
        }
      }
    }

    void loadVehicle();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <PublicMarketplaceLayout>
      <Seo
        canonical={`/cars/${id ?? vehicle.carId ?? ""}`}
        description={buildVehicleSeoDescription(vehicle)}
        image={vehicle.gallery[0] ?? ASSETS.cars[0]}
        structuredData={buildVehicleStructuredData(vehicle)}
        title={buildVehicleSeoTitle(vehicle)}
        type="product"
      />
      <SectionContainer className="pb-8 pt-8">
        <Breadcrumbs vehicle={vehicle} />
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <VehicleGallery vehicle={vehicle} />
          <PrimaryInfoPanel vehicle={vehicle} />
        </div>
      </SectionContainer>

      <SectionContainer className="bg-section">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <DescriptionCard vehicle={vehicle} />
          <FinanceCalculator vehicle={vehicle} />
        </div>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle
          subtitle="تفاصيل منظمة تساعدك على تقييم السيارة بسرعة ووضوح."
          title="المواصفات والتجهيزات"
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {featureSections.map((section) => (
            <FeatureAccordion key={section.title} section={section} />
          ))}
        </div>
      </SectionContainer>

      <SectionContainer className="bg-section">
        <SectionTitle
          subtitle="اختيارات قريبة من نفس الفئة والسعر."
          title="قد تهمك أيضًا"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {relatedCars.map((car) => (
            <CarImageCard
              badge={car.badge}
              city={car.city}
              imageAlt={car.name}
              imageSrc={car.imageSrc}
              key={car.name}
              name={`${car.name} ${car.year}`}
              price={car.price}
            />
          ))}
        </div>
      </SectionContainer>
    </PublicMarketplaceLayout>
  );
}

function Breadcrumbs({ vehicle }: { vehicle: VehicleDetails }) {
  return (
    <nav aria-label="مسار الصفحة" className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
      <Link className="transition hover:text-dark-900" to="/">الصفحة الرئيسية</Link>
      <span>/</span>
      <Link className="transition hover:text-dark-900" to="/cars">السيارات</Link>
      <span>/</span>
      <span className="text-dark-900">{vehicle.name}</span>
    </nav>
  );
}

function VehicleGallery({ vehicle }: { vehicle: VehicleDetails }) {
  const [selectedImage, setSelectedImage] = useState(vehicle.gallery[0] ?? ASSETS.cars[0]);

  useEffect(() => {
    setSelectedImage(vehicle.gallery[0] ?? ASSETS.cars[0]);
  }, [vehicle.gallery]);

  return (
    <Card className="overflow-hidden p-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-brand-lg bg-section sm:aspect-[16/10]">
        <ImageWithFallback
          alt={vehicle.name}
          className="h-full w-full object-cover"
          fallbackSrc={ASSETS.cars[1]}
          src={selectedImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/56 via-transparent to-transparent" />
        <div className="absolute right-5 top-5">
          <Badge tone="accent">{vehicle.badge}</Badge>
        </div>
        <div className="absolute bottom-4 left-4 rounded-3xl border border-white/15 bg-dark-900/72 px-4 py-3 text-white shadow-soft backdrop-blur-xl sm:bottom-5 sm:left-5 sm:px-5 sm:py-4">
          <p className="text-xs font-semibold text-white/62">Falcon Score</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-3xl font-semibold leading-none">{vehicle.falconScore}</span>
            <span className="pb-1 text-sm text-white/62">/ 10</span>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6">
        {vehicle.gallery.map((imageSrc, index) => (
          <button
            aria-label={`صورة السيارة ${index + 1}`}
            className={`aspect-[4/3] overflow-hidden rounded-2xl border bg-section transition hover:border-accent-500 ${
              selectedImage === imageSrc ? "border-accent-500 ring-2 ring-accent-500/20" : "border-border-subtle"
            }`}
            key={imageSrc}
            onClick={() => setSelectedImage(imageSrc)}
            type="button"
          >
            <ImageWithFallback
              alt={`${vehicle.name} ${index + 1}`}
              className="h-full w-full object-cover"
              src={imageSrc}
            />
          </button>
        ))}
      </div>
    </Card>
  );
}

function PrimaryInfoPanel({ vehicle }: { vehicle: VehicleDetails }) {
  const [leadMessage, setLeadMessage] = useState<string | null>(null);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLeadMessage(null);
    setLeadError(null);

    const formData = new FormData(form);
    const name = getFormText(formData, "leadName");
    const phone = getFormText(formData, "leadPhone");
    const email = getFormText(formData, "leadEmail");
    const message = getFormText(formData, "leadMessage");

    if (!name || !phone) {
      setLeadError("الاسم ورقم الهاتف حقول مطلوبة.");
      return;
    }

    setIsSubmittingLead(true);

    try {
      await createLead({
        carId: vehicle.carId,
        dealerId: vehicle.dealerId,
        email: email || undefined,
        message: message || undefined,
        name,
        phone,
        source: "CAR_DETAIL"
      });
      form.reset();
      setLeadMessage("تم إرسال طلب التواصل بنجاح.");
    } catch {
      setLeadError("تعذر إرسال طلب التواصل.");
    } finally {
      setIsSubmittingLead(false);
    }
  }

  return (
    <Card className="p-6 md:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Chip className="border-accent-500/20 bg-accent-500/10 text-dark-900">
          {vehicle.city}
        </Chip>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-500">
          <Star className="h-4 w-4" fill="currentColor" strokeWidth={1.75} />
          مميز
        </span>
      </div>
      <h1 className="mt-5 text-3xl font-semibold leading-tight text-dark-900 md:text-4xl">
        {vehicle.name}
      </h1>
      <p className="mt-4 text-3xl font-semibold text-dark-900 md:text-4xl">{vehicle.price}</p>
      <div className="mt-5">
        <SavedCarActions carId={vehicle.carId} />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {vehicle.specs.map(([label, value, Icon]) => (
          <div className="rounded-3xl border border-border-subtle bg-section p-4" key={label}>
            <Icon className="h-5 w-5 text-accent-500" strokeWidth={1.75} />
            <p className="mt-3 text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-dark-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-3">
        <a href="#finance-request">
          <Button className="h-14 w-full text-base" variant="accent">
            <Banknote className="h-5 w-5" strokeWidth={1.75} />
            طلب التمويل
          </Button>
        </a>
        <div className="grid gap-3 sm:grid-cols-2">
          {vehicle.dealerPhone ? (
            <a href={buildWhatsAppUrl(vehicle.dealerPhone, `مرحبًا، أريد الاستفسار عن ${vehicle.name}`)} rel="noreferrer" target="_blank">
              <Button className="h-14 w-full" variant="primary">
                <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
                تواصل عبر واتساب
              </Button>
            </a>
          ) : (
            <Button className="h-14 w-full" disabled title="رقم واتساب المعرض غير متاح. استخدم نموذج طلب التواصل." variant="primary">
              <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
              تواصل عبر واتساب
            </Button>
          )}
          {vehicle.dealerPhone ? (
            <a href={`tel:${normalizePhone(vehicle.dealerPhone)}`}>
              <Button className="h-14 w-full" variant="secondary">
                <Phone className="h-5 w-5" strokeWidth={1.75} />
                اتصل بالمعرض
              </Button>
            </a>
          ) : (
            <Button className="h-14 w-full" disabled title="رقم الاتصال غير متاح. استخدم نموذج طلب التواصل." variant="secondary">
              <Phone className="h-5 w-5" strokeWidth={1.75} />
              اتصل بالمعرض
            </Button>
          )}
        </div>
      </div>
      <form className="mt-6 grid gap-3 rounded-3xl border border-border-subtle bg-section p-4" onSubmit={handleLeadSubmit}>
        <h2 className="text-lg font-semibold text-dark-900">طلب تواصل</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="h-12 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-medium text-dark-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
            name="leadName"
            placeholder="الاسم"
            type="text"
          />
          <input
            className="h-12 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-medium text-dark-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
            name="leadPhone"
            placeholder="رقم الهاتف"
            type="tel"
          />
        </div>
        <input
          className="h-12 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-medium text-dark-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
          name="leadEmail"
          placeholder="البريد الإلكتروني (اختياري)"
          type="email"
        />
        <textarea
          className="min-h-24 resize-none rounded-2xl border border-border-subtle bg-white p-4 text-sm font-medium text-dark-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
          name="leadMessage"
          placeholder="رسالتك"
        />
        {leadMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {leadMessage}
          </p>
        ) : null}
        {leadError ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            {leadError}
          </p>
        ) : null}
        <Button className="h-12 w-full" isLoading={isSubmittingLead} type="submit" variant="primary">
          إرسال طلب التواصل
        </Button>
      </form>
    </Card>
  );
}

function DescriptionCard({ vehicle }: { vehicle: VehicleDetails }) {
  return (
    <Card className="p-7" id="finance-request">
      <SectionTitle
        subtitle="قيمة أوضح للشراء من خلال Falcon."
        title="وصف السيارة"
      />
      <p className="text-base leading-9 text-slate-600">{vehicle.description}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {["دعم Falcon", "تمويل ميسر", "تواصل موثوق"].map((item) => (
          <div className="rounded-3xl bg-accent-500/10 p-4 text-sm font-semibold text-dark-900" key={item}>
            {item}
          </div>
        ))}
      </div>
    </Card>
  );
}

function mapBackendCarToVehicleDetails(car: BackendCar): VehicleDetails {
  const brand = car.brand ?? "Falcon";
  const model = car.model ?? "Vehicle";
  const name = car.name ?? `${brand} ${model} ${car.year ?? ""}`.trim();
  const orderedGallery = [...(car.images ?? [])]
    .sort((first, second) => Number(second.isMain) - Number(first.isMain) || first.sortOrder - second.sortOrder)
    .map((image) => image.url);
  const imageSrc = orderedGallery[0] || car.imageUrl || ASSETS.cars[0];

  return {
    badge: car.dealerId ? "معرض موثق" : "وسيط فالكون",
    carId: car.id,
    city: car.city ?? "الرياض",
    dealerId: car.dealerId,
    dealerPhone: car.dealer?.phone ?? null,
    description:
      "هذه السيارة متاحة عبر Falcon من بيانات API المحلية، مع عرض واضح للسعر والمواصفات الأساسية وصورة السيارة عند توفرها.",
    falconScore: "9.2",
    gallery: orderedGallery.length > 0 ? orderedGallery : [imageSrc, ...ASSETS.cars.filter((src) => src !== imageSrc)].slice(0, 6),
    name,
    price: `${new Intl.NumberFormat("ar-SA").format(car.price ?? 0)} ريال`,
    specs: [
      ["الماركة", brand, Car],
      ["الموديل", model, Sparkles],
      ["سنة الصنع", String(car.year ?? "غير محدد"), CalendarDays],
      ["الممشى", `${new Intl.NumberFormat("ar-SA").format(car.mileage ?? 0)} كم`, Gauge],
      ["القير", car.transmission ?? "غير محدد", Wrench],
      ["الوقود", car.fuel ?? "غير محدد", Fuel],
      ["اللون الخارجي / الداخلي", "غير محدد", Palette],
      ["عدد الأبواب", "غير محدد", Car],
      ["حالة السيارة", "متاحة", ShieldCheck]
    ]
  };
}

function buildVehicleSeoTitle(vehicle: VehicleDetails) {
  return `${vehicle.name} ${getVehicleSpec(vehicle, "سنة الصنع")} - ${vehicle.price} | Falcon`;
}

function buildVehicleSeoDescription(vehicle: VehicleDetails) {
  const brand = getVehicleSpec(vehicle, "الماركة");
  const model = getVehicleSpec(vehicle, "الموديل");
  const mileage = getVehicleSpec(vehicle, "الممشى");
  return `${brand} ${model} في ${vehicle.city} بسعر ${vehicle.price}. الممشى ${mileage}. شاهد الصور والمواصفات واطلب التواصل أو التمويل عبر Falcon.`;
}

function buildVehicleStructuredData(vehicle: VehicleDetails) {
  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    "brand": {
      "@type": "Brand",
      "name": getVehicleSpec(vehicle, "الماركة")
    },
    "description": buildVehicleSeoDescription(vehicle),
    "image": vehicle.gallery,
    "mileageFromOdometer": getVehicleSpec(vehicle, "الممشى"),
    "model": getVehicleSpec(vehicle, "الموديل"),
    "name": vehicle.name,
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "price": vehicle.price,
      "priceCurrency": "SAR"
    },
    "vehicleModelDate": getVehicleSpec(vehicle, "سنة الصنع")
  };
}

function normalizePhone(phone: string) {
  const trimmed = phone.trim();
  return trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/[^\d]/g, "")}`;
}

function buildWhatsAppUrl(phone: string, message: string) {
  const digits = normalizePhone(phone).replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function getVehicleSpec(vehicle: VehicleDetails, label: string) {
  return vehicle.specs.find(([specLabel]) => specLabel === label)?.[1] ?? "غير محدد";
}

function getFormText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalPositiveInteger(formData: FormData, key: string) {
  const rawValue = getFormText(formData, key);

  if (!rawValue) {
    return undefined;
  }

  const value = Number(rawValue);
  return Number.isInteger(value) && value >= 0 ? value : undefined;
}

function FinanceCalculator({ vehicle }: { vehicle: VehicleDetails }) {
  const [financeMessage, setFinanceMessage] = useState<string | null>(null);
  const [financeError, setFinanceError] = useState<string | null>(null);
  const [isSubmittingFinance, setIsSubmittingFinance] = useState(false);

  async function handleFinanceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setFinanceMessage(null);
    setFinanceError(null);

    const formData = new FormData(form);
    const customerName = getFormText(formData, "customerName");
    const phone = getFormText(formData, "phone");
    const email = getFormText(formData, "email");
    const employmentType = getFormText(formData, "employmentType");
    const monthlyIncome = getOptionalPositiveInteger(formData, "monthlyIncome");
    const downPayment = getOptionalPositiveInteger(formData, "downPayment");
    const financingPeriod = getOptionalPositiveInteger(formData, "financingPeriod");

    if (!customerName || !phone) {
      setFinanceError("الاسم ورقم الهاتف حقول مطلوبة.");
      return;
    }

    setIsSubmittingFinance(true);

    try {
      await createFinanceRequest({
        carId: vehicle.carId,
        customerName,
        dealerId: vehicle.dealerId,
        downPayment,
        email: email || undefined,
        employmentType: employmentType || undefined,
        financingPeriod,
        monthlyIncome,
        phone
      });
      form.reset();
      setFinanceMessage("تم إرسال طلب التمويل بنجاح.");
    } catch {
      setFinanceError("تعذر إرسال طلب التمويل.");
    } finally {
      setIsSubmittingFinance(false);
    }
  }

  return (
    <Card className="p-7">
      <SectionTitle
        subtitle="أرقام تقريبية للعرض فقط، دون أي قرار ائتماني أو التزام."
        title="حاسبة التمويل"
      />
      <div className="grid gap-4">
        {financeDetails.map(([label, value]) => (
          <div className="flex flex-col gap-2 rounded-3xl border border-border-subtle bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between" key={label}>
            <span className="text-sm font-medium text-slate-500">{label}</span>
            <span className="text-base font-semibold text-dark-900">{value}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-brand-lg bg-dark-900 p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/62">القسط الشهري المتوقع</p>
            <p className="mt-2 text-3xl font-semibold">٥٬٨٩٠ ريال</p>
          </div>
          <CircleDollarSign className="h-10 w-10 text-accent-500" strokeWidth={1.75} />
        </div>
      </div>
      <form className="mt-6 grid gap-4 rounded-3xl border border-border-subtle bg-section p-4" onSubmit={handleFinanceSubmit}>
        <h3 className="text-lg font-semibold text-dark-900">طلب تمويل</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="h-12 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-medium text-dark-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
            name="customerName"
            placeholder="الاسم"
            type="text"
          />
          <input
            className="h-12 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-medium text-dark-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
            name="phone"
            placeholder="رقم الهاتف"
            type="tel"
          />
        </div>
        <input
          className="h-12 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-medium text-dark-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
          name="email"
          placeholder="البريد الإلكتروني (اختياري)"
          type="email"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            className="h-12 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-medium text-dark-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
            name="monthlyIncome"
            placeholder="الدخل الشهري"
            type="number"
          />
          <input
            className="h-12 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-medium text-dark-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
            name="downPayment"
            placeholder="الدفعة الأولى"
            type="number"
          />
          <input
            className="h-12 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-medium text-dark-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
            name="financingPeriod"
            placeholder="مدة التمويل بالشهور"
            type="number"
          />
        </div>
        <input
          className="h-12 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-medium text-dark-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
          name="employmentType"
          placeholder="نوع العمل (اختياري)"
          type="text"
        />
        {financeMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {financeMessage}
          </p>
        ) : null}
        {financeError ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
            {financeError}
          </p>
        ) : null}
        <Button className="h-12 w-full" isLoading={isSubmittingFinance} type="submit" variant="accent">
          إرسال طلب التمويل
        </Button>
      </form>
    </Card>
  );
}

function FeatureAccordion({
  section
}: {
  section: (typeof featureSections)[number];
}) {
  const Icon = section.icon;

  return (
    <details className="group rounded-brand-lg border border-border-subtle bg-white p-5 shadow-subtle" open>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <span className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-500">
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span className="text-lg font-semibold text-dark-900">{section.title}</span>
        </span>
        <ChevronDown className="h-5 w-5 text-slate-400 transition group-open:rotate-180" strokeWidth={1.75} />
      </summary>
      <div className="mt-5 grid gap-3">
        {section.items.map((item) => (
          <div className="rounded-2xl bg-section px-4 py-3 text-sm font-medium text-slate-600" key={item}>
            {item}
          </div>
        ))}
      </div>
    </details>
  );
}

function SectionTitle({
  subtitle,
  title
}: {
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-dark-900 md:text-3xl">{title}</h2>
      {subtitle ? (
        <p className="mt-2 text-sm leading-7 text-slate-500">{subtitle}</p>
      ) : null}
    </div>
  );
}
