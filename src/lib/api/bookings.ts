/**
 * Customer Bookings API
 * Connects to Spring Boot /api/me/appointments, /api/me/service-bookings, and /api/me/bookings endpoints.
 */

import { apiGet, apiPost, apiPatch, type PageResponse } from "./client";
import { formatBusinessTime } from "@/lib/utils/date";
import {
  type CustomerBooking,
} from "@/lib/mock/bookings";
import { fetchPets } from "./pets";

export type { CustomerBooking };

interface BackendBookingSummary {
  id: number;
  bookingType: "VETERINARY" | "SERVICE";
  referenceNo: string;
  petId: number;
  petName: string;
  species?: string;
  breed?: string;
  petPhotoUrl?: string;
  petGender?: string;
  petDateOfBirth?: string;
  petAgeYears?: number;
  petWeight?: number;
  petColor?: string;
  petMicrochipNumber?: string;
  petNotes?: string;
  ownerId?: number;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  qualification?: string;
  specialization?: string;
  licenseNumber?: string;
  isReviewed?: boolean;
  reviewRating?: number;
  reviewComment?: string;
  reviewCreatedAt?: string;
  providerId: number;
  providerName: string;
  providerType?: string;
  providerPhone?: string;
  providerImageUrl?: string;
  clinicOrBusinessName?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  serviceId?: number;
  serviceOrReason?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  amount?: number;
  status: string;
  paymentStatus?: string;
  notes?: string;
  paymentExpiresAt?: string;
  remainingPaymentSeconds?: number;
  canRetryPayment?: boolean;
  createdAt?: string;
  petMedicalRecords?: Array<{
    id: number;
    recordType?: string;
    diagnosis?: string;
    treatment?: string;
    medicines?: string;
    notes?: string;
    attachmentUrl?: string;
    recordDate: string;
    veterinarianName?: string;
  }>;
}

function mapStatus(status: string): CustomerBooking["status"] {
  const norm = status?.toUpperCase();
  if (norm === "COMPLETED") return "completed";
  if (norm === "CANCELLED") return "cancelled";
  if (norm === "NO_SHOW") return "no-show";
  return "scheduled";
}

function mapBackendBooking(b: BackendBookingSummary): CustomerBooking {
  const isVet = b.bookingType === "VETERINARY";
  const isTraining =
    !isVet &&
    (b.serviceOrReason?.toLowerCase().includes("train") ||
      b.providerType?.toLowerCase().includes("train"));
  const bookingType: CustomerBooking["type"] = isVet
    ? "veterinary"
    : isTraining
    ? "training"
    : "grooming";

  const dynamicPetPhoto = b.petPhotoUrl?.trim() || "";

  const pStatus = b.paymentStatus?.toUpperCase();
  const rawStatus = b.status?.toUpperCase();
  const isConfirmedOrCompleted = rawStatus === "CONFIRMED" || rawStatus === "COMPLETED";
  const isExplicitlyPaid = pStatus === "SUCCESS" || pStatus === "PAID";
  const mappedPaymentStatus: CustomerBooking["paymentStatus"] =
    isExplicitlyPaid || (isConfirmedOrCompleted && !b.paymentExpiresAt)
      ? "paid"
      : pStatus === "REFUNDED"
      ? "refunded"
      : "pending";

  const isPendingPayment = mappedPaymentStatus === "pending";

  return {
    id: String(b.id),
    appointmentNumber: b.referenceNo || `BK-${b.id}`,
    type: bookingType,
    providerId: String(b.providerId),
    providerName:
      b.providerName ||
      (isVet ? "PawConnect Veterinarian" : "PawConnect Specialist"),
    providerTitle: isVet
      ? "Licensed Veterinary Practitioner"
      : "Certified Specialist",
    providerClinicOrBusiness:
      b.clinicOrBusinessName ||
      (isVet
        ? "PawConnect Central Animal Hospital"
        : "PawConnect Care Center"),
    providerImage: b.providerImageUrl || "",
    serviceId: String(b.serviceId || b.id),
    serviceTitle:
      b.serviceOrReason ||
      (isVet ? "Clinical Examination" : "Specialist Service"),
    petId: String(b.petId),
    petName: b.petName || "Pet",
    petBreed: b.breed || b.species || "Companion",
    petPhoto: dynamicPetPhoto,
    species: b.species,
    petGender: b.petGender,
    petDateOfBirth: b.petDateOfBirth,
    petAgeYears: b.petAgeYears != null ? Number(b.petAgeYears) : undefined,
    petWeight: b.petWeight != null ? Number(b.petWeight) : undefined,
    petColor: b.petColor,
    petMicrochipNumber: b.petMicrochipNumber,
    petNotes: b.petNotes,
    ownerName: b.ownerName,
    ownerPhone: b.ownerPhone,
    ownerEmail: b.ownerEmail,
    qualification: b.qualification,
    specialization: b.specialization,
    licenseNumber: b.licenseNumber,
    clinicAddress: b.locationAddress,
    isReviewed: b.isReviewed,
    reviewRating: b.reviewRating,
    reviewComment: b.reviewComment,
    reviewCreatedAt: b.reviewCreatedAt,
    date: b.date,
    time: b.startTime ? formatBusinessTime(String(b.startTime)) : "",
    durationMinutes: (() => {
      if (b.startTime && b.endTime) {
        const [sh, sm] = b.startTime.split(":").map(Number);
        const [eh, em] = b.endTime.split(":").map(Number);
        if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
          const diff = (eh * 60 + em) - (sh * 60 + sm);
          if (diff > 0) return diff;
        }
      }
      return 45;
    })(),
    price: b.amount != null ? Number(b.amount) : 0,
    status: mapStatus(b.status),
    paymentStatus: mappedPaymentStatus,
    paymentExpiresAt: isPendingPayment ? b.paymentExpiresAt : undefined,
    remainingPaymentSeconds: isPendingPayment ? (b.remainingPaymentSeconds ?? 0) : 0,
    canRetryPayment: isPendingPayment ? Boolean(b.canRetryPayment) : false,
    notes: b.notes,
    location: b.locationAddress || b.clinicOrBusinessName || "",
    latitude: b.latitude != null ? Number(b.latitude) : undefined,
    longitude: b.longitude != null ? Number(b.longitude) : undefined,
    createdAt: b.createdAt || new Date().toISOString(),
    clinicalRecords: (b.petMedicalRecords || []).map((r: any) => ({
      id: String(r.id),
      recordType: r.recordType || "Clinical Consultation",
      diagnosis: r.diagnosis,
      treatment: r.treatment,
      medicines: r.medicines,
      notes: r.notes,
      attachmentUrl: r.attachmentUrl,
      recordDate: r.recordDate,
      veterinarianName: r.veterinarianName,
    })),
  };
}

