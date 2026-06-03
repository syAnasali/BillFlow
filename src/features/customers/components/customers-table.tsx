import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DeleteCustomerDialog } from "@/features/customers/components/delete-customer-dialog";
import { CustomerFormDialog } from "@/features/customers/components/customer-form-dialog";
import type { Customer } from "@/features/customers/types/customer";

const columns: DataTableColumn<Customer>[] = [
  {
    header: "Name",
    cell: (customer) => <span className="font-medium">{customer.name}</span>,
  },
  {
    header: "Phone",
    cell: (customer) => customer.phone || "-",
  },
  {
    header: "Email",
    cell: (customer) => customer.email || "-",
  },
  {
    header: "Address",
    cell: (customer) => (
      <span className="block max-w-72 truncate">{customer.address || "-"}</span>
    ),
  },
  {
    header: "Actions",
    className: "w-24 text-right",
    cell: (customer) => (
      <div className="flex justify-end gap-1">
        <CustomerFormDialog customer={customer} />
        <DeleteCustomerDialog customer={customer} />
      </div>
    ),
  },
];

/**
 * Customer-specific column configuration for the shared DataTable.
 */
export function CustomersTable({ customers }: { customers: Customer[] }) {
  return (
    <DataTable
      columns={columns}
      data={customers}
      emptyMessage="No customers found."
      getRowKey={(customer) => customer.id}
    />
  );
}
