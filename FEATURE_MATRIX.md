# Feature Matrix

This matrix defines required capabilities by user type. It is not an implementation plan and does not imply pages should be built before flows are validated.

| Capability | Visitor | Customer | Dealer | Employee | Manager | Platform Admin |
| --- | --- | --- | --- | --- | --- | --- |
| Public browsing | Yes | Yes | Preview own tenant | No | Preview own tenant | Support only |
| Public search | Yes | Yes | Preview own tenant | No | Preview own tenant | Support only |
| Account profile | No | Own profile | Own profile | Own profile | Own profile | Platform profile |
| Saved vehicles | No | Yes | No | No | No | No |
| Vehicle inventory | Published only | Published only | Full tenant | Assigned or limited | Full tenant | Support or audit |
| Leads | Create through conversion | Own requests | Full tenant | Assigned | Full tenant | Support or audit |
| Customers | No | Own profile only | Full tenant | Assigned | Full tenant | Support or audit |
| Finance requests | Create interest | Own requests | Tenant requests | Assigned | Full tenant | Support or audit |
| Messaging | Contact actions | Own conversations | Tenant conversations | Assigned | Full tenant | Support only |
| Employees | No | No | Manage if owner | No | Manage tenant team | Support only |
| Analytics | No | Personal status | Tenant analytics | Personal work | Team and tenant | Platform analytics |
| White-label | View public result | View public result | Configure if allowed | No | Configure if allowed | Manage platform rules |
| Billing | No | No | Tenant billing if owner | No | Limited or none | Full platform billing |
| Country/localization | Public selection | Preferences | Tenant settings | Preference only | Tenant settings | Platform config |
| Audit logs | No | Own activity summary | Tenant-sensitive | Own activity | Tenant audit | Platform audit |
| Observability | No | No | No | No | No | Yes |
| Support tools | No | Request support | Request support | Request support | Tenant support | Full support |

## Feature Readiness Levels

- Foundation: architecture, contracts, permissions, IA.
- Workflow: user journeys, states, validations.
- Interface: reusable components and screen composition.
- Implementation: API, persistence, background jobs.
- Scale: monitoring, performance, reliability, abuse prevention.

No capability should move to implementation until ownership, permissions, and success states are clear.
