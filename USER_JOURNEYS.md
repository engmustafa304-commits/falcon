# User Journeys

Falcon must be designed around user outcomes before screens. Every journey should feel calm, obvious, fast, and trustworthy.

## Visitor

### Goals

- Discover a dealership, vehicle, brand, or offer with minimal friction.
- Understand whether Falcon-powered experiences are trustworthy.
- Move from browsing to contact, finance interest, or account creation.

### Actions

- Search and browse public inventory.
- Compare dealership credibility signals.
- View vehicle, dealer, brand, and finance information.
- Switch language and country context.
- Contact a dealer through approved channels.

### Pain Points

- Overwhelming automotive listings.
- Unclear vehicle availability.
- Weak trust signals.
- Too many steps before contacting a dealer.
- Poor Arabic-first experiences.

### Success States

- Visitor finds a relevant vehicle or dealer quickly.
- Visitor understands next steps without assistance.
- Visitor trusts the dealership and platform.
- Visitor converts into a customer lead or registered customer.

### Navigation

- Public search.
- Inventory.
- Dealers.
- Brands.
- Finance.
- Language and country switcher.
- Authentication entry.

### Permissions

- Public read-only access to published tenant and marketplace content.
- No access to tenant operations, private customer data, or dashboards.

### Dashboard

- None.

### Required Features

- Public search and filtering.
- Public vehicle detail surfaces.
- Dealer profile surfaces.
- Trust and verification signals.
- Localization.
- Contact actions.
- Finance interest capture.

### Flows

1. Visitor lands on a public surface.
2. Visitor searches or browses.
3. Visitor evaluates vehicle, dealer, brand, or finance context.
4. Visitor contacts dealer, requests finance, saves interest, or registers.
5. Falcon creates a lead only after explicit conversion intent.

## Customer

### Goals

- Track vehicle inquiries, finance requests, appointments, and saved vehicles.
- Communicate with dealerships without repeating information.
- Complete purchasing or finance steps confidently.

### Actions

- Register or log in.
- Save vehicles and dealers.
- Submit inquiries.
- Submit finance requests.
- Track request status.
- Manage profile, language, and communication preferences.

### Pain Points

- Repeating the same information across dealerships.
- Losing track of requests.
- Unclear finance status.
- Slow dealership responses.
- Fragmented WhatsApp, phone, and platform conversations.

### Success States

- Customer sees all active requests in one place.
- Customer understands status and next action.
- Customer receives timely dealer responses.
- Customer can continue across mobile and desktop.

### Navigation

- Customer dashboard.
- Saved vehicles.
- Requests.
- Messages.
- Appointments.
- Profile and preferences.

### Permissions

- Read and update own profile.
- Read own inquiries, finance requests, appointments, and saved items.
- Create requests and messages.
- No access to dealership operations or other customers.

### Dashboard

- Request status summary.
- Saved vehicles.
- Recent dealer interactions.
- Finance progress.
- Recommended next actions.

### Required Features

- Customer identity.
- Saved inventory.
- Lead and inquiry tracking.
- Finance request tracking.
- Notification preferences.
- Secure messaging handoff.

### Flows

1. Customer creates account or continues from a public conversion.
2. Falcon connects public intent to customer profile.
3. Customer tracks all requests from dashboard.
4. Customer receives status updates.
5. Customer completes next action or closes request.

## Dealer

### Goals

- Operate dealership inventory, leads, customers, employees, and public presence.
- Publish reliable inventory quickly.
- Convert leads into sales with less operational friction.

### Actions

- Manage dealership profile.
- Add, edit, publish, unpublish, and archive vehicles.
- Respond to leads and customer requests.
- Assign employees.
- Review analytics.
- Manage settings, branding, and channels.

### Pain Points

- Manual inventory updates.
- Lead leakage across channels.
- No unified customer history.
- Inconsistent employee follow-up.
- Weak public website and marketplace operations.

### Success States

- Dealer sees daily operational priorities immediately.
- Inventory is accurate.
- Leads are routed and followed up.
- Team activity is visible.
- Public dealership experience reflects current data.

### Navigation

- Dealer dashboard.
- Inventory.
- Leads.
- Customers.
- Finance requests.
- Employees.
- Analytics.
- Public site.
- Settings.

### Permissions

- Tenant-scoped access only.
- Access depends on dealer role and employee assignment.
- Cannot access other tenants.

### Dashboard

- Inventory status.
- New leads.
- Follow-up tasks.
- Finance requests.
- Performance summary.
- Team activity.

### Required Features

- Tenant dashboard.
- Inventory operations.
- Lead management.
- Customer CRM.
- Employee management.
- Dealer settings.
- White-label public presence.
- Analytics.

