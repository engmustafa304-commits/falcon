# Role Permissions

Falcon permissions must use least privilege, tenant isolation, and explicit scopes.

## Permission Model

Permissions should be composed from:

- Actor: who is acting.
- Role: what authority they have.
- Scope: public, customer, tenant, platform.
- Resource: what object is accessed.
- Action: read, create, update, delete, assign, approve, export, configure.
- Context: tenant, country, assignment, ownership, plan, risk.

## Roles

| Role | Scope | Summary |
| --- | --- | --- |
| Visitor | Public | Anonymous read-only public access |
| Customer | Customer | Own profile, requests, saved items, and conversations |
| Dealer | Tenant | Tenant owner or primary dealership operator |
| Employee | Tenant assigned | Assigned operational work only |
| Manager | Tenant elevated | Team, workflow, and tenant operations management |
| Platform Admin | Platform | Falcon platform operations with audit requirements |

## Resource Permissions

| Resource | Visitor | Customer | Dealer | Employee | Manager | Platform Admin |
| --- | --- | --- | --- | --- | --- | --- |
| Public vehicle | Read published | Read published | Manage tenant | Assigned update | Manage tenant | Support/audit |
| Private vehicle | No | No | Manage tenant | Assigned read/update | Manage tenant | Support/audit |
| Customer profile | No | Own only | Tenant customers | Assigned only | Tenant customers | Support/audit |
| Lead | Create through conversion | Own only | Tenant leads | Assigned only | Tenant leads | Support/audit |
| Finance request | Create through conversion | Own only | Tenant requests | Assigned only | Tenant requests | Support/audit |
| Employee | No | No | Manage tenant team | Own profile | Manage team | Support/audit |
| Tenant settings | No | No | Manage if owner | No | Manage allowed settings | Support/audit |
| Billing | No | No | Owner only | No | Optional limited view | Full platform |
| White-label config | View result | View result | Configure if allowed | No | Configure if allowed | Platform rules |
| Audit event | No | Own visible activity | Limited tenant | Own activity | Tenant audit | Platform audit |

## High-Risk Actions

High-risk actions require elevated checks and audit logs:

- Cross-tenant access.
- User role changes.
- Tenant suspension.
- Billing changes.
- Data export.
- Bulk vehicle import or deletion.
- Finance status changes.
- Integration credential changes.
- White-label domain changes.

## Denial Rules

- If tenant context is missing, deny.
- If resource ownership is ambiguous, deny.
- If platform admin access lacks audit context, deny.
- If role is insufficient, deny.
- If plan entitlement is missing, deny.
- If country compliance blocks action, deny.

## Success Criteria

- Permissions are predictable.
- Users never see actions they cannot complete unless intentionally educational.
- All sensitive actions are auditable.
- Tenant data cannot leak across boundaries.
