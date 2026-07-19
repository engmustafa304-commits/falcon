import { ChevronDown, Loader2, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";
import { Button, Card } from "@/design-system/primitives";
import { getCarsResult, mapBackendCarToMarketplaceCar, type CarSearchParams, type CarSearchSort } from "@/services/carsApi";
import { MarketplaceCarCard, MarketplaceHero } from "./MarketplaceComponents";
import { PublicMarketplaceLayout } from "./PublicMarketplaceLayout";
import { marketplaceCars, type MarketplaceCar } from "./marketplaceData";

const sectionEntrance: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }
};

const gridStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } }
};

const gridItem: Variants = {
  hidden: { filter: "blur(6px)", opacity: 0, y: 18 },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

const gridItemReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const DEFAULT_PAGE_SIZE = 9;

const sortOptions: { label: string; value: CarSearchSort }[] = [
  { label: "الأحدث", value: "newest" },
  { label: "السعر من الأقل", value: "price_asc" },
  { label: "السعر من الأعلى", value: "price_desc" },
  { label: "الأقل ممشى", value: "mileage_asc" },
  { label: "الأحدث سنة", value: "year_desc" }
];

const statusOptions = [
  { label: "كل الحالات", value: "" },
  { label: "نشط", value: "ACTIVE" },
  { label: "مسودة", value: "DRAFT" },
  { label: "موقوف", value: "SUSPENDED" },
  { label: "مباع", value: "SOLD" }
] as const;

type FilterFormState = {
  brand: string;
  city: string;
  fuel: string;
  mileageMax: string;
  model: string;
  priceMax: string;
  priceMin: string;
  q: string;
  status: string;
  transmission: string;
  yearMax: string;
  yearMin: string;
};

export function CarsPage() {
  const prefersReducedMotion = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState<MarketplaceCar[]>(marketplaceCars);
  const [isFallback, setIsFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [total, setTotal] = useState(marketplaceCars.length);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<FilterFormState>(() => getFiltersFromSearchParams(searchParams));
  const activeSort = getSortFromSearchParams(searchParams);

  useEffect(() => {
    let isMounted = true;

    async function loadCars() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const query = getCarSearchParams(searchParams);
        const result = await getCarsResult(query);

        if (!isMounted) {
          return;
        }

        setCars(result.data.map(mapBackendCarToMarketplaceCar));
        setTotal(result.total);
        setPage(result.page);
        setPageSize(result.pageSize);
        setFilters(getFiltersFromSearchParams(searchParams));
        setIsFallback(false);
      } catch {
        if (isMounted) {
          setCars(marketplaceCars);
          setTotal(marketplaceCars.length);
          setPage(1);
          setPageSize(DEFAULT_PAGE_SIZE);
          setIsFallback(false);
          setLoadError("تعذر الاتصال بواجهة Falcon API، لذلك يتم عرض بيانات تجريبية مؤقتاً.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCars();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  function handleFilterChange(key: keyof FilterFormState, value: string) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value
    }));
  }

  function handleApplyFilters() {
    const nextParams = buildSearchParamsFromFilters(filters, activeSort, 1);
    setSearchParams(nextParams);
  }

  function handleClearFilters() {
    setSearchParams(new URLSearchParams());
  }

  function handleSortChange(value: CarSearchSort) {
    const nextParams = buildSearchParamsFromFilters(filters, value, 1);
    setSearchParams(nextParams);
  }

  function handlePageChange(nextPage: number) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    nextParams.set("pageSize", String(pageSize));
    setSearchParams(nextParams);
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginationPages = buildPaginationPages(page, totalPages);

  return (
    <PublicMarketplaceLayout>
      <Seo
        canonical="/cars"
        description="تصفح السيارات الجديدة والمستعملة من Falcon والمعارض المعتمدة مع فلاتر البحث حسب الماركة، المدينة، السعر، السنة، والممشى."
        image={cars[0]?.imageSrc ?? "/images/hero/hero-background.webp"}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "description": "قائمة سيارات Falcon المتاحة للبيع.",
          "inLanguage": "ar-SA",
          "name": "تصفح السيارات",
          "url": "/cars"
        }}
        title="تصفح السيارات"
      />
      <MarketplaceHero
        subtitle="اكتشف السيارات الجديدة والمستعملة من Falcon والمعارض المعتمدة."
        title="تصفح السيارات"
      />
      <motion.section
        animate="visible"
        className="px-5 py-10 sm:px-8 lg:px-10"
        initial={prefersReducedMotion ? undefined : "hidden"}
        variants={sectionEntrance}
      >
        <div className="mx-auto max-w-7xl">
          <Card className="p-4 md:p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,minmax(0,0.78fr))]">
              <label className="flex h-12 items-center gap-3 rounded-2xl border border-border-subtle bg-section px-4 sm:col-span-2 lg:col-span-1">
                <Search className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-dark-900 outline-none placeholder:text-slate-400"
                  onChange={(event) => handleFilterChange("q", event.currentTarget.value)}
                  placeholder="ابحث عن سيارة، معرض، أو موديل"
                  value={filters.q}
                  type="search"
                />
              </label>
              <FilterInput label="الماركة" onChange={(value) => handleFilterChange("brand", value)} value={filters.brand} />
              <FilterInput label="الموديل" onChange={(value) => handleFilterChange("model", value)} value={filters.model} />
              <FilterInput label="المدينة" onChange={(value) => handleFilterChange("city", value)} value={filters.city} />
              <FilterSelect label="الحالة" onChange={(value) => handleFilterChange("status", value)} options={statusOptions} value={filters.status} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <FilterInput label="سنة من" onChange={(value) => handleFilterChange("yearMin", value)} type="number" value={filters.yearMin} />
              <FilterInput label="سنة إلى" onChange={(value) => handleFilterChange("yearMax", value)} type="number" value={filters.yearMax} />
              <FilterInput label="سعر من" onChange={(value) => handleFilterChange("priceMin", value)} type="number" value={filters.priceMin} />
              <FilterInput label="سعر إلى" onChange={(value) => handleFilterChange("priceMax", value)} type="number" value={filters.priceMax} />
              <FilterInput label="أقصى ممشى" onChange={(value) => handleFilterChange("mileageMax", value)} type="number" value={filters.mileageMax} />
              <FilterInput label="الوقود" onChange={(value) => handleFilterChange("fuel", value)} value={filters.fuel} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto]">
              <FilterInput label="القير" onChange={(value) => handleFilterChange("transmission", value)} value={filters.transmission} />
              <Button className="w-full lg:w-auto" onClick={handleApplyFilters} variant="accent">
                تطبيق الفلاتر
              </Button>
              <Button className="w-full lg:w-auto" onClick={handleClearFilters} variant="secondary">
                مسح الفلاتر
              </Button>
            </div>
          </Card>

          <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                {isFallback ? cars.length : total} سيارات متاحة
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-dark-900">
                نتائج السيارات
              </h2>
            </div>
            <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-[auto_minmax(180px,1fr)]">
              <Button className="w-full" onClick={handleApplyFilters} variant="secondary">
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
                تحديث النتائج
              </Button>
              <label className="flex h-12 items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-semibold text-slate-600 shadow-subtle">
                <select
                  className="min-w-0 flex-1 bg-transparent outline-none"
                  onChange={(event) => handleSortChange(event.currentTarget.value as CarSearchSort)}
                  value={activeSort}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
              </label>
            </div>
          </div>

          {isLoading ? (
            <DataNotice className="mt-6" message="جاري تحميل بيانات السيارات..." tone="loading" />
          ) : null}
          {loadError ? <DataNotice className="mt-6" message={loadError} tone="warning" /> : null}
          {isFallback ? (
            <DataNotice
              className="mt-6"
              message="يتم عرض بيانات تجريبية لأن قاعدة البيانات فارغة."
            />
          ) : null}

          <motion.div
            animate="visible"
            className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            initial={prefersReducedMotion ? undefined : "hidden"}
            variants={gridStagger}
          >
            {cars.map((car) => (
              <motion.div key={car.name} variants={prefersReducedMotion ? gridItemReduced : gridItem}>
                <MarketplaceCarCard car={car} />
              </motion.div>
            ))}
          </motion.div>

          {!isLoading && !isFallback && cars.length === 0 ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-[2rem] border border-dashed border-border-subtle bg-white p-10 text-center"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-section text-slate-400">
                <SearchX className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-dark-900">لا توجد نتائج مطابقة</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-slate-500">
                جرّب تغيير كلمات البحث أو توسيع نطاق السعر والسنة.
              </p>
              <Button className="mt-6" onClick={handleClearFilters} variant="secondary">
                مسح الفلاتر
              </Button>
            </motion.div>
          ) : null}

          {!isFallback && totalPages > 1 ? (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {paginationPages.map((paginationPage) => (
              <button
                className={`h-11 w-11 rounded-2xl border text-sm font-semibold shadow-subtle ${
                  paginationPage === page
                    ? "border-accent-500 bg-accent-500 text-white"
                    : "border-border-subtle bg-white text-dark-900"
                }`}
                key={paginationPage}
                onClick={() => handlePageChange(paginationPage)}
                type="button"
              >
                {paginationPage}
              </button>
              ))}
            </div>
          ) : null}
        </div>
      </motion.section>
    </PublicMarketplaceLayout>
  );
}

