"use client";

import { useTransition } from "react";
import { DownloadIcon, PencilIcon, Trash2Icon, CheckCircle2Icon, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InvoiceListItem } from "@/features/invoices/types/invoice";
import { deleteInvoice, updateInvoiceStatus } from "@/features/invoices/server/actions";

type InvoicesTableProps = {
  invoices: InvoiceListItem[];
};

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStatusUpdate(id: string, status: "paid" | "sent") {
    startTransition(async () => {
      const res = await updateInvoiceStatus(id, status);
      if (res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleDelete(id: string, number: string) {
    if (!confirm(`Are you sure you want to delete invoice #${number}?`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteInvoice(id);
      if (res.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  }

  const columns: DataTableColumn<InvoiceListItem>[] = [
    {
      header: "Invoice #",
      cell: (row) => (
        <span className="font-semibold text-foreground">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      header: "Date",
      cell: (row) => row.invoiceDate,
    },
    {
      header: "Billed To",
      cell: (row) => <span className="font-medium text-foreground">{row.customerName}</span>,
    },
    {
      header: "Amount",
      cell: (row) => {
        const formatted = new Intl.NumberFormat("en-US", {
          currency: row.currency,
          style: "currency",
        }).format(row.grandTotal);
        return <span className="font-bold text-foreground">{formatted}</span>;
      },
    },
    {
      header: "Status",
      cell: (row) => {
        const variants: Record<string, { variant: "outline" | "default" | "secondary"; className: string }> = {
          draft: { variant: "outline", className: "bg-muted/40 text-muted-foreground" },
          sent: { variant: "default", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-none" },
          paid: { variant: "secondary", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-none" },
          overdue: { variant: "default", className: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-none" },
          cancelled: { variant: "outline", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-none" },
        };

        const config = variants[row.status] || { variant: "outline", className: "" };

        return (
          <Badge variant={config.variant} className={config.className}>
            {row.status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button asChild size="icon-sm" variant="ghost" title="Download PDF">
            <a href={`/api/invoices/${row.id}/pdf`} download>
              <DownloadIcon className="size-4" />
            </a>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost">
                <MoreHorizontalIcon className="size-4" />
                <span className="sr-only">Actions menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {row.status !== "paid" && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(row.id, "paid")}>
                  <CheckCircle2Icon className="mr-2 size-4 text-emerald-600" />
                  Mark as Paid
                </DropdownMenuItem>
              )}

              {row.status === "draft" && (
                <DropdownMenuItem onClick={() => handleStatusUpdate(row.id, "sent")}>
                  <CheckCircle2Icon className="mr-2 size-4 text-blue-600" />
                  Mark as Sent
                </DropdownMenuItem>
              )}

              <DropdownMenuItem asChild>
                <Link href={`/invoices/${row.id}/edit`}>
                  <PencilIcon className="mr-2 size-4" />
                  Edit Details
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => handleDelete(row.id, row.invoiceNumber)}
                disabled={isPending}
              >
                <Trash2Icon className="mr-2 size-4" />
                Delete Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={invoices}
      emptyMessage="No invoices found."
      getRowKey={(row) => row.id}
    />
  );
}
