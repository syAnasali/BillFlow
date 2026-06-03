import { renderToBuffer } from "@react-pdf/renderer";

import { InvoicePdfDocument } from "@/features/invoices/server/invoice-pdf-document";
import type { InvoicePdfData } from "@/features/invoices/types/invoice-pdf";

/**
 * Server-only rendering boundary. Future email and WhatsApp delivery services
 * can reuse the same PDF bytes without coupling to the HTTP download route.
 */
export async function renderInvoicePdf(invoice: InvoicePdfData) {
  return renderToBuffer(<InvoicePdfDocument invoice={invoice} />);
}
