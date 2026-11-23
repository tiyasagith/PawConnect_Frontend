"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "./brand-logo";
import { MobileNav } from "./mobile-nav";
import { Menu, ShoppingBag } from "lucide-react";
import { useAuthModal } from "@/stores/auth-modal.store";
import { useAuthStore } from "@/stores/auth.store";
import { useGlobalCart } from "@/providers/CartProvider";
import { UserMenu } from "./user-menu";
import { NotificationDropdown } from "./notification-dropdown";
import { cn } from "@/lib/utils";

interface PublicHeaderProps {
  className?: string;
}

export function PublicHeader({ className }: PublicHeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [hoveredNav, setHoveredNav] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const { openLogin, openRegister } = useAuthModal();
  const { isAuthenticated, primaryRole } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();
  const { cartCount } = useGlobalCart();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const publicNav = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Pet Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "FAQs", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ];

  const isPetOwner = mounted && isAuthenticated && primaryRole === "PET_OWNER";

  // PET_OWNER gets the customer portal navigation.
  // Other roles (ADMIN, VETERINARIAN, SERVICE_PROVIDER) and guests see publicNav.
  const customerNav = [
    { label: "Home", href: "/app" },
    { label: "Services", href: "/app/services" },
    { label: "Pet Shop", href: "/app/shop" },
    { label: "My Pets", href: "/app/pets" },
    { label: "My Bookings", href: "/app/bookings" },
    { label: "Orders", href: "/app/orders" },
    { label: "Profile", href: "/app/profile" },
  ];

  const navigation = isPetOwner ? customerNav : publicNav;

  const dashboardHref =
    primaryRole === "ADMIN"
      ? "/admin"
      : primaryRole === "VETERINARIAN"
      ? "/vet"
      : primaryRole === "SERVICE_PROVIDER"
      ? "/provider"
      : "/app";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300 ease-out motion-reduce:transition-none",
        isScrolled
          ? "border-b border-border/80 bg-background/85 py-2.5 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/75"
          : "border-b border-border/40 bg-background/60 py-3.5 backdrop-blur-md supports-[backdrop-filter]:bg-background/50",
        className
      )}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4"
        aria-label="Main navigation"
      >
        {/* Brand Logo with responsive sizing */}
        <div className="shrink-0 flex items-center">
          {/* Default on desktop, compact on mobile */}
          <div className="hidden sm:block">
            <BrandLogo
              variant="default"
              animate={true}
              href={!mounted || !isAuthenticated ? "/" : dashboardHref}
            />
          </div>
          <div className="sm:hidden">
            <BrandLogo
              variant="compact"
              animate={true}
              href={!mounted || !isAuthenticated ? "/" : dashboardHref}
            />
          </div>
        </div>

        {/* Center: Desktop Navigation Links with animated sliding pill */}
        <div
          className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 p-1 rounded-full bg-surface/50 border border-border/40 shadow-2xs backdrop-blur-xs"
          onMouseLeave={() => setHoveredNav(null)}
        >
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href);
            const isHovered = hoveredNav === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                onMouseEnter={() => setHoveredNav(item.href)}
                className={cn(
                  "relative px-3.5 py-1.5 text-xs xl:text-sm font-medium transition-colors rounded-full whitespace-nowrap select-none",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active Animated Background Pill */}
                {isActive && !shouldReduceMotion && (
                  <motion.span
                    layoutId="header-active-nav"
                    className="absolute inset-0 rounded-full bg-primary-soft/50 dark:bg-primary-soft/30 shadow-2xs -z-10 border border-primary/20"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {/* Hover Animated Background Pill */}
                {isHovered && !isActive && !shouldReduceMotion && (
                  <motion.span
                    layoutId="header-hover-nav"
                    className="absolute inset-0 rounded-full bg-muted/60 -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}

                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side: Actions, Cart, Notifications, Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Shopping Cart Link */}
          <Link
            href="/app/shop/cart"
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault();
                openLogin();
              }
            }}
            className="relative flex h-9 w-9 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-full hover:bg-muted/80 transition-colors text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-transparent hover:border-border/60"
            aria-label={`View shopping cart (${cartCount} items)`}
          >
            <ShoppingBag className="h-4.5 w-4.5 text-foreground transition-transform hover:scale-105" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground shadow-xs animate-in zoom-in-75 duration-200">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* Notification dropdown for logged-in users */}
          {mounted && isAuthenticated && <NotificationDropdown />}

          {/* Desktop Auth Controls */}
          {mounted && isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              {primaryRole !== "PET_OWNER" && (
                <Link
                  href={dashboardHref}
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/25 transition-all shadow-2xs hover:shadow-xs active:scale-95"
                >
                  Dashboard
                </Link>
              )}
              <UserMenu />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={openLogin}
                className="rounded-full px-4 text-xs font-semibold hover:bg-muted/70 h-9"
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={openRegister}
                className="rounded-full px-5 text-xs font-semibold shadow-xs h-9 active:scale-95 transition-transform"
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile User Profile (when logged in on small screen) */}
          {mounted && isAuthenticated && (
            <div className="sm:hidden">
              <UserMenu />
            </div>
          )}

          {/* Mobile Navigation Drawer Trigger */}
          <button
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-border/50"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Responsive Drawer Navigation */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navigation={navigation}
        showAuthButtons={!mounted || !isAuthenticated}
      />
    </header>
  );
}
