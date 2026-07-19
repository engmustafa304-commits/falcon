# Product Map

Falcon is an Automotive Operating System composed of connected product domains.

## Product Domains

```text
Falcon Platform
  Identity
  Tenancy
  Permissions
  Localization
  White-label
  Billing
  Audit
  Observability

Public Experience
  Discovery
  Inventory Browsing
  Dealer Profiles
  Brand Surfaces
  Finance Interest
  Contact Conversion

Customer Experience
  Customer Account
  Saved Vehicles
  Requests
  Finance Tracking
  Messages
  Appointments

Dealer Operations
  Dashboard
  Inventory
  Leads
  Customers
  Finance
  Team
  Analytics
  Public Site
  Settings

Platform Operations
  Tenant Management
  Plan Management
  Country Management
  Compliance
  Support
  System Health
```

## Product Principles

- Start with the user journey, then map the system capability.
- Treat dealerships as tenants, not as static websites.
- Treat customers as long-term relationships, not one-time leads.
- Treat employees and managers as operational users with different needs.
- Treat platform admins as high-trust operators with strict audit requirements.

## Domain Dependencies

- Identity powers every authenticated context.
- Tenancy powers every dealership operation.
- Permissions protect every resource.
- Localization powers public, customer, tenant, and platform experiences.
- Audit covers sensitive customer, tenant, billing, and admin actions.
- Observability protects scale and reliability.
- White-label depends on tenant, localization, public site, and design token systems.

## Product Maturity Path

1. Define journeys.
2. Define permissions.
3. Define information architecture.
4. Define contracts.
5. Define reusable UI patterns.
6. Implement flows.
7. Measure success.
8. Improve continuously.
