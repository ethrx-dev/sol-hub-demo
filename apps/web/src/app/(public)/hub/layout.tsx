"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  UserPlus,
  MessageCircle,
  Calendar,
  Images,
  BookOpen,
} from "lucide-react";
import { isFeatureEnabled } from "@/src/lib/features";

const NAV_ITEMS = [
  { href: "/hub", label: "Feed", icon: MessageSquare },
  { href: "/hub/groups", label: "Groups", icon: Users },
  { href: "/hub/members", label: "Members", icon: Users },
  { feature: "connections", href: "/hub/connections", label: "Network", icon: UserPlus },
  { feature: "forums", href: "/hub/forums", label: "Forums", icon: MessageCircle },
  { feature: "events", href: "/hub/events", label: "Events", icon: Calendar },
  { feature: "galleries", href: "/hub/galleries", label: "Galleries", icon: Images },
  { feature: "document_library", href: "/hub/documents", label: "Documents", icon: BookOpen },
  { feature: "blog", href: "/hub/blog", label: "Blog", icon: BookOpen },
];

export default function HubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/hub") return pathname === "/hub";
    return pathname.startsWith(href);
  };

  const items = NAV_ITEMS.filter(
    (item) => !item.feature || isFeatureEnabled(item.feature)
  );

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8">
        <nav className="flex flex-wrap gap-1 border-b pb-2 mb-6 overflow-x-auto">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </>
  );
}
