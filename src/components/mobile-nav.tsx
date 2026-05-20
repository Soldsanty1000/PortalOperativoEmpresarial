"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string };

export function MobileNav({ items, plaza }: { items: Item[]; plaza: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <div>
          <h2 className="text-base font-bold text-primary">Portal Operativo</h2>
          <p className="text-[10px] text-muted-foreground">{plaza}</p>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2" aria-label="Menú">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="bg-white border-b shadow-lg">
          {items.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-4 py-3 text-sm border-b last:border-b-0",
                pathname === href
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
