import { SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CustomerFormDialog } from "@/features/customers/components/customer-form-dialog";
import { CustomersPagination } from "@/features/customers/components/customers-pagination";
import { CustomersTable } from "@/features/customers/components/customers-table";
import type { CustomerPage } from "@/features/customers/types/customer";

/**
 * Searchable, paginated customer management surface.
 */
export function CustomersList({ customerPage }: { customerPage: CustomerPage }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <form className="flex w-full max-w-md gap-2" method="get">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                defaultValue={customerPage.search}
                name="search"
                placeholder="Search customers by name"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
          <CustomerFormDialog />
        </div>
        <CustomersTable customers={customerPage.customers} />
        <CustomersPagination
          page={customerPage.page}
          search={customerPage.search}
          totalCount={customerPage.totalCount}
          totalPages={customerPage.totalPages}
        />
      </CardContent>
    </Card>
  );
}
