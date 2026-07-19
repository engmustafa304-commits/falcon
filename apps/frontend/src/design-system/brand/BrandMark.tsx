import type { CSSProperties } from "react";

type BrandMarkProps = {
  className?: string;
  inverse?: boolean;
  styleSize?: number;
  title?: string;
};

export function BrandMark({
  className,
  inverse = false,
  styleSize,
  title = "Falcon"
}: BrandMarkProps) {
  const surface = inverse ? "#FFFFFF" : "#0F172A";
  const secondary = inverse ? "#0F172A" : "#FFFFFF";
  const sizeStyle: CSSProperties | undefined = styleSize
    ? { height: styleSize, width: styleSize }
    : undefined;

  return (
    <svg
      aria-label={title}
      className={className}
      fill="none"
      role="img"
      style={sizeStyle}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill={surface} height="64" rx="18" width="64" />
      <path
        d="M16 39.5C24 39.5 26.5 24.5 48 24.5"
        stroke="url(#falcon-mark-accent)"
        strokeLinecap="round"
        strokeWidth="7"
      />
      <path
        d="M17 26.5C27 26.5 32 17.5 47 17.5"
        stroke={secondary}
        strokeLinecap="round"
        strokeOpacity={inverse ? "0.85" : "0.92"}
        strokeWidth="4"
      />
      <path
        d="M23 45.5C31 45.5 36 38.5 47 38.5"
        stroke={secondary}
        strokeLinecap="round"
        strokeOpacity={inverse ? "0.46" : "0.58"}
        strokeWidth="3"
      />
      <defs>
        <linearGradient
          gradientUnits="userSpaceOnUse"
          id="falcon-mark-accent"
          x1="16"
          x2="48"
          y1="39.5"
          y2="24.5"
        >
          <stop stopColor="#43BFC7" />
          <stop offset="1" stopColor="#36B4BC" />
        </linearGradient>
      </defs>
    </svg>
  );
}
