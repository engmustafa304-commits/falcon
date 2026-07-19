import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "@/router/ProtectedRoute";
import type { AuthRole, AuthUser } from "@/services/authApi";

let storedToken: string | null = null;
let storedUser: AuthUser | null = null;

vi.mock("@/services/authApi", async () => {
  const actual = await vi.importActual<typeof import("@/services/authApi")>("@/services/authApi");

  return {
    ...actual,
    getStoredToken: () => storedToken,
    getStoredUser: () => storedUser
  };
});

describe("Protected route guards", () => {
  beforeEach(() => {
    storedToken = null;
    storedUser = null;
  });

  it("redirects unauthenticated users to login", () => {
    renderGuard(["CUSTOMER"], "/favorites");

    expect(screen.getByText("login")).toBeInTheDocument();
  });

  it("blocks CUSTOMER users from the dealer dashboard", () => {
    setAuthUser("CUSTOMER");
    renderGuard(["SUPER_ADMIN", "ADMIN", "DEALER_OWNER", "DEALER_MANAGER"], "/dealer/dashboard");

    expect(screen.getByText("login")).toBeInTheDocument();
  });

  it("blocks non-SUPER_ADMIN users from the admin dashboard", () => {
    setAuthUser("DEALER_OWNER");
    renderGuard(["SUPER_ADMIN"], "/admin/dashboard");

    expect(screen.getByText("login")).toBeInTheDocument();
  });
});

function renderGuard(allowedRoles: AuthRole[], initialPath: string) {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<div>login</div>} path="/login" />
        <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
          <Route element={<div>protected</div>} path={initialPath} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

function setAuthUser(role: AuthRole) {
  storedToken = "test-token";
  storedUser = {
    email: `${role.toLowerCase()}@falcon.test`,
    id: `${role}-id`,
    name: role,
    role,
    tenantId: "local-dev"
  };
}
