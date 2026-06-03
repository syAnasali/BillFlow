import { z } from "zod";

/**
 * Shared browser and server validation for customer create and edit forms.
 */
export const customerSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Customer name is required.").max(120),
  phone: z.string().trim().max(30).optional(),
  email: z
    .string()
    .trim()
    .email("Enter a valid customer email.")
    .max(254)
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(500).optional(),
});

export const customerIdSchema = z.uuid();

export type CustomerInput = z.infer<typeof customerSchema>;
