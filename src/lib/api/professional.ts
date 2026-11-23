/**
 * Professional Portals API (Veterinarian & Service Provider)
 * Connects to Spring Boot /api/vet/appointments and /api/provider/bookings endpoints.
 */

import { apiGet, apiPost, apiPut, apiPatch, apiDelete, type PageResponse } from "./client";
import { formatBusinessTime } from "@/lib/utils/date";
import {
  type VeterinarianProfile,
  type ServiceProviderProfile,
  type ProfessionalAvailability,
  type DaySchedule,
  type ProfessionalAppointment,
  type ProfessionalAppointmentStatus,
  type ProviderBooking,
  type ProviderService,
} from "@/lib/mock/professionals";

export type {
  VeterinarianProfile,
  ServiceProviderProfile,
  ProfessionalAvailability,
  DaySchedule,
  ProfessionalAppointment,
  ProfessionalAppointmentStatus,
  ProviderBooking,
  ProviderService,
};

interface BackendAppointment {
  id: number;
  appointmentNo: string;
  petId: number;
  petName: string;
  species?: string;
  breed?: string;
  petGender?: string;
  petDateOfBirth?: string;
  petAgeYears?: number;
  petWeight?: number;
  petColor?: string;
  petMicrochipNumber?: string;
  petNotes?: string;
  petPhotoUrl?: string;
  ownerId: number;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  veterinarianId: number;
  veterinarianName: string;
  clinicName?: string;
  clinicAddress?: string;
  specialization?: string;
  veterinarianQualification?: string;
  veterinarianLicenseNumber?: string;
  appointmentDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  consultationFee?: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  paymentStatus?: string;
  notes?: string;
  createdAt?: string;
  petVaccinations?: Array<{
    id: number;
    petId: number;
    petName?: string;
    vaccineName: string;
    vaccinationDate: string;
    nextDueDate?: string;
    certificateUrl?: string;
    administeredBy?: string;
    notes?: string;
  }>;
  petMedicalRecords?: Array<{
    id: number;
    petId: number;
    petName?: string;
    veterinarianId?: number;
    veterinarianName?: string;
    isVeterinarianVerified?: boolean;
    recordType: string;
    diagnosis?: string;
    treatment?: string;
    medicines?: string;
    recordDate: string;
    attachmentUrl?: string;
    notes?: string;
  }>;
}

interface BackendServiceBooking {
  id: number;
  bookingNo: string;
  petId: number;
  petName: string;
  species?: string;
  breed?: string;
  petGender?: string;
  petDateOfBirth?: string;
  petAgeYears?: number;
  petWeight?: number;
  petColor?: string;
  petMicrochipNumber?: string;
  petNotes?: string;
  petPhotoUrl?: string;
  ownerId: number;
  ownerName: string;
  ownerPhone?: string;
  ownerEmail?: string;
  providerId: number;
  businessName?: string;
  providerPhone?: string;
  providerType?: string;
  serviceId?: number;
  serviceName: string;
  durationMinutes?: number;
  bookingDate: string;
  startTime?: string;
  endTime?: string;
  price?: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  paymentStatus?: string;
  notes?: string;
  createdAt?: string;
  petVaccinations?: Array<{
    id: number;
    petId: number;
    petName?: string;
    vaccineName: string;
    vaccinationDate: string;
    nextDueDate?: string;
    certificateUrl?: string;
    administeredBy?: string;
    notes?: string;
  }>;
  petMedicalRecords?: Array<{
    id: number;
    petId: number;
    petName?: string;
    veterinarianId?: number;
    veterinarianName?: string;
    isVeterinarianVerified?: boolean;
    recordType: string;
    diagnosis?: string;
    treatment?: string;
    medicines?: string;
    recordDate: string;
    attachmentUrl?: string;
    notes?: string;
  }>;
}

interface BackendUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  roles: string[];
}

function mapStatusToUi(
  backendStatus: string
): ProfessionalAppointmentStatus {
  switch (backendStatus?.trim().toUpperCase()) {
    case "CONFIRMED":
      return "confirmed";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    case "IN_PROGRESS":
      return "in-progress";
    case "PENDING":
    default:
      return "upcoming";
  }
}

