"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileTextIcon,
  LayoutDashboardIcon,
  MenuIcon,
  ReceiptTextIcon,
  SettingsIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut } from "@/features/auth/server/actions";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/customers", label: "Customers", icon: UsersIcon },
  { href: "/invoices", label: "Invoices", icon: ReceiptTextIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

type DashboardShellProps = {
  children: React.ReactNode;
  userEmail?: string;
};

function Brand() {
  return (
    <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
      <img
        src="/logo.png"
        alt="BillFlow Logo"
        className="size-8 object-contain rounded-md"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <span className="hidden size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <FileTextIcon className="size-4" />
      </span>
      <span>BillFlow</span>
    </Link>
  );
}

function SidebarNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navigation.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        const link = (
          <Link
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            href={href}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );

        return mobile ? (
          <SheetClose asChild key={href}>
            {link}
          </SheetClose>
        ) : (
          <div key={href}>{link}</div>
        );
      })}
    </nav>
  );
}

function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Brand />
      </div>
      <div className="flex-1 px-3 py-6">
        <SidebarNavigation />
      </div>
      <div className="border-t px-4 py-4">
        <p className="text-xs text-muted-foreground">Invoice management</p>
      </div>
    </aside>
  );
}

function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="lg:hidden" size="icon-sm" variant="ghost">
          <MenuIcon />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-72" side="left">
        <SheetHeader className="border-b">
          <SheetTitle>
            <Brand />
          </SheetTitle>
        </SheetHeader>
        <div className="px-3 py-2">
          <SidebarNavigation mobile />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Responsive SaaS application frame shared by all protected routes.
 */
export function DashboardShell({ children, userEmail }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <DesktopSidebar />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <MobileSidebar />
              <p className="text-sm font-medium text-muted-foreground">
                Workspace
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-sm" variant="outline">
                  <UserRoundIcon />
                  <span className="sr-only">Open account menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {userEmail ?? "Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <SettingsIcon />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={signOut}>
                  <DropdownMenuItem asChild>
                    <button className="w-full" type="submit">
                      Sign out
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
