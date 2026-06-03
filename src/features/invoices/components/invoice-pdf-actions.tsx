import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getInvoicePdfUrl } from "@/features/invoices/utils/invoice-pdf-links";

/**
 * Invoice delivery toolbar. Print, email, and WhatsApp actions can be added
 * beside download while reusing the same server-rendered PDF endpoint.
 */
export function InvoicePdfActions({ invoiceId }: { invoiceId: string }) {
  return (
    <Button asChild variant="outline">
      <a href={getInvoicePdfUrl(invoiceId)}>
        <DownloadIcon data-icon="inline-start" />
        Download PDF
      </a>
    </Button>
  );
}
