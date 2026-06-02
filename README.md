
src/
│
├── app/ # Next.js routing layer
│ ├── (auth)/ # Public/auth routes
│ │ ├── login/page.tsx
│ │ ├── logout/page.tsx
│ │ └── register/page.tsx
│ │
│ ├── (dashboard)/ # Authenticated dashboard routes
│ │ ├── layout.tsx # Sidebar, Topbar, Role-based layout
│ │ ├── page.tsx # Main dashboard landing page
│ │
│ │ ├── quotation-manager/
│ │ │ ├── page.tsx # List/view quotations
│ │ │ ├── create/page.tsx
│ │ │ └── [id]/page.tsx # Edit/view single quotation
│ │ │
│ │ ├── po-manager/
│ │ │ ├── page.tsx
│ │ │ ├── create/page.tsx
│ │ │ └── [id]/page.tsx
│ │ │
│ │ ├── job-ticket-manager/
│ │ │ ├── page.tsx
│ │ │ ├── create/page.tsx
│ │ │ └── [id]/page.tsx
│ │ │
│ │ ├── dispatch-invoice-manager/
│ │ │ ├── page.tsx
│ │ │ ├── create/page.tsx
│ │ │ └── [id]/page.tsx
│ │ │
│ │ ├── inventory-manager/
│ │ │ ├── page.tsx
│ │ │ ├── create/page.tsx
│ │ │ └── [id]/page.tsx
│ │ │
│ │ ├── crm-module/
│ │ │ ├── page.tsx # Leads overview
│ │ │ ├── leads/create/page.tsx
│ │ │ ├── contacts/create/page.tsx
│ │ │ └── [id]/page.tsx # Lead/contact details
│ │ │
│ │ ├── users/
│ │ │ ├── page.tsx # Users list
│ │ │ ├── create/page.tsx
│ │ │ └── [id]/page.tsx # Edit user
│ │ │
│ │ └── settings/
│ │ └── page.tsx # System & application settings
│ │
│ └── api/ # Optional frontend route handlers/proxy
│ └── ...
│
├── modules/ # Self-contained ERP modules
│ ├── quotation/
│ │ ├── components/ # Module-specific UI
│ │ ├── hooks/useQuotations.ts
│ │ ├── services/quotationService.ts
│ │ ├── types/quotation.types.ts
│ │ └── utils/quotationHelpers.ts
│ │
│ ├── purchase-order/
│ │ ├── components/
│ │ ├── hooks/usePurchaseOrders.ts
│ │ ├── services/purchaseOrderService.ts
│ │ ├── types/purchaseOrder.types.ts
│ │ └── utils/purchaseOrderHelpers.ts
│ │
│ ├── job-ticket/
│ │ ├── components/
│ │ ├── hooks/useJobTickets.ts
│ │ ├── services/jobTicketService.ts
│ │ ├── types/jobTicket.types.ts
│ │ └── utils/jobTicketHelpers.ts
│ │
│ ├── dispatch-invoice/
│ │ ├── components/
│ │ ├── hooks/useDispatchInvoice.ts
│ │ ├── services/dispatchInvoiceService.ts
│ │ ├── types/dispatchInvoice.types.ts
│ │ └── utils/dispatchInvoiceHelpers.ts
│ │
│ ├── inventory/
│ │ ├── components/
│ │ ├── hooks/useInventory.ts
│ │ ├── services/inventoryService.ts
│ │ ├── types/inventory.types.ts
│ │ └── utils/inventoryHelpers.ts
│ │
│ ├── crm/
│ │ ├── components/
│ │ ├── hooks/useCRM.ts
│ │ ├── services/crmService.ts
│ │ ├── types/crm.types.ts
│ │ └── utils/crmHelpers.ts
│ │
│ ├── users/
│ │ ├── components/
│ │ ├── hooks/useUsers.ts
│ │ ├── services/userService.ts
│ │ ├── types/user.types.ts
│ │ └── utils/userHelpers.ts
│ │
│ └── settings/
│ ├── components/
│ ├── hooks/useSettings.ts
│ ├── services/settingsService.ts
│ ├── types/settings.types.ts
│ └── utils/settingsHelpers.ts
│
├── components/ # Global/shared UI components
│ ├── ui/ # ShadCN UI wrappers (Button, Input, Modal)
│ ├── tables/ # Generic table components
│ ├── forms/ # Generic forms
│ ├── layout/ # Header, Sidebar, Footer
│ └── common/ # DeleteConfirmationModal, Pagination, EmptyState
│
├── components/dashboard/ # Dashboard-specific UI
│ ├── widgets/ # KPI cards, charts, summaries
│ │ ├── QuotationKPI.tsx
│ │ ├── InventoryChart.tsx
│ │ ├── DispatchSummaryCard.tsx
│ │ └── SalesOverviewGraph.tsx
│ ├── DashboardHeader.tsx
│ └── DashboardLayout.tsx # Optional wrapper
│
├── hooks/ # Global hooks
│ ├── useAuth.ts
│ ├── useSidebar.ts
│ ├── usePagination.ts
│ └── useRole.ts
│
├── store/ # Redux store
│ ├── slices/ # Feature slices
│ │ ├── authSlice.ts
│ │ ├── quotationSlice.ts
│ │ └── ...
│ ├── actions/
│ ├── thunks/
│ └── index.ts
│
├── services/ # Global/shared services
│ ├── http.ts # Axios/fetch wrapper
│ ├── authService.ts
│ ├── userService.ts
│ └── apiService.ts # Centralized API aggregator
│
├── types/ # Global types/interfaces
│ ├── api.ts
│ ├── common.ts
│ └── user.ts
│
├── lib/ # Utility functions & validators
│ ├── auth/
│ ├── validators/
│ └── helpers/
│
├── config/
│ ├── env.ts
│ ├── rbac.ts # Role-based access control rules
│ └── constants.ts
│
├── styles/
│ ├── globals.css
│ └── variables.css
│
└── assets/
├── logos/
├── icons/
└── images/

