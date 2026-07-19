import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button, Input } from "@/design-system/primitives";
import { getDashboardPathForRole, register, type AuthRole } from "@/services/authApi";
import { AuthShell } from "./LoginPage";

export function RegisterPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
    const role = String(formData.get("role") ?? "CUSTOMER") as AuthRole;

    if (password !== passwordConfirm) {
      setErrorMessage("كلمتا المرور غير متطابقتين.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await register({
        email,
        name,
        password,
        phone: phone || undefined,
        role,
        tenantId: "local-dev"
      });

      setSuccessMessage("تم إنشاء الحساب بنجاح.");
      navigate(getDashboardPathForRole(response.user.role), { replace: true });
    } catch {
      setErrorMessage("تعذر إنشاء الحساب. تحقق من البيانات أو جرّب بريدًا آخر.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Falcon Account"
      subtitle="ابدأ رحلتك مع Falcon بإنشاء حساب جديد"
      title="إنشاء حساب جديد"
    >
      <form
        className="grid gap-5"
        onSubmit={handleSubmit}
      >
        <Input
          autoComplete="name"
          label="الاسم الكامل"
          name="name"
          placeholder="اكتب اسمك الكامل"
          required
          type="text"
        />
        <Input
          autoComplete="email"
          label="البريد الإلكتروني"
          name="email"
          placeholder="example@email.com"
          required
          type="email"
        />
        <Input
          autoComplete="tel"
          label="رقم الهاتف (اختياري)"
          name="phone"
          placeholder="+966 5X XXX XXXX"
          type="tel"
        />
        <Input
          autoComplete="new-password"
          label="كلمة المرور"
          minLength={8}
          name="password"
          placeholder="أنشئ كلمة مرور"
          required
          type="password"
        />
        <Input
          autoComplete="new-password"
          label="تأكيد كلمة المرور"
          minLength={8}
          name="passwordConfirm"
          placeholder="أعد كتابة كلمة المرور"
          required
          type="password"
        />
        <label className="block space-y-2">
          <span className="text-sm font-medium text-dark-900">نوع الحساب</span>
          <select
            className="falcon-motion min-h-12 w-full rounded-2xl border border-border-subtle bg-white px-4 py-3 text-sm text-dark-900 outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
            defaultValue="CUSTOMER"
            name="role"
          >
            <option value="CUSTOMER">عميل</option>
            <option value="DEALER_OWNER">صاحب معرض</option>
          </select>
        </label>
        {errorMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        ) : null}
        {successMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {successMessage}
          </p>
        ) : null}
        <Button className="h-14 text-base disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit" variant="accent">
          <UserPlus className="h-5 w-5" strokeWidth={1.75} />
          {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm font-medium text-slate-500">
        لديك حساب بالفعل؟{" "}
        <Link className="font-semibold text-accent-500 transition hover:text-dark-900" to="/login">
          سجّل الدخول
        </Link>
      </p>
    </AuthShell>
  );
}
