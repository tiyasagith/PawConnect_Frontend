"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  User,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";
import { Tooltip } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BrandLogo } from "@/components/shared/brand-logo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const vetNavItems: NavItem[] = [
  { label: "Dashboard", href: "/vet", icon: LayoutDashboard },
  { label: "Appointments", href: "/vet/appointments", icon: CalendarDays },
  { label: "Patient Log & Reports", href: "/vet/reports", icon: ClipboardCheck },
  { label: "Availability", href: "/vet/availability", icon: Clock },
  { label: "Profile", href: "/vet/profile", icon: User },
];

const providerNavItems: NavItem[] = [
  { label: "Dashboard", href: "/provider", icon: LayoutDashboard },
  { label: "Bookings", href: "/provider/bookings", icon: CalendarDays },
  { label: "Client Log & Reports", href: "/provider/reports", icon: ClipboardCheck },
  { label: "Services", href: "/provider/services", icon: ShoppingBag },
  { label: "Availability", href: "/provider/availability", icon: Clock },
  { label: "Profile", href: "/provider/profile", icon: User },
];

interface ProfessionalSidebarProps {
  role: "vet" | "provider";
}

export function ProfessionalSidebar({ role }: ProfessionalSidebarProps) {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar, isMobileNavOpen, closeMobileNav } = useUIStore();

  const navItems = role === "vet" ? vetNavItems : providerNavItems;
  const baseHref = role === "vet" ? "/vet" : "/provider";
  const portalName = role === "vet" ? "Veterinarian Portal" : "Service Provider Portal";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col fixed inset-y-0 left-0 z-30 border-r border-border bg-sidebar transition-[width] duration-[250ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none overflow-hidden",
          isSidebarCollapsed ? "w-16" : "w-56"
        )}
        aria-label={portalName}
      >
        {/* Brand Logo matching landing page */}
        <div className="flex h-14 items-center border-b border-border px-3 shrink-0 overflow-hidden whitespace-nowrap">
          {isSidebarCollapsed ? (
            <div className="flex w-full items-center justify-center">
              <BrandLogo variant="icon" animate={true} href={baseHref} />
            </div>
          ) : (
            <div className="flex flex-col min-w-0">
              <BrandLogo variant="compact" animate={true} href={baseHref} />
              <span className="text-[9px] text-primary font-bold uppercase tracking-wider pl-0.5 pt-0.5 truncate leading-none">
                {role === "vet" ? "Veterinarian" : "Service Provider"}
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2 overflow-x-hidden">
          {navItems.map((item) => {
            const isActive =
              item.href === baseHref
                ? pathname === baseHref
                : pathname?.startsWith(item.href);
            const Icon = item.icon;

            return isSidebarCollapsed ? (
              <Tooltip key={item.href} content={item.label} side="right">
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    "flex h-9 w-full items-center justify-center rounded-lg transition-colors overflow-hidden whitespace-nowrap",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </Link>
              </Tooltip>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors overflow-hidden whitespace-nowrap",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-border shrink-0 overflow-hidden">
          <button
            onClick={toggleSidebar}
            className={cn(
              "flex h-9 w-full items-center rounded-lg hover:bg-sidebar-accent transition-colors overflow-hidden whitespace-nowrap",
              isSidebarCollapsed ? "justify-center" : "px-3"
            )}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium overflow-hidden whitespace-nowrap">
                <ChevronLeft className="h-4 w-4 shrink-0" />
                <span className="truncate">Collapse Navigation</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Sheet */}
      <Sheet open={isMobileNavOpen} onOpenChange={(open) => !open && closeMobileNav()}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground">
          <SheetHeader className="h-16 px-4 border-b border-border flex flex-row items-center justify-between text-left">
            <div className="flex flex-col min-w-0">
              <SheetTitle className="sr-only">{portalName}</SheetTitle>
              <BrandLogo variant="default" animate={true} href={baseHref} />
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider pl-0.5 pt-0.5">
                {role === "vet" ? "Veterinarian Portal" : "Service Provider Portal"}
              </span>
            </div>
            <button
              onClick={closeMobileNav}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </SheetHeader>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === baseHref
                  ? pathname === baseHref
                  : pathname?.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileNav}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
