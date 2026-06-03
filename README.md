# BillFlow — Premium Invoicing & SaaS Billing Engine

BillFlow is a standalone, type-safe invoice and billing management application built with **Next.js 15**, **TypeScript**, and **Supabase**. It is designed to run as an independent SaaS product, with a highly decoupled architecture that allows it to easily serve as a reusable billing engine for larger ecosystems (such as upcoming Queue Management and Financial Insight products) in the future.

---

## 🚀 Key Features

* **Secure Authentication**: Cookie-based SSR session management using Supabase Auth and optimized Next.js 15 middleware.
* **Business Profile Workspace**: Custom invoice header details (business name, email, phone, address, and GST numbers).
* **Customer Directory**: Full paginated & searchable customer profiles directory with Dialog forms.
* **Dynamic Invoicing Engine**: Dynamic line-item spreadsheet with browser-side reactive math updates for subtotals, custom tax rates, flat discount subtractions, and grand totals.
* **Tamper-Proof Calculations**: All monetary math is recalculated and validated server-side within transactions before database commits.
* **Historical Snapshot Integrity**: Business and customer details are copied directly into invoice headers upon creation, ensuring future profile edits do not corrupt historical tax/legal records.
* **Server-Side PDF Compiler**: Renders high-quality, professional A4 invoices using `@react-pdf/renderer` in Node.js, streaming downloads through secure endpoint routing.
* **Responsive SaaS Dashboard**: Financial performance analytics displaying Paid revenue, Outstanding balances (sent & overdue invoices), Draft counts, and a Recent Invoices activity timeline.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 15 App Router (React 19)
* **Language**: TypeScript (Strict typing check ready)
* **Styling**: Tailwind CSS & shadcn/ui components
* **Backend**: Next.js Route Handlers & Server Actions
* **Database & Authentication**: Supabase (PostgreSQL with Row Level Security (RLS) enabled)
* **PDF Engine**: `@react-pdf/renderer` (Server-side rendering)

---

## 📦 Getting Started

### 1. Install Dependencies
Clone the repository and install npm packages:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Open `.env.local` and add your public credentials from the Supabase dashboard:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

### 3. Apply Database Schema
Apply migrations to your Supabase PostgreSQL instance. You can execute the consolidated SQL scripts located in `supabase/migrations/` inside your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new):
* `202606020001_create_businesses.sql`: Establishes the `businesses` table.
* `202606020002_create_customers.sql`: Establishes the `customers` table with index optimizations.
* `202606020003_create_invoices.sql`: Sets up the `invoices` snapshot table, `invoice_items` children table, and matching Row Level Security (RLS) policies checking `auth.uid() = user_id`.

### 4. Run Locally
Start the local Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Compilations
Build the optimized production package:
```bash
npm run build
```

---

## 📁 Repository Structure

```text
src/
├── app/                      # Next.js Page routes and callbacks
│   ├── (auth)/               # Guest login and signup pages
│   ├── (dashboard)/          # Dashboard Shell layouts
│   │   ├── customers/        # Customer directory UI
│   │   ├── dashboard/        # KPI card stats metrics
│   │   ├── invoices/         # Invoice pagination list & editor forms
│   │   └── settings/         # Business profile setup
│   └── api/                  # Secure invoice PDF streaming endpoint
├── components/               # Shareable UI buttons, tables, inputs
├── features/                 # Modular domain encapsulation
│   ├── auth/                 # Login actions & validations
│   ├── customers/            # Customers data queries
│   ├── invoices/             # PDF document formatting & math logic
│   └── settings/             # Workspace profile updates
└── lib/                      # Supabase SSR cookie wrappers
```

---

## 🔒 Security and Access Policy
Every custom table is protected by PostgreSQL **Row Level Security (RLS)**. Authenticated users can only read, write, edit, or delete items where `user_id = auth.uid()`. Cross-user data leakage is strictly prevented at the database driver level.
