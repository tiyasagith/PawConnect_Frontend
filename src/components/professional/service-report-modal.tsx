"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  X,
  Scissors,
  Award,
  Calendar,
  Clock,
  Phone,
  Mail,
  User,
  PawPrint,
  CheckCircle2,
  FileText,
} from "lucide-react";
import type { ProviderBooking } from "@/lib/mock/professionals";

interface ServiceReportModalProps {
  booking: ProviderBooking;
  selectedRecord?: {
    id?: string | number;
    date: string;
    type: string;
    diagnosis?: string;
    treatment?: string;
    medicines?: string;
    notes?: string;
    attachmentUrl?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceReportModal({
  booking,
  selectedRecord,
  open,
  onOpenChange,
}: ServiceReportModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const isTraining = booking.serviceCategory === "training";
  const sessionType = selectedRecord?.type || (isTraining ? "Canine Behavioral Training" : "Professional Pet Grooming");
  const assessment = selectedRecord?.diagnosis || booking.notes || "Comprehensive session completed successfully.";
  const procedures = selectedRecord?.treatment || booking.serviceName;
  const recommendations = selectedRecord?.medicines;
  const remarks = selectedRecord?.notes || booking.notes;
  const reportDate = selectedRecord?.date || booking.date;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="wide" className="max-w-3xl p-0 overflow-hidden bg-background">
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-service-report,
            #printable-service-report * {
              visibility: visible;
            }
            #printable-service-report {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              max-width: 100% !important;
              padding: 24px !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Modal Toolbar (Screen only) */}
        <div className="flex items-center justify-between p-4 border-b bg-card no-print">
          <div className="flex items-center gap-2">
            {isTraining ? (
              <Award className="h-5 w-5 text-amber-600" />
            ) : (
              <Scissors className="h-5 w-5 text-primary" />
            )}
            <span className="font-bold text-sm text-foreground">
              Official Pet Care & Evaluation Report
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="rounded-xl text-xs h-8 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Report
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

