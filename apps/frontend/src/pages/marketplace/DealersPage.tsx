import { useEffect, useState } from "react";
import { Seo } from "@/components/seo/Seo";
import { ApiErrorNotice } from "@/components/state/ApiErrorNotice";
import { Card } from "@/design-system/primitives";
import { getDealers, mapBackendDealerToFrontendDealer, type FrontendDealer } from "@/services/dealersApi";
import { isDemoFallbackEnabled } from "@/utils/runtime";
import { DealerCard, MarketplaceHero } from "./MarketplaceComponents";
import { PublicMarketplaceLayout } from "./PublicMarketplaceLayout";
import { marketplaceDealers } from "./marketplaceData";

export function DealersPage() {
  const [dealers, setDealers] = useState<FrontendDealer[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDealers() {
      try {
        const apiDealers = await getDealers();

        if (!isMounted) {
          return;
        }

        if (apiDealers.length === 0) {
          setDealers(isDemoFallbackEnabled ? [...marketplaceDealers] : []);
          setIsFallback(isDemoFallbackEnabled);
          return;
        }

        setDealers(apiDealers.map(mapBackendDealerToFrontendDealer));
        setIsFallback(false);
      } catch {
        if (isMounted) {
          setDealers(isDemoFallbackEnabled ? [...marketplaceDealers] : []);
          setIsFallback(isDemoFallbackEnabled);
          setLoadError(
            isDemoFallbackEnabled
              ? "تعذر الاتصال بواجهة Falcon API، لذلك يتم عرض بيانات تجريبية مؤقتاً."
              : "تعذر تحميل بيانات المعارض. حاول تحديث الصفحة أو العودة لاحقاً."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDealers();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PublicMarketplaceLayout>
      <Seo
        canonical="/dealers"
        description="تصفح معارض السيارات المعتمدة في Falcon، شاهد المدن والتقييمات وعدد السيارات، وتواصل مباشرة مع المعرض المناسب."
        image={dealers[0]?.imageSrc ?? "/images/hero/hero-background.webp"}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "description": "دليل معارض السيارات المعتمدة على Falcon.",
          "inLanguage": "ar-SA",
          "name": "معارض السيارات",
          "url": "/dealers"
        }}
        title="معارض السيارات"
      />
      <MarketplaceHero
        subtitle="تصفح المعارض المعتمدة وتواصل مباشرة مع أصحاب المعارض."
        title="معارض السيارات"
      />
      <section className="px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {isLoading ? <DataNotice message="جاري تحميل بيانات المعارض..." /> : null}
          {loadError ? <ApiErrorNotice message={loadError} /> : null}
          {isFallback ? (
            <DataNotice message="يتم عرض بيانات تجريبية لأن قاعدة البيانات فارغة." />
          ) : null}
          {!isLoading && !isFallback && dealers.length === 0 ? (
            <Card className="mt-6 p-8 text-center">
              <h2 className="text-2xl font-semibold text-dark-900">لا توجد معارض منشورة حالياً</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">ستظهر المعارض المعتمدة هنا عند توفرها.</p>
            </Card>
          ) : null}
        </div>
        <div className="mx-auto mt-6 grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-4">
          {dealers.map((dealer) => (
            <DealerCard dealer={dealer} key={dealer.name} />
          ))}
        </div>
      </section>
    </PublicMarketplaceLayout>
  );
}

function DataNotice({
  message,
  tone = "info"
}: {
  message: string;
  tone?: "info" | "warning";
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
        tone === "warning"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-accent-500/20 bg-accent-500/10 text-dark-900"
      }`}
    >
      {message}
    </div>
  );
}
