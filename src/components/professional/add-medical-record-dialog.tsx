"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAddVetAppointmentMedicalRecord } from "@/lib/api/hooks";
import { toast } from "@/lib/utils/toast";
import {
  Stethoscope,
  Pill,
  FileText,
  Upload,
  Calendar,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface AddMedicalRecordDialogProps {
  appointmentId: string;
  petName: string;
  doctorName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddMedicalRecordDialog({
  appointmentId,
  petName,
  doctorName,
  open,
  onOpenChange,
  onSuccess,
}: AddMedicalRecordDialogProps) {
  const { mutateAsync: addRecord, isPending } = useAddVetAppointmentMedicalRecord();

  const [recordType, setRecordType] = useState("Examination");
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [medicines, setMedicines] = useState("");
  const [notes, setNotes] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "medical-records");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "File upload failed");
      }

      const data = await res.json();
      setAttachmentUrl(data.url || "");
      toast.success("Attachment Uploaded", {
        description: "Medical report document successfully linked to patient record.",
      });
    } catch (err) {
      toast.error("Upload Failed", {
        description: err instanceof Error ? err.message : "Could not upload document.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error("Diagnosis Required", {
        description: "Please specify clinical findings or diagnosis for the patient.",
      });
      return;
    }

    try {
      await addRecord({
        appointmentId,
        payload: {
          recordType: recordType.trim() || "Examination",
          recordDate,
          diagnosis: diagnosis.trim(),
          treatment: treatment.trim() || undefined,
          medicines: medicines.trim() || undefined,
          notes: notes.trim() || undefined,
          attachmentUrl: attachmentUrl.trim() || undefined,
        },
      });

      toast.success("Clinical Record & Prescription Saved", {
        description: `Prescription recorded in ${petName}'s medical history.`,
      });

      onOpenChange(false);
      onSuccess?.();

      // Reset fields
      setDiagnosis("");
      setTreatment("");
      setMedicines("");
      setNotes("");
      setAttachmentUrl("");
    } catch {
      toast.error("Save Failed", {
        description: "Could not persist patient medical record. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="wide" className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Check Patient & Issue Prescription
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Document clinical examination, prescribe medications, and add treatment notes for <strong>{petName}</strong>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Top Row: Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Record Category *</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Examination">Clinical Examination & Consult</option>
                <option value="Diagnostic">Diagnostic / Lab / Pathology</option>
                <option value="Surgery">Surgical Procedure & Post-Op</option>
                <option value="Dental">Dental Care & Prophylaxis</option>
                <option value="Therapy">Therapy & Rehabilitation</option>
                <option value="Vaccination Review">Vaccination Health Review</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Date of Examination *</label>
              <Input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>
          </div>

          {/* Diagnosis & Findings */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground flex items-center justify-between">
              <span>Clinical Diagnosis & Observations *</span>
              <span className="text-[10px] text-muted-foreground font-normal">Primary medical evaluation</span>
            </label>
            <Textarea
              placeholder="e.g. Mild canine gastroenteritis, afebrile, alert. Moderate plaque on upper premolars..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={3}
              className="text-xs rounded-xl"
              required
            />
          </div>

          {/* ℞ Prescribed Medicines */}
          <div className="space-y-1.5 rounded-2xl border border-primary/25 bg-primary/5 p-3.5">
            <label className="font-bold text-primary flex items-center gap-1.5">
              <Pill className="h-4 w-4" />
              <span>℞ Prescribed Medicines & Dosage Instructions</span>
            </label>
            <Textarea
              placeholder="e.g.:&#10;1. Amoxicillin 250mg — 1 tab BID with food x 7 days&#10;2. Metoclopramide 10mg — 1/2 tab TID before food x 3 days&#10;3. Oral Probiotic Powder — 1 sachet daily in water"
              value={medicines}
              onChange={(e) => setMedicines(e.target.value)}
              rows={4}
              className="text-xs rounded-xl bg-background font-mono"
            />
            <p className="text-[10px] text-muted-foreground">
              Provide drug name, strength, route, frequency, and duration for the pet parent.
            </p>
          </div>

          {/* Treatment & Clinical Procedure */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              Clinical Procedures & Treatment Performed
            </label>
            <Input
              placeholder="e.g. Subcutaneous fluid administration 100mL, ear canal flushing, wound dressed"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="h-9 text-xs rounded-xl"
            />
          </div>

          {/* Dietary Advice & Follow-up Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              Dietary Advice & Follow-up Instructions
            </label>
            <Textarea
              placeholder="e.g. Bland diet (boiled chicken & rice) for 48 hours. Plenty of fresh water. Follow-up review in 5 days if vomiting recurs."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-xs rounded-xl"
            />
          </div>

          {/* Attachment / Lab Upload */}
          <div className="space-y-2 pt-1 border-t border-border/60">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Diagnostic Report / X-Ray / Lab Attachment (Optional)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="file"
                  id="doc-file-upload"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("doc-file-upload")?.click()}
                  disabled={isUploading}
                  className="w-full text-xs h-9 rounded-xl gap-2 font-medium"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading File...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5 text-primary" />
                      Choose File to Upload
                    </>
                  )}
                </Button>
              </div>

              <Input
                placeholder="Or paste document / image URL directly..."
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            {attachmentUrl && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Attached: <span className="truncate max-w-sm">{attachmentUrl}</span>
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
              className="rounded-xl text-xs h-9 gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving Patient File...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Save & Certify Prescription
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

