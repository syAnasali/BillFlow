/**
 * Stable presentation model consumed by PDF, print, email, and sharing flows.
 * Keeping it separate from database rows prevents delivery channels from
 * depending on storage details.
 */
export type InvoicePdfData = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  status: string;
  notes: string | null;
  currency: string;
  business: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    gstNumber: string | null;
  };
  customer: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    rate: number;
    lineTotal: number;
  }>;
  totals: {
    subtotal: number;
    taxRate: number;
    tax: number;
    discount: number;
    grandTotal: number;
  };
};