        {/* Printable Document Body */}
        <div id="printable-service-report" className="p-6 sm:p-8 space-y-6 text-foreground bg-card max-h-[80vh] overflow-y-auto">
          {/* Business & Session Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b-2 border-primary/20 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-primary tracking-tight">
                  PawConnect Specialist Care
                </span>
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/30 uppercase">
                  {isTraining ? "Canine Academy" : "Salon & Spa"}
                </Badge>
              </div>
              <h2 className="text-base font-bold text-foreground">
                {isTraining ? "Canine Training & Behavioral Evaluation Report" : "Pet Grooming, Hygiene & Health Care Report"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Session Ref: <strong className="font-mono text-foreground">{booking.bookingNumber}</strong> • {booking.serviceName}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5">
              <p className="font-bold text-sm text-foreground">Certified Specialist</p>
              <p className="text-muted-foreground">Professional Care Practitioner</p>
              <p className="text-muted-foreground font-mono">
                Session Date: {reportDate} • {booking.time}
              </p>
            </div>
          </div>

          {/* Pet & Owner Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border/80 bg-surface/50 p-4 text-xs">
            {/* Pet Column */}
            <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-border/60 pb-3 sm:pb-0 sm:pr-4">
              <span className="text-[10px] uppercase font-bold text-primary flex items-center gap-1">
                <PawPrint className="h-3 w-3" /> Pet Client Profile
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-foreground">{booking.pet.name}</span>
                <Badge variant="secondary" className="text-[10px] font-semibold">
                  {booking.pet.species} • {booking.pet.breed}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                <div>
                  <span>Gender: </span>
                  <strong className="text-foreground">{booking.pet.gender || "Unspecified"}</strong>
                </div>
                <div>
                  <span>Weight: </span>
                  <strong className="text-foreground">
                    {booking.pet.weight != null ? `${booking.pet.weight} kg` : "N/A"}
                  </strong>
                </div>
                <div>
                  <span>Age / DOB: </span>
                  <strong className="text-foreground">
                    {booking.pet.age != null ? `${booking.pet.age} yrs` : "N/A"}
                    {booking.pet.dateOfBirth ? ` (${booking.pet.dateOfBirth})` : ""}
                  </strong>
                </div>
                <div>
                  <span>Microchip: </span>
                  <strong className="font-mono text-foreground">{booking.pet.microchipId || "None"}</strong>
                </div>
                {booking.pet.color && (
                  <div className="col-span-2">
                    <span>Coat Color: </span>
                    <strong className="text-foreground">{booking.pet.color}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Column */}
            <div className="space-y-1.5 sm:pl-2">
              <span className="text-[10px] uppercase font-bold text-primary flex items-center gap-1">
                <User className="h-3 w-3" /> Pet Parent Information
              </span>
              <p className="text-sm font-bold text-foreground">{booking.owner.name}</p>
              <div className="space-y-1 text-[11px] text-muted-foreground pt-1">
                {booking.owner.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span>{booking.owner.phone}</span>
                  </p>
                )}
                {booking.owner.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span>{booking.owner.email}</span>
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground pt-1">
                  Service Category: <strong className="text-foreground capitalize">{booking.serviceCategory}</strong> ({booking.durationMinutes} min)
                </p>
              </div>
            </div>
          </div>

          {/* Session Overview & Assessment */}
          <div className="space-y-2 rounded-2xl border border-border/80 p-4 bg-card text-xs">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">
              1. {isTraining ? "Behavioral & Readiness Assessment" : "Coat, Skin & Hygiene Assessment"}
            </span>
            <p className="font-semibold text-foreground text-sm leading-relaxed">
              {assessment}
            </p>
          </div>

          {/* Procedures & Styling / Drills Performed */}
          <div className="rounded-2xl border border-border/80 p-4 bg-card text-xs space-y-2">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">
              2. {isTraining ? "Training Drills & Commands Practiced" : "Grooming & Hygiene Services Performed"}
            </span>
            <p className="text-foreground text-xs leading-relaxed whitespace-pre-line font-medium">
              {procedures}
            </p>
          </div>

          {/* Home Care Recommendations & Practice */}
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-primary/20 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                3. {isTraining ? "Home Practice Exercises & Commands" : "Recommended Home Care & Maintenance Routine"}
              </span>
              <Badge variant="outline" className="text-[10px] bg-background border-primary/30 text-primary">
                Specialist Advice
              </Badge>
            </div>
            {recommendations ? (
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-line font-medium">
                {recommendations}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Continue routine home maintenance and positive reinforcement schedule.
              </p>
            )}

            {remarks && (
              <div className="text-[11px] text-muted-foreground pt-1 border-t border-primary/10">
                <strong className="text-foreground">Specialist Observations: </strong>
                {remarks}
              </div>
            )}
          </div>

          {/* Provider Signature Block */}
          <div className="pt-6 border-t-2 border-border/60 flex flex-col sm:flex-row items-end justify-between gap-6 text-xs">
            <div className="space-y-1 text-[11px] text-muted-foreground max-w-sm">
              <p className="font-semibold text-foreground">PawConnect Partner Quality Guarantee</p>
              <p>
                Session verified and completed in accordance with professional pet handling, hygiene, and ethical training standards.
              </p>
            </div>

            <div className="text-center sm:text-right space-y-1 min-w-[200px]">
              <div className="border-b border-foreground/30 w-48 mx-auto sm:ml-auto pb-8">
                {/* Signature line */}
              </div>
              <p className="font-bold text-foreground text-xs pt-1">
                Authorized Care Provider
              </p>
              <p className="text-[10px] text-muted-foreground">Certified Specialist Seal</p>
            </div>
          </div>
        </div>

        {/* Modal Footer (Screen only) */}
        <div className="p-4 border-t bg-card flex justify-end gap-2 no-print">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="rounded-xl text-xs h-9">
            Close
          </Button>
          <Button size="sm" onClick={handlePrint} className="rounded-xl text-xs h-9 gap-1.5 bg-primary text-primary-foreground font-semibold">
            <Printer className="h-3.5 w-3.5" />
            Print Service Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