Frontend Folder Structure Explanation

This project uses a modular, scalable, and maintainable architecture designed for a full-featured ERP system. The structure separates routing, business logic, UI components, state management, and utilities, making the codebase easy to navigate and extend as the system grows.

1. app/

Contains the Next.js App Router structure:

(auth)/ – All public/authentication pages such as login, logout, and registration.

(dashboard)/ – All authenticated pages (Dashboard, ERP modules).

layout.tsx handles the sidebar, topbar, and role-based layout.

page.tsx is the main dashboard landing page.

Subfolders correspond to ERP modules, e.g., quotation-manager/, po-manager/, inventory-manager/, crm-module/. Each contains pages for list, create, and edit views.

Why this is good:

Clear separation of public vs authenticated routes.

Role-aware layout ensures access control and modular rendering.

2. modules/

Contains domain-driven logic for each ERP module:

quotation/, purchase-order/, job-ticket/, inventory/, dispatch-invoice/, crm/, users/, settings/.

Each module contains:

components/ – Module-specific reusable components.

services/ – API calls and business logic.

hooks/ – Custom hooks for state and logic.

types/ – Module-specific TypeScript types.

utils/ – Helper functions.

Why this is good:

Keeps business logic isolated and reusable.

Facilitates team collaboration, since frontend devs and module developers can work independently.

3. components/

Houses global and shared UI components:

ui/ – ShadCN UI wrappers (Button, Input, Modal).

tables/ – Generic table components.

forms/ – Generic forms used across modules.

layout/ – Sidebar, Header, Topbar, Footer.

common/ – Shared components like DeleteConfirmationModal, Pagination, EmptyState.

Why this is good:

Promotes reusability and consistency across the ERP system.

Reduces duplication of UI code.

4. components/dashboard/

Contains Dashboard-specific UI components:

widgets/ – KPI cards, charts, summaries (QuotationKPI, InventoryChart, DispatchSummaryCard, SalesOverviewGraph).

DashboardHeader.tsx – Page header for dashboard.

DashboardLayout.tsx – Optional wrapper for dashboard layout.

Why this is good:

Dashboard is modular, with widgets consuming module services.

Keeps presentation logic separate from module logic.

Easy to add/remove widgets without affecting modules.

5. store/

Redux store organization:

slices/ – Feature slices per module (authSlice, quotationSlice, etc.).

actions/ – Optional Redux actions.

thunks/ – Async operations for API calls.

index.ts – Store initialization.

Why this is good:

Centralized state management.

Supports complex interactions and cross-module state.

6. services/

Cross-cutting services:

authService.ts, userService.ts, http.ts, apiService.ts

Handles API calls and business logic used across modules.

Why this is good:

Promotes code reuse.

Keeps frontend modules decoupled from backend API logic.

7. hooks/

Global hooks like useAuth, useSidebar, usePagination, useRole.

Why this is good:

Encapsulates common logic.

Makes components cleaner and more readable.

8. config/

Configuration files:

env.ts – Environment variables.

rbac.ts – Role-Based Access Control mapping roles to permissions.

constants.ts – App-wide constants.

Why this is good:

Centralized configuration makes scaling and updates easier.

Supports role-aware rendering and permissions checks.

9. lib/

Utility functions and validators:

auth/ – Token and session helpers.

validators/ – Form and input validation functions.

helpers/ – Miscellaneous utilities.

Why this is good:

Keeps shared utility code organized.

Improves maintainability and testability.

10. types/

Global TypeScript types/interfaces, e.g., user.ts, auth.ts, api.ts, common.ts.

Why this is good:

Enforces type safety across modules.

Reduces runtime errors in a large-scale ERP.

11. styles/

Global CSS and variables (globals.css, variables.css).

Works with Tailwind and ShadCN UI styling.

12. assets/

Images, icons, logos, and static assets.

✅ Why This Folder Structure Works

Scalable & Modular – Adding a new module or dashboard widget doesn’t break the structure.

Separation of Concerns – Routing, business logic, state management, and UI are clearly separated.

Role-Aware & Secure – rbac.ts ensures that users see only what they are allowed to.

Reusable Components – ShadCN UI components and widgets are centralized.

Maintainable – Teams can work on modules, dashboard, and global components independently.

Enterprise-Ready – Optimized for a full ERP system connecting to a Node.js backend.

          ┌─────────────────────┐
          │     Dashboard       │
          │  (page.tsx + layout)│
          └─────────┬──────────┘
                    │ uses
                    ▼
          ┌─────────────────────┐
          │  Dashboard Widgets  │
          │ (KPI cards, charts, │
          │  summary cards)     │
          └─────────┬──────────┘
                    │ fetches
                    ▼
          ┌─────────────────────┐
          │     Module Services │
          │ (quotationService,  │
          │  inventoryService,  │
          │  crmService, etc.)  │
          └─────────┬──────────┘
                    │ calls
                    ▼
          ┌─────────────────────┐
          │      Node.js API    │
          │ (CRUD endpoints)    │
          └─────────┬──────────┘
                    │ interacts with
                    ▼
          ┌─────────────────────┐
          │     Database        │
          │  (MySQL / PostgreSQL│
          │   / MongoDB, etc.) │
          └─────────────────────┘
