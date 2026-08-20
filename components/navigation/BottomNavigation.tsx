"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { href: "/", label: "Map", icon: Map, match: (path: string) => path === "/" },
  { href: "/explore", label: "Explore", icon: Compass, match: (path: string) => path.startsWith("/explore") },
  { href: "/saved", label: "Saved", icon: Bookmark, match: (path: string) => path.startsWith("/saved") },
  { href: "/profile", label: "Profile", icon: User, match: (path: string) => path.startsWith("/profile") },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-ink bg-paper pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  active ? "text-ink" : "text-grey-400 hover:text-grey-600"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
