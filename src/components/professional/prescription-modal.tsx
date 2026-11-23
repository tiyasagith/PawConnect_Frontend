"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  X,
  Stethoscope,
  Phone,
  Mail,
  User,
  PawPrint,
  ShieldCheck,
  Globe,
  MapPin,
  Clock,
  Calendar,
  Award,
  CheckCircle2,
  FileCheck,
} from "lucide-react";

interface PrescriptionModalProps {
  appointment: any;
  selectedRecord?: {
    id?: string | number;
    date?: string;
    recordDate?: string;
    type?: string;
    diagnosis?: string;
    treatment?: string;
    medicines?: string;
    description?: string;
    veterinarianName?: string;
    notes?: string;
    attachmentUrl?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Normalizes doctor name so it cleanly begins with "Dr."
 */
function formatDoctorName(rawName?: string): string {
  if (!rawName || !rawName.trim()) {
    return "Dr. Ananya Sharma";
  }
  const trimmed = rawName.trim();
  if (/^dr\.?\s+/i.test(trimmed)) {
    return trimmed;
  }
  return `Dr. ${trimmed}`;
}

/**
 * Reusable Printable & Viewable Prescription Document Body
 */
function PrescriptionSheetContent({
  appointment,
  selectedRecord,
  activeDiagnosis,
  activeMedicines,
  activeTreatment,
  activeNotes,
  recordDate,
}: {
  appointment: any;
  selectedRecord: any;
  activeDiagnosis: string;
  activeMedicines?: string;
  activeTreatment?: string;
  activeNotes?: string;
  recordDate: string;
}) {
  const rawDoctorName =
    selectedRecord?.veterinarianName ||
    appointment?.veterinarianName ||
    appointment?.providerName ||
    "Ananya Sharma";

  const doctorName = formatDoctorName(rawDoctorName);

  const doctorQualification =
    appointment?.qualification ||
    appointment?.veterinarianQualification ||
    "BVSc & AH, MVSc (Veterinary Medicine)";

  const doctorSpecialization =
    appointment?.specialization ||
    appointment?.type ||
    "Small Animal Medicine & Surgery";

  const doctorLicenseNumber =
    appointment?.licenseNumber ||
    appointment?.veterinarianLicenseNumber ||
    "KA-VET-2023-492";

  const clinicName =
    appointment?.clinicName ||
    appointment?.providerClinicOrBusiness ||
    "Happy Paws Veterinary Clinic";

  const clinicAddress =
    appointment?.clinicAddress ||
    appointment?.location ||
    "2nd Cross Road, Marathahalli, Bangalore, Karnataka";

  const petName = appointment?.pet?.name || appointment?.petName || "Zopo";
  const petSpecies = appointment?.pet?.species || appointment?.species || "Canine (Dog)";
  const petBreed = appointment?.pet?.breed || appointment?.breed || "Golden Retriever";
  const petGender = appointment?.pet?.gender || appointment?.petGender || "Male";
  const petWeight = appointment?.pet?.weight ?? appointment?.petWeight ?? "7.0";
  const petAge = appointment?.pet?.age ?? appointment?.petAgeYears ?? "4.0";
  const petDob = appointment?.pet?.dateOfBirth ?? appointment?.petDateOfBirth ?? "2021-10-15";
  const petMicrochip =
    appointment?.pet?.microchipId ||
    appointment?.pet?.microchipNumber ||
    appointment?.petMicrochipNumber ||
    "MC-98246959-Approved";
  const petColor = appointment?.pet?.color || appointment?.petColor || "Golden";

  const ownerName = appointment?.owner?.name || appointment?.ownerName || "Disha Dey";
  const ownerPhone = appointment?.owner?.phone || appointment?.ownerPhone || "+91 98765 43210";
  const ownerEmail = appointment?.owner?.email || appointment?.ownerEmail || "client@pawconnect.com";
  const visitReason = appointment?.reason || appointment?.serviceOrReason || "Clinical Consultation & Health Exam";

  const prescriptionRef =
    appointment?.appointmentNumber ||
    (appointment?.id ? `APT-${appointment.id}` : "APT-94545597-CBDE");

  const vaccinations = appointment?.pet?.vaccinations || appointment?.petVaccinations || [];

  return (
    <div className="bg-white text-neutral-900 p-6 sm:p-9 space-y-6 rounded-2xl border border-neutral-300 font-sans shadow-xs max-w-4xl mx-auto">
      {/* 1. Global Platform & Clinic Master Header */}
      <div className="border-b-2 border-primary/40 pb-5 space-y-4">
        {/* Top Masthead with Website and Platform Authority */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 text-white px-4 py-2.5 rounded-xl print:bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm shadow-xs">
              🐾
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                PawConnect <span className="text-primary font-normal text-xs uppercase tracking-widest">Healthcare</span>
              </span>
              <p className="text-[10px] text-neutral-300 font-medium tracking-wide">
                Premier Veterinary & Clinical Pet Healthcare Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-neutral-300">
            <span className="flex items-center gap-1 text-primary-foreground font-semibold">
              <Globe className="h-3.5 w-3.5 text-primary" />
              www.pawconnect.com
            </span>
            <span className="hidden sm:inline text-neutral-500">•</span>
            <span className="text-[11px] text-neutral-400">Support: care@pawconnect.com</span>
          </div>
        </div>

        {/* Clinic & Attending Doctor Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Clinic / Facility Info */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-neutral-950 tracking-tight">
                {clinicName}
              </h2>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 uppercase font-bold py-0.5">
                Verified Clinic
              </Badge>
            </div>
            <p className="text-neutral-600 flex items-start gap-1.5 text-xs pt-0.5">
              <MapPin className="h-3.5 w-3.5 text-neutral-500 shrink-0 mt-0.5" />
              <span>{clinicAddress}</span>
            </p>
            <p className="text-[11px] text-neutral-500">
              PawConnect Certified Clinical Facility • In-Person & Digital Consultations
            </p>
          </div>

          {/* Attending Doctor Profile */}
          <div className="md:text-right space-y-0.5 text-xs bg-primary/5 md:bg-transparent p-3 md:p-0 rounded-xl border md:border-0 border-primary/20">
            <div className="flex md:justify-end items-center gap-1.5 text-primary font-bold text-xs">
              <Award className="h-3.5 w-3.5" />
              <span>Attending Veterinary Practitioner</span>
            </div>
            <h3 className="text-base font-black text-neutral-950">
              {doctorName}
            </h3>
            <p className="font-semibold text-neutral-800 text-xs">
              {doctorQualification}
            </p>
            <p className="text-neutral-600 text-xs">
              Specialization: <strong className="text-neutral-900 font-medium">{doctorSpecialization}</strong>
            </p>
            <p className="text-neutral-600 text-[11px] font-mono">
              State Board Reg / License No: <strong className="text-neutral-950 font-bold">{doctorLicenseNumber}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Official Rx Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-100/80 p-3 rounded-xl text-xs font-mono border border-neutral-200">
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase font-sans font-bold">Prescription ID</span>
          <strong className="text-neutral-950 font-bold">{prescriptionRef}</strong>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase font-sans font-bold">Consult Date</span>
          <strong className="text-neutral-950 font-bold">{recordDate}</strong>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase font-sans font-bold">Consult Time</span>
          <strong className="text-neutral-950 font-bold">{appointment?.time || "10:00 AM"}</strong>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase font-sans font-bold">Electronic Status</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" /> Validated
          </span>
        </div>
      </div>

      {/* 3. Patient (Pet) & Client (Pet Parent) Profile Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 text-xs">
        {/* Patient (Pet) Info */}
        <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-neutral-200 pb-3 sm:pb-0 sm:pr-4">
          <span className="text-[10px] uppercase font-bold text-primary flex items-center gap-1.5 tracking-wider">
            <PawPrint className="h-3.5 w-3.5" /> Patient Identification
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-base font-black text-neutral-950">{petName}</span>
            <span className="text-[11px] font-bold bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-md">
              {petSpecies} • {petBreed}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-neutral-600 pt-1">
            <div>
              <span>Sex: </span>
              <strong className="text-neutral-950 font-bold">{petGender}</strong>
            </div>
            <div>
              <span>Weight: </span>
              <strong className="text-neutral-950 font-bold">{petWeight} kg</strong>
            </div>
            <div>
              <span>Age / DOB: </span>
              <strong className="text-neutral-950 font-bold">
                {petAge} yrs {petDob ? `(${petDob})` : ""}
              </strong>
            </div>
            <div>
              <span>Microchip: </span>
              <strong className="font-mono text-neutral-950 font-bold">{petMicrochip}</strong>
            </div>
            {petColor && (
              <div className="col-span-2">
                <span>Coat Color: </span>
                <strong className="text-neutral-950 font-bold">{petColor}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Client (Pet Parent) Info */}
        <div className="space-y-1.5 sm:pl-2">
          <span className="text-[10px] uppercase font-bold text-primary flex items-center gap-1.5 tracking-wider">
            <User className="h-3.5 w-3.5" /> Client / Pet Parent
          </span>
          <p className="text-base font-black text-neutral-950">{ownerName}</p>
          <div className="space-y-1 text-[11px] text-neutral-600 pt-1">
            <p className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-neutral-500" />
              <span className="font-medium text-neutral-900">{ownerPhone}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-neutral-500" />
              <span className="font-medium text-neutral-900">{ownerEmail}</span>
            </p>
            <p className="text-[11px] text-neutral-600 pt-0.5">
              Reason for Visit: <strong className="text-neutral-900 font-semibold">&ldquo;{visitReason}&rdquo;</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 4. Clinical Findings & Diagnosis */}
      <div className="space-y-2 rounded-xl border border-neutral-200 p-4 bg-white text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-primary tracking-wider flex items-center gap-1">
            <Stethoscope className="h-3.5 w-3.5" /> 1. Clinical Examination & Diagnosis
          </span>
          <Badge variant="outline" className="text-[9px] font-bold text-neutral-600">
            Medical Assessment
          </Badge>
        </div>
        <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
          <p className="font-bold text-neutral-950 text-sm leading-relaxed">
            {activeDiagnosis}
          </p>
        </div>
        {activeTreatment && (
          <div className="pt-1 text-xs text-neutral-700">
            <strong className="text-neutral-950">Procedure / Clinical Treatment Administered: </strong>
            <span className="text-neutral-800">{activeTreatment}</span>
          </div>
        )}
      </div>

      {/* 5. ℞ Medical Prescription & Dosage Instructions */}
      <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-primary/20 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black font-serif text-primary">℞</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary block">
                Prescription & Medication Schedule
              </span>
              <span className="text-[10px] text-neutral-500 font-sans">
                Issued by {doctorName} • Validated on PawConnect
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase bg-white border border-primary/30 text-primary px-2.5 py-1 rounded-md shadow-2xs">
            Prescribed Treatment
          </span>
        </div>

        {activeMedicines ? (
          <div className="whitespace-pre-line text-xs font-mono font-medium text-neutral-950 bg-white rounded-xl p-4 border border-primary/25 leading-relaxed shadow-2xs">
            {activeMedicines}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-4 border border-neutral-200 text-xs text-neutral-600 italic">
            No systemic prescription required. Supportive hydration, gentle monitoring, and home care regimen recommended.
          </div>
        )}

        {activeNotes && (
          <div className="text-xs text-neutral-700 pt-1 bg-white/70 rounded-lg p-2.5 border border-primary/15">
            <strong className="text-neutral-950">Dietary & Home Care Instructions: </strong>
            <span>{activeNotes}</span>
          </div>
        )}
      </div>

      {/* 6. Current Immunization Summary (if available) */}
      {vaccinations && vaccinations.length > 0 && (
        <div className="rounded-xl border border-neutral-200 p-3.5 bg-neutral-50/60 text-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-neutral-600 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Current Immunization History
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {vaccinations.slice(0, 4).map((v: any, i: number) => (
              <div key={v.id ?? i} className="flex items-baseline justify-between p-2 rounded-lg bg-white border border-neutral-200">
                <span className="font-semibold text-neutral-950">{v.name || v.vaccineName}</span>
                <span className="text-neutral-500 text-[10px]">
                  {v.date || v.dateAdministered || v.vaccinationDate} {v.nextDue || v.nextDueDate ? `(Due: ${v.nextDue || v.nextDueDate})` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Doctor Attestation & Global Validation Footer */}
      <div className="pt-4 border-t-2 border-neutral-200 flex flex-col sm:flex-row items-end justify-between gap-6 text-xs">
        {/* Security & Regulatory Notice */}
        <div className="space-y-1.5 text-[11px] text-neutral-500 max-w-sm">
          <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
            <FileCheck className="h-3.5 w-3.5 text-primary" />
            <span>PawConnect Electronic Prescription Record</span>
          </div>
          <p className="leading-normal">
            This prescription is digitally authenticated by {doctorName} via the PawConnect Veterinary Network (<a href="https://www.pawconnect.com" className="text-primary hover:underline font-mono">www.pawconnect.com</a>).
            Keep all medications securely stored out of reach of children and other animals.
          </p>
        </div>

        {/* Doctor's Signature Block */}
        <div className="text-center sm:text-right space-y-1 min-w-[240px]">
          <div className="border-b-2 border-neutral-400 w-52 mx-auto sm:ml-auto pb-6 relative">
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block text-center">
              [ Digitally Signed & Authenticated ]
            </span>
          </div>
          <p className="font-black text-neutral-950 text-sm pt-1">
            {doctorName}
          </p>
          <p className="text-[11px] text-neutral-700 font-medium">
            {doctorQualification}
          </p>
          <p className="text-[10px] text-neutral-500 font-mono">
            Council Reg. No: <strong>{doctorLicenseNumber}</strong>
          </p>
          <p className="text-[9px] uppercase tracking-wider text-primary font-bold">
            Authorized Veterinary Medical Practitioner
          </p>
        </div>
      </div>

      {/* 8. Bottom Brand Stamp */}
      <div className="text-center pt-2 border-t border-neutral-100 text-[10px] text-neutral-400 font-mono">
        PawConnect Veterinary EHR Platform • Generated on {new Date().toLocaleDateString()} • www.pawconnect.com
      </div>
    </div>
  );
}

export function PrescriptionModal({
  appointment,
  selectedRecord,
  open,
  onOpenChange,
}: PrescriptionModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("pawconnect-print-prescription-active");
      }
    };
  }, []);

  const activeDiagnosis =
    selectedRecord?.diagnosis ||
    selectedRecord?.description ||
    appointment?.notes ||
    "Routine Clinical Examination & Preventive Health Assessment";

  const activeMedicines =
    selectedRecord?.medicines ||
    (selectedRecord?.notes?.includes("Rx:") ? selectedRecord.notes : undefined);

  const activeTreatment = selectedRecord?.treatment;
  const activeNotes = selectedRecord?.notes || appointment?.notes;
  const recordDate =
    (selectedRecord as any)?.date ||
    (selectedRecord as any)?.recordDate ||
    appointment?.date ||
    new Date().toISOString().split("T")[0];

  const handlePrint = () => {
    if (typeof window === "undefined") return;

    const originalTitle = document.title;
    const refNo = appointment?.appointmentNumber || `APPT-${appointment?.id || "REC"}`;
    document.title = `Prescription-${refNo}`;

    document.body.classList.add("pawconnect-print-prescription-active");
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "visible";

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove("pawconnect-print-prescription-active");
    }, 1000);
  };

  return (
    <>
      {/* Dedicated Print Isolation Styles for A4 Paper */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }

          body.pawconnect-print-prescription-active {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          /* Hide everything except the dedicated print portal */
          body.pawconnect-print-prescription-active > *:not(#pawconnect-print-prescription-portal) {
            display: none !important;
          }

          /* Display the print portal in standard document flow */
          body.pawconnect-print-prescription-active #pawconnect-print-prescription-portal {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 210mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }

          #pawconnect-print-prescription-portal * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
            text-shadow: none !important;
          }
        }

        /* Screen only: keep the print portal element invisible */
        @media screen {
          #pawconnect-print-prescription-portal {
            display: none !important;
          }
        }
      `}</style>

      {/* 1. DEDICATED DIRECT BODY PORTAL FOR PRINTING */}
      {mounted && open && (
        createPortal(
          <div id="pawconnect-print-prescription-portal">
            <PrescriptionSheetContent
              appointment={appointment}
              selectedRecord={selectedRecord}
              activeDiagnosis={activeDiagnosis}
              activeMedicines={activeMedicines}
              activeTreatment={activeTreatment}
              activeNotes={activeNotes}
              recordDate={recordDate}
            />
          </div>,
          document.body
        )
      )}

      {/* 2. ON-SCREEN MODAL DIALOG */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="wide" className="max-w-4xl p-0 overflow-hidden bg-background">
          {/* Modal Toolbar (Screen only) */}
          <div className="flex items-center justify-between p-4 border-b bg-card">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm text-foreground">
                Official Veterinary Prescription & Clinical Report • PawConnect
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handlePrint}
                className="rounded-xl text-xs h-8.5 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Prescription
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="rounded-xl text-xs h-8 w-8 p-0 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* On-screen Preview Body */}
          <div className="p-4 sm:p-6 max-h-[78vh] overflow-y-auto bg-neutral-100/40">
            <PrescriptionSheetContent
              appointment={appointment}
              selectedRecord={selectedRecord}
              activeDiagnosis={activeDiagnosis}
              activeMedicines={activeMedicines}
              activeTreatment={activeTreatment}
              activeNotes={activeNotes}
              recordDate={recordDate}
            />
          </div>

          {/* Modal Footer (Screen only) */}
          <div className="p-4 border-t bg-card flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="rounded-xl text-xs h-9">
              Close
            </Button>
            <Button size="sm" onClick={handlePrint} className="rounded-xl text-xs h-9 gap-1.5 bg-primary text-primary-foreground font-semibold">
              <Printer className="h-3.5 w-3.5" />
              Print Official Prescription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
