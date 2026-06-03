/**
 * Customer row displayed by the customer management screen.
 */
export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  createdAt: string;
};

export type CustomerActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Partial<
    Record<"name" | "phone" | "email" | "address", string[]>
  >;
};

export type CustomerPage = {
  customers: Customer[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  search: string;
};