export async function fetchBookings(): Promise<CustomerBooking[]> {
  const [res, pets] = await Promise.all([
    apiGet<PageResponse<BackendBookingSummary>>("/me/bookings", {
      params: { size: 50 },
    }),
    fetchPets().catch(() => []),
  ]);

  const petPhotoMap = new Map<string, string>();
  pets.forEach((p) => {
    const photo = (p.photo || p.photoUrl || "").trim();
    if (photo) {
      petPhotoMap.set(String(p.id), photo);
    }
  });

  const content = res?.content || [];
  return content.map((b) => {
    const mapped = mapBackendBooking(b);
    const dynamicPhoto =
      b.petPhotoUrl?.trim() || petPhotoMap.get(String(b.petId));
    if (dynamicPhoto) {
      mapped.petPhoto = dynamicPhoto;
    }
    return mapped;
  });
}

export async function fetchBookingById(
  id: string,
): Promise<CustomerBooking | null> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null;
  }
  try {
    const [res, pets] = await Promise.all([
      apiGet<BackendBookingSummary>(`/me/bookings/${numericId}`),
      fetchPets().catch(() => []),
    ]);
    if (res) {
      const mapped = mapBackendBooking(res);
      const matchedPet = pets.find((p) => String(p.id) === String(res.petId));
      const dynamicPhoto =
        res.petPhotoUrl?.trim() ||
        matchedPet?.photo?.trim() ||
        matchedPet?.photoUrl?.trim();
      if (dynamicPhoto) {
        mapped.petPhoto = dynamicPhoto;
      }
      // If veterinary appointment has no clinical records attached yet, attempt to pull from /me/appointments/{id} or pet's file
      if (res.bookingType === "VETERINARY" && (!mapped.clinicalRecords || mapped.clinicalRecords.length === 0)) {
        try {
          const aptRes = await apiGet<any>(`/me/appointments/${numericId}`);
          if (aptRes && Array.isArray(aptRes.petMedicalRecords) && aptRes.petMedicalRecords.length > 0) {
            mapped.clinicalRecords = aptRes.petMedicalRecords.map((r: any) => ({
              id: String(r.id),
              recordType: r.recordType || "Clinical Consultation",
              diagnosis: r.diagnosis,
              treatment: r.treatment,
              medicines: r.medicines,
              notes: r.notes,
              attachmentUrl: r.attachmentUrl,
              recordDate: r.recordDate,
              veterinarianName: r.veterinarianName,
            }));
          }
        } catch {
          // Gracefully fallback to matched pet's medical records
          if (matchedPet && Array.isArray(matchedPet.medicalRecords) && matchedPet.medicalRecords.length > 0) {
            mapped.clinicalRecords = matchedPet.medicalRecords.map((m: any) => ({
              id: String(m.id),
              recordType: m.recordType || "Clinical Consultation",
              diagnosis: m.diagnosis || m.description,
              treatment: m.treatment,
              medicines: m.medicines,
              notes: m.notes,
              attachmentUrl: m.attachmentUrl,
              recordDate: m.date,
              veterinarianName: m.veterinarian,
            }));
          }
        }
      }
      return mapped;
    }
  } catch {
    // Return null if booking not found
  }
  return null;
}

