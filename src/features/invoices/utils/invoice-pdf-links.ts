/**
 * Central PDF URL builder for download now and print/share actions later.
 */
export function getInvoicePdfUrl(invoiceId: string) {
  return `/api/invoices/${encodeURIComponent(invoiceId)}/pdf`;
}
