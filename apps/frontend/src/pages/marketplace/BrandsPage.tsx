import { Card, ImageWithFallback } from "@/design-system/primitives";
import { Seo } from "@/components/seo/Seo";
import { MarketplaceHero } from "./MarketplaceComponents";
import { PublicMarketplaceLayout } from "./PublicMarketplaceLayout";
import { marketplaceBrands } from "./marketplaceData";

export function BrandsPage() {
  return (
    <PublicMarketplaceLayout>
      <Seo
        canonical="/brands"
        description="استكشف سيارات Falcon حسب العلامة التجارية مثل تويوتا، لكزس، مرسيدس، BMW، هيونداي، كيا، نيسان، وفورد."
        image="/images/brands/toyota.svg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "description": "صفحة العلامات التجارية للسيارات في Falcon.",
          "inLanguage": "ar-SA",
          "name": "تصفح حسب العلامة",
          "url": "/brands"
        }}
        title="تصفح حسب العلامة"
      />
      <MarketplaceHero
        subtitle="اختر الشركة المصنعة واستكشف السيارات المتاحة لكل علامة."
        title="تصفح حسب العلامة"
      />
      <section className="px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {marketplaceBrands.map(([englishName, arabicName, imageSrc]) => (
            <Card
              className="falcon-motion flex min-h-36 flex-col items-center justify-center p-6 text-center hover:-translate-y-1 hover:border-accent-500"
              key={englishName}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-section">
                <ImageWithFallback
                  alt={arabicName}
                  className="h-9 w-9 object-contain"
                  src={imageSrc}
                />
              </div>
              <p className="mt-4 text-base font-semibold text-dark-900">
                {arabicName}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {englishName}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </PublicMarketplaceLayout>
  );
}
