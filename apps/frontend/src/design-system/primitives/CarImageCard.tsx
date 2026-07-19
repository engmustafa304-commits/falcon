import { ArrowUpLeft, MessageCircle, Phone } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { ImageWithFallback } from "./ImageWithFallback";

type CarImageCardProps = {
  badge?: string;
  city?: string;
  detailsHref?: string;
  imageAlt?: string;
  imageSrc?: string;
  name?: string;
  phoneHref?: string;
  price?: string;
  whatsappHref?: string;
};

const cardSpring = { damping: 22, mass: 0.6, stiffness: 260 };

export function CarImageCard({
  badge = "وسيط فالكون",
  city = "الرياض",
  detailsHref = "/cars",
  imageAlt = "Premium vehicle silhouette",
  imageSrc = "/images/cars/car-01.webp",
  name = "Porsche Taycan Turbo",
  phoneHref,
  price = "525,000 SAR",
  whatsappHref
}: CarImageCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const springGlowX = useSpring(glowX, { damping: 18, mass: 0.4, stiffness: 180 });
  const springGlowY = useSpring(glowY, { damping: 18, mass: 0.4, stiffness: 180 });
  const glowTranslateX = useTransform(springGlowX, [-1, 1], [-60, 60]);
  const glowTranslateY = useTransform(springGlowY, [-1, 1], [-50, 50]);

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (prefersReducedMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    glowX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    glowY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function handlePointerLeave() {
    glowX.set(0);
    glowY.set(0);
  }

  return (
    <motion.article
      className="group relative overflow-hidden rounded-[2rem] bg-dark-900 shadow-soft transition-shadow duration-300 hover:shadow-elevated"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      transition={cardSpring}
      whileHover={prefersReducedMotion ? undefined : { y: -8 }}
    >
      <div className="aspect-[16/11] overflow-hidden">
        <ImageWithFallback
          alt={imageAlt}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          src={imageSrc}
        />
      </div>

      {/* Cursor-follow light — desktop only, purely decorative. */}
      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center overflow-hidden opacity-0 transition-opacity duration-300 lg:flex lg:group-hover:opacity-100">
        <motion.div
          className="h-32 w-32 rounded-full bg-white/25 mix-blend-overlay blur-3xl"
          style={{ x: glowTranslateX, y: glowTranslateY }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/20 to-transparent" />
      <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
        <Badge tone={badge === "وسيط فالكون" ? "accent" : "neutral"}>
          {badge}
        </Badge>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white sm:text-2xl">{name}</h3>
            <p className="mt-2 text-sm font-medium text-white/75">
              {city} · {price}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 opacity-100 transition-[opacity,filter,transform] duration-300 ease-out md:mt-5 md:translate-y-2 md:opacity-0 md:blur-[2px] md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-hover:blur-0">
          {whatsappHref ? (
            <a href={whatsappHref} rel="noreferrer" target="_blank">
              <Button className="min-h-11 rounded-xl px-3 py-2" variant="accent">
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                واتساب
              </Button>
            </a>
          ) : (
            <Button className="min-h-11 rounded-xl px-3 py-2" disabled title="افتح التفاصيل لإرسال طلب تواصل." variant="accent">
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
              واتساب
            </Button>
          )}
          {phoneHref ? (
            <a href={phoneHref}>
              <Button className="min-h-11 rounded-xl px-3 py-2" variant="secondary">
                <Phone className="h-4 w-4" strokeWidth={1.75} />
                اتصال
              </Button>
            </a>
          ) : (
            <Button className="min-h-11 rounded-xl px-3 py-2" disabled title="رقم الاتصال غير متاح لهذه البطاقة." variant="secondary">
              <Phone className="h-4 w-4" strokeWidth={1.75} />
              اتصال
            </Button>
          )}
          <Link to={detailsHref}>
            <Button className="min-h-11 rounded-xl px-3 py-2" variant="secondary">
              <ArrowUpLeft className="h-4 w-4" strokeWidth={1.75} />
              التفاصيل
            </Button>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
