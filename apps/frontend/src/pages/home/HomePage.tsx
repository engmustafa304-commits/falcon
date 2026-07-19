import {
  ArrowUpLeft,
  BarChart3,
  Building2,
  Calculator,
  Car,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FilePenLine,
  MapPin,
  MessageCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  Star,
  Store,
  TrendingDown,
  TrendingUp,
  Users
} from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants
} from "framer-motion";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeroCarComplete, HeroCarExploded } from "@/assets/hero";
import { InteractiveHeroCar } from "@/components/hero/InteractiveHeroCar";
import { MobileNav } from "@/components/navigation/MobileNav";
import { Seo } from "@/components/seo/Seo";
import { ASSETS } from "@/config/assets";
import { Logo } from "@/design-system/brand";
import {
  Badge,
  Button,
  Card,
  CarImageCard,
  Chip,
  ImageWithFallback,
  SectionContainer
} from "@/design-system/primitives";
import { getCars, mapBackendCarToHomeCar } from "@/services/carsApi";
import { getDealers, mapBackendDealerToFrontendDealer } from "@/services/dealersApi";
import type { FrontendDealer } from "@/services/dealersApi";
import { cn } from "@/utils/cn";
import {
  brands,
  categories,
  dashboardPreviews,
  dealerCars,
  dealers,
  falconDirectCars,
  financedCars,
  latestCars,
  mostViewedCars,
  newCars,
  priceDropCars,
  specialOfferCars,
  usedCars,
  type HomeCar
} from "./homeData";

const navItems = [
  ["الرئيسية", "/"],
  ["السيارات", "/cars"],
  ["المعارض", "/dealers"],
  ["العلامات", "/brands"],
  ["الفئات", "/categories"],
  ["المفضلة", "/favorites"],
  ["المقارنة", "/compare"]
] as const;

export function HomePage() {
  const [apiCars, setApiCars] = useState<HomeCar[]>([]);
  const [apiDealers, setApiDealers] = useState<FrontendDealer[]>([]);
  const [carsFallbackReason, setCarsFallbackReason] = useState<"empty" | "error" | null>(null);
  const [dealersFallbackReason, setDealersFallbackReason] = useState<"empty" | "error" | null>(null);
  const [isMarketplaceLoading, setIsMarketplaceLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadMarketplacePreview() {
      try {
        const [carsResponse, dealersResponse] = await Promise.allSettled([getCars(), getDealers()]);

        if (!isMounted) {
          return;
        }

        if (carsResponse.status === "fulfilled") {
          if (carsResponse.value.length > 0) {
            setApiCars(carsResponse.value.map(mapBackendCarToHomeCar));
            setCarsFallbackReason(null);
          } else {
            setApiCars([]);
            setCarsFallbackReason("empty");
          }
        } else {
          setApiCars([]);
          setCarsFallbackReason("error");
        }

        if (dealersResponse.status === "fulfilled") {
          if (dealersResponse.value.length > 0) {
            setApiDealers(dealersResponse.value.map(mapBackendDealerToFrontendDealer));
            setDealersFallbackReason(null);
          } else {
            setApiDealers([]);
            setDealersFallbackReason("empty");
          }
        } else {
          setApiDealers([]);
          setDealersFallbackReason("error");
        }
      } finally {
        if (isMounted) {
          setIsMarketplaceLoading(false);
        }
      }
    }

    void loadMarketplacePreview();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-dark-900">
      <Seo
        canonical="/"
        description="Falcon منصة عربية أولى للبحث عن السيارات الجديدة والمستعملة، مقارنة الأسعار، التواصل مع المعارض المعتمدة، وطلبات التمويل."
        image="/images/hero/hero-background.webp"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "inLanguage": "ar-SA",
          "name": "Falcon",
          "potentialAction": {
            "@type": "SearchAction",
            "query-input": "required name=search_term_string",
            "target": "/cars?q={search_term_string}"
          },
          "url": "/"
        }}
        title="Falcon - منصة السيارات والمعارض"
        type="website"
      />
      <Navbar />
      <main>
        <HeroSection />
        <SearchSection />
        <StatsSection />
        <IntentSection />
        <FeaturedCarsSection
          apiCars={apiCars}
          fallbackReason={carsFallbackReason}
          isLoading={isMarketplaceLoading}
        />
        <DealersSection
          apiDealers={apiDealers}
          fallbackReason={dealersFallbackReason}
          isLoading={isMarketplaceLoading}
        />
        <BrandsSection />
        <CategoriesSection />
        <FalconScoreSection />
        <BenefitsSection />
        <DealerCtaSection />
        <DashboardPreviewSection />
        <AiSection />
        <LatestVehiclesSection apiCars={apiCars} fallbackReason={carsFallbackReason} />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-sticky border-b border-border-subtle bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Logo language="ar" />
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
          {navItems.map(([label, path]) => (
            <Link className="falcon-motion hover:text-dark-900" key={path} to={path}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            className="hidden h-11 items-center gap-2 rounded-2xl bg-section px-4 text-sm font-semibold text-dark-900 disabled:cursor-not-allowed disabled:opacity-70 md:inline-flex"
            disabled
            title="اختيار المدينة سيتم ربطه بفلاتر البحث لاحقًا."
            type="button"
          >
            <MapPin className="h-4 w-4" strokeWidth={1.75} />
            المدينة
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <Link
            aria-label="بحث"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border-subtle bg-white text-dark-900 shadow-subtle"
            to="/cars"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <Link className="hidden md:inline-flex" to="/login">
            <Button variant="ghost">تسجيل الدخول</Button>
          </Link>
          <Link className="hidden md:inline-flex" to="/register">
            <Button variant="primary">تسجيل حساب</Button>
          </Link>
          <MobileNav navItems={navItems} />
        </div>
      </div>
    </header>
  );
}

const heroStagger: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.15, staggerChildren: 0.11 }
  }
};