### Flows

1. Dealer logs in.
2. Dealer reviews operational dashboard.
3. Dealer resolves priority work: leads, inventory, finance, follow-up.
4. Dealer delegates tasks to employees.
5. Dealer reviews performance and adjusts operations.

## Employee

### Goals

- Complete assigned dealership work quickly.
- Follow up with leads and customers.
- Keep assigned inventory and tasks accurate.

### Actions

- View assigned leads, customers, vehicles, and tasks.
- Update lead status.
- Add notes.
- Contact customers.
- Update permitted vehicle fields.
- Escalate issues to manager.

### Pain Points

- Too much dashboard noise.
- Unclear ownership.
- Missing customer context.
- No simple follow-up rhythm.

### Success States

- Employee sees only relevant work.
- Employee knows the next best action.
- Manager can see progress.
- Customer receives consistent follow-up.

### Navigation

- My work.
- Assigned leads.
- Assigned customers.
- Assigned vehicles.
- Tasks.
- Messages.

### Permissions

- Limited tenant access.
- Read assigned records.
- Update assigned workflow states.
- Cannot manage billing, tenant settings, roles, or sensitive admin data.

### Dashboard

- My tasks.
- New assigned leads.
- Due follow-ups.
- Recent customer activity.

### Required Features

- Task assignment.
- Lead ownership.
- Notes and activity timeline.
- Limited CRM views.
- Notification center.

### Flows

1. Employee logs in.
2. Employee sees assigned work.
3. Employee completes follow-up.
4. Employee updates status and notes.
5. Falcon records activity and updates manager visibility.

## Manager

### Goals

- Lead dealership operations.
- Monitor team performance.
- Ensure no leads, customers, or finance requests are missed.
- Control quality and process.

### Actions

- Review dashboards.
- Assign leads and tasks.
- Manage employees.
- Review performance.
- Approve operational changes.
- Configure workflow settings.

### Pain Points

- Lack of visibility into employee activity.
- Missed leads.
- Poor operational reporting.
- Inconsistent inventory quality.
- Manual reporting.

### Success States

- Manager understands business health in minutes.
- Team workload is balanced.
- Critical leads are visible.
- Process gaps are surfaced.

### Navigation

- Manager dashboard.
- Team activity.
- Leads.
- Customers.
- Inventory.
- Finance requests.
- Analytics.
- Settings.

### Permissions

- Elevated tenant access.
- Manage employees and assignments.
- Review all tenant operational data.
- Cannot access platform-wide administration unless separately authorized.

### Dashboard

- Lead response performance.
- Team workload.
- Inventory health.
- Finance pipeline.
- Customer pipeline.
- Alerts and exceptions.

### Required Features

- Team management.
- Assignment controls.
- Workflow analytics.
- Operational alerts.
- Approval queues.
- Reporting.

### Flows

1. Manager opens dashboard.
2. Manager reviews exceptions and performance.
3. Manager assigns or reassigns work.
4. Manager resolves bottlenecks.
5. Falcon updates reporting and audit trail.

## Platform Admin

### Goals

- Operate Falcon as a platform.
- Manage tenants, countries, plans, compliance, support, and system health.
- Protect data isolation and platform reliability.

### Actions

- Create, review, suspend, or support tenants.
- Manage country and localization configuration.
- Review billing and subscriptions.
- Monitor system health.
- Investigate audit logs.
- Support tenant admins.

### Pain Points

- Cross-tenant actions are high risk.
- Support needs context without overexposure.
- Compliance differs by country.
- Large-scale incidents need fast visibility.

### Success States

- Admin can support tenants without violating isolation.
- Critical incidents are visible.
- High-risk actions are audited.
- Country and plan configuration is controlled.

### Navigation

- Platform dashboard.
- Tenants.
- Users.
- Plans and billing.
- Countries and localization.
- Compliance.
- Audit logs.
- Observability.
- Support tools.

### Permissions

- Platform-scoped permissions.
- Strictly audited cross-tenant access.
- Least privilege by admin function.
- Sensitive actions require elevated confirmation or future approval workflows.

### Dashboard

- Platform health.
- Tenant growth.
- Incident alerts.
- Billing status.
- Support queues.
- Audit risk signals.

### Required Features

- Tenant administration.
- Platform user administration.
- Billing and plan controls.
- Country and locale controls.
- Audit log review.
- Observability.
- Support tooling.

### Flows

1. Platform admin logs in with elevated security.
2. Admin reviews platform dashboard.
3. Admin selects tenant, support case, incident, or configuration area.
4. Falcon scopes access and records audit context.
5. Admin completes action and system records outcome.