function FilterInput({
  label,
  onChange,
  type = "text",
  value
}: {
  label: string;
  onChange: (value: string) => void;
  type?: "number" | "text";
  value: string;
}) {
  return (
    <label className="flex h-12 items-center rounded-2xl border border-border-subtle bg-white px-4">
      <input
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-dark-900 outline-none placeholder:text-slate-400"
        min={type === "number" ? 0 : undefined}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={label}
        type={type}
        value={value}
      />
    </label>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: readonly { label: string; value: string }[];
  value: string;
}) {
  return (
    <label className="flex h-12 items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-white px-4 text-sm font-semibold text-slate-600">
      <select
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent outline-none"
        onChange={(event) => onChange(event.currentTarget.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value || "all"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
    </label>
  );
}

function getFiltersFromSearchParams(searchParams: URLSearchParams): FilterFormState {
  return {
    brand: searchParams.get("brand") ?? "",
    city: searchParams.get("city") ?? "",
    fuel: searchParams.get("fuel") ?? "",
    mileageMax: searchParams.get("mileageMax") ?? "",
    model: searchParams.get("model") ?? "",
    priceMax: searchParams.get("priceMax") ?? "",
    priceMin: searchParams.get("priceMin") ?? "",
    q: searchParams.get("q") ?? "",
    status: searchParams.get("status") ?? "",
    transmission: searchParams.get("transmission") ?? "",
    yearMax: searchParams.get("yearMax") ?? "",
    yearMin: searchParams.get("yearMin") ?? ""
  };
}

function getCarSearchParams(searchParams: URLSearchParams): CarSearchParams {
  return {
    brand: getOptionalString(searchParams, "brand"),
    city: getOptionalString(searchParams, "city"),
    fuel: getOptionalString(searchParams, "fuel"),
    mileageMax: getOptionalNumber(searchParams, "mileageMax"),
    model: getOptionalString(searchParams, "model"),
    page: getOptionalNumber(searchParams, "page") ?? 1,
    pageSize: getOptionalNumber(searchParams, "pageSize") ?? DEFAULT_PAGE_SIZE,
    priceMax: getOptionalNumber(searchParams, "priceMax"),
    priceMin: getOptionalNumber(searchParams, "priceMin"),
    q: getOptionalString(searchParams, "q"),
    sort: getSortFromSearchParams(searchParams),
    status: getOptionalString(searchParams, "status") as CarSearchParams["status"],
    transmission: getOptionalString(searchParams, "transmission"),
    yearMax: getOptionalNumber(searchParams, "yearMax"),
    yearMin: getOptionalNumber(searchParams, "yearMin")
  };
}

function buildSearchParamsFromFilters(filters: FilterFormState, sort: CarSearchSort, page: number) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value.trim()) {
      searchParams.set(key, value.trim());
    }
  }

  if (sort !== "newest") {
    searchParams.set("sort", sort);
  }

  searchParams.set("page", String(page));
  searchParams.set("pageSize", String(DEFAULT_PAGE_SIZE));
  return searchParams;
}

function getSortFromSearchParams(searchParams: URLSearchParams): CarSearchSort {
  const sort = searchParams.get("sort");
  return sortOptions.some((option) => option.value === sort) ? sort as CarSearchSort : "newest";
}

function getOptionalString(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key)?.trim();
  return value ? value : undefined;
}

function getOptionalNumber(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);

  if (!value) {
    return undefined;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
}

function buildPaginationPages(page: number, totalPages: number) {
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function DataNotice({
  className = "",
  message,
  tone = "info"
}: {
  className?: string;
  message: string;
  tone?: "info" | "loading" | "warning";
}) {
  return (
    <div
      className={`${className} flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold ${
        tone === "warning"
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-accent-500/20 bg-accent-500/10 text-dark-900"
      }`}
    >
      {tone === "loading" ? (
        <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin text-accent-500" strokeWidth={2} />
      ) : null}
      {message}
    </div>
  );
}
