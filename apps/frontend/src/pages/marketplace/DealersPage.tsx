import { useEffect, useState } from "react";
import { Seo } from "@/components/seo/Seo";
import { getDealers, mapBackendDealerToFrontendDealer, type FrontendDealer } from "@/services/dealersApi";
import { DealerCard, MarketplaceHero } from "./MarketplaceComponents";
import { PublicMarketplaceLayout } from "./PublicMarketplaceLayout";
import { marketplaceDealers } from "./marketplaceData";

export function DealersPage() {
  const [dealers, setDealers] = useState<FrontendDealer[]>([...marketplaceDealers]);
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
          setDealers([...marketplaceDealers]);
          setIsFallback(true);
          return;
        }

        setDealers(apiDealers.map(mapBackendDealerToFrontendDealer));
        setIsFallback(false);
      } catch {
        if (isMounted) {
          setDealers([...marketplaceDealers]);
          setIsFallback(false);
          setLoadError("تعذر الاتصال بواجهة Falcon API، لذلك يتم عرض بيانات تجريبية مؤقتاً.");
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
          {loadError ? <DataNotice message={loadError} tone="warning" /> : null}
          {isFallback ? (
            <DataNotice message="يتم عرض بيانات تجريبية لأن قاعدة البيانات فارغة." />
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
