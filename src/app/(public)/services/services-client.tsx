"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderCard } from "@/components/shared/provider-card";
import { EmptyState } from "@/components/shared/states";
import {
  FadeInView,
  StaggerView,
  StaggerItem,
} from "@/lib/animations/motion-components";
import { Stethoscope, Scissors, Award, ArrowRight, Check } from "lucide-react";
import {
  usePublicVeterinarians,
  usePublicServiceProviders,
  type BackendPublicVeterinarian,
  type BackendPublicServiceProvider,
} from "@/lib/api/hooks";

interface ServicesClientProps {
  initialVets?: BackendPublicVeterinarian[];
  initialGroomers?: BackendPublicServiceProvider[];
  initialTrainers?: BackendPublicServiceProvider[];
}

export function ServicesClient({
  initialVets,
  initialGroomers,
  initialTrainers,
}: ServicesClientProps = {}) {
  const { data: vets = initialVets || [] } = usePublicVeterinarians();
  const { data: groomers = initialGroomers || [] } = usePublicServiceProviders({
    providerType: "GROOMER",
  });
  const { data: trainers = initialTrainers || [] } = usePublicServiceProviders({
    providerType: "TRAINER",
  });

  return (
    <div className="flex flex-col gap-10 py-6 sm:gap-14 sm:py-10 md:gap-16 md:py-12 lg:gap-20 lg:py-16">
      {/* ─── Page Hero ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 w-full">
        <FadeInView aboveTheFold className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <Badge variant="cream" className="text-xs">Certified Specialists</Badge>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.18] sm:leading-[1.12] break-words">
            Complete pet care services under one roof
          </h1>
          <p className="font-decorative text-xl xs:text-2xl sm:text-3xl font-bold text-primary leading-tight">
            Tailored medical, grooming, and behavioral care
          </p>
          <p className="text-xs xs:text-sm sm:text-base leading-relaxed text-muted-foreground px-1 sm:px-0">
            Every specialist on PawConnect is fully verified, licensed, and dedicated
            to fear-free handling. Discover our three pillars of pet health and wellness below.
          </p>
        </FadeInView>

        {/* 3 Pillar Summary Cards with Staggered Entrance */}
        <StaggerView className="mt-8 sm:mt-12 grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <StaggerItem>
            <div className="rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/70 bg-primary-soft/30 p-5 sm:p-7 md:p-8 flex flex-col justify-between h-full transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:will-change-transform motion-reduce:transition-none">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <Stethoscope className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Veterinary Medicine</h2>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Comprehensive physical exams, vaccinations, dental procedures, surgery, and urgent care triage.
                </p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground pt-1 sm:pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Licensed doctors & emergency triage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Real-time appointment slots</span>
                  </li>
                </ul>
              </div>
              <Button asChild size="sm" className="mt-5 sm:mt-6 w-full sm:w-auto rounded-full self-start shadow-sm active:scale-95 transition-transform">
                <Link href="/services/veterinary" className="flex items-center justify-center gap-1.5">
                  <span>Browse Veterinarians</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/70 bg-cream/50 p-5 sm:p-7 md:p-8 flex flex-col justify-between h-full transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:will-change-transform motion-reduce:transition-none">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-400 text-amber-950 shadow-sm">
                  <Scissors className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Grooming & Spas</h2>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Breed styling haircuts, organic oatmeal soaks, high-velocity blowout de-shedding, and hygienic paw trims.
                </p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground pt-1 sm:pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>Fear-free handling certified</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>Clean, sanitized private suites</span>
                  </li>
                </ul>
              </div>
              <Button asChild size="sm" className="mt-5 sm:mt-6 w-full sm:w-auto rounded-full self-start bg-amber-500 hover:bg-amber-600 text-white shadow-sm active:scale-95 transition-transform">
                <Link href="/services/grooming" className="flex items-center justify-center gap-1.5">
                  <span>Browse Salons</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </StaggerItem>

          <StaggerItem className="sm:col-span-2 lg:col-span-1">
            <div className="rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/70 bg-blue-soft/40 p-5 sm:p-7 md:p-8 flex flex-col justify-between h-full transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:will-change-transform motion-reduce:transition-none">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-sky-400 text-sky-950 shadow-sm">
                  <Award className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Positive Training</h2>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Puppy foundational obedience, leash aggression resets, separation anxiety rehab, and agility obstacle courses.
                </p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground pt-1 sm:pt-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span>100% positive reinforcement only</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    <span>Private and group class options</span>
                  </li>
                </ul>
              </div>
              <Button asChild size="sm" className="mt-5 sm:mt-6 w-full sm:w-auto rounded-full self-start bg-sky-600 hover:bg-sky-700 text-white shadow-sm active:scale-95 transition-transform">
                <Link href="/services/training" className="flex items-center justify-center gap-1.5">
                  <span>Browse Trainers</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </StaggerItem>
        </StaggerView>
      </section>

      {/* ─── 1. Veterinary Services Preview ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 w-full">
        <FadeInView className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4.5 w-4.5 text-primary shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Veterinary Health</span>
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">Clinical care & wellness checks</h2>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto rounded-full shrink-0 self-start sm:self-auto">
            <Link href="/services/veterinary" className="flex items-center justify-center gap-1.5">
              <span>View All Veterinary Doctors ({vets.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </FadeInView>

        {vets.length === 0 ? (
          <EmptyState
            title="Veterinary Clinicians Joining Soon"
            description="Licensed veterinary doctors and clinics are currently completing verification. Check back shortly or browse other services."
            icon={<Stethoscope className="h-7 w-7 text-primary" />}
            action={
              <Button asChild size="sm" variant="outline" className="w-full sm:w-auto rounded-full">
                <Link href="/services/veterinary">View Veterinary Details</Link>
              </Button>
            }
          />
        ) : (
          <StaggerView className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {vets.slice(0, 3).map((vet) => (
              <StaggerItem key={`vet-${vet.id}`}>
                <ProviderCard
                  id={String(vet.id)}
                  name={vet.name}
                  title={vet.specialization || "Licensed Veterinarian"}
                  specialty={vet.qualification || vet.specialization}
                  location={vet.clinicName || vet.clinicAddress || "Veterinary Practice"}
                  rating={vet.rating || 0}
                  reviewCount={vet.reviewCount || 0}
                  fee={vet.consultationFee || 500}
                  feeLabel="Consultation"
                  nextAvailable={vet.isAvailableToday ? "Available Today" : "Book Online"}
                  availableToday={vet.isAvailableToday}
                  image={vet.profileImageUrl || vet.photo || ""}
                  badges={[
                    ...(vet.specialization ? [vet.specialization] : []),
                    ...(vet.experienceYears ? [`${vet.experienceYears}y exp`] : []),
                  ]}
                  bio={vet.bio}
                  detailsHref="/services/veterinary"
                />
              </StaggerItem>
            ))}
          </StaggerView>
        )}
      </section>

      {/* ─── 2. Grooming Services Preview ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 w-full">
        <FadeInView className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scissors className="h-4.5 w-4.5 text-amber-600 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Grooming & Hygiene</span>
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">Gentle spa baths & styling</h2>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto rounded-full shrink-0 self-start sm:self-auto">
            <Link href="/services/grooming" className="flex items-center justify-center gap-1.5">
              <span>View Grooming Salons ({groomers.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </FadeInView>

        {groomers.length === 0 ? (
          <EmptyState
            title="Grooming Salons Joining Soon"
            description="Certified fear-free groomers and luxury salons are completing onboarding. Visit our grooming directory for details."
            icon={<Scissors className="h-7 w-7 text-amber-600" />}
            action={
              <Button asChild size="sm" variant="outline" className="w-full sm:w-auto rounded-full">
                <Link href="/services/grooming">Explore Grooming Packages</Link>
              </Button>
            }
          />
        ) : (
          <StaggerView className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {groomers.slice(0, 3).map((provider) => (
              <StaggerItem key={`groom-${provider.id}`}>
                <ProviderCard
                  id={String(provider.id)}
                  name={provider.name}
                  title={provider.businessName}
                  specialty={provider.description || "Grooming & Spa"}
                  location={provider.address || "Certified Salon"}
                  rating={provider.rating || 0}
                  reviewCount={provider.reviewCount || 0}
                  fee={800}
                  feeLabel="Starting at"
                  nextAvailable="Book Online"
                  availableToday={true}
                  image={provider.profileImageUrl || provider.photo || ""}
                  badges={["Grooming"]}
                  detailsHref="/services/grooming"
                />
              </StaggerItem>
            ))}
          </StaggerView>
        )}
      </section>

      {/* ─── 3. Training Services Preview ───────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 w-full">
        <FadeInView className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-sky-600 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Canine Coaching</span>
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">Positive behavioral programs</h2>
          </div>
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto rounded-full shrink-0 self-start sm:self-auto">
            <Link href="/services/training" className="flex items-center justify-center gap-1.5">
              <span>View Certified Trainers ({trainers.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </FadeInView>

        {trainers.length === 0 ? (
          <EmptyState
            title="Positive Trainers Joining Soon"
            description="Certified behavioral specialists and puppy coaches are completing their profiles."
            icon={<Award className="h-7 w-7 text-sky-600" />}
            action={
              <Button asChild size="sm" variant="outline" className="w-full sm:w-auto rounded-full">
                <Link href="/services/training">View Training Details</Link>
              </Button>
            }
          />
        ) : (
          <StaggerView className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {trainers.slice(0, 3).map((provider) => (
              <StaggerItem key={`train-${provider.id}`}>
                <ProviderCard
                  id={String(provider.id)}
                  name={provider.name}
                  title={provider.businessName}
                  specialty={provider.description || "Positive Canine Coaching"}
                  location={provider.address || "Training Facility"}
                  rating={provider.rating || 0}
                  reviewCount={provider.reviewCount || 0}
                  fee={1200}
                  feeLabel="Starting at"
                  nextAvailable="Book Online"
                  availableToday={true}
                  image={provider.profileImageUrl || provider.photo || ""}
                  badges={["Trainer"]}
                  detailsHref="/services/training"
                />
              </StaggerItem>
            ))}
          </StaggerView>
        )}
      </section>
    </div>
  );
}
