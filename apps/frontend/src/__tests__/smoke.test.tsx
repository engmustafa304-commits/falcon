import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { CarImageCard } from "@/design-system/primitives";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";

vi.mock("@/services/notificationsApi", () => ({
  deleteNotification: vi.fn(),
  getNotifications: vi.fn(() => Promise.resolve([])),
  markAllNotificationsRead: vi.fn(() => Promise.resolve([])),
  markNotificationRead: vi.fn()
}));

describe("Falcon frontend smoke tests", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the login page", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "تسجيل الدخول" })).toBeInTheDocument();
    expect(screen.getByLabelText("البريد الإلكتروني")).toBeInTheDocument();
    expect(screen.getByLabelText("كلمة المرور")).toBeInTheDocument();
  });

  it("renders the register page", () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "إنشاء حساب جديد" })).toBeInTheDocument();
    expect(screen.getByLabelText("الاسم الكامل")).toBeInTheDocument();
    expect(screen.getByLabelText("نوع الحساب")).toBeInTheDocument();
  });

  it("renders a car image card", () => {
    render(
      <MemoryRouter>
        <CarImageCard
          badge="معرض موثق"
          city="جدة"
          imageSrc="/images/cars/car-01.webp"
          name="Lexus LX600 2024"
          price="485,000 ريال"
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("article")).toBeInTheDocument();
    expect(screen.getByText("Lexus LX600 2024")).toBeInTheDocument();
    expect(screen.getByText(/جدة/)).toBeInTheDocument();
    expect(screen.getByText("معرض موثق")).toBeInTheDocument();
  });

  it("renders the notification center", async () => {
    render(<NotificationCenter />);

    expect(screen.getByRole("button", { name: "الإشعارات" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("تعذر تحميل الإشعارات.")).not.toBeInTheDocument();
    });
  });
});
