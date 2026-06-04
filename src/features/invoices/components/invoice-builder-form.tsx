"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, Trash2Icon, ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { invoiceSchema } from "@/features/invoices/schemas/invoice";
import { saveInvoice } from "@/features/invoices/server/actions";
import type { Invoice, InvoiceActionState, InvoiceInput } from "@/features/invoices/types/invoice";

const initialState: InvoiceActionState = {};

type InvoiceBuilderFormProps = {
  customers: Array<{ id: string; name: string }>;
  initialInvoice?: Invoice;
};

export function InvoiceBuilderForm({ customers, initialInvoice }: InvoiceBuilderFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(saveInvoice, initialState);
  const [isSubmitting, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const defaultValues: InvoiceInput = {
    id: initialInvoice?.id,
    customerId: initialInvoice?.customerId ?? "",
    invoiceNumber: initialInvoice?.invoiceNumber ?? "",
    invoiceDate: initialInvoice?.invoiceDate ?? new Date().toISOString().split("T")[0],
    status: initialInvoice?.status ?? "draft",
    notes: initialInvoice?.notes ?? "",
    currency: initialInvoice?.currency ?? "INR",
    taxRate: initialInvoice?.taxRate ?? 0,
    discountTotal: initialInvoice?.discountTotal ?? 0,
    items: initialInvoice
      ? (initialInvoice as any).items.map((item: any) => ({
          itemName: item.itemName,
          quantity: item.quantity,
          rate: item.rate,
        }))
      : [{ itemName: "", quantity: 1, rate: 0 }],
  };

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
    setError,
  } = useForm<InvoiceInput>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Watch fields for automatic mathematical totals calculation
  const items = watch("items") || [];
  const taxRate = Number(watch("taxRate") || 0);
  const discountTotal = Number(watch("discountTotal") || 0);
  const currency = watch("currency") || "INR";

  const subtotal = items.reduce((acc: number, item: any) => {
    const q = Number(item?.quantity || 0);
    const r = Number(item?.rate || 0);
    return acc + q * r;
  }, 0);

  const taxTotal = subtotal * (taxRate / 100);
  const grandTotal = Math.max(0, subtotal + taxTotal - discountTotal);

  // Sync server actions success feedback
  useEffect(() => {
    if (state.success) {
      router.push("/invoices");
      router.refresh();
    }
  }, [router, state.success]);

  // Map server validation errors back to React Hook Form
  useEffect(() => {
    if (!state.fieldErrors) return;

    Object.entries(state.fieldErrors).forEach(([name, messages]) => {
      const message = messages?.[0];
      if (message) {
        setError(name as keyof InvoiceInput, { message });
      }
    });
  }, [setError, state.fieldErrors]);

  const submitForm = handleSubmit(() => {
    if (!formRef.current) return;

    startTransition(() => {
      formAction(new FormData(formRef.current!));
    });
  });

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      currency,
      style: "currency",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild size="icon-sm" variant="ghost">
          <Link href="/invoices">
            <ArrowLeftIcon />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {initialInvoice ? `Edit Invoice #${initialInvoice.invoiceNumber}` : "New Invoice"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {initialInvoice
              ? "Modify the line items and details of this invoice."
              : "Create a professional business invoice."}
          </p>
        </div>
      </div>

      <form onSubmit={submitForm} ref={formRef} className="space-y-6">
        {initialInvoice ? <input type="hidden" name="id" value={initialInvoice.id} /> : null}

        {/* hidden stringified array input for Server Actions */}
        <input type="hidden" name="itemsJson" value={JSON.stringify(items)} />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Details Panel */}
          <Card className="lg:col-span-2">
            <CardContent className="space-y-6 p-6">
              <h2 className="text-lg font-medium">Invoice Details</h2>

              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field data-invalid={Boolean(errors.customerId)}>
                    <FieldLabel htmlFor="customerId">Customer</FieldLabel>
                    <Select
                      defaultValue={defaultValues.customerId}
                      onValueChange={(val) => setValue("customerId", val, { shouldValidate: true })}
                    >
                      <SelectTrigger id="customerId">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.length === 0 ? (
                          <div className="p-2 text-center text-xs text-muted-foreground">
                            No customers found.{" "}
                            <Link href="/customers" className="font-semibold text-primary underline">
                              Add one first
                            </Link>
                          </div>
                        ) : (
                          customers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {/* fallback hidden select for form data parsing */}
                    <select className="hidden" {...register("customerId")}>
                      <option value="">Select a customer</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <FieldError errors={[errors.customerId]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.invoiceNumber)}>
                    <FieldLabel htmlFor="invoiceNumber">Invoice Number</FieldLabel>
                    <Input id="invoiceNumber" {...register("invoiceNumber")} placeholder="e.g. INV-0021" />
                    <FieldError errors={[errors.invoiceNumber]} />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <Field data-invalid={Boolean(errors.invoiceDate)}>
                    <FieldLabel htmlFor="invoiceDate">Invoice Date</FieldLabel>
                    <Input id="invoiceDate" type="date" {...register("invoiceDate")} />
                    <FieldError errors={[errors.invoiceDate]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.status)}>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select
                      defaultValue={defaultValues.status}
                      onValueChange={(val) => setValue("status", val as any)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <select className="hidden" {...register("status")}>
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <FieldError errors={[errors.status]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.currency)}>
                    <FieldLabel htmlFor="currency">Currency</FieldLabel>
                    <Select
                      defaultValue={defaultValues.currency}
                      onValueChange={(val) => setValue("currency", val)}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                    <select className="hidden" {...register("currency")}>
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                    <FieldError errors={[errors.currency]} />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Pricing Totals Sidebar Card */}
          <Card className="flex flex-col justify-between">
            <CardContent className="space-y-6 p-6">
              <h2 className="text-lg font-medium">Invoice Summary</h2>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Tax Total:</span>
                  <span className="font-semibold text-destructive">+{formatMoney(taxTotal)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Discount:</span>
                  <span className="font-semibold text-emerald-600">-{formatMoney(discountTotal)}</span>
                </div>
                <div className="flex justify-between pt-1.5 text-base font-bold text-foreground">
                  <span>Grand Total:</span>
                  <span>{formatMoney(grandTotal)}</span>
                </div>
              </div>

              <FieldGroup className="mt-4">
                <Field data-invalid={Boolean(errors.taxRate)}>
                  <FieldLabel htmlFor="taxRate">Tax Rate (%)</FieldLabel>
                  <Input
                    id="taxRate"
                    type="number"
                    step="any"
                    {...register("taxRate")}
                  />
                  <FieldError errors={[errors.taxRate]} />
                </Field>

                <Field data-invalid={Boolean(errors.discountTotal)}>
                  <FieldLabel htmlFor="discountTotal">Discount (Flat Amount)</FieldLabel>
                  <Input
                    id="discountTotal"
                    type="number"
                    step="any"
                    {...register("discountTotal")}
                  />
                  <FieldError errors={[errors.discountTotal]} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        {/* Line Items Card */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Line Items</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ itemName: "", quantity: 1, rate: 0 })}
              >
                <PlusIcon data-icon="inline-start" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-end sm:border-none sm:pb-0">
                  <div className="flex-1">
                    {index === 0 && <label className="mb-2 hidden text-xs font-semibold text-muted-foreground sm:block">Item Description</label>}
                    <Input
                      placeholder="Item name / description"
                      {...register(`items.${index}.itemName` as const)}
                      required
                    />
                  </div>

                  <div className="w-full sm:w-24">
                    {index === 0 && <label className="mb-2 hidden text-xs font-semibold text-muted-foreground sm:block">Quantity</label>}
                    <Input
                      type="number"
                      step="1"
                      min="1"
                      placeholder="Qty"
                      {...register(`items.${index}.quantity` as const)}
                      required
                    />
                  </div>

                  <div className="w-full sm:w-36">
                    {index === 0 && <label className="mb-2 hidden text-xs font-semibold text-muted-foreground sm:block">Unit Price</label>}
                    <Input
                      type="number"
                      step="any"
                      placeholder="Rate"
                      {...register(`items.${index}.rate` as const)}
                      required
                    />
                  </div>

                  <div className="w-full sm:w-36">
                    {index === 0 && <label className="mb-2 hidden text-xs font-semibold text-muted-foreground sm:block">Line Total</label>}
                    <div className="flex h-10 items-center justify-end rounded-md border bg-accent/30 px-3 text-sm font-medium">
                      {formatMoney(
                        Number(watch(`items.${index}.quantity` as const) || 0) *
                          Number(watch(`items.${index}.rate` as const) || 0)
                      )}
                    </div>
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)}
                    >
                      <Trash2Icon />
                      <span className="sr-only">Delete item</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.items ? (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {errors.items.message}
              </p>
            ) : null}
          </CardContent>
        </Card>

        {/* Notes Card */}
        <Card>
          <CardContent className="p-6">
            <Field data-invalid={Boolean(errors.notes)}>
              <FieldLabel htmlFor="notes">Invoice Notes (Optional)</FieldLabel>
              <Textarea
                id="notes"
                placeholder="Include payment details, terms, or other custom information here..."
                rows={3}
                {...register("notes")}
              />
              <FieldError errors={[errors.notes]} />
            </Field>
          </CardContent>
        </Card>

        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline" type="button">
            <Link href="/invoices">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending || isSubmitting}>
            {isPending || isSubmitting ? "Saving..." : "Save Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
