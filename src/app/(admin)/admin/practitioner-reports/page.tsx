import type { Metadata } from "next";
import { PractitionerReportsClient } from "./practitioner-reports-client";

export const metadata: Metadata = {
  title: "Doctor & Provider Patient Tracking — Admin Portal",
  description:
    "Track clinical doctor and service provider patient visits, completed treatments, upcoming sessions, and verified revenue.",
};

export default function PractitionerReportsPage() {
  return <PractitionerReportsClient />;
}

