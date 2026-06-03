import { z } from "zod";

/**
 * Shared browser and server validation for the business profile form.
 */
export const businessProfileSchema = z.object({
  name: z.string().trim().min(1, "Business name is required.").max(120),
  phone: z.string().trim().max(30).optional(),
  email: z
    .string()
    .trim()
    .email("Enter a valid business email.")
    .max(254)
    .optional()
    .or(z.literal("")),
  address: z.string().trim().max(500).optional(),
  gstNumber: z.string().trim().max(30).optional(),
  logoUrl: z
    .string()
    .trim()
    .url("Enter a valid logo URL.")
    .max(2048)
    .optional()
    .or(z.literal("")),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