function mapUiStatusToBackend(
  uiStatus: ProfessionalAppointmentStatus
): string {
  switch (uiStatus) {
    case "confirmed":
      return "CONFIRMED";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    case "in-progress":
      return "IN_PROGRESS";
    default:
      return "CONFIRMED";
  }
}

function mapBackendAppointmentToUi(a: BackendAppointment): ProfessionalAppointment {
  return {
    id: String(a.id),
    appointmentNumber: a.appointmentNo || `APPT-${a.id}`,
    veterinarianId: String(a.veterinarianId),
    veterinarianName: a.veterinarianName,
    clinicName: a.clinicName,
    clinicAddress: a.clinicAddress,
    specialization: a.specialization,
    qualification: a.veterinarianQualification,
    licenseNumber: a.veterinarianLicenseNumber,
    date: a.appointmentDate,
    time: a.startTime ? formatBusinessTime(String(a.startTime)) : "",
    durationMinutes: 30,
    type: a.specialization || "Clinical Exam",
    status: mapStatusToUi(a.status),
    paymentStatus: a.paymentStatus,
    reason: a.reason || "Clinical Examination",
    notes: a.notes,
    pet: {
      id: String(a.petId),
      name: a.petName || "Pet",
      species: a.species || "",
      breed: a.breed || "",
      age: a.petAgeYears != null ? Number(a.petAgeYears) : null,
      gender: a.petGender || null,
      weight: a.petWeight != null ? Number(a.petWeight) : null,
      photo: a.petPhotoUrl?.trim() || "",
      color: a.petColor || undefined,
      microchipId: a.petMicrochipNumber,
      notes: a.petNotes,
      dateOfBirth: a.petDateOfBirth,
      vaccinations: (a.petVaccinations || []).map((v) => ({
        id: v.id,
        name: v.vaccineName,
        date: v.vaccinationDate,
        nextDue: v.nextDueDate || "",
        certificateUrl: v.certificateUrl,
        administeredBy: v.administeredBy,
        notes: v.notes,
      })),
      medicalHistory: (a.petMedicalRecords || []).map((m) => ({
        id: m.id,
        date: m.recordDate,
        type: m.recordType,
        description: m.diagnosis || m.treatment || m.recordType,
        diagnosis: m.diagnosis,
        treatment: m.treatment,
        medicines: m.medicines,
        attachmentUrl: m.attachmentUrl,
        notes: m.notes,
        veterinarianName: m.veterinarianName,
        isVeterinarianVerified: m.isVeterinarianVerified,
      })),
    },
    owner: {
      id: String(a.ownerId),
      name: a.ownerName || "Pet Parent",
      phone: a.ownerPhone || null,
      email: a.ownerEmail || null,
    },
    createdAt: a.createdAt || new Date().toISOString(),
  };
}

function mapBackendServiceBookingToUi(b: BackendServiceBooking): ProviderBooking {
  const isTraining = b.providerType?.toLowerCase().includes("train") || b.serviceName?.toLowerCase().includes("train");

  return {
    id: String(b.id),
    bookingNumber: b.bookingNo || `BK-${b.id}`,
    providerId: String(b.providerId),
    serviceId: String(b.serviceId || b.id),
    serviceName: b.serviceName || (isTraining ? "Training Session" : "Grooming Service"),
    serviceCategory: isTraining ? "training" : "grooming",
    date: b.bookingDate,
    time: b.startTime ? formatBusinessTime(String(b.startTime)) : "",
    durationMinutes: b.durationMinutes || 60,
    price: b.price != null ? Number(b.price) : 0,
    status: mapStatusToUi(b.status),
    paymentStatus: b.paymentStatus,
    notes: b.notes,
    pet: {
      id: String(b.petId),
      name: b.petName || "Pet",
      species: b.species || "",
      breed: b.breed || "",
      age: b.petAgeYears != null ? Number(b.petAgeYears) : null,
      gender: b.petGender || null,
      weight: b.petWeight != null ? Number(b.petWeight) : null,
      photo: b.petPhotoUrl?.trim() || "",
      color: b.petColor || undefined,
      microchipId: b.petMicrochipNumber,
      notes: b.petNotes,
      dateOfBirth: b.petDateOfBirth,
      vaccinations: (b.petVaccinations || []).map((v) => ({
        id: v.id,
        name: v.vaccineName,
        date: v.vaccinationDate,
        nextDue: v.nextDueDate || "",
        certificateUrl: v.certificateUrl,
        administeredBy: v.administeredBy,
        notes: v.notes,
      })),
      medicalHistory: (b.petMedicalRecords || []).map((m) => ({
        id: m.id,
        date: m.recordDate,
        type: m.recordType,
        description: m.diagnosis || m.treatment || m.recordType,
        diagnosis: m.diagnosis,
        treatment: m.treatment,
        medicines: m.medicines,
        attachmentUrl: m.attachmentUrl,
        notes: m.notes,
        veterinarianName: m.veterinarianName,
        isVeterinarianVerified: m.isVeterinarianVerified,
      })),
    },
    owner: {
      id: String(b.ownerId),
      name: b.ownerName || "Pet Parent",
      phone: b.ownerPhone || null,
      email: b.ownerEmail || null,
    },
    createdAt: b.createdAt || new Date().toISOString(),
  };
}

