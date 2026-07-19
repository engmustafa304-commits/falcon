import { CarFront, Filter, Fuel, Gauge, SlidersHorizontal, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { Card, CarImageCard, Chip, SectionContainer } from "@/design-system/primitives";
import { PublicMarketplaceLayout } from "./PublicMarketplaceLayout";
import { marketplaceCars, marketplaceCategories } from "./marketplaceData";

const categoryExtras: Record<
  string,
  {
    availableCount: string;
    popularBrands: string[];
    tagline: string;
  }
> = {
  sedan: {
    availableCount: "١٨ سيارة متاحة",
    popularBrands: ["مرسيدس", "تويوتا", "هيونداي", "كيا"],
    tagline: "سيارات مريحة وعملية للحياة اليومية"
  },
  suv: {
    availableCount: "٣٢ سيارة متاحة",
    popularBrands: ["لكزس", "BMW", "تويوتا", "شيفروليه"],
    tagline: "مساحة أكبر وراحة أعلى للعائلة والرحلات"
  },
  electric: {
    availableCount: "٩ سيارات متاحة",
    popularBrands: ["بورشه", "مرسيدس", "BMW", "هيونداي"],
    tagline: "تقنيات حديثة وقيادة هادئة وكفاءة عالية"
  }
};

const sortOptions = ["الأحدث أولاً", "الأقل سعرًا", "الأعلى سعرًا"];
const filters = [
  ["نوع القير", Gauge],
  ["الوقود", Fuel],
  ["السعر", SlidersHorizontal]
] as const;

export function CategoryDetailsPage() {
  const { slug = "sedan" } = useParams();
  const category = getCategory(slug);
  const extra = categoryExtras[category.slug] ?? categoryExtras.sedan;
  const categoryCars = marketplaceCars.filter((car) => car.categorySlug === category.slug);
  const cars = categoryCars.length > 0 ? categoryCars : marketplaceCars.slice(0, 3);

  return (
    <PublicMarketplaceLayout>
      <Seo
        canonical={`/categories/${category.slug}`}
        description={`${category.name} على Falcon: ${extra.tagline}. ${category.longDescription}`}
        image="/images/hero/hero-background.webp"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "description": category.longDescription,
          "inLanguage": "ar-SA",
          "name": `سيارات ${category.name}`,
          "url": `/categories/${category.slug}`
        }}
        title={`سيارات ${category.name}`}
      />
      <section className="bg-section px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="مسار الصفحة" className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
            <Link className="transition hover:text-dark-900" to="/">الصفحة الرئيسية</Link>
            <span>/</span>
            <Link className="transition hover:text-dark-900" to="/categories">الفئات</Link>
            <span>/</span>
            <span className="text-dark-900">{category.name}</span>
          </nav>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <CategoryHero
              availableCount={extra.availableCount}
              category={category}
              tagline={extra.tagline}
            />
            <CategoryInfo
              description={category.longDescription}
              popularBrands={extra.popularBrands}
            />
          </div>
        </div>
      </section>

      <SectionContainer>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent-500">Falcon Categories</p>
            <h2 className="mt-2 text-3xl font-semibold text-dark-900 md:text-4xl">
              سيارات {category.name} المتاحة
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              استكشف جميع السيارات من فئة {category.name} المتوفرة في Falcon.
            </p>
          </div>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            {sortOptions.map((option) => (
              <Chip className="bg-white px-4" key={option}>{option}</Chip>
            ))}
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:flex sm:flex-wrap">
          <span className="inline-flex h-11 items-center gap-2 rounded-2xl bg-dark-900 px-4 text-sm font-semibold text-white">
            <Filter className="h-4 w-4 text-accent-500" strokeWidth={1.75} />
            فلاتر الفئة
          </span>
          {filters.map(([label, Icon]) => (
            <button
              className="inline-flex h-11 w-full items-center gap-2 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-accent-500 hover:text-dark-900 sm:w-auto"
              key={label}
              type="button"
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cars.map((car) => (
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

function CategoryHero({
  availableCount,
  category,
  tagline
}: {
  availableCount: string;
  category: ReturnType<typeof getCategory>;
  tagline: string;
}) {
  return (
    <Card className="relative overflow-hidden p-8 md:p-10">
      <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-accent-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-dark-900 text-accent-500 shadow-soft">
          <CarFront className="h-12 w-12" strokeWidth={1.5} />
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Chip className="border-accent-500/20 bg-accent-500/10 text-dark-900">
            {availableCount}
          </Chip>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
            <Sparkles className="h-4 w-4 text-accent-500" strokeWidth={1.75} />
            فئة رئيسية
          </span>
        </div>
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-dark-900 sm:text-5xl md:text-6xl">
          {category.name}
        </h1>
        <p className="mt-4 text-xl font-semibold text-slate-700">{tagline}</p>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          {category.description}
        </p>
      </div>
    </Card>
  );
}

function CategoryInfo({
  description,
  popularBrands
}: {
  description: string;
  popularBrands: string[];
}) {
  return (
    <Card className="flex flex-col justify-between p-8 md:p-10">
      <div>
        <p className="text-sm font-semibold text-accent-500">عن الفئة</p>
        <h2 className="mt-3 text-3xl font-semibold text-dark-900">الاستخدامات والمزايا</h2>
        <p className="mt-5 text-base leading-9 text-slate-600">{description}</p>
      </div>
      <div className="mt-8">
        <p className="text-sm font-semibold text-slate-500">علامات شائعة في هذه الفئة</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {popularBrands.map((brand) => (
            <Chip className="bg-section px-4" key={brand}>{brand}</Chip>
          ))}
        </div>
      </div>
    </Card>
  );
}

function getCategory(slug: string) {
  const normalizedSlug = slug.toLowerCase();
  const match = marketplaceCategories.find(([, , categorySlug]) => categorySlug === normalizedSlug);

  if (!match) {
    return {
      description: "سيارات يومية أنيقة ومريحة",
      longDescription:
        "السيارات السيدان تتميز بالراحة والاقتصادية وسهولة الاستخدام داخل المدينة والسفر اليومي.",
      name: "سيدان",
      slug: "sedan"
    };
  }

  const [name, description, categorySlug, longDescription] = match;

  return {
    description,
    longDescription,
    name,
    slug: categorySlug
  };
}
