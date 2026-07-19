import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/home/HomePage";
import { ProtectedRoute } from "@/router/ProtectedRoute";

const DesignSystemPreview = lazy(() => import("@/design-system/preview/DesignSystemPreview").then((module) => ({ default: module.DesignSystemPreview })));
const AdminDashboardLayout = lazy(() => import("@/pages/admin/AdminDashboardLayout").then((module) => ({ default: module.AdminDashboardLayout })));
const AdminFinanceRequests = lazy(() => import("@/pages/admin/AdminFinanceRequests").then((module) => ({ default: module.AdminFinanceRequests })));
const AdminLeads = lazy(() => import("@/pages/admin/AdminLeads").then((module) => ({ default: module.AdminLeads })));
const AdminManageCars = lazy(() => import("@/pages/admin/AdminManageCars").then((module) => ({ default: module.AdminManageCars })));
const AdminOverview = lazy(() => import("@/pages/admin/AdminOverview").then((module) => ({ default: module.AdminOverview })));
const AdminReports = lazy(() => import("@/pages/admin/AdminReports").then((module) => ({ default: module.AdminReports })));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings").then((module) => ({ default: module.AdminSettings })));
const ManageBrands = lazy(() => import("@/pages/admin/ManageBrands").then((module) => ({ default: module.ManageBrands })));
const ManageCategories = lazy(() => import("@/pages/admin/ManageCategories").then((module) => ({ default: module.ManageCategories })));
const ManageDealers = lazy(() => import("@/pages/admin/ManageDealers").then((module) => ({ default: module.ManageDealers })));
const ManageUsers = lazy(() => import("@/pages/admin/ManageUsers").then((module) => ({ default: module.ManageUsers })));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const AccountPage = lazy(() => import("@/pages/account/AccountPage").then((module) => ({ default: module.AccountPage })));
const Customers = lazy(() => import("@/pages/dashboard/Customers").then((module) => ({ default: module.Customers })));
const DashboardHome = lazy(() => import("@/pages/dashboard/DashboardHome").then((module) => ({ default: module.DashboardHome })));
const DashboardLayout = lazy(() => import("@/pages/dashboard/DashboardLayout").then((module) => ({ default: module.DashboardLayout })));
const FinanceRequests = lazy(() => import("@/pages/dashboard/FinanceRequests").then((module) => ({ default: module.FinanceRequests })));
const Leads = lazy(() => import("@/pages/dashboard/Leads").then((module) => ({ default: module.Leads })));
const ManageCars = lazy(() => import("@/pages/dashboard/ManageCars").then((module) => ({ default: module.ManageCars })));
const Reports = lazy(() => import("@/pages/dashboard/Reports").then((module) => ({ default: module.Reports })));
const Settings = lazy(() => import("@/pages/dashboard/Settings").then((module) => ({ default: module.Settings })));
const BrandDetailsPage = lazy(() => import("@/pages/marketplace/BrandDetailsPage").then((module) => ({ default: module.BrandDetailsPage })));
const BrandsPage = lazy(() => import("@/pages/marketplace/BrandsPage").then((module) => ({ default: module.BrandsPage })));
const CarDetailsPage = lazy(() => import("@/pages/marketplace/CarDetailsPage").then((module) => ({ default: module.CarDetailsPage })));
const CarsPage = lazy(() => import("@/pages/marketplace/CarsPage").then((module) => ({ default: module.CarsPage })));
const CategoriesPage = lazy(() => import("@/pages/marketplace/CategoriesPage").then((module) => ({ default: module.CategoriesPage })));
const CategoryDetailsPage = lazy(() => import("@/pages/marketplace/CategoryDetailsPage").then((module) => ({ default: module.CategoryDetailsPage })));
const ComparePage = lazy(() => import("@/pages/marketplace/ComparePage").then((module) => ({ default: module.ComparePage })));
const DealerDetailsPage = lazy(() => import("@/pages/marketplace/DealerDetailsPage").then((module) => ({ default: module.DealerDetailsPage })));
const DealersPage = lazy(() => import("@/pages/marketplace/DealersPage").then((module) => ({ default: module.DealersPage })));
const FavoritesPage = lazy(() => import("@/pages/marketplace/FavoritesPage").then((module) => ({ default: module.FavoritesPage })));

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegisterPage />} path="/register" />
          <Route element={<CarsPage />} path="/cars" />
          <Route element={<CarDetailsPage />} path="/cars/:id" />
          <Route element={<DealersPage />} path="/dealers" />
          <Route element={<DealerDetailsPage />} path="/dealers/:id" />
          <Route element={<BrandsPage />} path="/brands" />
          <Route element={<BrandDetailsPage />} path="/brands/:slug" />
          <Route element={<CategoriesPage />} path="/categories" />
          <Route element={<CategoryDetailsPage />} path="/categories/:slug" />
          <Route element={<FavoritesPage />} path="/favorites" />
          <Route element={<ComparePage />} path="/compare" />
          <Route element={<DesignSystemPreview />} path="/design-system" />
          <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "DEALER_OWNER", "DEALER_MANAGER", "CUSTOMER"]} />}>
            <Route element={<AccountPage />} path="/account" />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN", "DEALER_OWNER", "DEALER_MANAGER"]} />}>
            <Route element={<Navigate replace to="/dealer/dashboard" />} path="/dashboard" />
            <Route element={<DashboardLayout />} path="/dealer/dashboard">
              <Route index element={<DashboardHome />} />
              <Route element={<ManageCars />} path="cars" />
              <Route element={<Leads />} path="leads" />
              <Route element={<FinanceRequests />} path="finance-requests" />
              <Route element={<Customers />} path="customers" />
              <Route element={<Reports />} path="reports" />
              <Route element={<Settings />} path="settings" />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
            <Route element={<AdminDashboardLayout />} path="/admin/dashboard">
              <Route index element={<AdminOverview />} />
              <Route element={<ManageDealers />} path="dealers" />
              <Route element={<AdminManageCars />} path="dealers/:dealerId/cars" />
              <Route element={<AdminManageCars />} path="cars" />
              <Route element={<AdminLeads />} path="leads" />
              <Route element={<AdminFinanceRequests />} path="finance-requests" />
              <Route element={<ManageUsers />} path="users" />
              <Route element={<ManageBrands />} path="brands" />
              <Route element={<ManageCategories />} path="categories" />
              <Route element={<AdminReports />} path="reports" />
              <Route element={<AdminSettings />} path="settings" />
            </Route>
          </Route>
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center" dir="rtl">
      <div className="rounded-3xl border border-border-subtle bg-white px-6 py-5 text-sm font-semibold text-body shadow-soft">
        جاري تحميل Falcon...
      </div>
    </div>
  );
}
