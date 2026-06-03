"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PencilIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  customerSchema,
  type CustomerInput,
} from "@/features/customers/schemas/customer";
import { saveCustomer } from "@/features/customers/server/actions";
import type {
  Customer,
  CustomerActionState,
} from "@/features/customers/types/customer";

const initialState: CustomerActionState = {};

type CustomerFormDialogProps = {
  customer?: Customer;
};

/**
 * Reusable create and edit dialog backed by React Hook Form and a Server Action.
 */
export function CustomerFormDialog({ customer }: CustomerFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    saveCustomer,
    initialState,
  );
  const [isSubmitting, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      id: customer?.id,
      name: customer?.name ?? "",
      phone: customer?.phone ?? "",
      email: customer?.email ?? "",
      address: customer?.address ?? "",
    },
  });

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      router.refresh();
    }
  }, [router, state.success]);

  useEffect(() => {
    if (!state.fieldErrors) {
      return;
    }

    Object.entries(state.fieldErrors).forEach(([name, messages]) => {
      const message = messages?.[0];

      if (message) {
        setError(name as keyof CustomerInput, { message });
      }
    });
  }, [setError, state.fieldErrors]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      reset({
        id: customer?.id,
        name: customer?.name ?? "",
        phone: customer?.phone ?? "",
        email: customer?.email ?? "",
        address: customer?.address ?? "",
      });
    }
  }

  const submitForm = handleSubmit(() => {
    if (!formRef.current) {
      return;
    }

    startTransition(() => {
      formAction(new FormData(formRef.current!));
    });
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {customer ? (
          <Button size="icon-sm" variant="ghost">
            <PencilIcon />
            <span className="sr-only">Edit {customer.name}</span>
          </Button>
        ) : (
          <Button>
            <PlusIcon data-icon="inline-start" />
            Add customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{customer ? "Edit customer" : "Add customer"}</DialogTitle>
          <DialogDescription>
            Save the contact details used when creating invoices.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-6" onSubmit={submitForm} ref={formRef}>
          {customer ? <input type="hidden" {...register("id")} /> : null}
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor={`customer-name-${customer?.id ?? "new"}`}>
                Name
              </FieldLabel>
              <Input
                id={`customer-name-${customer?.id ?? "new"}`}
                {...register("name")}
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <div className="grid gap-7 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.phone)}>
                <FieldLabel htmlFor={`customer-phone-${customer?.id ?? "new"}`}>
                  Phone
                </FieldLabel>
                <Input
                  id={`customer-phone-${customer?.id ?? "new"}`}
                  {...register("phone")}
                />
                <FieldError errors={[errors.phone]} />
              </Field>
              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor={`customer-email-${customer?.id ?? "new"}`}>
                  Email
                </FieldLabel>
                <Input
                  id={`customer-email-${customer?.id ?? "new"}`}
                  type="email"
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
            </div>
            <Field data-invalid={Boolean(errors.address)}>
              <FieldLabel htmlFor={`customer-address-${customer?.id ?? "new"}`}>
                Address
              </FieldLabel>
              <Textarea
                id={`customer-address-${customer?.id ?? "new"}`}
                rows={3}
                {...register("address")}
              />
              <FieldError errors={[errors.address]} />
            </Field>
          </FieldGroup>
          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" disabled={isPending || isSubmitting}>
              {isPending || isSubmitting ? "Saving..." : "Save customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