const heroItem: Variants = {
  hidden: { filter: "blur(10px)", opacity: 0, y: 26 },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] }
  }
};

const heroItemReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const springSpotlightX = useSpring(spotlightX, { damping: 24, mass: 0.6, stiffness: 40 });
  const springSpotlightY = useSpring(spotlightY, { damping: 24, mass: 0.6, stiffness: 40 });
  const spotlightTranslateX = useTransform(springSpotlightX, [-1, 1], [-160, 160]);
  const spotlightTranslateY = useTransform(springSpotlightY, [-1, 1], [-120, 120]);

  const { scrollYProgress } = useScroll({ offset: ["start start", "end start"], target: sectionRef });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55, 1], [1, 1, 0]);
  const contentShift = useTransform(scrollYProgress, [0, 1], [0, 36]);

  const handleHeroPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (prefersReducedMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    spotlightX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    spotlightY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const handleHeroPointerLeave = () => {
    spotlightX.set(0);
    spotlightY.set(0);
  };

  const itemVariants = prefersReducedMotion ? heroItemReduced : heroItem;

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden bg-dark-900 lg:h-screen"
      onPointerLeave={handleHeroPointerLeave}
      onPointerMove={handleHeroPointerMove}
      ref={sectionRef}
    >
      <InteractiveHeroCar completeImage={HeroCarComplete} explodedImage={HeroCarExploded} />

      {/* Readability overlays — decorative only, must not block pointer events reaching the car. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-900/95 via-dark-900/10 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-dark-900/35 lg:to-dark-900/92" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-dark-900 via-dark-900/45 to-transparent" />
      <div className="pointer-events-none absolute -left-32 top-1/4 hidden h-[36rem] w-[36rem] rounded-full bg-accent-500/20 blur-[140px] lg:block" />

      {/* Cursor-driven ambient light — a second, independent glow layer that softly follows the pointer. */}
      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
        <motion.div
          aria-hidden="true"
          className="h-[42rem] w-[42rem] rounded-full bg-accent-500/10 blur-[150px]"
          style={{ willChange: "transform", x: spotlightTranslateX, y: spotlightTranslateY }}
        />
      </div>

      <div className="absolute left-5 top-5 z-20 hidden items-center gap-2 rounded-full border border-white/18 bg-[rgba(15,23,42,0.72)] p-1 text-white shadow-soft backdrop-blur-xl lg:flex">
        <button
          aria-label="السيارة السابقة"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/76 transition hover:bg-white/10 hover:text-white"
          type="button"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <span className="px-2 text-sm font-semibold" dir="ltr">1 / 12</span>
        <button
          aria-label="السيارة التالية"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/76 transition hover:bg-white/10 hover:text-white"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      {/*
        pointer-events-none here: this flex container spans the full hero
        width (needed for lg:justify-start to push content left), but only
        the text block inside is actually visible — without this, the empty
        space would swallow pointer events meant for InteractiveHeroCar's
        own hover-driven crossfade underneath.
      */}
      <div className="pointer-events-none relative z-10 flex min-h-[100svh] flex-col justify-center gap-10 px-5 pb-14 pt-28 sm:px-8 lg:h-screen lg:flex-row lg:items-end lg:justify-start lg:px-10 lg:pb-24 lg:pt-0">
        <motion.div
          className="pointer-events-auto w-full text-center lg:w-[48%] lg:text-right"
          style={
            prefersReducedMotion
              ? undefined
              : { opacity: contentOpacity, willChange: "transform, opacity", y: contentShift }
          }
        >
          <motion.div
            animate="visible"
            initial="hidden"
            variants={heroStagger}
          >
            <motion.div variants={itemVariants}>
              <Badge
                className="border border-white/15 bg-dark-900/60 text-accent-500 shadow-soft backdrop-blur-md"
                tone="accent"
              >
                Falcon Direct • وسيط فالكون
              </Badge>
            </motion.div>
            <div className="mt-6 space-y-5">
              <motion.h1
                className="text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1] xl:text-[4rem]"
                variants={itemVariants}
              >
                السيارات التي تبحث عنها...
                <span className="block text-accent-500">كلها في مكان واحد</span>
              </motion.h1>
              <motion.p
                className="mx-auto max-w-xl text-base leading-[1.9] text-white/75 sm:text-lg lg:mx-0 lg:text-xl lg:leading-[1.8]"
                variants={itemVariants}
              >
                ابحث بين آلاف السيارات الجديدة والمستعملة، وقارن الأسعار، وتواصل
                مباشرة مع المعارض المعتمدة أو مع فريق Falcon للحصول على أفضل عرض.
              </motion.p>
            </div>
            <motion.div
              className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:justify-center lg:justify-start"
              variants={itemVariants}
            >
              <motion.div
                className="w-full sm:w-auto"
                whileHover={prefersReducedMotion ? undefined : { y: -3 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              >
                <Link className="w-full sm:w-auto" to="/cars">
                  <Button className="w-full sm:w-auto" variant="accent">تصفح السيارات</Button>
                </Link>
              </motion.div>
              <motion.div
                className="w-full sm:w-auto"
                whileHover={prefersReducedMotion ? undefined : { y: -3 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              >
                <Link className="w-full sm:w-auto" to="/dealers">
                  <Button className="w-full sm:w-auto" variant="secondary">عرض المعارض</Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {!prefersReducedMotion ? (
        <motion.div
          animate={{ y: [0, 8, 0] }}
          className="pointer-events-none absolute inset-x-0 bottom-6 z-20 hidden flex-col items-center gap-2 text-white/45 lg:flex"
          transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.32em]">Scroll</span>
          <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
        </motion.div>
      ) : null}
    </section>
  );
}

function SearchSection() {
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const searchParams = new URLSearchParams();
    const fieldMap = {
      brand: "brand",
      model: "model",
      priceMax: "priceMax",
      q: "q",
      status: "status",
      yearMin: "yearMin"
    } as const;

    for (const [fieldName, queryName] of Object.entries(fieldMap)) {
      const value = formData.get(fieldName);

      if (typeof value === "string" && value.trim()) {
        searchParams.set(queryName, value.trim());
      }
    }

    searchParams.set("page", "1");
    navigate(`/cars?${searchParams.toString()}`);
  }

  return (
    <SectionContainer className="pt-0">
      <Card className="p-4 md:p-5">
        <form className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_repeat(5,minmax(0,0.72fr))_auto]" onSubmit={handleSubmit}>
          <label className="flex h-12 items-center gap-3 rounded-2xl border border-border-subtle bg-section px-4 sm:col-span-2 xl:col-span-1">
            <Search className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-dark-900 outline-none placeholder:text-slate-400"
              name="q"
              placeholder="ابحث عن سيارة، معرض، أو موديل"
              type="search"
            />
          </label>
          <HomeSearchInput name="brand" placeholder="الماركة" />
          <HomeSearchInput name="model" placeholder="الموديل" />
          <HomeSearchInput name="yearMin" placeholder="السنة" type="number" />
          <HomeSearchInput name="priceMax" placeholder="السعر" type="number" />
          <label className="flex h-12 w-full items-center justify-between rounded-2xl border border-border-subtle bg-white px-4 text-sm font-semibold text-slate-600">
            <select className="min-w-0 flex-1 bg-transparent outline-none" name="status">
              <option value="">نوع البيع</option>
              <option value="ACTIVE">نشط</option>
              <option value="SOLD">مباع</option>
            </select>
            <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
          </label>
          <Button className="w-full sm:col-span-2 xl:col-span-1" type="submit" variant="accent">
            بحث
          </Button>
        </form>
      </Card>
    </SectionContainer>
  );
}

