import type { Metadata } from "next";
import { ContactClient } from "./contact-client";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Contact PawConnect - Customer & Veterinary Support",
  description:
    "Get in touch with the PawConnect pet care team. We are available 7 days a week to assist with appointments, orders, and clinical questions.",
};

export default function ContactPage() {
  return (
    <div className="py-6 sm:py-10 md:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 space-y-8 sm:space-y-10 md:space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto px-1 sm:px-0">
          <Badge variant="cream" className="text-xs">
            We&apos;re Here to Help
          </Badge>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Contact PawConnect
          </h1>
          <p className="font-decorative text-xl xs:text-2xl sm:text-3xl font-bold text-primary leading-tight">
            Friendly support for pet parents & specialists
          </p>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground leading-relaxed">
            Have a question, feedback, or need help finding the right veterinary clinic?
            Reach out via the form below or contact our care coordinators directly.
          </p>
        </div>

        {/* Interactive Form & Contact Details */}
        <ContactClient />
      </div>
    </div>
  );
}