export interface CreateBookingInput {
  type: "veterinary" | "grooming" | "training";
  providerId: string;
  providerName: string;
  providerTitle: string;
  providerClinicOrBusiness?: string;
  providerImage?: string;
  serviceId: string;
  serviceTitle: string;
  petId: string;
  petName: string;
  petBreed: string;
  petPhoto?: string;
  date: string;
  time: string;
  durationMinutes: number;
  price: number;
  notes?: string;
  location: string;
}

function parseToLocalTime(timeStr?: string): string {
  if (!timeStr || !timeStr.trim()) {
    throw new Error("A valid booking time slot is required.");
  }
  const clean = timeStr.trim();
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(clean)) {
    return clean.length === 5 ? `${clean}:00` : clean;
  }
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const meridian = match[3]?.toUpperCase();
    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}:00`;
  }
  throw new Error(`Invalid booking time format: "${timeStr}". Expected HH:mm or HH:mm:ss.`);
}

export async function createBooking(input: CreateBookingInput): Promise<CustomerBooking> {
  const petIdNum = Number(input.petId);
  if (!Number.isInteger(petIdNum) || petIdNum <= 0) {
    throw new Error("A valid pet must be selected for booking.");
  }

  const providerIdNum = Number(input.providerId);
  if (!Number.isInteger(providerIdNum) || providerIdNum <= 0) {
    throw new Error("A valid provider must be selected for booking.");
  }

  if (!input.date) {
    throw new Error("A valid booking date is required.");
  }

  const formattedStartTime = parseToLocalTime(input.time);

  if (input.type === "veterinary") {
    const appointmentPayload = {
      petId: petIdNum,
      veterinarianId: providerIdNum,
      appointmentDate: input.date,
      startTime: formattedStartTime,
      reason: input.serviceTitle || "Clinical Examination",
    };

    const res = await apiPost<{
      id: number;
      appointmentNo?: string;
      appointmentDate: string;
      status: string;
      consultationFee?: number;
    }>("/me/appointments", appointmentPayload);

    return {
      ...input,
      id: String(res.id),
      appointmentNumber: res.appointmentNo || `PC-VET-${res.id}`,
      providerClinicOrBusiness: input.providerClinicOrBusiness || input.providerName,
      providerImage: input.providerImage || "",
      petPhoto: input.petPhoto || "",
      status: "scheduled",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
    };
  } else {
    const serviceIdNum = Number(input.serviceId);
    if (!Number.isInteger(serviceIdNum) || serviceIdNum <= 0) {
      throw new Error("A valid service must be selected for booking.");
    }

    const servicePayload = {
      petId: petIdNum,
      providerId: providerIdNum,
      serviceId: serviceIdNum,
      bookingDate: input.date,
      startTime: formattedStartTime,
      notes: input.notes || "Requested via web portal",
    };

    const res = await apiPost<{
      id: number;
      bookingNo?: string;
      bookingDate: string;
      status: string;
      price?: number;
    }>("/me/service-bookings", servicePayload);

    return {
      ...input,
      id: String(res.id),
      appointmentNumber: res.bookingNo || `PC-SRV-${res.id}`,
      providerClinicOrBusiness: input.providerClinicOrBusiness || input.providerName,
      providerImage: input.providerImage || "",
      petPhoto: input.petPhoto || "",
      status: "scheduled",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
    };
  }
}

export async function cancelBooking(id: string): Promise<CustomerBooking> {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error("A valid numeric booking ID is required to cancel.");
  }

  const res = await apiPatch<BackendBookingSummary>(`/me/bookings/${numericId}/cancel`, {
    reason: "Customer requested cancellation",
  });
  return mapBackendBooking(res);
}

export async function rescheduleBooking(
  _id: string,
  _newDate: string,
  _newTime: string
): Promise<CustomerBooking> {
  throw new Error(
    "Rescheduling is not supported directly. Please cancel this appointment and reserve a new available time slot."
  );
}
