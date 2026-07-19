import { Bell, Car, Heart, LogOut, Scale, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/design-system/brand";
import { Badge, Button, Card, ImageWithFallback } from "@/design-system/primitives";
import { getBackendCarImageSrc, type BackendCar } from "@/services/carsApi";
import { getMyFinanceRequests, type FinanceRequest } from "@/services/financeRequestsApi";
import { getMyLeads, type Lead } from "@/services/leadsApi";
import { getNotifications, type AppNotification } from "@/services/notificationsApi";
import { getCompareItems, getFavorites } from "@/services/savedCarsApi";
import { getStoredUser, logout } from "@/services/authApi";

type AccountData = {
  compare: BackendCar[];
  favorites: BackendCar[];
  financeRequests: FinanceRequest[];
  leads: Lead[];
  notifications: AppNotification[];
};

const emptyData: AccountData = {
  compare: [],
  favorites: [],
  financeRequests: [],
  leads: [],
  notifications: []
};

export function AccountPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [data, setData] = useState<AccountData>(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAccount() {
      setIsLoading(true);
      setError(null);

      try {
        const [favorites, compare, leads, financeRequests, notifications] = await Promise.all([
          getFavorites(),
          getCompareItems(),
          getMyLeads(),
          getMyFinanceRequests(),
          getNotifications()
        ]);

        if (isMounted) {
          setData({
            compare,
            favorites,
            financeRequests,
            leads,
            notifications
          });
        }
      } catch {
        if (isMounted) {
          setError("تعذر تحميل بيانات الحساب. تأكد من تسجيل الدخول وتشغيل API.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <main className="min-h-screen bg-section px-5 py-6 text-dark-900 sm:px-8" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-border-subtle bg-white p-5 shadow-subtle md:flex-row md:items-center md:justify-between">
          <Link to="/">
            <Logo language="ar" />
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            <Link className="hover:text-dark-900" to="/cars">السيارات</Link>
            <Link className="hover:text-dark-900" to="/favorites">المفضلة</Link>
            <Link className="hover:text-dark-900" to="/compare">المقارنة</Link>
          </nav>
          <Button onClick={handleLogout} variant="secondary">
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            تسجيل الخروج
          </Button>
        </header>

        <section className="py-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-accent-500">Falcon Account</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-dark-900 md:text-4xl">حسابي</h1>
            <p className="mt-3 text-base leading-8 text-slate-600">تابع مفضلتك، المقارنة، طلبات التواصل والتمويل من مكان واحد.</p>
          </div>

          {error ? (
            <p className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              {error}
            </p>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
            <Card className="p-6">
              <UserRound className="h-8 w-8 text-accent-500" strokeWidth={1.75} />
              <h2 className="mt-4 text-2xl font-semibold text-dark-900">{user?.name ?? "مستخدم Falcon"}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">{user?.email}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge tone="accent">{user?.role ?? "CUSTOMER"}</Badge>
                <Badge tone="neutral">{user?.tenantId ?? "local-dev"}</Badge>
              </div>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={Heart} label="المفضلة" value={data.favorites.length} />
              <Metric icon={Scale} label="المقارنة" value={data.compare.length} />
              <Metric icon={Car} label="طلبات التواصل" value={data.leads.length} />
              <Metric icon={Bell} label="الإشعارات" value={data.notifications.filter((item) => !item.isRead).length} />
            </div>
          </div>
        </section>

        {isLoading ? (
          <Card className="p-6 text-center text-sm font-semibold text-slate-600">جاري تحميل بيانات الحساب...</Card>
        ) : (
          <div className="grid gap-6 pb-10">
            <CarStrip cars={data.favorites} title="السيارات المفضلة" />
            <CarStrip cars={data.compare} title="سيارات المقارنة" />
            <RequestsList leads={data.leads} />
            <FinanceList requests={data.financeRequests} />
            <NotificationsList notifications={data.notifications} />
          </div>
        )}
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: number }) {
  return (
    <Card className="p-5">
      <Icon className="h-6 w-6 text-accent-500" strokeWidth={1.75} />
      <p className="mt-4 text-3xl font-semibold text-dark-900">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
    </Card>
  );
}

function CarStrip({ cars, title }: { cars: BackendCar[]; title: string }) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-dark-900">{title}</h2>
        <Link className="text-sm font-semibold text-accent-500 hover:text-dark-900" to={title.includes("المقارنة") ? "/compare" : "/favorites"}>
          عرض الكل
        </Link>
      </div>
      {cars.length === 0 ? (
        <p className="text-sm leading-7 text-slate-500">لا توجد عناصر بعد.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {cars.slice(0, 3).map((car, index) => (
            <Link className="rounded-3xl border border-border-subtle p-3 transition hover:border-accent-500/40" key={car.id} to={`/cars/${car.id}`}>
              <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-section">
                <ImageWithFallback alt={car.name ?? "سيارة"} className="h-full w-full object-cover" src={getBackendCarImageSrc(car, index)} />
              </div>
              <p className="mt-3 text-sm font-semibold text-dark-900">{car.name ?? "سيارة Falcon"}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{car.city ?? "غير محدد"}</p>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

function RequestsList({ leads }: { leads: Lead[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-dark-900">طلبات التواصل</h2>
      <ListEmpty visible={leads.length === 0} />
      <div className="mt-4 grid gap-3">
        {leads.map((lead) => (
          <StatusRow key={lead.id} label={lead.car?.name ?? lead.dealer?.name ?? "طلب عام"} meta={lead.createdAt?.slice(0, 10)} status={lead.status} />
        ))}
      </div>
    </Card>
  );
}

function FinanceList({ requests }: { requests: FinanceRequest[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-dark-900">طلبات التمويل</h2>
      <ListEmpty visible={requests.length === 0} />
      <div className="mt-4 grid gap-3">
        {requests.map((request) => (
          <StatusRow key={request.id} label={request.car?.name ?? request.dealer?.name ?? "طلب تمويل"} meta={request.createdAt?.slice(0, 10)} status={request.status} />
        ))}
      </div>
    </Card>
  );
}

function NotificationsList({ notifications }: { notifications: AppNotification[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-dark-900">الإشعارات</h2>
      <ListEmpty visible={notifications.length === 0} />
      <div className="mt-4 grid gap-3">
        {notifications.slice(0, 6).map((notification) => (
          <StatusRow key={notification.id} label={notification.title} meta={notification.message} status={notification.isRead ? "مقروء" : "جديد"} />
        ))}
      </div>
    </Card>
  );
}

function StatusRow({ label, meta, status }: { label: string; meta?: string; status: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border-subtle bg-section p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-dark-900">{label}</p>
        {meta ? <p className="mt-1 text-xs font-medium text-slate-500">{meta}</p> : null}
      </div>
      <Badge tone="neutral">{status}</Badge>
    </div>
  );
}

function ListEmpty({ visible }: { visible: boolean }) {
  return visible ? <p className="mt-3 text-sm leading-7 text-slate-500">لا توجد بيانات حتى الآن.</p> : null;
}
