"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Lightbulb,
  Users,
  BookOpen,
  Search,
  Handshake,
  DollarSign,
  UserCog,
  ChevronLeft,
  ChevronRight,
  X,
  Bell,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth, type UserRole } from "@/src/lib/auth";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const roleLinks: Record<UserRole, SidebarLink[]> = {
  innovator: [
    { href: "/innovator", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/innovator/projects", label: "My Projects", icon: <FolderKanban className="h-4 w-4" /> },
    { href: "/innovator/projects/new", label: "Submit Idea", icon: <Lightbulb className="h-4 w-4" /> },
    { href: "/innovator/matches", label: "My Matches", icon: <Handshake className="h-4 w-4" /> },
    { href: "/workspaces", label: "Workspaces", icon: <FolderKanban className="h-4 w-4" /> },
    { href: "/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { href: "/hub", label: "Hub", icon: <Users className="h-4 w-4" /> },
    { href: "/resources", label: "Resources", icon: <BookOpen className="h-4 w-4" /> },
  ],
  mentor: [
    { href: "/mentor", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/mentor/browse", label: "Browse Projects", icon: <Search className="h-4 w-4" /> },
    { href: "/mentor/matches", label: "My Matches", icon: <Handshake className="h-4 w-4" /> },
    { href: "/workspaces", label: "Workspaces", icon: <FolderKanban className="h-4 w-4" /> },
    { href: "/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { href: "/hub", label: "Hub", icon: <Users className="h-4 w-4" /> },
    { href: "/resources", label: "Resources", icon: <BookOpen className="h-4 w-4" /> },
  ],
  investor: [
    { href: "/investor", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/investor/browse", label: "Browse Projects", icon: <Search className="h-4 w-4" /> },
    { href: "/investor/matches", label: "My Matches", icon: <Handshake className="h-4 w-4" /> },
    { href: "/investor/portfolio", label: "My Investments", icon: <DollarSign className="h-4 w-4" /> },
    { href: "/workspaces", label: "Workspaces", icon: <FolderKanban className="h-4 w-4" /> },
    { href: "/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { href: "/hub", label: "Hub", icon: <Users className="h-4 w-4" /> },
    { href: "/resources", label: "Resources", icon: <BookOpen className="h-4 w-4" /> },
  ],
  participant: [
    { href: "/participant", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/hub", label: "Hub", icon: <Users className="h-4 w-4" /> },
    { href: "/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { href: "/resources", label: "Resources", icon: <BookOpen className="h-4 w-4" /> },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/admin/users", label: "Users", icon: <UserCog className="h-4 w-4" /> },
    { href: "/admin/projects", label: "Projects", icon: <FolderKanban className="h-4 w-4" /> },
    { href: "/admin/matches", label: "Matches", icon: <Handshake className="h-4 w-4" /> },
    { href: "/admin/pages", label: "Pages", icon: <FileText className="h-4 w-4" /> },
    { href: "/admin/media", label: "Media", icon: <ImageIcon className="h-4 w-4" /> },
    { href: "/admin/pillar-submissions", label: "Pillar Submissions", icon: <FolderKanban className="h-4 w-4" /> },
    { href: "/admin/groups", label: "Groups", icon: <Users className="h-4 w-4" /> },
    { href: "/admin/posts", label: "Posts", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/admin/stories", label: "Stories", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/admin/donations", label: "Donations", icon: <DollarSign className="h-4 w-4" /> },
    { href: "/admin/resources", label: "Resources", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/hub", label: "Hub", icon: <Users className="h-4 w-4" /> },
    { href: "/resources", label: "Resources", icon: <BookOpen className="h-4 w-4" /> },
  ],
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const links = roleLinks[user.role] || [];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] flex-col border-r border-border bg-white transition-all duration-300 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center justify-end p-2">
          <button
            onClick={() => {
              setCollapsed(!collapsed);
              onClose();
            }}
            className="hidden rounded-md p-1 hover:bg-primary/10 lg:block"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-primary/10 lg:hidden"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-2 pb-4">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-[0_10px_0_10px] px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
                title={collapsed ? link.label : undefined}
              >
                {link.icon}
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