function HomeSearchInput({
  name,
  placeholder,
  type = "text"
}: {
  name: string;
  placeholder: string;
  type?: "number" | "text";
}) {
  return (
    <label className="flex h-12 w-full items-center rounded-2xl border border-border-subtle bg-white px-4">
      <input
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-dark-900 outline-none placeholder:text-slate-400"
        min={type === "number" ? 0 : undefined}
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </label>
  );
}

function StatsSection() {
  const stats = [
    ["25,000+", "سيارة"],
    ["1,200+", "معرض معتمد"],
    ["50+", "مدينة"],
    ["98%", "رضا العملاء"]
  ] as const;

  return (
    <SectionContainer className="py-8">
      <div className="grid gap-3 md:grid-cols-4">
        {stats.map(([value, label]) => (
          <Card className="p-6 text-center" key={label}>
            <p className="text-4xl font-semibold text-dark-900">{value}</p>
            <p className="mt-2 text-sm font-medium text-slate-500">{label}</p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}

function IntentSection() {
  const intents = [
    [Car, "شراء سيارة", "ابحث وقارن وتواصل بسرعة"],
    [Building2, "تصفح المعارض", "معارض موثقة في مدينتك"],
    [Calculator, "احسب التمويل", "قدّر خياراتك قبل التواصل"],
    [RefreshCcw, "قيّم سيارتك", "اعرف قيمة سيارتك الحالية"],
    [Store, "اعرض سيارتك مع Falcon", "بيع أو فوّض فالكون كوسيط"]
  ] as const;

  return (
    <SectionContainer>
      <SectionHeading
        eyebrow="رحلتك"
        title="ماذا تريد اليوم؟"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {intents.map(([Icon, title, description]) => (
          <Link
            className="falcon-motion block min-h-48 rounded-brand-lg border border-border-subtle bg-white p-6 shadow-subtle hover:-translate-y-1 hover:border-accent-500 hover:shadow-soft"
            key={title}
            to={getIntentHref(title)}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-accent-500/10 text-dark-900">
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-dark-900">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}

function getIntentHref(title: string) {
  const paths: Record<string, string> = {
    "احسب التمويل": "/cars",
    "اعرض سيارتك مع Falcon": "/register",
    "تصفح المعارض": "/dealers",
    "شراء سيارة": "/cars",
    "قيّم سيارتك": "/cars"
  };

  return paths[title] ?? "/cars";
}

function FeaturedCarsSection({
  apiCars,
  fallbackReason,
  isLoading
}: {
  apiCars: readonly HomeCar[];
  fallbackReason: "empty" | "error" | null;
  isLoading: boolean;
}) {
  const apiFalconCars = apiCars.filter((car) => car.badge === "وسيط فالكون");
  const apiDealerCars = apiCars.filter((car) => car.badge === "معرض موثق");

  const rails = [
    { badge: "وسيط فالكون", cars: apiFalconCars.length > 0 ? apiFalconCars : falconDirectCars, title: "سيارات فالكون" },
    { badge: "معرض موثق", cars: apiDealerCars.length > 0 ? apiDealerCars : dealerCars, title: "سيارات المعارض" },
    { cars: apiCars.length > 0 ? apiCars.slice(0, 3) : newCars, title: "سيارات جديدة" },
    { cars: apiCars.length > 0 ? apiCars.slice(0, 3) : usedCars, title: "سيارات مستعملة" },
    { cars: financedCars, title: "سيارات ممولة" },
    { cars: specialOfferCars, title: "عروض خاصة" }
  ] as const;

  return (
    <SectionContainer className="bg-section">
      <SectionHeading eyebrow="السيارات" title="اختيارات واضحة لكل نوع بحث" />
      {isLoading ? <HomeDataNotice message="جاري تحميل سيارات Falcon..." /> : null}
      {fallbackReason === "empty" ? (
        <HomeDataNotice message="يتم عرض بيانات تجريبية لأن قاعدة البيانات فارغة." />
      ) : null}
      {fallbackReason === "error" ? (
        <HomeDataNotice
          message="تعذر الاتصال بواجهة Falcon API، لذلك يتم عرض بيانات تجريبية مؤقتاً."
          tone="warning"
        />
      ) : null}
      <div className="space-y-10">
        {rails.map((rail) => (
          <CarRail
            badge={"badge" in rail ? rail.badge : undefined}
            cars={rail.cars}
            key={rail.title}
            title={rail.title}
          />
        ))}
      </div>
    </SectionContainer>
  );
}

function CarRail({
  badge,
  cars,
  title
}: {
  badge?: string;
  cars: readonly HomeCar[];
  title: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-2xl font-semibold text-dark-900">{title}</h3>
          {badge ? <Badge tone="accent">{badge}</Badge> : null}
        </div>
        <Link className="hidden md:inline-flex" to="/cars">
          <Button variant="ghost">
            عرض الكل
            <ArrowUpLeft className="h-4 w-4" strokeWidth={1.75} />
          </Button>
        </Link>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-3">
        {cars.map((car) => (
          <div className="min-w-[280px] max-w-[340px] flex-1 sm:min-w-[310px] sm:max-w-[360px]" key={`${title}-${car.name}`}>
            <CarImageCard
              badge={car.badge}
              city={car.city}
              imageAlt={car.name}
              imageSrc={car.imageSrc}
              detailsHref={getCarDetailsHref(car)}
              name={car.name}
              price={car.price}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function DealersSection({
  apiDealers,
  fallbackReason,
  isLoading
}: {
  apiDealers: readonly FrontendDealer[];
  fallbackReason: "empty" | "error" | null;
  isLoading: boolean;
}) {
  const visibleDealers = apiDealers.length > 0 ? apiDealers : dealers;

  return (
    <SectionContainer>
      <SectionHeading
        eyebrow="المعارض المميزة"
        subtitle="نخبة من معارض السيارات المعتمدة."
        title="معارض موثقة بتجربة شراء أوضح"
      />
      {isLoading ? <HomeDataNotice message="جاري تحميل المعارض المميزة..." /> : null}
      {fallbackReason === "empty" ? (
        <HomeDataNotice message="يتم عرض بيانات تجريبية لأن قاعدة البيانات فارغة." />
      ) : null}
      {fallbackReason === "error" ? (
        <HomeDataNotice
          message="تعذر الاتصال بواجهة Falcon API، لذلك يتم عرض بيانات تجريبية مؤقتاً."
          tone="warning"
        />
      ) : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {visibleDealers.map((dealer) => (
          <Card className="p-5" key={dealer.name}>
            <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-section">
              <ImageWithFallback
                alt={dealer.name}
                className="h-full w-full object-cover"
                src={dealer.imageSrc}
              />
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-dark-900">
                      {dealer.name}
                    </h3>
                    <ShieldCheck
                      className="h-4 w-4 shrink-0 text-accent-500"
                      strokeWidth={1.75}
                    />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-section px-2.5 py-1 text-xs font-semibold text-slate-600">
                    <Star className="h-3.5 w-3.5 text-amber-500" fill="currentColor" strokeWidth={1.75} />
                    {dealer.rating}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {dealer.city} · {dealer.cars}
                </p>
              </div>
              <Link to={getDealerDetailsHref(dealer)}>
                <Button className="w-full" variant="secondary">
                  زيارة المعرض
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}

function HomeDataNotice({
  message,
  tone = "info"
}: {
  message: string;
  tone?: "info" | "warning";
}) {
  return (
    <div
      className={cn(
        "mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold",
        tone === "warning"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-accent-500/20 bg-accent-500/10 text-dark-900"
      )}
    >
      {message}
    </div>
  );
}

function BrandsSection() {
  return (
    <SectionContainer className="bg-section">
      <SectionHeading
        eyebrow="العلامات"
        subtitle="اختر الشركة المصنعة."
        title="تصفح حسب العلامة"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {brands.map(([englishName, arabicName, imageSrc]) => (
          <Link
            className="falcon-motion flex min-h-32 flex-col items-center justify-center rounded-brand-lg border border-border-subtle bg-white p-5 text-center shadow-subtle hover:-translate-y-1 hover:border-accent-500"
            key={englishName}
            to={`/brands/${englishName.toLowerCase()}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-section">
              <ImageWithFallback
                alt={arabicName}
                className="h-8 w-8 object-contain"
                src={imageSrc}
              />
            </div>
            <p className="mt-3 text-sm font-semibold text-dark-900">
              {arabicName}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {englishName}
            </p>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}

function CategoriesSection() {
  return (
    <SectionContainer>
      <SectionHeading
        eyebrow="الفئات"
        subtitle="ابحث حسب أسلوب الاستخدام."
        title="اختر حسب الفئة"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category, index) => (
          <Link
            className="falcon-motion flex items-center justify-between rounded-brand-lg border border-border-subtle bg-white p-5 shadow-subtle hover:-translate-y-1 hover:border-accent-500"
            key={category}
            to={`/categories/${getCategorySlug(category)}`}
          >
            <div>
              <p className="text-lg font-semibold text-dark-900">{category}</p>
              <p className="mt-1 text-sm text-slate-500">
                {index % 2 === 0 ? "خيارات يومية وعائلية" : "خيارات أداء وفخامة"}
              </p>
            </div>
            <ArrowUpLeft className="h-5 w-5 text-accent-500" strokeWidth={1.75} />
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}

function FalconScoreSection() {
  return (
    <SectionContainer className="bg-section">
      <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <Card className="relative overflow-hidden p-8 shadow-soft">
          <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-accent-500/10 blur-3xl" />
          <p className="text-sm font-semibold text-accent-500">Falcon Score</p>
          <div className="mt-5 flex items-end gap-3">
            <p className="text-7xl font-semibold leading-none text-dark-900">9.2</p>
            <p className="pb-2 text-sm font-semibold text-slate-500">/ 10</p>
          </div>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-section">
            <div className="h-full w-[92%] rounded-full falcon-gradient" />
          </div>
          <div className="mt-6 grid gap-3 text-sm font-medium text-slate-600">
            {["السعر", "قيمة السيارة", "الطلب عليها", "سهولة إعادة البيع"].map((item) => (
              <div className="flex items-center justify-between" key={item}>
                <span>{item}</span>
                <TrendingUp className="h-4 w-4 text-accent-500" strokeWidth={1.75} />
              </div>
            ))}
          </div>
        </Card>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-500">ميزة ثقة</p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight text-dark-900">
            Falcon Score
          </h2>
          <p className="mt-5 text-lg leading-9 text-slate-600">
            درجة تقييم تساعد العميل على اتخاذ قرار الشراء بناءً على السعر، قيمة
            السيارة، الطلب عليها، وسهولة إعادة البيع.
          </p>
        </div>
      </div>
    </SectionContainer>
  );
}

function BenefitsSection() {
  const benefits = [
    [
      ShieldCheck,
      "وسيط موثوق",
      "نساعدك في الوصول إلى أفضل العروض من معارض معتمدة مع شفافية كاملة."
    ],
    [
      MessageCircle,
      "تواصل مباشر",
      "تواصل مع المعرض أو مع فريق Falcon بسهولة ومن مكان واحد."
    ],
    [
      Car,
      "خيارات متنوعة",
      "آلاف السيارات الجديدة والمستعملة بمختلف الفئات والعلامات التجارية."
    ],
    [
      ShieldCheck,
      "سهولة وأمان",
      "واجهة بسيطة، بحث سريع، وتجربة موثوقة من أول زيارة حتى إتمام الصفقة."
    ]
  ] as const;

  return (
    <SectionContainer>
      <SectionHeading
        eyebrow="لماذا يختار العملاء Falcon؟"
        title="تجربة شراء أكثر وضوحاً وثقة"
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {benefits.map(([Icon, title, description]) => (
          <Card className="p-7" key={title}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500/10 text-dark-900">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-dark-900">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}

function DealerCtaSection() {
  const cards = [
    [Car, "إدارة السيارات"],
    [Users, "إدارة العملاء"],
    [CircleDollarSign, "طلبات التمويل"],
    [BarChart3, "التقارير"],
    [ClipboardList, "الموظفون"]
  ] as const;

  return (
    <SectionContainer className="bg-section">
      <div className="overflow-hidden rounded-[2rem] border border-border-subtle bg-white p-6 shadow-soft md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-accent-500">
                هل تملك معرض سيارات؟
              </p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight text-dark-900 md:text-5xl">
                انضم إلى منصة Falcon وأدر معرضك بالكامل من لوحة تحكم واحدة.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                منصة واحدة لتنظيم السيارات، العملاء، طلبات التمويل، التقارير،
                والموظفين بتجربة بسيطة واحترافية.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map(([Icon, title]) => (
                <div
                  className="rounded-3xl border border-border-subtle bg-section p-5"
                  key={title}
                >
                  <Icon className="h-5 w-5 text-accent-500" strokeWidth={1.75} />
                  <p className="mt-4 text-lg font-semibold text-dark-900">{title}</p>
                </div>
              ))}
            </div>
            <Link to="/register">
              <Button className="h-14 px-8 text-base" variant="primary">
                ابدأ الآن
              </Button>
            </Link>
          </div>
          <div className="overflow-hidden rounded-brand-lg border border-border-subtle bg-section p-3 shadow-soft">
            <div className="aspect-[16/11] overflow-hidden rounded-[1.25rem] bg-white">
              <ImageWithFallback
                alt="لوحة صاحب المعرض"
                className="h-full w-full object-cover"
                src={ASSETS.dashboard.owner}
              />
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

function DashboardPreviewSection() {
  return (
    <SectionContainer>
      <SectionHeading
        eyebrow="لوحة التحكم"
        title="لوحات أكبر وأنظف لإدارة المعرض"
      />
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-border-subtle bg-white p-4 shadow-soft">
          <div className="aspect-[16/9] overflow-hidden rounded-[1.5rem] bg-section">
            <ImageWithFallback
              alt={dashboardPreviews[0][0]}
              className="h-full w-full object-cover"
              src={dashboardPreviews[0][1]}
            />
          </div>
          <p className="mt-5 px-2 text-xl font-semibold text-dark-900">
            {dashboardPreviews[0][0]}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardPreviews.slice(1).map(([title, imageSrc]) => (
            <Card className="p-4" key={title}>
              <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-section">
                <ImageWithFallback
                  alt={title}
                  className="h-full w-full object-cover"
                  src={imageSrc}
                />
              </div>
              <p className="mt-4 text-base font-semibold text-dark-900">{title}</p>
            </Card>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}

function AiSection() {
  const aiCards = [
    [FilePenLine, "كتابة إعلان السيارة"],
    [CircleDollarSign, "اقتراح سعر البيع"],
    [BarChart3, "تحليل السوق"],
    [MessageCircle, "الرد على العملاء"],
    [TrendingUp, "تحليل المنافسين"]
  ] as const;

  return (
    <SectionContainer className="bg-section">
      <SectionHeading
        eyebrow="Falcon AI"
        title="ذكاء اصطناعي لمعارض السيارات"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {aiCards.map(([Icon, title]) => (
          <Card className="p-6" key={title}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500/10 text-dark-900">
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-dark-900">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              نموذج ثابت يوضح اتجاه قدرات فالكون الذكية.
            </p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}

function LatestVehiclesSection({
  apiCars,
  fallbackReason
}: {
  apiCars: readonly HomeCar[];
  fallbackReason: "empty" | "error" | null;
}) {
  const liveCars = apiCars.length > 0 ? apiCars.slice(0, 3) : null;

  return (
    <>
      <CarRailSection
        cars={liveCars ?? latestCars}
        eyebrow="أحدث السيارات"
        fallbackReason={fallbackReason}
        title="وصلت حديثاً إلى Falcon"
      />
      <CarRailSection
        cars={liveCars ?? mostViewedCars}
        eyebrow="الأكثر مشاهدة"
        title="سيارات يتابعها العملاء بكثرة"
      />
      <CarRailSection
        cars={priceDropCars}
        eyebrow="انخفض سعرها"
        icon={<TrendingDown className="h-5 w-5 text-accent-500" strokeWidth={1.75} />}
        title="فرص بسعر أفضل"
      />
    </>
  );
}

function CarRailSection({
  cars,
  eyebrow,
  fallbackReason,
  icon,
  title
}: {
  cars: readonly HomeCar[];
  eyebrow: string;
  fallbackReason?: "empty" | "error" | null;
  icon?: ReactNode;
  title: string;
}) {
  return (
    <SectionContainer>
      <SectionHeading eyebrow={eyebrow} title={title} />
      {fallbackReason === "empty" ? (
        <HomeDataNotice message="يتم عرض بيانات تجريبية لأن قاعدة البيانات فارغة." />
      ) : null}
      {fallbackReason === "error" ? (
        <HomeDataNotice
          message="تعذر الاتصال بواجهة Falcon API، لذلك يتم عرض بيانات تجريبية مؤقتاً."
          tone="warning"
        />
      ) : null}
      {icon ? <div className="mb-4">{icon}</div> : null}
      <div className="grid gap-5 md:grid-cols-3">
        {cars.map((car) => (
          <CarImageCard
            badge={car.badge}
            city={car.city}
            imageAlt={car.name}
            imageSrc={car.imageSrc}
            detailsHref={getCarDetailsHref(car)}
            key={`${eyebrow}-${car.name}`}
            name={car.name}
            price={car.price}
          />
        ))}
      </div>
    </SectionContainer>
  );
}

function TestimonialsSection() {
  const testimonials = [
    ["تجربة البحث أصبحت أوضح، والتواصل مع المعرض كان سريعاً جداً.", "سارة العتيبي"],
    ["Falcon أعطانا واجهة أكثر احترافية لعرض السيارات وإدارة الطلبات.", "مدير معرض النخبة"],
    ["أعجبني وجود سيارات فالكون المباشرة بجانب المعارض الموثقة.", "محمد الحربي"]
  ] as const;

  return (
    <SectionContainer className="bg-section">
      <SectionHeading eyebrow="آراء العملاء" title="ثقة مبنية على تجربة هادئة" />
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map(([quote, name]) => (
          <Card className="p-7" key={name}>
            <div className="flex gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star className="h-4 w-4" fill="currentColor" key={index} strokeWidth={1.75} />
              ))}
            </div>
            <p className="mt-5 text-base leading-8 text-slate-600">{quote}</p>
            <p className="mt-6 text-sm font-semibold text-dark-900">{name}</p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}

function CtaSection() {
  return (
    <SectionContainer>
      <div className="overflow-hidden rounded-[2rem] bg-dark-900 p-6 text-white shadow-elevated md:p-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-2xl">
            <Chip className="border-white/10 bg-white/10 text-white">
              Falcon V2
            </Chip>
            <h2 className="mt-5 text-3xl font-semibold leading-tight md:text-5xl">
              اختر سيارتك أو شغّل معرضك من منصة واحدة
            </h2>
            <p className="mt-4 text-base leading-8 text-white/70">
              واجهة عامة للعملاء، ومسار واضح للمعارض، وخيار وسيط فالكون لمن يريد
              عرضاً أفضل.
            </p>
          </div>
          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <Link className="w-full sm:w-auto" to="/cars">
              <Button className="w-full sm:w-auto" variant="accent">تصفح السيارات</Button>
            </Link>
            <Link className="w-full sm:w-auto" to="/register">
              <Button className="w-full border-white/10 bg-white/10 text-white sm:w-auto" variant="secondary">
                انضم كمعرض
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-white px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 text-center md:grid-cols-[1fr_1.5fr] md:text-right">
        <div className="flex flex-col items-center md:items-start">
          <Logo language="ar" />
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
            Falcon Automotive Operating System: منصة عربية أولى للبحث عن
            السيارات، تشغيل المعارض، وخدمات الوساطة.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="font-semibold text-dark-900">{group.title}</p>
              <div className="mt-4 grid gap-3 text-sm font-medium text-slate-500">
                {group.links.map((link) => (
                  <Link className="falcon-motion hover:text-dark-900" key={link.label} to={link.path}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

function SectionHeading({
  className,
  eyebrow,
  subtitle,
  title
}: {
  className?: string;
  eyebrow: string;
  subtitle?: string;
  title: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div>
        <p className="text-sm font-semibold text-accent-500">{eyebrow}</p>
        <h2 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight text-dark-900 md:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            {subtitle}
          </p>
        ) : null}
      </div>
      <Link to="/cars">
        <Button className="w-fit" variant="ghost">
          عرض الكل
          <ArrowUpLeft className="h-4 w-4" strokeWidth={1.75} />
        </Button>
      </Link>
    </div>
  );
}

function getCarDetailsHref(car: HomeCar) {
  return car.id ? `/cars/${car.id}` : "/cars";
}

function getDealerDetailsHref(dealer: { id?: string; name: string }) {
  return dealer.id ? `/dealers/${dealer.id}` : "/dealers";
}

function getCategorySlug(category: string) {
  const slugs: Record<string, string> = {
    SUV: "suv",
    "بيك أب": "pickup",
    "رياضية": "sports",
    "سيدان": "sedan",
    "شاحنات": "trucks",
    "فان": "van",
    "كهربائية": "electric",
    "هجينة": "hybrid"
  };

  return slugs[category] ?? encodeURIComponent(category);
}

const footerGroups = [
  {
    links: [
      { label: "السيارات", path: "/cars" },
      { label: "المعارض", path: "/dealers" },
      { label: "Falcon Direct", path: "/cars?type=falcon" }
    ],
    title: "المنصة"
  },
  {
    links: [
      { label: "التمويل", path: "/cars" },
      { label: "تقييم السيارة", path: "/cars" },
      { label: "لوحة المعرض", path: "/dealer/dashboard" }
    ],
    title: "الخدمات"
  },
  {
    links: [
      { label: "عن فالكون", path: "/" },
      { label: "الدعم", path: "/account" },
      { label: "الشروط", path: "/" }
    ],
    title: "فالكون"
  }
] as const;