// ─── VETERINARIAN APPOINTMENTS ───────────────────────────────────────────────

export async function fetchVetAppointments(): Promise<ProfessionalAppointment[]> {
  const res = await apiGet<PageResponse<BackendAppointment>>("/vet/appointments", {
    params: { size: 50 },
  });
  return (res?.content || []).map(mapBackendAppointmentToUi);
}

export async function fetchVetAppointmentById(
  id: string
): Promise<ProfessionalAppointment | null> {
  try {
    const res = await apiGet<BackendAppointment>(`/vet/appointments/${id}`);
    return mapBackendAppointmentToUi(res);
  } catch {
    return null;
  }
}

export async function updateVetAppointmentStatus(
  id: string,
  status: ProfessionalAppointmentStatus,
  notes?: string
): Promise<ProfessionalAppointment> {
  const targetStatus = mapUiStatusToBackend(status);
  const updated = await apiPatch<BackendAppointment>(`/vet/appointments/${id}/status`, {
    status: targetStatus,
    notes,
  });
  return mapBackendAppointmentToUi(updated);
}

// ─── SERVICE PROVIDER BOOKINGS ──────────────────────────────────────────────

export async function fetchProviderBookings(): Promise<ProviderBooking[]> {
  const res = await apiGet<PageResponse<BackendServiceBooking>>("/provider/bookings", {
    params: { size: 50 },
  });
  return (res?.content || []).map(mapBackendServiceBookingToUi);
}

export async function fetchProviderBookingById(
  id: string
): Promise<ProviderBooking | null> {
  try {
    const res = await apiGet<BackendServiceBooking>(`/provider/bookings/${id}`);
    return mapBackendServiceBookingToUi(res);
  } catch {
    return null;
  }
}

export async function updateProviderBookingStatus(
  id: string,
  status: ProfessionalAppointmentStatus,
  notes?: string
): Promise<ProviderBooking> {
  const targetStatus = mapUiStatusToBackend(status);
  const updated = await apiPatch<BackendServiceBooking>(`/provider/bookings/${id}/status`, {
    status: targetStatus,
    notes,
  });
  return mapBackendServiceBookingToUi(updated);
}

// ─── PROFILES & AVAILABILITY ────────────────────────────────────────────────

