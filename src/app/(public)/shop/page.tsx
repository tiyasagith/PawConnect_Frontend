import type { Metadata } from "next";
import { ShopClient } from "./shop-client";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "In-House Pet Shop - PawConnect",
  description:
    "Shop verified in-house pet nutrition, non-toxic chew toys, ergonomic harnesses, and hypoallergenic grooming essentials.",
};

export default function ShopPage() {
  return (
    <div className="py-6 sm:py-10 md:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 md:space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto px-1 sm:px-0">
          <Badge variant="cream" className="text-xs">
            PawConnect In-House Supply
          </Badge>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            The Pet Essentials Shop
          </h1>
          <p className="font-decorative text-xl xs:text-2xl sm:text-3xl font-bold text-primary leading-tight">
            Nutritious, durable, and veterinarian-approved
          </p>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground leading-relaxed">
            Every product in our store is directly stocked, tested, and shipped by PawConnect.
            No unverified third-party sellers, no counterfeit items—only the highest standard for your companion.
          </p>
        </div>

        {/* Interactive Shop Discovery */}
        <ShopClient />
      </div>
    </div>
  );
}
