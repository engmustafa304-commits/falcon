import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Logo } from "@/design-system/brand";
import { Button, Card, Input } from "@/design-system/primitives";
import { getDashboardPathForRole, login, type AuthRole } from "@/services/authApi";

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const response = await login({ email, password });
      const state = location.state as { from?: string } | null;
      const fallbackPath = getDashboardPathForRole(response.user.role);

      navigate(getAllowedRedirectPath(response.user.role, state?.from) ?? fallbackPath, { replace: true });
    } catch {
      setErrorMessage("تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Falcon Account"
      subtitle="أهلاً بك مرة أخرى، أدخل بياناتك للدخول"
      title="تسجيل الدخول"
    >
      <form
        className="grid gap-5"
        onSubmit={handleSubmit}
      >
        <Input
          autoComplete="username"
          label="البريد الإلكتروني"
          name="email"
          placeholder="example@email.com"
          required
          type="email"
        />
        <Input
          autoComplete="current-password"
          label="كلمة المرور"
          name="password"
          placeholder="أدخل كلمة المرور"
          required
          type="password"
        />
        {errorMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        ) : null}
        <div className="flex justify-end">
          <button
            className="text-sm font-semibold text-accent-500 transition hover:text-dark-900"
            onClick={() => setErrorMessage("استعادة كلمة المرور غير مفعلة بعد. تواصل مع الدعم لتحديث كلمة المرور.")}
            type="button"
          >
            نسيت كلمة المرور؟
          </button>
        </div>
        <Button className="h-14 text-base disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit" variant="accent">
          <LockKeyhole className="h-5 w-5" strokeWidth={1.75} />
          {isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm font-medium text-slate-500">
        ليس لديك حساب؟{" "}
        <Link className="font-semibold text-accent-500 transition hover:text-dark-900" to="/register">
          سجّل الآن
        </Link>
      </p>
    </AuthShell>
  );
}

function getAllowedRedirectPath(role: AuthRole, from?: string) {
  if (!from) {
    return null;
  }

  if (from.startsWith("/admin/dashboard")) {
    return role === "SUPER_ADMIN" || role === "ADMIN" ? from : null;
  }

  if (from.startsWith("/dealer/dashboard") || from === "/dashboard") {
    return role === "SUPER_ADMIN" || role === "ADMIN" || role === "DEALER_OWNER" || role === "DEALER_MANAGER"
      ? from
      : null;
  }

  return from;
}

export function AuthShell({
  children,
  eyebrow,
  subtitle,
  title
}: {
  children: ReactNode;
  eyebrow: string;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="min-h-screen bg-section px-5 py-8 text-dark-900 sm:px-8" dir="rtl">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <aside className="hidden rounded-[2rem] bg-dark-900 p-10 text-white shadow-elevated lg:block">
            <Logo className="text-white" language="ar" />
            <h2 className="mt-10 text-4xl font-semibold leading-tight">
              منصة واحدة للسيارات والمعارض وخدمات Falcon.
            </h2>
            <p className="mt-5 max-w-md text-base leading-8 text-white/68">
              تجربة دخول هادئة وآمنة تجهز المستخدم للوصول إلى خدمات السوق أو لوحة المعرض لاحقًا.
            </p>
            <div className="mt-10 grid gap-3">
              {["بيانات محمية", "تجربة عربية أولاً", "جاهز للمعارض والعملاء"].map((item) => (
                <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/8 p-4" key={item}>
                  <ShieldCheck className="h-5 w-5 text-accent-500" strokeWidth={1.75} />
                  <span className="text-sm font-semibold text-white/82">{item}</span>
                </div>
              ))}
            </div>
          </aside>

          <Card className="mx-auto w-full max-w-xl p-6 shadow-soft md:p-8">
            <div className="mb-8 text-right">
              <div className="mb-8 flex justify-center lg:hidden">
                <Logo language="ar" />
              </div>
              <p className="text-sm font-semibold text-accent-500">{eyebrow}</p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight text-dark-900 md:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-base leading-8 text-slate-600">{subtitle}</p>
            </div>
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
}
