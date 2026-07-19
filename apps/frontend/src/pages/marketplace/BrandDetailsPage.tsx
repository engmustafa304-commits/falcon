import { BadgeCheck, ExternalLink, Filter, SlidersHorizontal } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { Card, CarImageCard, Chip, ImageWithFallback, SectionContainer } from "@/design-system/primitives";
import { PublicMarketplaceLayout } from "./PublicMarketplaceLayout";
import { marketplaceCars, marketplaceBrands } from "./marketplaceData";

const brandProfiles: Record<
  string,
  {
    availableCount: string;
    description: string;
    history: string;
    officialWebsite: string;
    tagline: string;
  }
> = {
  lexus: {
    availableCount: "١٢ سيارة متاحة",
    description: "شركة سيارات يابانية معروفة بالفخامة والأداء والاعتمادية العالية.",
    history:
      "تأسست لكزس عام 1989 كعلامة فاخرة تركز على الراحة، جودة التصنيع، والتقنيات الهادئة. أصبحت لكزس خيارًا مفضلاً للعملاء الباحثين عن سيارة راقية تجمع بين الاعتمادية وتجربة قيادة مريحة.",
    officialWebsite: "https://www.lexus.com.sa",
    tagline: "فخامة يابانية بهدوء وموثوقية عالية"
  },
  mercedes: {
    availableCount: "١٨ سيارة متاحة",
    description: "علامة ألمانية فاخرة تجمع بين الحضور، التقنية، والأداء.",
    history:
      "مرسيدس بنز من أعرق شركات السيارات في العالم، وتشتهر بابتكارات السلامة وتجربة القيادة الفاخرة، مع مجموعة واسعة من سيارات السيدان والـ SUV والسيارات عالية الأداء.",
    officialWebsite: "https://www.mercedes-benz.com",
    tagline: "هندسة ألمانية وحضور فاخر"
  },
  toyota: {
    availableCount: "٢٤ سيارة متاحة",
    description: "علامة يابانية عملية تشتهر بالاعتمادية وقيمة إعادة البيع.",
    history:
      "تويوتا من أكثر العلامات انتشارًا في المنطقة، وتقدم سيارات عملية للعائلات والأعمال والرحلات، مع سمعة قوية في الاعتمادية وتكاليف التشغيل المناسبة.",
    officialWebsite: "https://www.toyota.com.sa",
    tagline: "اعتمادية يومية وقيمة طويلة المدى"
  }
};

const filters = ["الفئة", "السعر", "الموديل", "السنة"];
const sortOptions = ["الأحدث أولًا", "السعر من الأقل", "الأعلى تقييمًا"];

export function BrandDetailsPage() {
  const { slug = "lexus" } = useParams();
  const brand = getBrand(slug);
  const profile = brandProfiles[brand.slug] ?? brandProfiles.lexus;
  const brandCars = marketplaceCars.filter((car) => car.brandSlug === brand.slug);
  const cars = brandCars.length > 0 ? brandCars : marketplaceCars.slice(0, 3);

  return (
    <PublicMarketplaceLayout>
      <Seo
        canonical={`/brands/${brand.slug}`}
        description={`${brand.arabicName} على Falcon: ${profile.description} ${profile.availableCount}. تصفح السيارات المتاحة حسب الموديل والسعر والسنة.`}
        image={brand.logo}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Brand",
          "description": profile.description,
          "logo": brand.logo,
          "name": brand.arabicName,
          "sameAs": profile.officialWebsite,
          "url": `/brands/${brand.slug}`
        }}
        title={`سيارات ${brand.arabicName}`}
      />
      <section className="bg-section px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="مسار الصفحة" className="mb-6 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
            <Link className="transition hover:text-dark-900" to="/">الصفحة الرئيسية</Link>
            <span>/</span>
            <Link className="transition hover:text-dark-900" to="/brands">العلامات</Link>
            <span>/</span>
            <span className="text-dark-900">{brand.arabicName}</span>
          </nav>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <BrandHero
              availableCount={profile.availableCount}
              brand={brand}
              description={profile.description}
              tagline={profile.tagline}
            />
            <BrandInfoPanel
              history={profile.history}
              officialWebsite={profile.officialWebsite}
            />
          </div>
        </div>
      </section>

      <SectionContainer>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent-500">Falcon Brands</p>
            <h2 className="mt-2 text-3xl font-semibold text-dark-900 md:text-4xl">
              سيارات {brand.arabicName} المتاحة
            </h2>
            <p className="mt-3 text-base leading-8 text-slate-600">
              تصفح جميع سيارات {brand.arabicName} المتوفرة في Falcon.
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
            فلاتر العلامة
          </span>
          {filters.map((filter) => (
            <button
              className="inline-flex h-11 w-full items-center gap-2 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-accent-500 hover:text-dark-900 sm:w-auto"
              key={filter}
              type="button"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
              {filter}
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

function BrandHero({
  availableCount,
  brand,
  description,
  tagline
}: {
  availableCount: string;
  brand: ReturnType<typeof getBrand>;
  description: string;
  tagline: string;
}) {
  return (
    <Card className="relative overflow-hidden p-8 md:p-10">
      <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-accent-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-border-subtle bg-white shadow-subtle">
          <ImageWithFallback
            alt={brand.arabicName}
            className="h-14 w-14 object-contain"
            src={brand.logo}
          />
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Chip className="border-accent-500/20 bg-accent-500/10 text-dark-900">
            {availableCount}
          </Chip>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
            <BadgeCheck className="h-4 w-4 text-accent-500" strokeWidth={1.75} />
            علامة موثقة
          </span>
        </div>
        <h1 className="mt-5 text-4xl font-semibold leading-tight text-dark-900 sm:text-5xl md:text-6xl">
          {brand.arabicName}
        </h1>
        <p className="mt-4 text-xl font-semibold text-slate-700">{tagline}</p>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">{description}</p>
      </div>
    </Card>
  );
}

function BrandInfoPanel({
  history,
  officialWebsite
}: {
  history: string;
  officialWebsite: string;
}) {
  return (
    <Card className="flex flex-col justify-between p-8 md:p-10">
      <div>
        <p className="text-sm font-semibold text-accent-500">عن العلامة</p>
        <h2 className="mt-3 text-3xl font-semibold text-dark-900">نبذة مختصرة</h2>
        <p className="mt-5 text-base leading-9 text-slate-600">{history}</p>
      </div>
      <a
        className="mt-8 inline-flex w-fit items-center gap-2 rounded-2xl border border-border-subtle bg-white px-5 py-3 text-sm font-semibold text-dark-900 shadow-subtle transition hover:border-accent-500"
        href={officialWebsite}
        rel="noreferrer"
        target="_blank"
      >
        زيارة الموقع الرسمي
        <ExternalLink className="h-4 w-4 text-accent-500" strokeWidth={1.75} />
      </a>
    </Card>
  );
}

function getBrand(slug: string) {
  const normalizedSlug = slug.toLowerCase();
  const match = marketplaceBrands.find(([englishName]) => {
    return englishName.toLowerCase().replace(/\s+/g, "-") === normalizedSlug;
  });

  if (!match) {
    return {
      arabicName: "لكزس",
      englishName: "Lexus",
      logo: "/images/brands/lexus.svg",
      slug: "lexus"
    };
  }

  const [englishName, arabicName, logo] = match;

  return {
    arabicName,
    englishName,
    logo,
    slug: normalizedSlug
  };
}
