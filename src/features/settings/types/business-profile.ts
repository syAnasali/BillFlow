/**
 * Business profile shape returned from the database to the Settings screen.
 */
export type BusinessProfile = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstNumber: string | null;
  logoUrl: string | null;
};

/**
 * Serializable status returned by the save Server Action.
 */
export type BusinessProfileActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Partial<
    Record<
      "name" | "phone" | "email" | "address" | "gstNumber" | "logoUrl",
      string[]
    >
  >;
};
