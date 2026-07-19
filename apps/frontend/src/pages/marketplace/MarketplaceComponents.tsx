import {
  ArrowUpLeft,
  Gauge,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star
} from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import { SavedCarActions } from "@/components/cars/SavedCarActions";
import { Badge, Button, Card, Chip, ImageWithFallback } from "@/design-system/primitives";
import { cn } from "@/utils/cn";
import type { MarketplaceCar } from "./marketplaceData";

const cardSpring = { damping: 22, mass: 0.6, stiffness: 260 };

export function MarketplaceHero({
  subtitle,
  title
}: {
  subtitle?: string;
  title: string;
}) {
  return (
    <section className="bg-section px-5 py-14 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-semibold text-accent-500">Falcon Marketplace</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-dark-900 md:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function MarketplaceCarCard({ car }: { car: MarketplaceCar }) {
  const prefersReducedMotion = useReducedMotion();

  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const springGlowX = useSpring(glowX, { damping: 18, mass: 0.4, stiffness: 180 });
  const springGlowY = useSpring(glowY, { damping: 18, mass: 0.4, stiffness: 180 });
  const glowTranslateX = useTransform(springGlowX, [-1, 1], [-70, 70]);
  const glowTranslateY = useTransform(springGlowY, [-1, 1], [-60, 60]);

  function handleImagePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (prefersReducedMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    glowX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    glowY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function handleImagePointerLeave() {
    glowX.set(0);
    glowY.set(0);
  }

  return (
    <motion.article
      className="group overflow-hidden rounded-[2rem] border border-border-subtle bg-white shadow-subtle transition-shadow duration-300 hover:shadow-elevated"
      transition={cardSpring}
      whileHover={prefersReducedMotion ? undefined : { y: -8 }}
    >
      <div
        className="relative aspect-[4/3] overflow-hidden bg-section sm:aspect-[16/10]"
        onPointerLeave={handleImagePointerLeave}
        onPointerMove={handleImagePointerMove}
      >
        <ImageWithFallback
          alt={car.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          src={car.imageSrc}
        />

        {/* Cursor-follow light — desktop only, purely decorative. */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center overflow-hidden opacity-0 transition-opacity duration-300 lg:flex lg:group-hover:opacity-100">
          <motion.div
            className="h-36 w-36 rounded-full bg-white/30 mix-blend-overlay blur-3xl"
            style={{ x: glowTranslateX, y: glowTranslateY }}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-900/45 via-transparent to-transparent" />

        <div className="absolute right-4 top-4">
          <Badge
            className="border border-white/25 bg-dark-900/55 text-white backdrop-blur-md"
            tone={car.badge === "وسيط فالكون" ? "accent" : "neutral"}
          >
            {car.badge}
          </Badge>
        </div>

        <div className="absolute left-4 top-4">
          <SavedCarActions carId={car.id} variant="icon" />
        </div>

        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-dark-900/55 py-1.5 pl-3 pr-2 text-white shadow-soft backdrop-blur-md">
          <span className="text-sm font-bold leading-none text-accent-500">{car.falconScore}</span>
          <span className="text-[10px] font-semibold leading-none text-white/70">Falcon Score</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-semibold text-dark-900">{car.name}</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {car.year} · {car.model}
            </p>
          </div>
          <p className="shrink-0 text-xl font-semibold text-dark-900">{car.price}</p>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm font-medium text-slate-500">
          <span>{car.city}</span>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <span className="inline-flex items-center gap-1">
            <Gauge className="h-4 w-4" strokeWidth={1.75} />
            {car.mileage}
          </span>
        </div>

        <div
          className={cn(
            "mt-5 grid gap-2 sm:grid-cols-3",
            "opacity-100 lg:opacity-0 lg:blur-[2px] lg:transition-[opacity,filter] lg:duration-300 lg:group-hover:opacity-100 lg:group-hover:blur-0"
          )}
        >
          <Button className="min-h-11 rounded-xl px-2 py-2" disabled title="رقم الواتساب غير متاح لهذه البطاقة. افتح التفاصيل لإرسال طلب تواصل." variant="accent">
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
            واتساب
          </Button>
          <Button className="min-h-11 rounded-xl px-2 py-2" disabled title="رقم الاتصال غير متاح لهذه البطاقة. افتح التفاصيل لإرسال طلب تواصل." variant="secondary">
            <Phone className="h-4 w-4" strokeWidth={1.75} />
            اتصال
          </Button>
          <Link to={`/cars/${car.id ?? car.brandSlug}`}>
            <Button className="min-h-11 w-full rounded-xl px-2 py-2" variant="secondary">
              <ArrowUpLeft className="h-4 w-4" strokeWidth={1.75} />
              التفاصيل
            </Button>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export function DealerCard({
  dealer
}: {
  dealer: {
    cars: string;
    city: string;
    id?: string;
    imageSrc: string;
    inventory: readonly string[];
    name: string;
    rating: string;
  };
}) {
  return (
    <Card className="p-5">
      <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-section">
        <ImageWithFallback
          alt={dealer.name}
          className="h-full w-full object-cover"
          src={dealer.imageSrc}
        />
      </div>
      <div className="mt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-dark-900">{dealer.name}</h3>
            <ShieldCheck className="h-4 w-4 text-accent-500" strokeWidth={1.75} />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-section px-2.5 py-1 text-xs font-semibold text-slate-600">
            <Star className="h-3.5 w-3.5 text-amber-500" fill="currentColor" strokeWidth={1.75} />
            {dealer.rating}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {dealer.city} · {dealer.cars}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {dealer.inventory.map((label) => (
            <Chip className="h-8 px-3 text-xs" key={label}>
              {label}
            </Chip>
          ))}
        </div>
        <Link to={`/dealers/${dealer.id ?? dealer.name}`}>
          <Button className="mt-5 w-full" variant="secondary">
            زيارة المعرض
          </Button>
        </Link>
      </div>
    </Card>
  );
}
