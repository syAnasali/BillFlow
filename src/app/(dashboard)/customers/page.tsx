import { CustomersList } from "@/features/customers/components/customers-list";
import { getCustomersPage } from "@/features/customers/server/queries";

type CustomersPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
};

/**
 * Protected customer management screen.
 */
export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;
  const customerPage = await getCustomersPage(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage the contacts used on your invoices.
        </p>
      </div>
      <CustomersList customerPage={customerPage} />
    </div>
  );
}
