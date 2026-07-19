# Information Architecture

Falcon information architecture is role-first, tenant-aware, and task-oriented. The system should reveal only what the current user needs for the current context.

## Primary Contexts

- Public context: anonymous visitor surfaces.
- Customer context: individual buyer or finance applicant.
- Tenant context: dealership operations.
- Platform context: Falcon administration.

## Core Objects

- Tenant.
- Dealership.
- User.
- Role.
- Employee.
- Customer.
- Vehicle.
- Lead.
- Finance request.
- Appointment.
- Message.
- Task.
- Public site.
- Brand.
- Subscription.
- Payment.
- Integration.
- Notification.
- Audit event.
- Country.
- Locale.
- White-label configuration.

## Top-Level IA

```text
Public
  Search
  Inventory
  Dealers
  Brands
  Finance
  Auth

Customer
  Dashboard
  Saved
  Requests
  Messages
  Appointments
  Profile

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

Platform
  Dashboard
  Tenants
  Users
  Plans
  Countries
  Compliance
  Audit
  Observability
  Support
```

## IA Principles

- Keep navigation shallow where possible.
- Separate public discovery from authenticated operations.
- Separate tenant administration from platform administration.
- Make ownership clear: customer-owned, tenant-owned, or platform-owned.
- Treat country, language, currency, and white-label settings as platform primitives.
- Keep high-risk actions away from routine daily workflows.

## Content Hierarchy

1. Critical action or status.
2. Current context.
3. Primary object details.
4. Related activity and history.
5. Secondary metadata.
6. Admin or audit details.

## Search Architecture

- Public search: vehicles, dealers, brands, finance content.
- Tenant search: vehicles, customers, leads, finance requests, employees.
- Platform search: tenants, users, support cases, audit events.

Search results must respect permissions, tenant boundaries, country context, and publication status.
