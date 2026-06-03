import Link from "next/link";

import { Button } from "@/components/ui/button";

type CustomersPaginationProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  search: string;
};

function getPageHref(page: number, search: string) {
  const params = new URLSearchParams();
  params.set("page", page.toString());

  if (search) {
    params.set("search", search);
  }

  return `/customers?${params.toString()}`;
}

/**
 * URL-based customer pagination that remains compatible with server rendering.
 */
export function CustomersPagination({
  page,
  totalPages,
  totalCount,
  search,
}: CustomersPaginationProps) {
  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        {totalCount} customer{totalCount === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline" disabled={page <= 1}>
          <Link
            aria-disabled={page <= 1}
            href={page <= 1 ? "#" : getPageHref(page - 1, search)}
          >
            Previous
          </Link>
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          asChild
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
        >
          <Link
            aria-disabled={page >= totalPages}
            href={page >= totalPages ? "#" : getPageHref(page + 1, search)}
          >
            Next
          </Link>
        </Button>
      </div>
    </div>
  );
}
