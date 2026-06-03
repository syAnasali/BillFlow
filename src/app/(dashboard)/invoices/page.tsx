import { InvoicesList } from "@/features/invoices/components/invoices-list";
import { getInvoicesPage } from "@/features/invoices/server/queries";

type InvoicesPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
};

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;
  const invoicePage = await getInvoicesPage(params);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Invoices</h1>
        <p className="text-sm text-muted-foreground">
          Create, track, and manage your customer invoices.
        </p>
      </div>
      <InvoicesList invoicePage={invoicePage} />
    </div>
  );
}
