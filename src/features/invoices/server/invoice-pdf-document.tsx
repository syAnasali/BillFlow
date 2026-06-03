import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { InvoicePdfData } from "@/features/invoices/types/invoice-pdf";

const colors = {
  ink: "#172033",
  muted: "#667085",
  border: "#E4E7EC",
  surface: "#F8FAFC",
  brand: "#1D4ED8",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    color: colors.ink,
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.45,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  brandName: { fontSize: 16, fontWeight: 700, color: colors.ink, marginBottom: 4 },
  brandDetails: { color: colors.muted, fontSize: 8.5, lineHeight: 1.35 },
  headerRight: {
    alignItems: "flex-end",
  },
  invoiceTitle: { color: colors.brand, fontSize: 22, fontWeight: 700, lineHeight: 1.1 },
  invoiceNumber: { color: colors.muted, fontSize: 10, marginTop: 4, lineHeight: 1.1 },
  textMuted: { color: colors.muted },
  sectionGrid: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
  },
  section: { flex: 1 },
  sectionTitle: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 7,
    textTransform: "uppercase",
  },
  clientName: { fontSize: 10, fontWeight: 700, color: colors.ink, marginBottom: 3 },
  clientDetails: { color: colors.muted, fontSize: 8.5, lineHeight: 1.35 },
  detailRow: { flexDirection: "row", marginBottom: 4 },
  detailLabel: { color: colors.muted, width: 60, fontSize: 8.5 },
  detailValue: { color: colors.ink, fontSize: 8.5, fontWeight: 500 },
  table: {
    borderColor: colors.border,
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 4,
    overflow: "hidden",
  },
  tableHeader: {
    backgroundColor: colors.surface,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tableRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  itemName: { flex: 1 },
  quantity: { textAlign: "right", width: 60 },
  rate: { textAlign: "right", width: 90 },
  amount: { textAlign: "right", width: 90 },
  totalsWrap: {
    alignItems: "flex-end",
    marginTop: 18,
  },
  totals: { width: 220 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  grandTotal: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    fontSize: 12,
    fontWeight: 700,
    justifyContent: "space-between",
    marginTop: 3,
    paddingTop: 9,
  },
  notes: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    marginTop: 24,
    padding: 12,
  },
  footer: {
    bottom: 24,
    color: colors.muted,
    fontSize: 8,
    left: 40,
    position: "absolute",
    right: 40,
    textAlign: "center",
  },
});

function formatCurrency(value: number, currency: string) {
  const normalizedCurrency = currency.trim().toUpperCase();
  const formatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedNumber = formatter.format(value);

  const symbolMap: Record<string, string> = {
    INR: "Rs. ",
    USD: "$",
    EUR: "€",
  };

  const symbol = symbolMap[normalizedCurrency] || `${normalizedCurrency} `;
  return `${symbol}${formattedNumber}`;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

function OptionalLine({ value, style }: { value: string | null; style?: any }) {
  return value ? <Text style={style}>{value}</Text> : null;
}

/**
 * Professional invoice document template rendered on the server.
 */
export function InvoicePdfDocument({ invoice }: { invoice: InvoicePdfData }) {
  const money = (value: number) => formatCurrency(value, invoice.currency);

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>{invoice.business.name}</Text>
            <OptionalLine style={styles.brandDetails} value={invoice.business.address} />
            <OptionalLine style={styles.brandDetails} value={invoice.business.phone} />
            <OptionalLine style={styles.brandDetails} value={invoice.business.email} />
            {invoice.business.gstNumber ? (
              <Text style={styles.brandDetails}>GST: {invoice.business.gstNumber}</Text>
            ) : null}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.sectionGrid}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={styles.clientName}>{invoice.customer.name}</Text>
            <OptionalLine style={styles.clientDetails} value={invoice.customer.address} />
            <OptionalLine style={styles.clientDetails} value={invoice.customer.phone} />
            <OptionalLine style={styles.clientDetails} value={invoice.customer.email} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Number</Text>
              <Text style={styles.detailValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(invoice.invoiceDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>{invoice.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Items</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.itemName}>Item</Text>
            <Text style={styles.quantity}>Qty</Text>
            <Text style={styles.rate}>Rate</Text>
            <Text style={styles.amount}>Amount</Text>
          </View>
          {invoice.items.map((item) => (
            <View key={item.id} style={styles.tableRow} wrap={false}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <Text style={styles.rate}>{money(item.rate)}</Text>
              <Text style={styles.amount}>{money(item.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.textMuted}>Subtotal</Text>
              <Text>{money(invoice.totals.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.textMuted}>Tax ({invoice.totals.taxRate}%)</Text>
              <Text>{money(invoice.totals.tax)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.textMuted}>Discount</Text>
              <Text>-{money(invoice.totals.discount)}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text>Grand Total</Text>
              <Text>{money(invoice.totals.grandTotal)}</Text>
            </View>
          </View>
        </View>

        {invoice.notes ? (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>Generated with BillFlow</Text>
      </Page>
    </Document>
  );
}
