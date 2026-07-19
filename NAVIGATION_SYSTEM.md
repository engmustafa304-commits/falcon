# Navigation System

Falcon navigation must feel effortless: role-aware, context-aware, and quiet. Navigation should never expose unavailable actions.

## Navigation Principles

- One primary navigation model per context.
- No duplicate destinations with different names.
- Role-specific navigation, not one giant menu.
- Preserve tenant context at all times.
- Keep destructive or administrative areas visually separated.
- Prioritize daily work over configuration.

## Public Navigation

- Search.
- Inventory.
- Dealers.
- Brands.
- Finance.
- Language.
- Country.
- Login or register.

## Customer Navigation

- Dashboard.
- Saved.
- Requests.
- Messages.
- Appointments.
- Profile.

## Dealer Navigation

- Dashboard.
- Inventory.
- Leads.
- Customers.
- Finance.
- Team.
- Analytics.
- Public Site.
- Settings.

## Employee Navigation

- My Work.
- Assigned Leads.
- Assigned Customers.
- Assigned Vehicles.
- Tasks.
- Messages.

## Manager Navigation

- Dashboard.
- Team Activity.
- Leads.
- Customers.
- Inventory.
- Finance.
- Analytics.
- Settings.

## Platform Admin Navigation

- Platform Dashboard.
- Tenants.
- Users.
- Plans.
- Countries.
- Compliance.
- Audit.
- Observability.
- Support.

## Navigation States

- Default: only available destinations.
- Active: current destination and context.
- Disabled: visible only when education is useful.
- Hidden: unavailable due to permission or tenant plan.
- Alerted: destination has critical pending work.
- Scoped: destination is filtered by tenant, country, or assignment.

## Mobile Navigation

- Public: compact top navigation plus primary action.
- Customer: bottom navigation for dashboard, saved, requests, messages, profile.
- Employee: bottom navigation for my work, leads, tasks, messages.
- Dealer and Manager: sidebar collapses into command-style navigation.
- Platform Admin: mobile is support/monitoring only unless explicitly designed later.

## Command Navigation

Future command navigation should support:

- Search records.
- Jump to destinations.
- Create allowed objects.
- Switch tenant context for platform admins.
- Execute safe shortcuts.

Command actions must respect role permissions and audit high-risk actions.
