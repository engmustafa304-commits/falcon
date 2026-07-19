import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card } from "@/design-system/primitives";
import { getFavorites, removeFavorite } from "@/services/savedCarsApi";
import { mapBackendCarToMarketplaceCar, type BackendCar } from "@/services/carsApi";
import { MarketplaceCarCard, MarketplaceHero } from "./MarketplaceComponents";
import { marketplaceCars } from "./marketplaceData";
import { PublicMarketplaceLayout } from "./PublicMarketplaceLayout";

export function FavoritesPage() {
  const [cars, setCars] = useState<BackendCar[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshFavorites() {
    const response = await getFavorites();
    setCars(response);
    setIsFallback(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadFavorites() {
      try {
        const response = await getFavorites();

        if (isMounted) {
          setCars(response);
          setIsFallback(false);
        }
      } catch {
        if (isMounted) {
          setCars([]);
          setIsFallback(true);
          setError("تعذر تحميل المفضلة من API، لذلك يتم عرض بيانات تجريبية.");
        }
      }
    }

    void loadFavorites();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleRemove(carId?: string) {
    if (!carId) {
      return;
    }

    setMessage(null);
    setError(null);

    try {
      await removeFavorite(carId);
      await refreshFavorites();
      setMessage("تمت إزالة السيارة من المفضلة.");
    } catch {
      setError("تعذر إزالة السيارة من المفضلة.");
    }
  }

  const visibleCars = isFallback ? marketplaceCars : cars.map(mapBackendCarToMarketplaceCar);

  return (
    <PublicMarketplaceLayout>
      <MarketplaceHero
        subtitle="السيارات التي حفظتها للعودة إليها لاحقًا."
        title="المفضلة"
      />
      <section className="px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Notice message={message} tone="success" />
          <Notice message={error} tone="warning" />
          {isFallback ? <Notice message="يتم عرض بيانات تجريبية لأن API غير متاح." /> : null}
          {!isFallback && cars.length === 0 ? (
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-dark-900">لا توجد سيارات محفوظة بعد</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">أضف سيارات إلى المفضلة من صفحة السيارات أو صفحة التفاصيل.</p>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleCars.map((car, index) => (
                <div className="grid gap-3" key={car.id ?? car.name}>
                  <MarketplaceCarCard car={car} />
                  {!isFallback ? (
                    <Button className="w-full" onClick={() => void handleRemove(cars[index]?.id)} variant="secondary">
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      إزالة من المفضلة
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicMarketplaceLayout>
  );
}

function Notice({
  message,
  tone = "info"
}: {
  message?: string | null;
  tone?: "info" | "success" | "warning";
}) {
  if (!message) {
    return null;
  }

  const className =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-accent-500/20 bg-accent-500/10 text-dark-900";

  return <p className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${className}`}>{message}</p>;
}
