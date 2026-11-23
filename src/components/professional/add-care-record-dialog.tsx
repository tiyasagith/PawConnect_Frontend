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
import { useAddProviderBookingCareRecord } from "@/lib/api/hooks";
import { toast } from "@/lib/utils/toast";
import {
  Scissors,
  Award,
  Calendar,
  Upload,
  Loader2,
  CheckCircle2,
  FileText,
  Sparkles,
} from "lucide-react";

interface AddCareRecordDialogProps {
  bookingId: string;
  petName: string;
  serviceCategory: "grooming" | "training" | string;
  serviceName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddCareRecordDialog({
  bookingId,
  petName,
  serviceCategory,
  serviceName,
  open,
  onOpenChange,
  onSuccess,
}: AddCareRecordDialogProps) {
  const { mutateAsync: addCareRecord, isPending } = useAddProviderBookingCareRecord();

  const isTraining = serviceCategory === "training";

  const [recordType, setRecordType] = useState(() => (isTraining ? "Training Evaluation" : "Grooming Care"));
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState(() => serviceName || "");
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
      formData.append("folder", "care-records");

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
      toast.success("Photo / Report Attached", {
        description: "Before/after photo or session report uploaded successfully.",
      });
    } catch (err) {
      toast.error("Upload Failed", {
        description: err instanceof Error ? err.message : "Could not upload photo.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.error("Assessment Required", {
        description: isTraining
          ? "Please provide a behavioral or training milestones assessment."
          : "Please provide a coat, skin, or hygiene assessment.",
      });
      return;
    }

    try {
      await addCareRecord({
        bookingId,
        payload: {
          recordType: recordType.trim() || (isTraining ? "Training Evaluation" : "Grooming Care"),
          recordDate,
          diagnosis: diagnosis.trim(),
          treatment: treatment.trim() || undefined,
          medicines: medicines.trim() || undefined,
          notes: notes.trim() || undefined,
          attachmentUrl: attachmentUrl.trim() || undefined,
        },
      });

      toast.success("Care Session Report Recorded", {
        description: `Session documentation stored on ${petName}'s permanent health & service file.`,
      });

      onOpenChange(false);
      onSuccess?.();

      setDiagnosis("");
      setTreatment(serviceName || "");
      setMedicines("");
      setNotes("");
      setAttachmentUrl("");
    } catch {
      toast.error("Save Failed", {
        description: "Could not log session report. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="wide" className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {isTraining ? <Award className="h-5 w-5 text-amber-600" /> : <Scissors className="h-5 w-5 text-primary" />}
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Check Pet & Record Session Report
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Log {isTraining ? "behavioral progress, drills completed," : "coat condition, hygiene styling,"} and recommendations for <strong>{petName}</strong>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Top Row: Session Type & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Session Category *</label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Grooming Care">Grooming & Spa Care</option>
                <option value="Training Evaluation">Canine Training Evaluation</option>
                <option value="Therapy">Hydrotherapy / Physical Conditioning</option>
                <option value="Daycare / Boarding">Daycare / Boarding Daily Log</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Session Date *</label>
              <Input
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>
          </div>

          {/* Assessment / Findings */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground flex items-center justify-between">
              <span>{isTraining ? "Behavioral & Milestone Assessment *" : "Coat, Skin & Hygiene Assessment *"}</span>
              <span className="text-[10px] text-muted-foreground font-normal">Condition observed</span>
            </label>
            <Textarea
              placeholder={
                isTraining
                  ? "e.g. High focus and food drive. Successfully held 30-sec sit-stay with mild distraction. Handled leash pressure well."
                  : "e.g. Double coat in good condition with minor matting behind ears. Skin clear, no hotspots or fleas observed. Nails trimmed and filed."
              }
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows={3}
              className="text-xs rounded-xl"
              required
            />
          </div>

          {/* Procedures / Drills Performed */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              {isTraining ? "Drills, Commands & Exercises Completed" : "Services, Products & Styling Performed"}
            </label>
            <Input
              placeholder={
                isTraining
                  ? "e.g. Loose-leash walking, recall on long line (15ft), place command"
                  : "e.g. Oatmeal bath, high-velocity deshed blow dry, sanitary trim, paw balm"
              }
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="h-9 text-xs rounded-xl"
            />
          </div>

          {/* Home Care / Homework */}
          <div className="space-y-1.5 rounded-2xl border border-primary/25 bg-primary/5 p-3.5">
            <label className="font-bold text-primary flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>{isTraining ? "Home Practice Exercises (Homework for Owner)" : "Home Care & Maintenance Recommendations"}</span>
            </label>
            <Textarea
              placeholder={
                isTraining
                  ? "e.g.:&#10;1. Practice sit-stay for 2 mins twice daily before meals&#10;2. Use high-value treats (boiled chicken) for recall outdoors&#10;3. Avoid letting pet pull ahead at doorways"
                  : "e.g.:&#10;1. Brush with slicker brush 3x weekly to prevent matting&#10;2. Apply hypoallergenic ear cleaner once weekly&#10;3. Next full groom due in 4 to 6 weeks"
              }
              value={medicines}
              onChange={(e) => setMedicines(e.target.value)}
              rows={3}
              className="text-xs rounded-xl bg-background"
            />
          </div>

          {/* Session Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Additional Observations & Staff Remarks</label>
            <Textarea
              placeholder="e.g. Pet was exceptionally calm during blow-drying. Loved peanut butter lick mat."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-xs rounded-xl"
            />
          </div>

          {/* Before/After Photo Upload */}
          <div className="space-y-2 pt-1 border-t border-border/60">
            <label className="font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Before / After Photo or Session Certificate (Optional)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <input
                  type="file"
                  id="care-photo-upload"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("care-photo-upload")?.click()}
                  disabled={isUploading}
                  className="w-full text-xs h-9 rounded-xl gap-2 font-medium"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading Media...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5 text-primary" />
                      Upload Photo / Report File
                    </>
                  )}
                </Button>
              </div>

              <Input
                placeholder="Or paste media URL directly..."
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
                  Recording Session...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Save Session Care Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

