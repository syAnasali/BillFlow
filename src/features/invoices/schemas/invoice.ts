import { z } from "zod";

export const invoiceItemSchema = z.object({
  itemName: z.string().trim().min(1, "Item name is required.").max(200),
  quantity: z.coerce
    .number()
    .gt(0, "Quantity must be greater than zero."),
  rate: z.coerce
    .number()
    .min(0, "Rate cannot be negative."),
});

export const invoiceSchema = z.object({
  id: z.string().uuid().optional(),
  customerId: z.string().uuid("Please select a customer."),
  invoiceNumber: z.string().trim().min(1, "Invoice number is required.").max(50),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Provide a valid date (YYYY-MM-DD)."),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  currency: z.string().length(3, "Currency must be a 3-letter ISO code."),
  taxRate: z.coerce
    .number()
    .min(0, "Tax rate cannot be negative.")
    .max(100, "Tax rate cannot exceed 100%"),
  discountTotal: z.coerce
    .number()
    .min(0, "Discount cannot be negative."),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required."),
});

export const invoiceIdSchema = z.string().uuid();
export const invoiceStatusSchema = z.enum(["draft", "sent", "paid", "overdue", "cancelled"]);
