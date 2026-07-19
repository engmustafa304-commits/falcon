import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card, ImageWithFallback } from "@/design-system/primitives";
import { getBackendCarImageSrc, type BackendCar } from "@/services/carsApi";
import { getCompareItems, removeCompareItem } from "@/services/savedCarsApi";
import { marketplaceCars } from "./marketplaceData";
import { MarketplaceHero } from "./MarketplaceComponents";
import { PublicMarketplaceLayout } from "./PublicMarketplaceLayout";

const comparisonRows = [
  ["الماركة", (car: BackendCar) => car.brand ?? "غير محدد"],
  ["الموديل", (car: BackendCar) => car.model ?? "غير محدد"],
  ["السنة", (car: BackendCar) => String(car.year ?? "غير محدد")],
  ["السعر", (car: BackendCar) => `${new Intl.NumberFormat("ar-SA").format(car.price ?? 0)} ريال`],
  ["الممشى", (car: BackendCar) => `${new Intl.NumberFormat("ar-SA").format(car.mileage ?? 0)} كم`],
  ["المدينة", (car: BackendCar) => car.city ?? "غير محدد"],
  ["الوقود", (car: BackendCar) => car.fuel ?? "غير محدد"],
  ["القير", (car: BackendCar) => car.transmission ?? "غير محدد"]
] as const;

export function ComparePage() {
  const [cars, setCars] = useState<BackendCar[]>([]);
  const [isFallback, setIsFallback] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshCompareItems() {
    const response = await getCompareItems();
    setCars(response);
    setIsFallback(false);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadCompareItems() {
      try {
        const response = await getCompareItems();

        if (isMounted) {
          setCars(response);
          setIsFallback(false);
        }
      } catch {
        if (isMounted) {
          setCars([]);
          setIsFallback(true);
          setError("تعذر تحميل المقارنة من API، لذلك يتم عرض بيانات تجريبية.");
        }
      }
    }

    void loadCompareItems();

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
      await removeCompareItem(carId);
      await refreshCompareItems();
      setMessage("تمت إزالة السيارة من المقارنة.");
    } catch {
      setError("تعذر إزالة السيارة من المقارنة.");
    }
  }

  const visibleCars = isFallback ? fallbackCompareCars() : cars;

  return (
    <PublicMarketplaceLayout>
      <MarketplaceHero
        subtitle="قارن المواصفات الأساسية بين السيارات المحفوظة للمقارنة."
        title="المقارنة"
      />
      <section className="px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Notice message={message} tone="success" />
          <Notice message={error} tone="warning" />
          {isFallback ? <Notice message="يتم عرض بيانات تجريبية لأن API غير متاح." /> : null}
          {!isFallback && visibleCars.length === 0 ? (
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-semibold text-dark-900">لا توجد سيارات للمقارنة بعد</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">أضف سيارات إلى المقارنة من بطاقات السيارات أو صفحة التفاصيل.</p>
            </Card>
          ) : (
            <Card className="overflow-x-auto p-4 md:p-6">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-right text-sm">
                <thead>
                  <tr>
                    <th className="sticky right-0 z-10 bg-white p-4 text-slate-500">المعيار</th>
                    {visibleCars.map((car, index) => (
                      <th className="p-4 align-top" key={car.id ?? `${car.name}-${index}`}>
                        <div className="w-56">
                          <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-section">
                            <ImageWithFallback
                              alt={car.name ?? "سيارة"}
                              className="h-full w-full object-cover"
                              src={getBackendCarImageSrc(car, index)}
                            />
                          </div>
                          <p className="mt-3 text-base font-semibold text-dark-900">{car.name ?? "سيارة Falcon"}</p>
                          {!isFallback ? (
                            <Button className="mt-3 h-10 px-3 text-xs" onClick={() => void handleRemove(car.id)} variant="secondary">
                              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                              إزالة
                            </Button>
                          ) : null}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map(([label, getValue]) => (
                    <tr key={label}>
                      <th className="sticky right-0 z-10 border-t border-border-subtle bg-white p-4 font-semibold text-dark-900">
                        {label}
                      </th>
                      {visibleCars.map((car, index) => (
                        <td className="border-t border-border-subtle p-4 font-medium text-slate-600" key={`${label}-${car.id ?? index}`}>
                          {getValue(car)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </section>
    </PublicMarketplaceLayout>
  );
}

function fallbackCompareCars(): BackendCar[] {
  return marketplaceCars.slice(0, 3).map((car, index) => ({
    brand: car.name.split(" ")[0] ?? "Falcon",
    city: car.city,
    fuel: index === 1 ? "هجين" : "بنزين",
    id: car.id ?? `fallback-${index}`,
    imageUrl: car.imageSrc,
    mileage: Number.parseInt(car.mileage.replace(/\D/g, ""), 10) || 0,
    model: car.model,
    name: car.name,
    price: Number.parseInt(car.price.replace(/\D/g, ""), 10) || 0,
    transmission: "أوتوماتيك",
    year: Number.parseInt(car.year, 10)
  }));
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
