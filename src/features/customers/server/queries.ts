import { createClient } from "@/lib/supabase/server";
import type { CustomerPage } from "@/features/customers/types/customer";

const DEFAULT_PAGE_SIZE = 10;

function normalizePage(page?: string) {
  const parsedPage = Number.parseInt(page ?? "1", 10);
  return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

function normalizeSearch(search?: string) {
  return search?.trim().slice(0, 100) ?? "";
}

/**
 * Loads one user-scoped customer page. The URL-driven page and search inputs
 * keep the list ready for server-rendered pagination as the dataset grows.
 */
export async function getCustomersPage({
  page,
  search,
}: {
  page?: string;
  search?: string;
}): Promise<CustomerPage> {
  const currentPage = normalizePage(page);
  const normalizedSearch = normalizeSearch(search);
  const from = (currentPage - 1) * DEFAULT_PAGE_SIZE;
  const to = from + DEFAULT_PAGE_SIZE - 1;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    throw new Error("Your session has expired. Sign in and try again.");
  }

  let query = supabase
    .from("customers")
    .select("id, name, phone, email, address, created_at", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (normalizedSearch) {
    const escapedSearch = normalizedSearch.replace(/[%_\\]/g, "\\$&");
    query = query.ilike("name", `%${escapedSearch}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Unable to load customers: ${error.message}`);
  }

  const totalCount = count ?? 0;

  return {
    customers: (data ?? []).map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      createdAt: customer.created_at,
    })),
    page: currentPage,
    pageSize: DEFAULT_PAGE_SIZE,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE)),
    search: normalizedSearch,
  };
}
