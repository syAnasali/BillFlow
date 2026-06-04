import { FileTextIcon } from "lucide-react";
import Link from "next/link";

/**
 * Centers the public authentication screens inside a premium split-pane brand layout.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2 bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Brand Showcase Panel (Left Side, Desktop Only) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-zinc-950 border-r border-zinc-800/60 overflow-hidden">
        {/* Glow meshes */}
        <div className="absolute -left-1/4 -top-1/4 size-[150%] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />
        <div className="absolute right-0 bottom-0 size-[80%] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
        
        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <Link className="flex items-center gap-2.5 font-bold text-xl tracking-tight" href="/">
            <img
              src="/logo.png"
              alt="BillFlow"
              className="size-8 object-contain rounded-md"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <span className="hidden size-8 items-center justify-center rounded-lg bg-blue-600 text-white" style={{ display: "none" }}>
              <FileTextIcon className="size-4" />
            </span>
            <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">BillFlow</span>
          </Link>
        </div>

        {/* Feature Pitch List */}
        <div className="relative z-10 my-auto max-w-md space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Fast, secure, and standalone invoice generation.
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            BillFlow is a standalone invoicing workspace designed to track cash flows, organize client contacts, and stream professional A4 PDF bills.
          </p>

          <div className="space-y-3.5 pt-4">
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs">✓</span>
              <span>Compile & print A4 PDF invoices instantly</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs">✓</span>
              <span>Secure PostgreSQL row-level isolation (RLS)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs">✓</span>
              <span>Detailed cash-flow statistics metrics dashboard</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-zinc-500 font-medium">
          BillFlow Client v1.0 • Built with Next.js 15 & Supabase
        </div>
      </div>

      {/* Form Pane (Right Side, Centered) */}
      <div className="relative flex items-center justify-center p-6 bg-zinc-950 sm:p-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent opacity-50 pointer-events-none lg:hidden" />
        <div className="w-full max-w-sm relative z-10">
          {children}
        </div>
      </div>
    </main>
  );
}
