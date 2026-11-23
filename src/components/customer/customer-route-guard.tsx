"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/shared/role-guard";

// Routes that any guest can browse without being blocked by RoleGuard:
const PUBLIC_PREFIXES = [
  "/app/shop/products",
  "/app/shop",
  "/app/services",
];

export function CustomerRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Checkout strictly requires authentication
  const isCheckout =
    pathname === "/app/shop/checkout" ||
    pathname?.startsWith("/app/shop/checkout");

  const isPublicRoute =
    !isCheckout &&
    PUBLIC_PREFIXES.some(
      (prefix) => pathname === prefix || pathname?.startsWith(prefix + "/")
    );

  if (isPublicRoute) {
    return <>{children}</>;
  }

  return (
    <RoleGuard allowedRoles={["PET_OWNER", "ADMIN"]}>
      {children}
    </RoleGuard>
  );
}
