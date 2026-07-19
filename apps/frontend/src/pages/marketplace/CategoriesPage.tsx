import { ArrowUpLeft } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { Card } from "@/design-system/primitives";
import { MarketplaceHero } from "./MarketplaceComponents";
import { PublicMarketplaceLayout } from "./PublicMarketplaceLayout";
import { marketplaceCategories } from "./marketplaceData";

export function CategoriesPage() {
  return (
    <PublicMarketplaceLayout>
      <Seo
        canonical="/categories"
        description="اختر فئة السيارة المناسبة لك في Falcon: سيدان، SUV، بيك أب، رياضية، كهربائية، هجينة، فان، وشاحنات."
        image="/images/hero/hero-background.webp"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "description": "تصفح السيارات حسب الفئة والاستخدام.",
          "inLanguage": "ar-SA",
          "name": "اختر حسب الفئة",
          "url": "/categories"
        }}
        title="اختر حسب الفئة"
      />
      <MarketplaceHero
        subtitle="ابحث حسب أسلوب الاستخدام واختر الفئة المناسبة لك."
        title="اختر حسب الفئة"
      />
      <section className="px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {marketplaceCategories.map(([category, description]) => (
            <Card
              className="falcon-motion flex min-h-40 items-start justify-between gap-5 p-6 hover:-translate-y-1 hover:border-accent-500"
              key={category}
            >
              <div>
                <h3 className="text-2xl font-semibold text-dark-900">
                  {category}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {description}
                </p>
              </div>
              <ArrowUpLeft className="h-5 w-5 shrink-0 text-accent-500" strokeWidth={1.75} />
            </Card>
          ))}
        </div>
      </section>
    </PublicMarketplaceLayout>
  );
}
