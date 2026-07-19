import {
  Clock,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import { mapBackendCarToMarketplaceCar } from "@/services/carsApi";
import { getDealer, type BackendDealerDetails } from "@/services/dealersApi";
import { createLead } from "@/services/leadsApi";
import { marketplaceCars } from "./marketplaceData";
import type { MarketplaceCar } from "./marketplaceData";
import { PublicMarketplaceLayout } from "./PublicMarketplaceLayout";

type DealerDetails = {
  address: string;
  carsCount: string;
  city: string;
  coverImage: string;
  description: string;
  email: string;
  established: string;
  id?: string;
  name: string;
  phone: string;
  rating: string;
  tagline: string;
  verified: boolean;
  whatsapp: string;
};

const fallbackDealer: DealerDetails = {
  address: "طريق الملك فهد، حي الياسمين، الرياض",
  carsCount: "١٢٨ سيارة",
  city: "الرياض، السعودية",
  coverImage: ASSETS.dealers[0],
  description:
    "معرض الخليج للسيارات هو أحد المعارض المتخصصة في السيارات الفاخرة والجديدة والمستعملة المختارة بعناية. تأسس المعرض لخدمة العملاء الباحثين عن تجربة شراء واضحة، موثوقة، ومدعومة بفريق يعرف تفاصيل سوق السيارات المحلي.",
  email: "care@gulf-motors.sa",
  established: "منذ 2004",
  name: "معرض الخليج للسيارات",
  phone: "+966 11 245 8890",
  rating: "4.7",
  tagline: "خبرة 20 عامًا في بيع السيارات الفاخرة",
  verified: true,
  whatsapp: "+966 55 245 8890"
} as const;

const workingHours = [
  ["الأحد - الخميس", "٩:٠٠ صباحًا - ١٠:٠٠ مساءً"],
  ["الجمعة", "٤:٠٠ مساءً - ١٠:٠٠ مساءً"],
  ["السبت", "١٠:٠٠ صباحًا - ١١:٠٠ مساءً"]
] as const;

const socialLinks = [
  ["إنستغرام", Instagram],
  ["سناب", Sparkles],
  ["واتساب", MessageCircle]
] as const;

export function DealerDetailsPage() {
  const { id } = useParams();
  const [dealer, setDealer] = useState<DealerDetails>(fallbackDealer);
  const [inventory, setInventory] = useState<MarketplaceCar[]>(marketplaceCars.slice(0, 6));

  useEffect(() => {
    let isMounted = true;

    async function loadDealer() {
      if (!id) {
        return;
      }

      try {
        const apiDealer = await getDealer(id);

        if (isMounted) {
          setDealer(mapBackendDealerToDetails(apiDealer));
          setInventory(
            apiDealer.cars && apiDealer.cars.length > 0
              ? apiDealer.cars.map(mapBackendCarToMarketplaceCar)
              : marketplaceCars.slice(0, 6)
          );
        }
      } catch {
        if (isMounted) {
          setDealer(fallbackDealer);
          setInventory(marketplaceCars.slice(0, 6));
        }
      }
    }

    void loadDealer();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <PublicMarketplaceLayout>
      <Seo
        canonical={`/dealers/${id ?? dealer.id ?? ""}`}
        description={`${dealer.verified ? "معرض موثق" : "معرض"} في ${dealer.city} على Falcon. ${dealer.carsCount}، تقييم ${dealer.rating} من 5، وتواصل مباشر مع المعرض.`}
        image={dealer.coverImage}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AutoDealer",
          "address": dealer.address,
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": dealer.rating
          },
          "description": dealer.description,
          "email": dealer.email,
          "image": dealer.coverImage,
          "name": dealer.name,
          "telephone": dealer.phone,
          "url": `/dealers/${id ?? dealer.id ?? ""}`
        }}
        title={`${dealer.name} - ${dealer.city} | Falcon`}
        type="profile"
      />
      <SectionContainer className="pb-8 pt-8">
        <Breadcrumbs dealer={dealer} />
        <DealerHero dealer={dealer} />
      </SectionContainer>

      <SectionContainer className="bg-section">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <AboutDealer dealer={dealer} />
          <DealerContactPanel dealer={dealer} />
        </div>
      </SectionContainer>

      <SectionContainer>
        <SectionHeading
          subtitle="تصفح السيارات المتاحة لدى هذا المعرض."
          title="سيارات المعرض"
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {inventory.map((car) => (
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

      <SectionContainer className="bg-section">
        <ContactDealer dealer={dealer} />
      </SectionContainer>
    </PublicMarketplaceLayout>
  );
}

function Breadcrumbs({ dealer }: { dealer: DealerDetails }) {
  return (
    <nav aria-label="مسار الصفحة" className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
      <Link className="transition hover:text-dark-900" to="/">الصفحة الرئيسية</Link>
      <span>/</span>
      <Link className="transition hover:text-dark-900" to="/dealers">المعارض</Link>
      <span>/</span>
      <span className="text-dark-900">{dealer.name}</span>
    </nav>
  );
}

function DealerHero({ dealer }: { dealer: DealerDetails }) {
  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] border border-border-subtle bg-white shadow-soft">
      <div className="relative min-h-[420px] overflow-hidden bg-section sm:min-h-[360px] md:min-h-[460px]">
        <ImageWithFallback
          alt={dealer.name}
          className="absolute inset-0 h-full w-full object-cover"
          fallbackSrc={ASSETS.dealers[1]}
          src={dealer.coverImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/82 via-dark-900/22 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-8">
          <div className="max-w-4xl text-white">
            <div className="flex flex-wrap items-center gap-3">
              {dealer.verified ? (
                <Badge tone="accent">
                  <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                  معرض موثق
                </Badge>
              ) : null}
              <Chip className="border-white/12 bg-white/12 text-white">
                {dealer.established}
              </Chip>
            </div>
            <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl md:text-6xl">
              {dealer.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/76">
              {dealer.tagline}
            </p>
            <div className="mt-6 flex flex-col items-start gap-3 text-sm font-semibold text-white/80 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent-500" strokeWidth={1.75} />
                {dealer.city}
              </span>
              <span className="inline-flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400" fill="currentColor" strokeWidth={1.75} />
                {dealer.rating} من 5
              </span>
              <span>{dealer.carsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutDealer({ dealer }: { dealer: DealerDetails }) {
  return (
    <Card className="p-7">
      <SectionHeading
        subtitle="نبذة تساعد العميل على فهم تخصص المعرض وثقته."
        title="عن المعرض"
      />
      <p className="text-base leading-9 text-slate-600">{dealer.description}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {["سيارات فاخرة", "جديد ومستعمل", "فحص موثوق"].map((item) => (
          <div className="rounded-3xl bg-accent-500/10 p-4 text-sm font-semibold text-dark-900" key={item}>
            {item}
          </div>
        ))}
      </div>
    </Card>
  );
}

function DealerContactPanel({ dealer }: { dealer: DealerDetails }) {
  return (
    <Card className="p-7">
      <SectionHeading title="بيانات الاتصال" />
      <div className="grid gap-3">
        <ContactRow href={`tel:${normalizePhone(dealer.phone)}`} icon={Phone} label="الهاتف" value={dealer.phone} />
        <ContactRow icon={Mail} label="البريد الإلكتروني" value={dealer.email} />
        <ContactRow href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealer.address)}`} icon={MapPin} label="العنوان" value={dealer.address} />
      </div>

      <div className="mt-7">
        <h3 className="text-lg font-semibold text-dark-900">وسائل التواصل</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {socialLinks.map(([label, Icon]) => (
            <a
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-semibold text-dark-900 transition hover:border-accent-500"
              href={label === "واتساب" ? buildWhatsAppUrl(dealer.whatsapp, `مرحبًا، أريد التواصل مع ${dealer.name}`) : "#contact-form"}
              key={label}
              rel={label === "واتساب" ? "noreferrer" : undefined}
              target={label === "واتساب" ? "_blank" : undefined}
            >
              <Icon className="h-4 w-4 text-accent-500" strokeWidth={1.75} />
              {label}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-7">
        <h3 className="text-lg font-semibold text-dark-900">ساعات العمل</h3>
        <div className="mt-4 grid gap-3">
          {workingHours.map(([day, hours]) => (
            <div className="flex flex-col gap-2 rounded-3xl bg-section px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4" key={day}>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-dark-900">
                <Clock className="h-4 w-4 text-accent-500" strokeWidth={1.75} />
                {day}
              </span>
              <span className="text-sm font-medium text-slate-500">{hours}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function mapBackendDealerToDetails(dealer: BackendDealerDetails): DealerDetails {
  const carsCount =
    dealer._count?.cars ?? (Array.isArray(dealer.cars) ? dealer.cars.length : 0);

  return {
    address: dealer.city ?? "الرياض",
    carsCount: `${new Intl.NumberFormat("ar-SA").format(carsCount)} سيارة`,
    city: `${dealer.city ?? "الرياض"}، السعودية`,
    coverImage: ASSETS.dealers[0],
    description:
      "هذا المعرض متصل ببيانات API المحلية في Falcon، ويمكن عرض سياراته المتاحة مباشرة من قاعدة البيانات.",
    email: "care@falcon.sa",
    established: "معرض محلي",
    id: dealer.id,
    name: dealer.name ?? "معرض Falcon",
    phone: dealer.phone ?? "+966 55 000 0000",
    rating: "4.8",
    tagline: dealer.isVerified ? "معرض موثق على Falcon" : "معرض على منصة Falcon",
    verified: Boolean(dealer.isVerified),
    whatsapp: dealer.phone ?? "+966 55 000 0000"
  };
}

function ContactRow({
  href,
  icon: Icon,
  label,
  value
}: {
  href?: string;
  icon: typeof Phone;
  label: string;
  value: string;
}) {
  const content = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-500">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-semibold text-dark-900">{value}</p>
      </div>
    </>
  );

  return href ? (
    <a className="flex items-start gap-3 rounded-3xl border border-border-subtle bg-white p-4 transition hover:border-accent-500/50" href={href} rel={href.startsWith("http") ? "noreferrer" : undefined} target={href.startsWith("http") ? "_blank" : undefined}>
      {content}
    </a>
  ) : (
    <div className="flex items-start gap-3 rounded-3xl border border-border-subtle bg-white p-4">
      {content}
    </div>
  );
}

function ContactDealer({ dealer }: { dealer: DealerDetails }) {
  const [leadMessage, setLeadMessage] = useState<string | null>(null);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setLeadMessage(null);
    setLeadError(null);

    const formData = new FormData(form);
    const name = getFormText(formData, "name");
    const phone = getFormText(formData, "phone");
    const email = getFormText(formData, "email");
    const message = getFormText(formData, "message");

    if (!name || !phone) {
      setLeadError("الاسم ورقم الهاتف حقول مطلوبة.");
      return;
    }

    setIsSubmittingLead(true);

    try {
      await createLead({
        dealerId: dealer.id,
        email: email || undefined,
        message: message || undefined,
        name,
        phone,
        source: "DEALER_PAGE"
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
    <Card className="overflow-hidden p-0">
      <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-dark-900 p-7 text-white md:p-9">
          <Badge tone="accent">تواصل مباشر</Badge>
          <h2 className="mt-5 text-3xl font-semibold leading-tight md:text-4xl">
            هل تريد معرفة المزيد عن سيارات المعرض؟
          </h2>
          <p className="mt-4 text-base leading-8 text-white/68">
            أرسل بياناتك وسيقوم فريق المعرض أو Falcon بمساعدتك في الخطوة التالية.
          </p>
          <a href={buildWhatsAppUrl(dealer.whatsapp, `مرحبًا، أريد التواصل مع ${dealer.name}`)} rel="noreferrer" target="_blank">
            <Button className="mt-7 w-full sm:w-auto" variant="accent">
              <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
              تواصل مع المعرض عبر واتساب
            </Button>
          </a>
        </div>
        <form className="grid gap-4 p-7 md:p-9" id="contact-form" onSubmit={handleLeadSubmit}>
          {[
            ["الاسم", "name", "text"],
            ["رقم الهاتف", "phone", "tel"],
            ["البريد الإلكتروني", "email", "email"]
          ].map(([field, name, type]) => (
            <label className="grid gap-2" key={field}>
              <span className="text-sm font-semibold text-slate-600">{field}</span>
              <input
                className="h-12 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-medium text-dark-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                name={name}
                placeholder={field}
                type={type}
              />
            </label>
          ))}
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-600">الرسالة</span>
            <textarea
              className="min-h-32 resize-none rounded-2xl border border-border-subtle bg-white p-4 text-sm font-medium text-dark-900 outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
              name="message"
              placeholder="اكتب رسالتك هنا"
            />
          </label>
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
          <Button className="h-14 w-full" isLoading={isSubmittingLead} type="submit" variant="primary">
            إرسال الطلب
          </Button>
        </form>
      </div>
    </Card>
  );
}

function getFormText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhone(phone: string) {
  const trimmed = phone.trim();
  return trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/[^\d]/g, "")}`;
}

function buildWhatsAppUrl(phone: string, message: string) {
  const digits = normalizePhone(phone).replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function SectionHeading({
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
