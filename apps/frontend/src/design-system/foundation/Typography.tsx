import { Card } from "@/design-system/primitives";

const arabicSamples = [
  ["Hero", "السيارات التي تبحث عنها... كلها في مكان واحد", "type-hero"],
  ["Section Title", "نظام تشغيلي فاخر لمعارض السيارات", "type-section"],
  ["Heading", "تجربة واضحة وسريعة وموثوقة", "type-title"],
  ["Body", "ابحث بين آلاف السيارات الجديدة والمستعملة، وقارن الأسعار، وتواصل مباشرة مع المعارض المعتمدة.", "type-body"],
  ["Caption", "وسيط فالكون · تجربة موثوقة", "type-caption"],
  ["Button", "تصفح السيارات", "type-button"],
  ["Label", "المدينة", "type-label"]
] as const;

const englishSamples = [
  ["Hero", "Premium automotive operations, in one place", "type-hero"],
  ["Section Title", "A luxury operating system for dealerships", "type-section"],
  ["Heading", "Clear, fast, trusted experiences", "type-title"],
  ["Body", "Search inventory, compare prices, and connect directly with verified dealerships.", "type-body"],
  ["Caption", "Falcon Direct · Trusted brokerage", "type-caption"],
  ["Button", "Browse vehicles", "type-button"],
  ["Label", "City", "type-label"]
] as const;

export function Typography() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <TypographyColumn
        dir="rtl"
        lang="ar"
        samples={arabicSamples}
        title="Arabic / SA Hazm"
      />
      <TypographyColumn
        dir="ltr"
        lang="en"
        samples={englishSamples}
        title="English / Inter"
      />
    </div>
  );
}

function TypographyColumn({
  dir,
  lang,
  samples,
  title
}: {
  dir: "ltr" | "rtl";
  lang: "ar" | "en";
  samples: readonly (readonly [string, string, string])[];
  title: string;
}) {
  return (
    <Card className="space-y-8 p-8" dir={dir} lang={lang}>
      <div>
        <p className="type-caption uppercase text-slate-500">Typography System</p>
        <h3 className="mt-2 type-title text-dark-900">{title}</h3>
      </div>
      <div className="space-y-7">
        {samples.map(([label, text, className]) => (
          <div className="border-t border-border-subtle pt-5" key={label}>
            <p className="type-label text-accent-500">{label}</p>
            <p className={`mt-3 ${className} text-dark-900`}>{text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
