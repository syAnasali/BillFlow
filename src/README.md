# BillFlow Source Architecture

BillFlow uses a feature-based structure for a scalable Next.js App Router
application. Folders currently contain placeholders only; business logic should
be added as the product is implemented.

```text
src/
|-- app/                    # Next.js routes, layouts, loading states, and route handlers
|   |-- (auth)/             # Public authentication routes
|   |-- (dashboard)/        # Protected SaaS application routes
|   `-- api/                # API endpoints, webhooks, and external callbacks
|-- components/             # Reusable application-wide React components
|   |-- layouts/            # Shared navigation, sidebars, and page containers
|   |-- shared/             # Composed components used across multiple features
|   `-- ui/                 # Generic shadcn/ui primitives and customizations
|-- features/               # Domain modules with feature-local ownership
|   |-- auth/               # Authentication and session workflows
|   |-- customers/          # Customer management workflows
|   |-- invoices/           # Invoice lifecycle workflows
|   `-- settings/           # Workspace, account, and billing preferences
|-- lib/                    # Shared integrations and infrastructure
|   |-- constants/          # Application-wide immutable constants
|   |-- supabase/           # Supabase clients, middleware helpers, and generated types
|   `-- validations/        # Cross-feature validation helpers
|-- hooks/                  # Application-wide reusable React hooks
|-- types/                  # Application-wide TypeScript declarations
`-- utils/                  # Small domain-agnostic helper functions
```

Each domain under `features/` follows the same internal structure:

```text
feature/
|-- components/             # Feature-specific React components
|-- hooks/                  # Feature-specific client hooks
|-- schemas/                # Feature-specific input validation schemas
|-- server/                 # Server-only actions, queries, and integrations
`-- types/                  # Feature-specific TypeScript types
```

Keep route files thin: they should compose features instead of implementing
domain rules. Prefer feature-local code unless a module is genuinely shared
across multiple domains.

## Supabase Clients

Set the values from `.env.example` in `.env.local`.

Use the browser client in Client Components:

```ts
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
```

Use the request-scoped server client in Server Components, Server Actions, and
Route Handlers:

```ts
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
```

Authentication is intentionally not implemented yet.
