import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  ShieldCheck,
  HeartPulse,
  Weight,
  User,
  Phone,
  Mail,
  FileText,
  ExternalLink,
  Info,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PetImage } from "@/components/shared/entity-image";

interface PetProfileSummaryProps {
  pet: {
    id: string;
    name: string;
    species: string;
    breed: string;
    age?: number | null;
    gender?: "Male" | "Female" | string | null;
    weight?: number | null;
    photo: string;
    color?: string;
    microchipId?: string;
    notes?: string;
    dateOfBirth?: string;
    vaccinations?: {
      id?: number;
      name: string;
      date: string;
      nextDue?: string;
      certificateUrl?: string;
      administeredBy?: string;
      notes?: string;
    }[];
    medicalHistory?: {
      id?: number;
      date: string;
      type: string;
      description?: string;
      diagnosis?: string;
      treatment?: string;
      medicines?: string;
      attachmentUrl?: string;
      notes?: string;
      veterinarianName?: string;
      isVeterinarianVerified?: boolean;
    }[];
  };
  owner?: {
    id?: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  };
  className?: string;
}

export function PetProfileSummary({ pet, owner, className }: PetProfileSummaryProps) {
  return (
    <Card className={cn("p-5 sm:p-6 rounded-2xl border-border/80 shadow-xs space-y-5", className)}>
      {/* Primary header */}
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden bg-secondary shrink-0 border border-border/60">
          <PetImage
            src={pet.photo}
            alt={pet.name || "Pet"}
            sizes="(max-width: 640px) 80px, 96px"
          />
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-foreground truncate">{pet.name}</h3>
            <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
              {pet.species}
            </Badge>
            {pet.gender && (
              <Badge variant="outline" className="text-xs font-medium">
                {pet.gender}
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground font-medium truncate">
            {pet.breed}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
            {pet.age != null && (
              <span className="flex items-center gap-1 font-medium">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {pet.age} {pet.age === 1 ? "year" : "years"} old
              </span>
            )}
            {pet.dateOfBirth && (
              <span className="text-[11px] text-muted-foreground">
                (DOB: {pet.dateOfBirth})
              </span>
            )}
            {pet.weight != null && (
              <>
                {(pet.age != null || pet.dateOfBirth) && <span>•</span>}
                <span className="flex items-center gap-1 font-medium">
                  <Weight className="h-3.5 w-3.5 text-primary" />
                  {pet.weight} kg
                </span>
              </>
            )}
            {pet.color && (
              <>
                <span>•</span>
                <span>Color: {pet.color}</span>
              </>
            )}
          </div>

          {pet.microchipId && (
            <p className="text-[11px] font-mono text-muted-foreground pt-0.5">
              Microchip ID: <span className="text-foreground font-semibold">{pet.microchipId}</span>
            </p>
          )}
        </div>
      </div>

      {/* Special Patient Notes */}
      {pet.notes && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
            <Info className="h-3.5 w-3.5 shrink-0" />
            <span>Pet Patient Notes / Sensitivities</span>
          </div>
          <p className="text-muted-foreground leading-relaxed pl-5">&ldquo;{pet.notes}&rdquo;</p>
        </div>
      )}

      {/* Owner Contact Information (if provided) */}
      {owner && (
        <div className="pt-3 border-t border-border/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <User className="h-3.5 w-3.5 text-primary" />
            <span>Parent / Contact Information</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs rounded-xl bg-surface/40 p-3 border border-border/50">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <span className="text-muted-foreground">Name:</span>
              <span>{owner.name}</span>
            </div>
            {owner.phone && (
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                <a href={`tel:${owner.phone}`} className="hover:text-primary hover:underline">
                  {owner.phone}
                </a>
              </div>
            )}
            {owner.email && (
              <div className="flex items-center gap-2 text-foreground sm:col-span-2">
                <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                <a href={`mailto:${owner.email}`} className="hover:text-primary hover:underline truncate">
                  {owner.email}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vaccinations overview if available */}
      {pet.vaccinations && pet.vaccinations.length > 0 && (
        <div className="pt-3 border-t border-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Immunization Records ({pet.vaccinations.length})</span>
            </div>
          </div>
          <div className="space-y-2">
            {pet.vaccinations.map((v, i) => (
              <div
                key={v.id ?? i}
                className="rounded-xl border border-border/70 bg-surface/60 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{v.name}</span>
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
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                          Next Due: {v.nextDue}
                        </span>
                      </>
                    )}
                  </div>
                  {v.notes && (
                    <p className="text-[11px] text-muted-foreground italic">&ldquo;{v.notes}&rdquo;</p>
                  )}
                </div>

                {v.certificateUrl && (
                  <div className="shrink-0 pt-1 sm:pt-0">
                    <a
                      href={v.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      title="Open full vaccination certificate document"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View Certificate
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical history & care records highlights if available */}
      {pet.medicalHistory && pet.medicalHistory.length > 0 && (
        <div className="pt-3 border-t border-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <HeartPulse className="h-3.5 w-3.5 text-primary" />
              <span>Clinical & Care History ({pet.medicalHistory.length})</span>
            </div>
          </div>
          <div className="space-y-2">
            {pet.medicalHistory.map((m, i) => (
              <div
                key={m.id ?? i}
                className="text-xs rounded-xl bg-surface/50 p-3 border border-border/60 flex flex-col gap-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {m.diagnosis || m.description || m.type}
                    </span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {m.type}
                    </Badge>
                    {m.isVeterinarianVerified && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/40 text-emerald-600 gap-1 inline-flex items-center">
                        <CheckCircle className="h-2.5 w-2.5" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">{m.date}</span>
                </div>

                {m.treatment && (
                  <p className="text-muted-foreground text-[11px]">
                    <strong className="text-foreground font-medium">Treatment:</strong> {m.treatment}
                  </p>
                )}
                {m.medicines && (
                  <p className="text-muted-foreground text-[11px]">
                    <strong className="text-foreground font-medium">Medicines / Rx:</strong> {m.medicines}
                  </p>
                )}
                {m.notes && (
                  <p className="text-muted-foreground text-[11px] italic">
                    &ldquo;{m.notes}&rdquo;
                  </p>
                )}
                {m.veterinarianName && (
                  <p className="text-[11px] text-muted-foreground">
                    Attending: {m.veterinarianName}
                  </p>
                )}

                {m.attachmentUrl && (
                  <div className="pt-1">
                    <a
                      href={m.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      title="Open attached medical file / diagnostic report"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Attached Document
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
