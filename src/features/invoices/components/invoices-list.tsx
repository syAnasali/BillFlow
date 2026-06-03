"use client";

import { SearchIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InvoicesTable } from "@/features/invoices/components/invoices-table";
import type { InvoicesPageData } from "@/features/invoices/types/invoice";
import { cn } from "@/lib/utils";

type InvoicesListProps = {
  invoicePage: InvoicesPageData;
};

function getPageHref(page: number, search: string, status: string) {
  const params = new URLSearchParams();
  params.set("page", page.toString());
  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  return `/invoices?${params.toString()}`;
}

function getStatusHref(status: string, search: string) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (search) params.set("search", search);
  return `/invoices?${params.toString()}`;
}

export function InvoicesList({ invoicePage }: InvoicesListProps) {
  const statuses = [
    { label: "All", value: "all" },
    { label: "Draft", value: "draft" },
    { label: "Sent", value: "sent" },
    { label: "Paid", value: "paid" },
    { label: "Overdue", value: "overdue" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <Card>
      <CardContent className="p-0">
        {/* Navigation Tabs */}
        <div className="flex border-b overflow-x-auto px-4 gap-4">
          {statuses.map((s) => {
            const isActive = invoicePage.status === s.value;
            return (
              <Link
                key={s.value}
                href={getStatusHref(s.value, invoicePage.search)}
                className={cn(
                  "py-3.5 text-sm font-semibold border-b-2 px-1 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <form className="flex w-full max-w-md gap-2" method="get">
            {invoicePage.status && invoicePage.status !== "all" ? (
              <input type="hidden" name="status" value={invoicePage.status} />
            ) : null}
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                defaultValue={invoicePage.search}
                name="search"
                placeholder="Search invoices by number"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>

          <Button asChild>
            <Link href="/invoices/new">
              <PlusIcon data-icon="inline-start" />
              New Invoice
            </Link>
          </Button>
        </div>

        {/* Invoices List Table */}
        <InvoicesTable invoices={invoicePage.invoices} />

        {/* Pagination bar */}
        <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            {invoicePage.totalCount} invoice{invoicePage.totalCount === 1 ? "" : "s"} found
          </p>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" disabled={invoicePage.page <= 1}>
              <Link
                aria-disabled={invoicePage.page <= 1}
                href={invoicePage.page <= 1 ? "#" : getPageHref(invoicePage.page - 1, invoicePage.search, invoicePage.status)}
              >
                Previous
              </Link>
            </Button>
            <span>
              Page {invoicePage.page} of {invoicePage.totalPages}
            </span>
            <Button
              asChild
              size="sm"
              variant="outline"
              disabled={invoicePage.page >= invoicePage.totalPages}
            >
              <Link
                aria-disabled={invoicePage.page >= invoicePage.totalPages}
                href={invoicePage.page >= invoicePage.totalPages ? "#" : getPageHref(invoicePage.page + 1, invoicePage.search, invoicePage.status)}
              >
                Next
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
