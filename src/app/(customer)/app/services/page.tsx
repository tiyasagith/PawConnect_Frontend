import type { Metadata } from "next";
import { CustomerServicesClient } from "./services-client";

export const metadata: Metadata = {
  title: "Care Services | PawConnect Pet Parent Portal",
  description:
    "Explore certified veterinary clinics, stress-free grooming salons, and positive behavior trainers for your pets.",
};

export default function CustomerServicesPage() {
  return <CustomerServicesClient />;
}

