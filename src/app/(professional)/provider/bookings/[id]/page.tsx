import type { Metadata } from "next";
import { ProviderBookingDetailClient } from "./provider-booking-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Booking ${id} - Service Provider Portal`,
    description: "Detailed pet patient profile, service schedule, and care session history.",
  };
}

export default async function ProviderBookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ProviderBookingDetailClient bookingId={id} />;
}

