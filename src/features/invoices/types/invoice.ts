export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type InvoiceItem = {
  id?: string;
  itemName: string;
  quantity: number;
  rate: number;
  lineTotal: number;
  sortOrder?: number;
};

export type Invoice = {
  id: string;
  userId: string;
  businessId: string;
  customerId: string;
  invoiceNumber: string;
  invoiceDate: string;
  status: InvoiceStatus;
  notes: string | null;
  currency: string;
  businessName: string;
  businessPhone: string | null;
  businessEmail: string | null;
  businessAddress: string | null;
  businessGstNumber: string | null;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  subtotal: number;
  taxRate: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
};

export type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  status: InvoiceStatus;
  currency: string;
  grandTotal: number;
  customerName: string;
  createdAt: string;
};

export type InvoiceItemInput = {
  itemName: string;
  quantity: number;
  rate: number;
};

export type InvoiceInput = {
  id?: string;
  customerId: string;
  invoiceNumber: string;
  invoiceDate: string;
  status: InvoiceStatus;
  notes?: string;
  currency: string;
  taxRate: number;
  discountTotal: number;
  items: InvoiceItemInput[];
};

export type InvoiceActionState = {
  success?: string;
  error?: string;
  fieldErrors?: {
    [K in keyof InvoiceInput]?: string[];
  };
};

export type InvoicesPageData = {
  invoices: InvoiceListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  search: string;
  status: string;
};
