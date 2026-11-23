"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddVetAppointmentVaccination } from "@/lib/api/hooks";
import { toast } from "@/lib/utils/toast";
import {
  ShieldCheck,
  Calendar,
  Upload,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface AddVaccinationDialogProps {
  appointmentId: string;
  petName: string;
  doctorName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const COMMON_VACCINES = [
  "Rabies (1-Year / 3-Year Annual Booster)",
  "DHPP (Distemper, Hepatitis, Parvovirus, Parainfluenza)",
  "Bordetella (Kennel Cough)",
  "Leptospirosis (4-Way Serovar)",
  "Canine Influenza (H3N2 / H3N8)",
  "FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)",
  "FeLV (Feline Leukemia Virus)",
];

export function AddVaccinationDialog({
  appointmentId,
  petName,
  doctorName,
  open,
  onOpenChange,
  onSuccess,
}: AddVaccinationDialogProps) {
  const { mutateAsync: addVaccination, isPending } = useAddVetAppointmentVaccination();

  const [vaccineName, setVaccineName] = useState("");
  const [vaccinationDate, setVaccinationDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [nextDueDate, setNextDueDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  });
  const [administeredBy, setAdministeredBy] = useState(doctorName ? `Dr. ${doctorName.replace(/^Dr\.\s*/i, "")}` : "");
  const [notes, setNotes] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "vaccinations");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "File upload failed");
      }

      const data = await res.json();
      setCertificateUrl(data.url || "");
      toast.success("Certificate Uploaded", {
        description: "Official immunization certificate document attached.",
      });
    } catch (err) {
      toast.error("Upload Failed", {
        description: err instanceof Error ? err.message : "Could not upload certificate.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName.trim()) {
      toast.error("Vaccine Name Required", {
        description: "Please specify the name of the administered vaccine.",
      });
      return;
    }

    try {
      await addVaccination({
        appointmentId,
        payload: {
          vaccineName: vaccineName.trim(),
          vaccinationDate,
          nextDueDate: nextDueDate || undefined,
          administeredBy: administeredBy.trim() || undefined,
          notes: notes.trim() || undefined,
          certificateUrl: certificateUrl.trim() || undefined,
        },
      });

      toast.success("Vaccination Certified", {
        description: `${vaccineName} recorded in ${petName}'s immunization ledger.`,
      });

      onOpenChange(false);
      onSuccess?.();

      setVaccineName("");
      setNotes("");
      setCertificateUrl("");
    } catch {
      toast.error("Record Failed", {
        description: "Could not log vaccination record. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="wide" className="max-w-xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Administer / Record Vaccination
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Issue immunization certificate and record booster cycle for <strong>{petName}</strong>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Vaccine Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Vaccine Name *</label>
            <Input
              list="common-vaccine-options"
              placeholder="e.g. Rabies Annual Booster, DHPP, Bordetella..."
              value={vaccineName}
              onChange={(e) => setVaccineName(e.target.value)}
              className="h-9 text-xs rounded-xl"
              required
            />
            <datalist id="common-vaccine-options">
              {COMMON_VACCINES.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </div>

          {/* Dates: Administered & Next Due */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Date Administered *</label>
              <Input
                type="date"
                value={vaccinationDate}
                onChange={(e) => setVaccinationDate(e.target.value)}
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Next Booster Due Date</label>
              <Input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Administered By */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Administering Veterinarian / Clinic</label>
            <Input
              placeholder="e.g. Dr. Jane Smith, DVM"
              value={administeredBy}
              onChange={(e) => setAdministeredBy(e.target.value)}
              className="h-9 text-xs rounded-xl"
            />
          </div>

          {/* Notes: Batch & Reaction */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Batch # / Lot & Clinical Observations</label>
            <Textarea
              placeholder="e.g. Lot #V9823-B, administered SQ right rear limb. No acute anaphylaxis observed post 15-min wait."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-xs rounded-xl"
            />
          </div>

          {/* Certificate Document Upload */}
          <div className="space-y-2 pt-1 border-t border-border/60">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-emerald-600" />
              <span>Immunization Certificate / Batch Sticker (Optional)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <input
                  type="file"
                  id="vac-cert-upload"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("vac-cert-upload")?.click()}
                  disabled={isUploading}
                  className="w-full text-xs h-9 rounded-xl gap-2 font-medium"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading Certificate...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5 text-emerald-600" />
                      Upload Certificate File
                    </>
                  )}
                </Button>
              </div>

              <Input
                placeholder="Or certificate URL..."
                value={certificateUrl}
                onChange={(e) => setCertificateUrl(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            {certificateUrl && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Certificate Linked: <span className="truncate max-w-sm">{certificateUrl}</span>
              </p>
            )}
          </div>

          <DialogFooter className="pt-4 border-t flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isUploading}
              className="rounded-xl text-xs h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Certifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Certify & Save Immunization
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