export async function fetchVetProfile(): Promise<VeterinarianProfile> {
  try {
    const user = await apiGet<BackendUser>("/me");
    return {
      id: String(user.id),
      name: `Dr. ${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: user.phone || "",
      qualification: "Veterinary Medicine",
      specialization: "General Practice",
      experienceYears: 1,
      clinic: "Veterinary Clinic",
      location: "Active Practice",
      bio: "Licensed veterinary practitioner.",
      photo: user.profileImage?.trim() || "",
      verificationStatus: "verified",
    };
  } catch {
    return {
      id: "vet-me",
      name: "Veterinarian Doctor",
      email: "",
      phone: "",
      qualification: "Veterinary Practitioner",
      specialization: "General Practice",
      experienceYears: 1,
      clinic: "Veterinary Hospital",
      location: "Clinic",
      bio: "Licensed veterinary specialist.",
      photo: "",
      verificationStatus: "verified",
    };
  }
}

export async function updateVetProfile(
  updates: Partial<VeterinarianProfile>
): Promise<VeterinarianProfile> {
  try {
    const names = (updates.name || "").replace(/^Dr\.\s*/, "").split(" ");
    const firstName = names[0] || "Veterinarian";
    const lastName = names.slice(1).join(" ") || "Specialist";

    await apiPut<BackendUser>("/me", {
      firstName,
      lastName,
      phone: updates.phone,
      profileImage: updates.photo,
    });
  } catch {
    // ignore
  }
  return {
    id: updates.id || "vet-me",
    name: updates.name || "Veterinarian Doctor",
    email: updates.email || "",
    phone: updates.phone || "",
    qualification: updates.qualification || "Veterinary Medicine",
    specialization: updates.specialization || "General Practice",
    experienceYears: updates.experienceYears || 1,
    clinic: updates.clinic || "Veterinary Clinic",
    location: updates.location || "Practice",
    bio: updates.bio || "",
    photo: updates.photo?.trim() || "",
    verificationStatus: updates.verificationStatus || "verified",
    ...updates,
  };
}

export async function fetchProviderProfile(): Promise<ServiceProviderProfile> {
  try {
    const user = await apiGet<BackendUser>("/me");
    return {
      id: String(user.id),
      name: `${user.firstName} ${user.lastName}`.trim(),
      businessName: `${user.firstName}'s Pet Care`,
      email: user.email,
      phone: user.phone || "",
      providerType: "grooming",
      specializations: ["Pet Care"],
      experienceYears: 1,
      location: "Local Practice",
      bio: "Certified pet care specialist.",
      photo: user.profileImage?.trim() || "",
      verificationStatus: "verified",
    };
  } catch {
    return {
      id: "provider-me",
      name: "Service Provider",
      businessName: "Pet Care Salon",
      email: "",
      phone: "",
      providerType: "grooming",
      specializations: ["Pet Care"],
      experienceYears: 1,
      location: "Active Salon",
      bio: "Certified pet care specialist.",
      photo: "",
      verificationStatus: "verified",
    };
  }
}

export async function updateProviderProfile(
  updates: Partial<ServiceProviderProfile>
): Promise<ServiceProviderProfile> {
  try {
    const names = (updates.name || "").split(" ");
    const firstName = names[0] || "Provider";
    const lastName = names.slice(1).join(" ") || "Specialist";

    await apiPut<BackendUser>("/me", {
      firstName,
      lastName,
      phone: updates.phone,
      profileImage: updates.photo,
    });
  } catch {
    // ignore
  }
  return {
    id: updates.id || "provider-me",
    name: updates.name || "Service Provider",
    businessName: updates.businessName || "Pet Care Salon",
    email: updates.email || "",
    phone: updates.phone || "",
    providerType: updates.providerType || "grooming",
    specializations: updates.specializations || ["Pet Care"],
    experienceYears: updates.experienceYears || 1,
    location: updates.location || "Active Salon",
    bio: updates.bio || "",
    photo: updates.photo?.trim() || "",
    verificationStatus: updates.verificationStatus || "verified",
    ...updates,
  };
}

export interface BackendProviderAvailabilityDay {
  id?: number;
  providerId: number;
  dayOfWeek: string;
  startTime?: string | null;
  endTime?: string | null;
  slotDurationMinutes?: number | null;
  isAvailable: boolean;
  isConfigured?: boolean;
}

export interface BackendProviderAvailabilityResponse {
  configured: boolean;
  message?: string;
  providerId?: number;
  days: BackendProviderAvailabilityDay[];
}

export async function fetchProfessionalAvailability(
  role: "vet" | "provider"
): Promise<ProfessionalAvailability> {
  if (role === "provider") {
    const res = await apiGet<BackendProviderAvailabilityResponse>("/provider/availability");
    return mapProviderAvailability(res);
  }

  const rows = await apiGet<BackendVeterinarianAvailability[]>("/vet/availability");
  return mapVeterinarianAvailability(rows);
}

