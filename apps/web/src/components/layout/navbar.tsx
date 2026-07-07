"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell, LogOut, Settings, User, Compass, AlertCircle } from "lucide-react";
import { useAuth } from "@/src/lib/auth";
import { useNotificationStore } from "@/src/stores/notification-store";
import { useTourStore } from "@/src/stores/tour-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { NotificationDropdown } from "@/src/components/shared/notification-dropdown";
import { GlobalSearch } from "@/src/components/shared/global-search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  {
    href: "/what-we-do",
    label: "What We Do",
    children: [
      { href: "/what-we-do", label: "What We Do" },
      { href: "/innovators", label: "Innovators" },
      { href: "/mentors", label: "Mentors" },
      { href: "/investors", label: "Conscious Investors" },
    ],
  },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/donate", label: "Donate" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white shadow-sm">
      <div className="mx-auto flex h-[70px] max-w-[1173px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img src="/sol-logo.svg" alt="SOL" className="h-12 w-auto" />
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          {navLinks.map((link) =>
            "children" in link && link.children ? (
              <DropdownMenu key={link.label}>
                <DropdownMenuTrigger asChild>
                  <button className={`inline-flex items-center gap-1 text-sm font-medium transition-colors duration-300 hover:text-primary ${
                    pathname.startsWith(link.href)
                      ? "text-primary"
                      : "text-foreground"
                  }`}>
                    {link.label}
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {link.children.map((child) => (
                    <DropdownMenuItem key={child.href} asChild>
                      <Link href={child.href} className="cursor-pointer">
                        {child.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 hover:text-primary ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
          <GlobalSearch />
          <button
            onClick={() => useTourStore.getState().open()}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            title="Take a tour of SOL Hub"
          >
            <Compass className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <>
              <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative flex items-center gap-2 rounded-full outline-none">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {user?.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {user && !user.onboarding_completed && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-destructive" />
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.full_name}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  {user && !user.onboarding_completed && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/onboarding"
                          className="cursor-pointer bg-amber-50 focus:bg-amber-100"
                        >
                          <AlertCircle className="mr-2 h-4 w-4 text-amber-600" />
                          <span className="font-medium text-amber-800">Complete Onboarding</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${user?.role}`}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground transition-colors duration-300 hover:text-primary"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="btn-sol btn-sol-primary text-sm"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
              key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-3 py-2">
              <GlobalSearch />
            </div>
            <button
              onClick={() => {
                useTourStore.getState().open();
                setMobileOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
            >
              <Compass className="h-4 w-4" />
              Take a Tour
            </button>
            <hr className="my-2 border-border" />
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.full_name?.split(" ").map((n) => n[0]).join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-primary/10"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-sol btn-sol-primary mt-2 inline-block text-center text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
