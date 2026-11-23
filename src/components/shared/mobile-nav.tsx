"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronRight } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuthModal } from "@/stores/auth-modal.store";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: { label: string; href: string }[];
  showAuthButtons?: boolean;
}

export function MobileNav({
  isOpen,
  onClose,
  navigation,
  showAuthButtons = false,
}: MobileNavProps) {
  const pathname = usePathname();
  const { openLogin, openRegister } = useAuthModal();

  const handleLogin = () => {
    onClose();
    openLogin();
  };

  const handleRegister = () => {
    onClose();
    openRegister();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col justify-between">
        <div>
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <BrandLogo variant="compact" animate={false} href="/" />
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-1.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          </SheetHeader>

          <nav className="p-3 space-y-1 overflow-y-auto" aria-label="Mobile navigation">
            {navigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : item.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all",
                    isActive
                      ? "bg-primary-soft text-primary font-semibold shadow-2xs"
                      : "text-foreground hover:bg-muted/70"
                  )}
                >
                  <span>{item.label}</span>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isActive ? "text-primary opacity-100" : "text-muted-foreground opacity-40"
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {showAuthButtons && (
          <div className="p-4 border-t border-border bg-surface/30 space-y-2.5">
            <Button variant="outline" className="w-full rounded-xl h-10.5 font-semibold" onClick={handleLogin}>
              Login
            </Button>
            <Button className="w-full rounded-xl h-10.5 font-semibold shadow-sm" onClick={handleRegister}>
              Sign Up
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
