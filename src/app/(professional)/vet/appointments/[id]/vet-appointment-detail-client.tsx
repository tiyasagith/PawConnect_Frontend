"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useVetAppointment, useUpdateVetAppointmentStatus } from "@/lib/api/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/lib/utils/toast";
import { InvoiceModal } from "@/components/shared/invoice-modal";
import { PrescriptionModal } from "@/components/professional/prescription-modal";
import { AddMedicalRecordDialog } from "@/components/professional/add-medical-record-dialog";
import { AddVaccinationDialog } from "@/components/professional/add-vaccination-dialog";
import { PetImage } from "@/components/shared/entity-image";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Stethoscope,
  CheckCircle2,
  PlayCircle,
  XCircle,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Printer,
  Pill,
  ExternalLink,
  PlusCircle,
  HeartPulse,
  Weight,
  Sparkles,
  Info,
  CheckCircle,
} from "lucide-react";
import type { ProfessionalAppointmentStatus } from "@/lib/mock/professionals";

interface VetAppointmentDetailClientProps {
  appointmentId: string;
}

export function VetAppointmentDetailClient({
  appointmentId,
}: VetAppointmentDetailClientProps) {
  const { data: appointment, isLoading, isError, refetch } = useVetAppointment(appointmentId);
  const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateVetAppointmentStatus();

  const [targetStatus, setTargetStatus] = useState<ProfessionalAppointmentStatus | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedRecordToPrint, setSelectedRecordToPrint] = useState<any | null>(null);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isAddVaccinationOpen, setIsAddVaccinationOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="py-8">
        <LoadingState variant="detail" message="Retrieving patient appointment file..." />
      </div>
    );
  }

  if (isError || !appointment) {
    return (
      <div className="py-12">
        <ErrorState
          title="Appointment Record Not Found"
          description="Could not locate this clinical appointment reference."
          action={
            <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
              Retry
            </Button>
          }
        />
        <div className="text-center mt-6">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/vet/appointments">Back to Appointments</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleConfirmStatusChange = async () => {
    if (!targetStatus) return;
    try {
      await updateStatus({
        id: appointment.id,
        status: targetStatus,
      });
      toast.success("Appointment Status Updated", {
        description: `Marked as ${targetStatus}. Patient file synchronized.`,
      });
      setTargetStatus(null);
    } catch (err: unknown) {
      toast.error("Status Update Failed", {
        description: err instanceof Error ? err.message : "Could not modify appointment status. Please try again.",
      });
      setTargetStatus(null);
      refetch();
    }
  };

  const handlePrintRecord = (record?: any) => {
    setSelectedRecordToPrint(record || null);
    setIsPrescriptionModalOpen(true);
  };

  const medicalHistory = appointment.pet.medicalHistory || [];
  const vaccinations = appointment.pet.vaccinations || [];

  return (
    <div className="space-y-8 pb-20">
      {/* Top Page Header */}
      <PageHeader
        title={`Appointment ${appointment.appointmentNumber}`}
        description={`${appointment.type} • Scheduled for ${appointment.date} at ${appointment.time}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Print Prescription Button */}
          <Button
            size="sm"
            onClick={() => handlePrintRecord()}
            className="rounded-xl text-xs h-8.5 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
            title="Print Official Prescription & Clinical Report"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Prescription & Report
          </Button>

          {/* Tax Invoice / Bill Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsInvoiceOpen(true)}
            className="rounded-xl text-xs h-8.5 gap-1.5 border-primary/30 text-primary hover:bg-primary/10 font-medium"
            title="View & Print Clinical Tax Invoice"
          >
            <FileText className="h-3.5 w-3.5" />
            Tax Invoice / Bill
          </Button>

          <StatusBadge status={appointment.status} size="lg" />

          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs h-8.5 gap-1.5">
            <Link href="/vet/appointments">
              <ArrowLeft className="h-3.5 w-3.5" />
              All Appointments
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Primary Status Banner & Operations Controls */}
      <Card className="rounded-3xl border-border/80 p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">
                  {appointment.type}
                </h2>
                {appointment.paymentStatus === "PAID" && (
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-semibold">
                    Paid Consultation
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {appointment.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-semibold text-foreground">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {appointment.time} ({appointment.durationMinutes} min consult window)
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {appointment.status === "upcoming" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTargetStatus("confirmed")}
                disabled={isUpdating}
                className="rounded-xl text-xs font-semibold gap-1.5 h-9"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Confirm Appointment
              </Button>
            )}

            {appointment.status === "confirmed" && (
              <Button
                size="sm"
                onClick={() => setTargetStatus("in-progress")}
                disabled={isUpdating}
                className="rounded-xl text-xs font-semibold gap-1.5 h-9"
              >
                <PlayCircle className="h-4 w-4" />
                Begin Consultation
              </Button>
            )}

            {appointment.status === "in-progress" && (
              <Button
                size="sm"
                onClick={() => setTargetStatus("completed")}
                disabled={isUpdating}
                className="rounded-xl text-xs font-semibold gap-1.5 h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                Complete & Discharge
              </Button>
            )}

            {appointment.status !== "completed" && appointment.status !== "cancelled" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setTargetStatus("cancelled")}
                disabled={isUpdating}
                className="rounded-xl text-xs text-destructive hover:bg-destructive/10 gap-1.5 h-9 font-medium"
              >
                <XCircle className="h-4 w-4" />
                Cancel Visit
              </Button>
            )}

            {appointment.status === "cancelled" && (
              <Badge variant="outline" className="text-xs py-1 px-3 border-rose-300 bg-rose-50 text-rose-700 font-semibold gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-rose-600" />
                Appointment Cancelled (Terminal)
              </Badge>
            )}
          </div>
        </div>

        {/* Reason for Visit */}
        <div className="rounded-2xl border border-border/70 bg-surface/50 p-4 space-y-1.5 text-xs">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-primary" />
            Patient Reason for Consultation:
          </span>
          <p className="text-muted-foreground leading-relaxed pl-5.5">
            &ldquo;{appointment.reason}&rdquo;
          </p>
        </div>

        {appointment.notes && (
          <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4 space-y-1.5 text-xs">
            <span className="font-bold text-foreground">Doctor&apos;s Consultation / Discharge Remarks:</span>
            <p className="text-muted-foreground leading-relaxed">
              {appointment.notes}
            </p>
          </div>
        )}
      </Card>

      {/* Patient Biological Profile & Client Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Complete Patient Medical & Biological File */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-5 sm:p-6 rounded-3xl border-border/80 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <HeartPulse className="h-4 w-4 text-primary" />
                Patient Medical & Biological File
              </h3>
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 bg-primary/5 text-primary border-primary/20">
                Verified File
              </Badge>
            </div>

            {/* Header info */}
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden bg-secondary shrink-0 border border-border/60">
                <PetImage
                  src={appointment.pet.photo}
                  alt={appointment.pet.name || "Pet"}
                  sizes="(max-width: 640px) 80px, 96px"
                />
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground truncate">{appointment.pet.name}</h3>
                  <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                    {appointment.pet.species}
                  </Badge>
                  {appointment.pet.gender && (
                    <Badge variant="outline" className="text-xs font-medium">
                      {appointment.pet.gender}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground font-medium truncate">
                  {appointment.pet.breed}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                  {appointment.pet.age != null && (
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {appointment.pet.age} {appointment.pet.age === 1 ? "year" : "years"} old
                    </span>
                  )}
                  {appointment.pet.dateOfBirth && (
                    <span className="text-[11px] text-muted-foreground">
                      (DOB: {appointment.pet.dateOfBirth})
                    </span>
                  )}
                  {appointment.pet.weight != null && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Weight className="h-3.5 w-3.5 text-primary" />
                        {appointment.pet.weight} kg
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Stored Biological Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-border/60">
              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Sex / Gender</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {appointment.pet.gender || "Not Specified"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Body Weight</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {appointment.pet.weight != null ? `${appointment.pet.weight} kg` : "Not Recorded"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Age / DOB</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {appointment.pet.age != null ? `${appointment.pet.age} yrs` : "N/A"}
                  {appointment.pet.dateOfBirth ? ` (${appointment.pet.dateOfBirth})` : ""}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Coat / Color</span>
                <span className="font-semibold text-foreground text-xs mt-0.5 block">
                  {appointment.pet.color || "Standard"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface/50 border border-border/50 col-span-2 sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">Microchip ID</span>
                <span className="font-mono font-semibold text-foreground text-xs mt-0.5 block">
                  {appointment.pet.microchipId || "No Microchip Registered"}
                </span>
              </div>
            </div>

            {/* Pet Parent Special Notes / Sensitivities */}
            {appointment.pet.notes && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span>Pet Parent Special Instructions / Allergies</span>
                </div>
                <p className="text-muted-foreground leading-relaxed pl-5">&ldquo;{appointment.pet.notes}&rdquo;</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Owner Information & Workspace Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Clinical Workspace Action Card */}
          <Card className="rounded-3xl border-primary/30 p-5 space-y-4 shadow-2xs bg-primary/5">
            <div className="flex items-center gap-2 pb-3 border-b border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Clinical Workspace Actions</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Examine the patient, prescribe medications, or administer vaccinations directly into the patient&apos;s verified file.
            </p>

            <div className="space-y-2">
              <Button
                onClick={() => setIsAddRecordOpen(true)}
                className="w-full text-xs h-9 rounded-xl gap-2 font-semibold bg-primary text-primary-foreground shadow-xs"
              >
                <Stethoscope className="h-4 w-4" />
                Check Patient / Add Prescription
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsAddVaccinationOpen(true)}
                className="w-full text-xs h-9 rounded-xl gap-2 font-semibold border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Administer / Record Vaccination
              </Button>

              <Button
                variant="outline"
                onClick={() => handlePrintRecord()}
                className="w-full text-xs h-9 rounded-xl gap-2 font-semibold border-primary/30 text-primary hover:bg-primary/10"
              >
                <Printer className="h-4 w-4" />
                Print Clinical Examination Report
              </Button>
            </div>
          </Card>

          {/* Client Contact Record Card */}
          <Card className="rounded-3xl border-border/80 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-3 border-b border-border/60">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Client Contact Record</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground text-[11px] block">Pet Parent Name</span>
                <span className="font-bold text-foreground text-sm">{appointment.owner.name}</span>
              </div>

              {appointment.owner.phone && (
                <div>
                  <span className="text-muted-foreground text-[11px] block">Telephone</span>
                  <div className="flex items-center gap-1.5 font-medium text-foreground mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <a href={`tel:${appointment.owner.phone}`} className="hover:text-primary hover:underline">
                      {appointment.owner.phone}
                    </a>
                  </div>
                </div>
              )}

              {appointment.owner.email && (
                <div>
                  <span className="text-muted-foreground text-[11px] block">Email Address</span>
                  <div className="flex items-center gap-1.5 font-medium text-foreground mt-0.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <a href={`mailto:${appointment.owner.email}`} className="hover:text-primary hover:underline truncate">
                      {appointment.owner.email}
                    </a>
                  </div>
                </div>
              )}

              {appointment.owner.preferredContact && (
                <div className="pt-2 border-t border-border/60">
                  <span className="text-muted-foreground text-[11px] block">Communication Preference</span>
                  <span className="font-medium text-foreground">{appointment.owner.preferredContact}</span>
                </div>
              )}
            </div>

            <div className="pt-2 text-[11px] text-muted-foreground border-t border-border/50 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Veterinary Client Patient Confidentiality</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Previous Medical Reports, Prescriptions & Vaccination History */}
      <Card className="rounded-3xl border-border/80 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-primary" />
              Previous Medical Reports, Prescriptions & Vaccination History
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete historical ledger stored by pet parent and consulting veterinarians.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsAddRecordOpen(true)}
              className="rounded-xl text-xs h-8.5 gap-1.5 font-semibold"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Record / Prescription
            </Button>
          </div>
        </div>

        <Tabs defaultValue="prescriptions" className="w-full space-y-4">
          <TabsList className="bg-secondary/60 p-1 rounded-2xl h-10 w-full sm:w-auto">
            <TabsTrigger value="prescriptions" className="rounded-xl text-xs px-4">
              Previous Prescriptions & Reports ({medicalHistory.length})
            </TabsTrigger>
            <TabsTrigger value="vaccinations" className="rounded-xl text-xs px-4">
              Vaccination & Immunization Ledger ({vaccinations.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Medical Records & Prescriptions */}
          <TabsContent value="prescriptions" className="space-y-4 pt-1">
            {medicalHistory.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed text-xs text-muted-foreground space-y-2">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p>No previous medical records or prescriptions on file for {appointment.pet.name}.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddRecordOpen(true)}
                  className="rounded-xl text-xs mt-2"
                >
                  Create First Clinical Record
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {medicalHistory.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="rounded-2xl border border-border/70 bg-card p-5 space-y-3 hover:border-primary/40 transition-colors shadow-2xs"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">
                          {m.diagnosis || m.description || m.type}
                        </span>
                        <Badge variant="secondary" className="text-[10px] font-semibold py-0.5 px-2">
                          {m.type}
                        </Badge>
                        {m.isVeterinarianVerified ? (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/40 text-emerald-600 gap-1 inline-flex items-center">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Doctor Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                            Owner Stored
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">{m.date}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintRecord(m)}
                          className="rounded-xl text-xs h-7 px-2.5 gap-1 font-medium"
                          title="Print this Prescription / Report"
                        >
                          <Printer className="h-3 w-3" />
                          <span>Print</span>
                        </Button>
                      </div>
                    </div>

                    {/* Prescribed Medicines (Rx) Highlight Box */}
                    {m.medicines && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1">
                        <span className="font-bold text-primary text-xs flex items-center gap-1.5">
                          <Pill className="h-3.5 w-3.5" />
                          <span>℞ Prescribed Medicines & Dosage:</span>
                        </span>
                        <p className="whitespace-pre-line text-xs font-mono font-medium text-foreground pl-5">
                          {m.medicines}
                        </p>
                      </div>
                    )}

                    {/* Treatment & Notes Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {m.treatment && (
                        <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                          <span className="font-bold text-foreground block text-[11px]">Treatment Performed:</span>
                          <p className="text-muted-foreground text-xs mt-0.5">{m.treatment}</p>
                        </div>
                      )}
                      {m.notes && (
                        <div className="p-3 rounded-xl bg-surface/50 border border-border/50">
                          <span className="font-bold text-foreground block text-[11px]">Clinical Instructions & Remarks:</span>
                          <p className="text-muted-foreground text-xs mt-0.5">{m.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Doctor Info & Attachment */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-muted-foreground border-t border-border/50">
                      <span>Attending: {m.veterinarianName || "Practitioner on Record"}</span>

                      {m.attachmentUrl && (
                        <a
                          href={m.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Attachment / Lab File
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Vaccinations Ledger */}
          <TabsContent value="vaccinations" className="space-y-4 pt-1">
            {vaccinations.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed text-xs text-muted-foreground space-y-2">
                <ShieldCheck className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p>No vaccination records registered for {appointment.pet.name}.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddVaccinationOpen(true)}
                  className="rounded-xl text-xs mt-2"
                >
                  Record First Vaccination
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {vaccinations.map((v, idx) => (
                  <div
                    key={v.id || idx}
                    className="rounded-2xl border border-border/70 bg-card p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{v.name}</span>
                        {v.administeredBy && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                            {v.administeredBy}
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex flex-wrap gap-2">
                        <span>Administered: {v.date}</span>
                        {v.nextDue && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              Next Booster Due: {v.nextDue}
                            </span>
                          </>
                        )}
                      </div>
                      {v.notes && (
                        <p className="text-[11px] text-muted-foreground italic">&ldquo;{v.notes}&rdquo;</p>
                      )}
                    </div>

                    {v.certificateUrl && (
                      <div className="shrink-0">
                        <a
                          href={v.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          View Certificate
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Confirmation Dialog for Status Transitions */}
      <ConfirmDialog
        open={Boolean(targetStatus)}
        onOpenChange={(op) => !op && setTargetStatus(null)}
        title={`Update Appointment to "${targetStatus}"?`}
        description={`Confirming this update will advance ${appointment.appointmentNumber} to "${targetStatus}" and notify the pet parent.`}
        confirmLabel="Confirm Status Change"
        variant={targetStatus === "cancelled" ? "destructive" : "default"}
        onConfirm={handleConfirmStatusChange}
      />

      {/* Printable Clinical GST Tax Invoice Modal */}
      <InvoiceModal
        open={isInvoiceOpen}
        onOpenChange={setIsInvoiceOpen}
        invoiceType="APPOINTMENT"
        resourceId={appointment.id}
      />

      {/* Official Printable Prescription & Clinical Report Modal */}
      <PrescriptionModal
        appointment={appointment}
        selectedRecord={selectedRecordToPrint}
        open={isPrescriptionModalOpen}
        onOpenChange={(op) => {
          setIsPrescriptionModalOpen(op);
          if (!op) setSelectedRecordToPrint(null);
        }}
      />

      {/* Add Medical Record & Prescription Dialog */}
      <AddMedicalRecordDialog
        appointmentId={appointment.id}
        petName={appointment.pet.name}
        doctorName={appointment.veterinarianId}
        open={isAddRecordOpen}
        onOpenChange={setIsAddRecordOpen}
        onSuccess={() => refetch()}
      />

      {/* Add Vaccination Dialog */}
      <AddVaccinationDialog
        appointmentId={appointment.id}
        petName={appointment.pet.name}
        open={isAddVaccinationOpen}
        onOpenChange={setIsAddVaccinationOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
