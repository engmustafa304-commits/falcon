import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ManageCars } from "@/pages/dashboard/ManageCars";
import { CarDetailsPage } from "@/pages/marketplace/CarDetailsPage";
import { ComparePage } from "@/pages/marketplace/ComparePage";
import { FavoritesPage } from "@/pages/marketplace/FavoritesPage";

const mockCar = {
  brand: "Lexus",
  city: "الرياض",
  dealer: {
    id: "dealer-1",
    isVerified: true,
    name: "معرض فالكون"
  },
  dealerId: "dealer-1",
  fuel: "بنزين",
  id: "car-1",
  imageUrl: "/images/cars/car-01.webp",
  mileage: 12000,
  model: "LX600",
  name: "Lexus LX600",
  price: 485000,
  transmission: "أوتوماتيك",
  year: 2025
};

const serviceMocks = vi.hoisted(() => ({
  createFinanceRequest: vi.fn(),
  createLead: vi.fn(),
  getCar: vi.fn(),
  getCarImages: vi.fn(),
  getCars: vi.fn(),
  getCompareItems: vi.fn(),
  getFavorites: vi.fn(),
  getMyDealer: vi.fn(),
  getMyDealerCars: vi.fn(),
  updateCar: vi.fn()
}));

vi.mock("@/services/carsApi", () => ({
  createCar: vi.fn(),
  createCarImage: vi.fn(),
  deleteCar: vi.fn(),
  deleteCarImage: vi.fn(),
  getBackendCarImageSrc: (car: typeof mockCar) => car.imageUrl ?? "/images/cars/car-01.webp",
  getCar: serviceMocks.getCar,
  getCarImages: serviceMocks.getCarImages,
  getCars: serviceMocks.getCars,
  getMyDealerCars: serviceMocks.getMyDealerCars,
  mapBackendCarToMarketplaceCar: (car: typeof mockCar) => ({
    badge: "معرض موثق",
    brandSlug: "lexus",
    categorySlug: "suv",
    city: car.city,
    falconScore: "9.2",
    id: car.id,
    imageSrc: car.imageUrl,
    mileage: `${car.mileage} كم`,
    model: car.model,
    name: car.name,
    price: `${car.price} ريال`,
    year: String(car.year)
  }),
  setMainCarImage: vi.fn(),
  updateCar: serviceMocks.updateCar
}));

vi.mock("@/services/dealersApi", () => ({
  getMyDealer: serviceMocks.getMyDealer
}));

vi.mock("@/services/uploadsApi", () => ({
  uploadCarImage: vi.fn(),
  uploadCarImageAsset: vi.fn()
}));

vi.mock("@/services/savedCarsApi", () => ({
  addCompareItem: vi.fn(),
  addFavorite: vi.fn(),
  getCompareItems: serviceMocks.getCompareItems,
  getFavorites: serviceMocks.getFavorites,
  removeCompareItem: vi.fn(),
  removeFavorite: vi.fn()
}));

vi.mock("@/services/leadsApi", () => ({
  createLead: serviceMocks.createLead
}));

vi.mock("@/services/financeRequestsApi", () => ({
  createFinanceRequest: serviceMocks.createFinanceRequest
}));

describe("Falcon page states", () => {
  beforeEach(() => {
    serviceMocks.getCars.mockResolvedValue([mockCar]);
    serviceMocks.getMyDealerCars.mockResolvedValue([mockCar]);
    serviceMocks.getCar.mockResolvedValue(mockCar);
    serviceMocks.getCarImages.mockResolvedValue([]);
    serviceMocks.updateCar.mockResolvedValue(mockCar);
    serviceMocks.getMyDealer.mockResolvedValue({ city: "الرياض", id: "dealer-1", name: "معرض فالكون" });
    serviceMocks.getFavorites.mockResolvedValue([mockCar]);
    serviceMocks.getCompareItems.mockResolvedValue([mockCar]);
    serviceMocks.createLead.mockResolvedValue({ id: "lead-1" });
    serviceMocks.createFinanceRequest.mockResolvedValue({ id: "finance-1" });
  });

  it("loads selected car data into ManageCars edit mode", async () => {
    render(<ManageCars />);

    await screen.findByText("Lexus LX600");
    fireEvent.click(screen.getByRole("button", { name: /تعديل/ }));

    await waitFor(() => {
      expect(screen.getByDisplayValue("485000")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "حفظ التعديلات" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "إلغاء التعديل" })).toBeInTheDocument();
  });

  it("renders saved cars on the favorites page", async () => {
    render(
      <MemoryRouter>
        <FavoritesPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Lexus LX600")).toBeInTheDocument();
  });

  it("renders comparison table rows", async () => {
    render(
      <MemoryRouter>
        <ComparePage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Lexus LX600")).toBeInTheDocument();
    expect(screen.getByText("الماركة")).toBeInTheDocument();
    expect(screen.getByText("القير")).toBeInTheDocument();
  });

  it("shows lead form success state", async () => {
    renderCarDetailsPage();

    const leadForm = screen.getByRole("heading", { name: "طلب تواصل" }).closest("form");
    expect(leadForm).not.toBeNull();

    fireEvent.change(within(leadForm as HTMLFormElement).getByPlaceholderText("الاسم"), { target: { value: "عميل مهتم" } });
    fireEvent.change(within(leadForm as HTMLFormElement).getByPlaceholderText("رقم الهاتف"), { target: { value: "966500000000" } });
    fireEvent.submit(leadForm as HTMLFormElement);

    await waitFor(() => {
      expect(serviceMocks.createLead).toHaveBeenCalled();
    });
    expect(await screen.findByText("تم إرسال طلب التواصل بنجاح.")).toBeInTheDocument();
  });

  it("shows finance form success state", async () => {
    renderCarDetailsPage();

    const financeForm = screen.getByRole("heading", { name: "طلب تمويل" }).closest("form");
    expect(financeForm).not.toBeNull();

    fireEvent.change(within(financeForm as HTMLFormElement).getByPlaceholderText("الاسم"), { target: { value: "عميل تمويل" } });
    fireEvent.change(within(financeForm as HTMLFormElement).getByPlaceholderText("رقم الهاتف"), { target: { value: "966511111111" } });
    fireEvent.submit(financeForm as HTMLFormElement);

    await waitFor(() => {
      expect(serviceMocks.createFinanceRequest).toHaveBeenCalled();
    });
    expect(await screen.findByText("تم إرسال طلب التمويل بنجاح.")).toBeInTheDocument();
  });
});

function renderCarDetailsPage() {
  render(
    <MemoryRouter initialEntries={["/cars/car-1"]}>
      <Routes>
        <Route element={<CarDetailsPage />} path="/cars/:id" />
      </Routes>
    </MemoryRouter>
  );
}
