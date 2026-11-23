import type { Metadata } from "next";
import { VeterinaryClient } from "./veterinary-client";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Veterinary Doctors & Urgent Care - PawConnect",
  description:
    "Find and book appointments with board-certified veterinary doctors, surgeons, dermatologists, and dentists near you.",
};

export default function VeterinaryPage() {
  return (
    <div className="py-6 sm:py-10 md:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 md:space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto px-1 sm:px-0">
          <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
            Veterinary Medicine
          </Badge>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Certified Veterinary Doctors
          </h1>
          <p className="font-decorative text-xl xs:text-2xl sm:text-3xl font-bold text-primary leading-tight">
            Compassionate diagnostics & surgical excellence
          </p>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground leading-relaxed">
            Browse our network of licensed veterinary practitioners. Filter by specialty,
            inspect credentials, and choose convenient appointment slots.
          </p>
        </div>

        {/* Interactive Client Discovery */}
        <VeterinaryClient />
      </div>
    </div>
  );
}