export async function updateProfessionalAvailability(
  role: "vet" | "provider",
  schedule: DaySchedule[],
  notes?: string
): Promise<ProfessionalAvailability> {
  if (role === "provider") {
    const payload = formatProviderSchedulePayload(schedule);
    const res = await apiPut<BackendProviderAvailabilityResponse>("/provider/availability", payload);
    const mapped = mapProviderAvailability(res);
    if (notes !== undefined) {
      mapped.notes = notes;
    }
    return mapped;
  }

  const rows = await apiPut<BackendVeterinarianAvailability[]>("/vet/availability", {
    schedule: schedule.map((day) => ({
      dayOfWeek: day.day.toUpperCase(),
      startTime: day.active && day.startTime
        ? (day.startTime.length === 5 ? `${day.startTime}:00` : day.startTime)
        : null,
      endTime: day.active && day.endTime
        ? (day.endTime.length === 5 ? `${day.endTime}:00` : day.endTime)
        : null,
      slotDurationMinutes: day.active ? (day.slotDurationMinutes || null) : null,
      isAvailable: day.active,
    })),
  });
  const mapped = mapVeterinarianAvailability(rows);
  if (notes !== undefined) {
    mapped.notes = notes;
  }
  return mapped;
}

export interface BackendVeterinarianAvailability {
  id?: number;
  veterinarianId: number;
  dayOfWeek: string;
  startTime?: string | null;
  endTime?: string | null;
  slotDurationMinutes?: number | null;
  isAvailable: boolean;
  isConfigured?: boolean;
}

const WEEK_DAYS: DaySchedule["day"][] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function formatProviderSchedulePayload(schedule: DaySchedule[]) {
  return {
    schedule: schedule.map((day) => ({
      dayOfWeek: day.day.toUpperCase(),
      isAvailable: day.active,
      startTime: day.active && day.startTime
        ? (day.startTime.length === 5 ? `${day.startTime}:00` : day.startTime)
        : null,
      endTime: day.active && day.endTime
        ? (day.endTime.length === 5 ? `${day.endTime}:00` : day.endTime)
        : null,
      slotDurationMinutes: day.active ? (day.slotDurationMinutes || null) : null,
    })),
  };
}

export function mapProviderAvailability(
  res: BackendProviderAvailabilityResponse
): ProfessionalAvailability {
  const isConfigured = Boolean(res?.configured);
  const daysMap = new Map((res?.days || []).map((d) => [d.dayOfWeek.toUpperCase(), d]));

  const weeklySchedule: DaySchedule[] = WEEK_DAYS.map((day) => {
    const row = daysMap.get(day.toUpperCase());
    if (!isConfigured || !row || !row.isConfigured) {
      return {
        day,
        active: false,
        startTime: "",
        endTime: "",
        slotDurationMinutes: 0,
      };
    }
    return {
      day,
      active: Boolean(row.isAvailable),
      startTime: row.startTime ? row.startTime.slice(0, 5) : "",
      endTime: row.endTime ? row.endTime.slice(0, 5) : "",
      slotDurationMinutes: row.slotDurationMinutes ?? 0,
    };
  });

  return {
    id: String(res?.providerId ? `provider-avail-${res.providerId}` : "provider-availability"),
    role: "provider",
    professionalId: String(res?.providerId || ""),
    configured: isConfigured,
    weeklySchedule,
    updatedAt: new Date().toISOString(),
  };
}

