import type { Metadata } from "next";
import { ProviderReportsClient } from "./provider-reports-client";

export const metadata: Metadata = {
  title: "Client Session Tracking & Performance Reports — Service Provider Portal",
  description:
    "Review your client booking history, completed grooming & training sessions, upcoming appointments, and business revenue.",
};

export default function ProviderReportsPage() {
  return <ProviderReportsClient />;
}

