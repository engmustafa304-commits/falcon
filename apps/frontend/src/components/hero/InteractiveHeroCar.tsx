import { Car } from "lucide-react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

type InteractiveHeroCarProps = {
  className?: string;
  completeImage: string;
  explodedImage?: string;
};

const SPRING_MOVEMENT = { damping: 20, mass: 0.4, stiffness: 120 };
const SPRING_BLEND = { damping: 24, mass: 0.5, stiffness: 90 };
// Full-bleed cover, no padding, no inner frame — the car IS the panel.
const LAYER_CLASS = "absolute inset-0 h-full w-full object-cover object-center";

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function InteractiveHeroCar({
  className,
  completeImage,
  explodedImage
}: InteractiveHeroCarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [canHover, setCanHover] = useState(false);
  const [completeFailed, setCompleteFailed] = useState(false);
  const [explodedFailed, setExplodedFailed] = useState(false);

  const showExploded = Boolean(explodedImage) && !explodedFailed;
  // Gates pointer *behavior* only — never branches the DOM tree, so there is
  // no mount-time flash while canHover resolves from its media-query effect.
  const isInteractive = canHover && !prefersReducedMotion && showExploded;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const pointerBlend = useMotionValue(0);

  const blend = useSpring(pointerBlend, SPRING_BLEND);
  const smoothX = useSpring(pointerX, SPRING_MOVEMENT);
  const smoothY = useSpring(pointerY, SPRING_MOVEMENT);

  // object-cover already crops the image flush to the panel with zero slack
  // on its constrained axis, so a resting scale of 1 would expose a hard
  // edge the moment translateY moves. Baking in a little permanent overscan
  // (1.08–1.14) gives the parallax room to breathe without ever showing a
  // seam — the crossfade "zoom" still reads the same relative amount.
  const completeScale = useTransform(blend, [0, 1], [1.08, 1.11]);
  const explodedScale = useTransform(blend, [0, 1], [1.1, 1.14]);
  const completeOpacity = useTransform(blend, [0, 1], [1, 0.25]);
  const explodedOpacity = useTransform(blend, [0, 1], [0, 1]);
  const completeTranslateX = useTransform(smoothX, [-1, 1], [-12, 12]);
  const completeTranslateY = useTransform(smoothY, [-1, 1], [-8, 8]);
  const explodedTranslateX = useTransform(smoothX, [-1, 1], [-20, 20]);
  const explodedTranslateY = useTransform(smoothY, [-1, 1], [-14, 14]);

  // Glow and shadow are overlays painted directly on top of the car photo
  // (blend-mode, not opacity stacking behind it) — with a full-bleed cover
  // image there is no gap left for a layer sitting behind it to show through.
  const glowOpacity = useTransform(blend, [0, 1], [0.22, 0.42]);
  const shadowOpacity = useTransform(blend, [0, 1], [0.35, 0.55]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(hoverQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => setCanHover(event.matches);
    hoverQuery.addEventListener("change", handleChange);

    return () => hoverQuery.removeEventListener("change", handleChange);
  }, []);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isInteractive) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const relX = clamp01((event.clientX - rect.left) / rect.width);
    const relY = clamp01((event.clientY - rect.top) / rect.height);

    pointerX.set(relX * 2 - 1);
    pointerY.set(relY * 2 - 1);
    pointerBlend.set(relX);
  };

  const handlePointerLeave = () => {
    if (!isInteractive) {
      return;
    }

    pointerX.set(0);
    pointerY.set(0);
    pointerBlend.set(0);
  };

  if (completeFailed) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "flex h-full w-full items-center justify-center text-white/30",
          className
        )}
      >
        <Car className="h-12 w-12" strokeWidth={1.5} />
      </div>
    );
  }

  // Reduced motion: the plainest possible render — static full-bleed image,
  // no motion wrapper, no decorative layers, no pointer listeners.
  if (prefersReducedMotion) {
    return (
      <div className={cn("absolute inset-0 h-full w-full overflow-hidden", className)}>
        <img
          alt="سيارة فالكون الفاخرة"
          className={LAYER_CLASS}
          onError={() => setCompleteFailed(true)}
          src={completeImage}
        />
      </div>
    );
  }

  const willChange = "transform, opacity";

  return (
    <div
      className={cn("absolute inset-0 h-full w-full overflow-hidden", className)}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      ref={containerRef}
    >
      <motion.div
        animate={{ opacity: 1 }}
        className="absolute inset-0 h-full w-full"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          alt="سيارة فالكون الفاخرة"
          className={LAYER_CLASS}
          onError={() => setCompleteFailed(true)}
          src={completeImage}
          style={{
            opacity: showExploded ? completeOpacity : 1,
            scale: completeScale,
            willChange,
            x: completeTranslateX,
            y: completeTranslateY
          }}
        />
        {/*
          Only mounted on hover-capable pointers: it sits at opacity 0 until
          interaction anyway, so gating the mount avoids a wasted download on
          touch devices without ever causing a visible pop-in.
        */}
        {canHover && showExploded ? (
          <motion.img
            alt="مكونات سيارة فالكون بعرض تفصيلي"
            className={LAYER_CLASS}
            onError={() => setExplodedFailed(true)}
            src={explodedImage}
            style={{
              opacity: explodedOpacity,
              scale: explodedScale,
              willChange,
              x: explodedTranslateX,
              y: explodedTranslateY
            }}
          />
        ) : null}

        {/*
          Idle "breathing" light — independent of pointer state, so the hero
          reads as alive even before anyone moves the mouse. A separate layer
          rather than folding into glowOpacity below, since animate and a
          style-bound MotionValue can't drive the same property at once.
        */}
        <motion.div
          animate={{ opacity: [0.06, 0.14, 0.06] }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_40%,#43BFC7_0%,transparent_70%)] mix-blend-screen blur-3xl"
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        />

        {/* Ambient accent glow, painted directly onto the photo via screen blending. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_38%,#43BFC7_0%,transparent_72%)] mix-blend-screen blur-2xl"
          style={{ opacity: glowOpacity, willChange: "opacity" }}
        />

        {/* Grounding shadow, deepening the base of the frame directly over the car. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/25 to-transparent mix-blend-multiply"
          style={{ opacity: shadowOpacity, willChange: "opacity" }}
        />
      </motion.div>
    </div>
  );
}