export function mapVeterinarianAvailability(
  rows: BackendVeterinarianAvailability[]
): ProfessionalAvailability {
  const isAnyConfigured = rows.some((row) => row.isConfigured === true);
  const days = new Map(rows.map((row) => [row.dayOfWeek.toUpperCase(), row]));
  const weeklySchedule: DaySchedule[] = WEEK_DAYS.map((day) => {
    const row = days.get(day.toUpperCase());
    if (!isAnyConfigured || !row || !row.isConfigured) {
      return {
        day,
        active: false,
        startTime: "",
        endTime: "",
        slotDurationMinutes: 0,
      };
    }
    return {
      day,
      active: Boolean(row.isAvailable),
      startTime: row.startTime ? row.startTime.slice(0, 5) : "",
      endTime: row.endTime ? row.endTime.slice(0, 5) : "",
      slotDurationMinutes: row.slotDurationMinutes ?? 0,
    };
  });

  return {
    id: String(rows.find((row) => row.id != null)?.id ?? "vet-availability"),
    role: "vet",
    professionalId: rows.length ? String(rows[0].veterinarianId) : "",
    configured: isAnyConfigured,
    weeklySchedule,
    notes: isAnyConfigured
      ? "Standard operational duty hours synchronized with clinical scheduling."
      : "Clinical schedule not yet configured. Please configure your working days and consult durations.",
    updatedAt: new Date().toISOString(),
  };
}

export interface BackendServiceDto {
  id: number;
  providerId: number;
  categoryId?: number;
  categoryName?: string;
  serviceType?: "GROOMING" | "TRAINING" | string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  imageUrl?: string;
  imageUrls?: string[];
  isActive: boolean;
}

export interface BackendServiceCategoryDto {
  id: number;
  name: string;
  serviceType: "GROOMING" | "TRAINING";
  description?: string;
  isActive: boolean;
}

export function mapBackendServiceToUi(s: BackendServiceDto): ProviderService {
  let category: "training" | "grooming" = "grooming";
  if (s.serviceType?.toUpperCase() === "TRAINING") {
    category = "training";
  } else if (s.serviceType?.toUpperCase() === "GROOMING") {
    category = "grooming";
  } else if ((s.categoryName || "").toLowerCase().includes("train")) {
    category = "training";
  }
  return {
    id: String(s.id),
    providerId: String(s.providerId),
    categoryId: s.categoryId,
    categoryName: s.categoryName || (category === "training" ? "Training" : "Grooming"),
    name: s.name,
    category,
    description: s.description || "",
    price: Number(s.price),
    durationMinutes: s.durationMinutes,
    active: Boolean(s.isActive),
    imageUrl: s.imageUrls?.[0] || s.imageUrl,
    imageUrls: s.imageUrls?.length ? s.imageUrls : s.imageUrl ? [s.imageUrl] : [],
    createdAt: new Date().toISOString(),
  };
}

export async function fetchServiceCategories(): Promise<BackendServiceCategoryDto[]> {
  return apiGet<BackendServiceCategoryDto[]>("/provider/services/categories");
}

export async function fetchProviderServices(): Promise<ProviderService[]> {
  const res = await apiGet<BackendServiceDto[]>("/provider/services");
  return (res || []).map(mapBackendServiceToUi);
}

export async function fetchProviderServiceById(id: string | number): Promise<ProviderService> {
  const res = await apiGet<BackendServiceDto>(`/provider/services/${id}`);
  return mapBackendServiceToUi(res);
}

export interface CreateProviderServiceInput {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  active?: boolean;
  imageUrl?: string;
  imageUrls?: string[];
}

export async function createProviderService(
  input: CreateProviderServiceInput
): Promise<ProviderService> {
  const payload = {
    name: input.name.trim(),
    description: input.description?.trim(),
    price: input.price,
    durationMinutes: input.durationMinutes,
    imageUrl: input.imageUrls?.[0] ?? input.imageUrl,
    imageUrls: input.imageUrls,
    isActive: input.active !== undefined ? input.active : true,
  };
  const res = await apiPost<BackendServiceDto>("/provider/services", payload);
  return mapBackendServiceToUi(res);
}

export async function updateProviderService(
  id: string,
  input: Partial<CreateProviderServiceInput>
): Promise<ProviderService> {
  const current = await apiGet<BackendServiceDto>(`/provider/services/${id}`);
  const payload = {
    name: input.name !== undefined ? input.name.trim() : current.name,
    description: input.description !== undefined ? input.description?.trim() : current.description,
    price: input.price !== undefined ? input.price : current.price,
    durationMinutes: input.durationMinutes !== undefined ? input.durationMinutes : current.durationMinutes,
    imageUrl: input.imageUrls !== undefined ? input.imageUrls[0] ?? null : input.imageUrl !== undefined ? input.imageUrl : current.imageUrl,
    imageUrls: input.imageUrls !== undefined ? input.imageUrls : input.imageUrl !== undefined ? undefined : current.imageUrls,
    isActive: input.active !== undefined ? input.active : current.isActive,
  };
  const res = await apiPut<BackendServiceDto>(`/provider/services/${id}`, payload);
  return mapBackendServiceToUi(res);
}

