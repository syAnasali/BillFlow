import Link from "next/link";
import { PlusIcon, UserPlusIcon, SettingsIcon, ReceiptTextIcon, TrendingUpIcon, AlertCircleIcon, ShieldAlertIcon, FileTextIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  // 1. Query all user's invoices to calculate dashboard metrics in-memory (highly efficient)
  const { data: allInvoices, error: allInvoicesError } = await supabase
    .from("invoices")
    .select("status, grand_total, currency")
    .eq("user_id", userId);

  if (allInvoicesError) {
    throw new Error(`Unable to load dashboard stats: ${allInvoicesError.message}`);
  }

  // 2. Query the 5 most recent invoices for the activity list
  const { data: recentInvoices, error: recentInvoicesError } = await supabase
    .from("invoices")
    .select("id, invoice_number, invoice_date, status, grand_total, currency, customer_name")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (recentInvoicesError) {
    throw new Error(`Unable to load recent activities: ${recentInvoicesError.message}`);
  }

  // Helper function to format cash/money values based on currency
  const formatMoney = (value: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-US", {
      currency,
      style: "currency",
    }).format(value);
  };

  // Perform statistics aggregation on the server side
  const invoices = allInvoices || [];
  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((acc, inv) => acc + Number(inv.grand_total), 0);

  const totalOutstanding = invoices
    .filter((inv) => inv.status === "sent" || inv.status === "overdue")
    .reduce((acc, inv) => acc + Number(inv.grand_total), 0);

  const draftsCount = invoices.filter((inv) => inv.status === "draft").length;
  const invoicesCount = invoices.length;

  const currencyCode = invoices[0]?.currency || "INR";

  // Badges status color mapping
  const badgeConfig: Record<string, { className: string }> = {
    draft: { className: "bg-muted/40 text-muted-foreground border-none" },
    sent: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-none" },
    paid: { className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-none" },
    overdue: { className: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-none" },
    cancelled: { className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-none" },
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back to BillFlow. Here is your business billing overview.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/settings">
              <SettingsIcon />
              Workspace Setup
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/invoices/new">
              <PlusIcon data-icon="inline-start" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Paid Revenue */}
        <Card className="relative overflow-hidden border-emerald-500/10 bg-emerald-500/[0.01]">
          <div className="absolute right-3 top-3 rounded-md bg-emerald-500/10 p-2 text-emerald-600">
            <TrendingUpIcon className="size-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-bold">Total Revenue</CardDescription>
            <CardTitle className="text-2xl font-extrabold text-foreground">
              {formatMoney(totalPaid, currencyCode)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Settled cash flow from cleared invoices.</p>
          </CardContent>
        </Card>

        {/* Outstanding Receivables */}
        <Card className="relative overflow-hidden border-blue-500/10 bg-blue-500/[0.01]">
          <div className="absolute right-3 top-3 rounded-md bg-blue-500/10 p-2 text-blue-600">
            <AlertCircleIcon className="size-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-bold">Outstanding</CardDescription>
            <CardTitle className="text-2xl font-extrabold text-foreground">
              {formatMoney(totalOutstanding, currencyCode)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Receivables from sent & overdue invoices.</p>
          </CardContent>
        </Card>

        {/* Draft Invoices */}
        <Card className="relative overflow-hidden border-muted-foreground/10 bg-muted-foreground/[0.01]">
          <div className="absolute right-3 top-3 rounded-md bg-muted/60 p-2 text-muted-foreground">
            <ReceiptTextIcon className="size-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-bold">Drafts</CardDescription>
            <CardTitle className="text-2xl font-extrabold text-foreground">{draftsCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Work-in-progress invoices waiting to issue.</p>
          </CardContent>
        </Card>

        {/* Total Invoiced Count */}
        <Card className="relative overflow-hidden border-primary/10 bg-primary/[0.01]">
          <div className="absolute right-3 top-3 rounded-md bg-primary/10 p-2 text-primary">
            <FileTextIcon className="size-5" />
          </div>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-bold">Invoices Issued</CardDescription>
            <CardTitle className="text-2xl font-extrabold text-foreground">{invoicesCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total invoices prepared across the lifecycle.</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Activities & Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Invoices Feed Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>View the status of your 5 most recent invoices.</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/invoices">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentInvoices && recentInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b bg-accent/20 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                      <th className="p-4">Invoice #</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((inv) => (
                      <tr key={inv.id} className="border-b hover:bg-accent/10 transition-colors">
                        <td className="p-4 font-semibold text-foreground">{inv.invoice_number}</td>
                        <td className="p-4 font-medium text-foreground">{inv.customer_name}</td>
                        <td className="p-4 font-bold text-foreground">
                          {formatMoney(Number(inv.grand_total), inv.currency)}
                        </td>
                        <td className="p-4">
                          <Badge className={badgeConfig[inv.status]?.className || ""}>
                            {inv.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button asChild size="icon-sm" variant="ghost">
                            <a href={`/api/invoices/${inv.id}/pdf`} download title="Download PDF">
                              <FileTextIcon className="size-4 text-primary" />
                            </a>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <ShieldAlertIcon className="size-12 text-muted-foreground mb-3" />
                <h3 className="font-semibold text-base text-foreground mb-1">No invoices created yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Welcome to BillFlow! Generate your very first invoice to begin tracking your revenue.
                </p>
                <Button asChild size="sm">
                  <Link href="/invoices/new">Create First Invoice</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Shortcut Panel */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Shortcut workflows to manage your business directory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start gap-3 h-12" variant="outline">
              <Link href="/invoices/new">
                <span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <PlusIcon className="size-4" />
                </span>
                <div className="text-left">
                  <p className="text-sm font-medium leading-none">New Invoice</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Prepare a new billing sheet</p>
                </div>
              </Link>
            </Button>

            <Button asChild className="w-full justify-start gap-3 h-12" variant="outline">
              <Link href="/customers">
                <span className="flex size-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
                  <UserPlusIcon className="size-4" />
                </span>
                <div className="text-left">
                  <p className="text-sm font-medium leading-none">Add Customer</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Register a customer contact</p>
                </div>
              </Link>
            </Button>

            <Button asChild className="w-full justify-start gap-3 h-12" variant="outline">
              <Link href="/settings">
                <span className="flex size-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600">
                  <SettingsIcon className="size-4" />
                </span>
                <div className="text-left">
                  <p className="text-sm font-medium leading-none">Business Profile</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage your invoice headers</p>
                </div>
              </Link>
            </Button>
          </CardContent>
          <div className="border-t p-4 bg-accent/10 rounded-b-lg">
            <p className="text-xs text-center text-muted-foreground">
              BillFlow Engine v1.0 • Standalone SaaS Ready
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
