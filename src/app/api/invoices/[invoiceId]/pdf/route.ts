import { NextResponse } from "next/server";
import { z } from "zod";

import { getInvoicePdfData } from "@/features/invoices/server/pdf-queries";
import { renderInvoicePdf } from "@/features/invoices/server/render-invoice-pdf";

export const runtime = "nodejs";

const invoiceIdSchema = z.uuid();

/**
 * Returns an authenticated, user-owned invoice as a downloadable PDF.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  const { invoiceId } = await params;
  const parsedInvoiceId = invoiceIdSchema.safeParse(invoiceId);

  if (!parsedInvoiceId.success) {
    return NextResponse.json({ error: "Invalid invoice ID." }, { status: 400 });
  }

  const invoice = await getInvoicePdfData(parsedInvoiceId.data);

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  const pdf = await renderInvoicePdf(invoice);
  const filename = `invoice-${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-_]/g, "-")}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/pdf",
    },
  });
}