export async function toggleProviderServiceActive(
  id: string
): Promise<ProviderService> {
  const current = await apiGet<BackendServiceDto>(`/provider/services/${id}`);
  const payload = {
    name: current.name,
    description: current.description,
    price: current.price,
    durationMinutes: current.durationMinutes,
    imageUrl: current.imageUrl,
    imageUrls: current.imageUrls,
    isActive: !current.isActive,
  };
  const res = await apiPut<BackendServiceDto>(`/provider/services/${id}`, payload);
  return mapBackendServiceToUi(res);
}

export async function deleteProviderService(id: string): Promise<string> {
  await apiDelete<void>(`/provider/services/${id}`);
  return id;
}


// ─── PRACTITIONER PATIENT & CLIENT ACTIVITY REPORTS ───────────────────────────

import type { PractitionerPerformanceReport } from "./admin";

export async function fetchVetPatientReport(filters?: {
  startDate?: string;
  endDate?: string;
  status?: string;
}): Promise<PractitionerPerformanceReport | null> {
  const cleanFilters: Record<string, string> = {};
  if (filters?.startDate) cleanFilters.startDate = filters.startDate;
  if (filters?.endDate) cleanFilters.endDate = filters.endDate;
  if (filters?.status && filters.status !== "ALL") cleanFilters.status = filters.status;

  const res = await apiGet<PractitionerPerformanceReport>(
    "/vet/reports/patients",
    { params: cleanFilters }
  );
  return res || null;
}

export async function fetchProviderClientReport(filters?: {
  startDate?: string;
  endDate?: string;
  status?: string;
}): Promise<PractitionerPerformanceReport | null> {
  const cleanFilters: Record<string, string> = {};
  if (filters?.startDate) cleanFilters.startDate = filters.startDate;
  if (filters?.endDate) cleanFilters.endDate = filters.endDate;
  if (filters?.status && filters.status !== "ALL") cleanFilters.status = filters.status;

  const res = await apiGet<PractitionerPerformanceReport>(
    "/provider/reports/clients",
    { params: cleanFilters }
  );
  return res || null;
}

// ─── PRACTITIONER PATIENT RECORD CREATION (VET & PROVIDER) ───────────────────

export interface CreateProfessionalMedicalRecordPayload {
  recordType?: string;
  diagnosis?: string;
  treatment?: string;
  medicines?: string;
  recordDate?: string;
  attachmentUrl?: string;
  notes?: string;
}

export interface CreateProfessionalVaccinationPayload {
  vaccineName: string;
  vaccinationDate: string;
  nextDueDate?: string;
  certificateUrl?: string;
  administeredBy?: string;
  notes?: string;
}

export async function addVetAppointmentMedicalRecord(
  appointmentId: string | number,
  payload: CreateProfessionalMedicalRecordPayload
) {
  return await apiPost<any>(`/vet/appointments/${appointmentId}/medical-records`, {
    ...payload,
    recordDate: payload.recordDate || new Date().toISOString().split("T")[0],
    recordType: payload.recordType || "Clinical Consultation",
  });
}

export async function addVetAppointmentVaccination(
  appointmentId: string | number,
  payload: CreateProfessionalVaccinationPayload
) {
  return await apiPost<any>(`/vet/appointments/${appointmentId}/vaccinations`, {
    ...payload,
    vaccinationDate: payload.vaccinationDate || new Date().toISOString().split("T")[0],
  });
}

export async function addProviderBookingCareRecord(
  bookingId: string | number,
  payload: CreateProfessionalMedicalRecordPayload
) {
  return await apiPost<any>(`/provider/bookings/${bookingId}/care-records`, {
    ...payload,
    recordDate: payload.recordDate || new Date().toISOString().split("T")[0],
    recordType: payload.recordType || "Care Session",
  });
}
