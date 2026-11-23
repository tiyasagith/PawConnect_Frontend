import type { Metadata } from "next";
import { VetReportsClient } from "./vet-reports-client";

export const metadata: Metadata = {
  title: "Clinical Patient Tracking & Practice Analytics — Veterinarian Portal",
  description:
    "Review your patient visit logs, completed clinical treatments, upcoming consultations, and practice revenue.",
};

export default function VetReportsPage() {
  return <VetReportsClient />;
}

