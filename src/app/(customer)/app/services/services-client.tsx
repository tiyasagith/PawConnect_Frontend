"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderCard } from "@/components/shared/provider-card";
import { EmptyState } from "@/components/shared/states";
import { BookingModal } from "@/components/customer/booking-modal";
import { useAuthStore } from "@/stores/auth.store";
import { useAuthModal } from "@/stores/auth-modal.store";
import { toast } from "@/lib/utils/toast";
import {
  FadeInView,
  StaggerView,
  StaggerItem,
} from "@/lib/animations/motion-components";
import {
  Stethoscope,
  Scissors,
  Award,
  ArrowRight,
  Check,
  CalendarDays,
  ShieldCheck,
  Heart,
} from "lucide-react";
import {
  usePublicVeterinarians,
  usePublicServiceProviders,
  type BackendPublicVeterinarian,
  type BackendPublicServiceProvider,
} from "@/lib/api/hooks";

export function CustomerServicesClient() {
  const router = useRouter();
  const [selectedVet, setSelectedVet] = React.useState<BackendPublicVeterinarian | null>(null);
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const { isAuthenticated } = useAuthStore();
  const { openLogin } = useAuthModal();

  const { data: vets = [], isLoading: vetsLoading } = usePublicVeterinarians();
  const { data: groomers = [], isLoading: groomersLoading } = usePublicServiceProviders({
    providerType: "GROOMER",
  });
  const { data: trainers = [], isLoading: trainersLoading } = usePublicServiceProviders({
    providerType: "TRAINER",
  });

  const handleBookVet = (vet: BackendPublicVeterinarian) => {
    if (!isAuthenticated) {
      toast.info("Sign in required", {
        description: "Please sign in to book an appointment slot.",
      });
      openLogin();
      return;
    }
    setSelectedVet(vet);
    setIsBookingOpen(true);
  };

  const handleBookGroomer = (provider: BackendPublicServiceProvider) => {
    if (!isAuthenticated) {
      toast.info("Sign in required", {
        description: `Please sign in to book a grooming slot with ${provider.businessName || provider.name}.`,
      });
      openLogin();
      return;
    }
    router.push(`/app/services/grooming/${provider.id}`);
  };

  const handleBookTrainer = (trainer: BackendPublicServiceProvider) => {
    if (!isAuthenticated) {
      toast.info("Sign in required", {
        description: `Please sign in to book a training session slot with ${trainer.businessName || trainer.name}.`,
      });
      openLogin();
      return;
    }
    router.push(`/app/services/training/${trainer.id}`);
  };

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-12">
      {/* ─── Hero Banner ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[32px] border border-border/80 bg-gradient-to-br from-primary-soft/40 via-surface/60 to-cream/40 p-6 sm:p-10 lg:p-12 shadow-xs">
        <div className="max-w-3xl space-y-4">
          <Badge variant="cream" className="text-xs">
            Pet Parent Services
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Trusted care services for your companions
          </h1>
          <p className="font-decorative text-xl sm:text-2xl font-bold text-primary">
            Licensed Vets, Luxury Grooming & Positive Training
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base max-w-2xl">
            Book certified appointments seamlessly with real-time confirmation, verified health records, and direct digital booking.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild className="rounded-full shadow-sm">
              <Link href="/app/services/veterinary" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                <span>Find a Veterinarian</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/app/services/grooming" className="flex items-center gap-2">
                <Scissors className="h-4 w-4" />
                <span>Book Grooming Spa</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/app/services/training" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>Behavior Coaching</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 3 Primary Pillars ──────────────────────────────────────────────── */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Select a Care Category</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Choose from our specialized pet service disciplines</p>
          </div>
        </div>

        <StaggerView className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Pillar 1: Veterinary */}
          <StaggerItem>
            <div className="rounded-[32px] border border-border/70 bg-card p-6 sm:p-8 flex flex-col justify-between h-full transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none">
              <div className="space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <Stethoscope className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Veterinary Care</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Consult licensed veterinary doctors for full examinations, vaccines, diagnostics, and preventive care.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground pt-1">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Instant real-time appointment scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Digital consultation notes & prescriptions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Emergency triage & routine checkups</span>
                  </li>
                </ul>
              </div>
              <Button asChild size="sm" className="mt-6 rounded-full self-start shadow-sm active:scale-95 transition-transform">
                <Link href="/app/services/veterinary" className="flex items-center gap-1.5">
                  <span>Explore Veterinarians</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </StaggerItem>

          {/* Pillar 2: Grooming */}
          <StaggerItem>
            <div className="rounded-[32px] border border-border/70 bg-card p-6 sm:p-8 flex flex-col justify-between h-full transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none">
              <div className="space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
                  <Scissors className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Grooming & Spas</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Treat your pet to luxury baths, breed-specific haircuts, de-shedding blowouts, and nail trims.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground pt-1">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Gentle, certified fear-free handling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Organic hypoallergenic shampoo treatments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Private sanitized suites & custom styling</span>
                  </li>
                </ul>
              </div>
              <Button asChild size="sm" className="mt-6 rounded-full self-start bg-amber-500 hover:bg-amber-600 text-white shadow-sm active:scale-95 transition-transform">
                <Link href="/app/services/grooming" className="flex items-center gap-1.5">
                  <span>Explore Groomers</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </StaggerItem>

          {/* Pillar 3: Training */}
          <StaggerItem className="sm:col-span-2 lg:col-span-1">
            <div className="rounded-[32px] border border-border/70 bg-card p-6 sm:p-8 flex flex-col justify-between h-full transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none">
              <div className="space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm">
                  <Award className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Positive Training</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Certified behavioral coaching, puppy foundational manners, socialization, and agility skills.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground pt-1">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>100% positive reinforcement methods</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>One-on-one sessions & group workshops</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>Leash reactivity & separation anxiety resets</span>
                  </li>
                </ul>
              </div>
              <Button asChild size="sm" className="mt-6 rounded-full self-start bg-sky-600 hover:bg-sky-700 text-white shadow-sm active:scale-95 transition-transform">
                <Link href="/app/services/training" className="flex items-center gap-1.5">
                  <span>Explore Trainers</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </StaggerItem>
        </StaggerView>
      </section>

      {/* ─── Featured Veterinary Specialists ───────────────────────────────── */}
      <section>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="h-4.5 w-4.5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Veterinary Doctors</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Available Clinicians</h2>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full self-start sm:self-auto">
            <Link href="/app/services/veterinary" className="flex items-center gap-1.5">
              <span>View All Doctors ({vets.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {vets.length === 0 ? (
          <EmptyState
            title="Clinicians Joining Soon"
            description="Licensed veterinary doctors are completing onboarding. Check back shortly."
            icon={<Stethoscope className="h-7 w-7 text-primary" />}
            action={
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/app/services/veterinary">Browse Directory</Link>
              </Button>
            }
          />
        ) : (
          <StaggerView className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  detailsHref={`/app/services/veterinary/${vet.id}`}
                  onSelect={() => handleBookVet(vet)}
                />
              </StaggerItem>
            ))}
          </StaggerView>
        )}
      </section>

      {/* ─── Featured Grooming Salons ───────────────────────────────────────── */}
      <section>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Scissors className="h-4.5 w-4.5 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Grooming & Hygiene</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Grooming Studios</h2>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full self-start sm:self-auto">
            <Link href="/app/services/grooming" className="flex items-center gap-1.5">
              <span>View All Salons ({groomers.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {groomers.length === 0 ? (
          <EmptyState
            title="Groomers Joining Soon"
            description="Certified grooming salons are currently joining our network."
            icon={<Scissors className="h-7 w-7 text-amber-500" />}
            action={
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/app/services/grooming">Browse Grooming Directory</Link>
              </Button>
            }
          />
        ) : (
          <StaggerView className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groomers.slice(0, 3).map((provider) => (
              <StaggerItem key={`groom-${provider.id}`}>
                <ProviderCard
                  id={String(provider.id)}
                  name={provider.name}
                  title={provider.businessName}
                  specialty={provider.description || "Luxury Pet Grooming"}
                  location={provider.address || "Certified Salon"}
                  rating={provider.rating || 0}
                  reviewCount={provider.reviewCount || 0}
                  fee={800}
                  feeLabel="Starting at"
                  nextAvailable="Book Online"
                  availableToday={true}
                  image={provider.profileImageUrl || provider.photo || ""}
                  badges={["Groomer"]}
                  detailsHref={`/app/services/grooming/${provider.id}`}
                  onSelect={() => handleBookGroomer(provider)}
                />
              </StaggerItem>
            ))}
          </StaggerView>
        )}
      </section>

      {/* ─── Featured Behavior & Training ───────────────────────────────────── */}
      <section>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4.5 w-4.5 text-sky-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Behavioral Coaching</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Certified Trainers</h2>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full self-start sm:self-auto">
            <Link href="/app/services/training" className="flex items-center gap-1.5">
              <span>View All Trainers ({trainers.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {trainers.length === 0 ? (
          <EmptyState
            title="Trainers Joining Soon"
            description="Positive reinforcement dog trainers are completing their profiles."
            icon={<Award className="h-7 w-7 text-sky-600" />}
            action={
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link href="/app/services/training">Browse Training Directory</Link>
              </Button>
            }
          />
        ) : (
          <StaggerView className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  detailsHref={`/app/services/training/${provider.id}`}
                  onSelect={() => handleBookTrainer(provider)}
                />
              </StaggerItem>
            ))}
          </StaggerView>
        )}
      </section>

      {/* Booking Modal */}
      {selectedVet && (
        <BookingModal
          open={isBookingOpen}
          onOpenChange={(open) => {
            setIsBookingOpen(open);
            if (!open) setSelectedVet(null);
          }}
          type="veterinary"
          provider={{
            id: String(selectedVet.id),
            name: selectedVet.name,
            title: selectedVet.specialization || "Veterinarian",
            clinicOrBusiness: selectedVet.clinicName || "Veterinary Practice",
            image: selectedVet.profileImageUrl || selectedVet.photo || "",
            feeOrRate: selectedVet.consultationFee ?? 500,
            feeLabel: "Consultation Fee",
            location: selectedVet.clinicAddress || "Clinic",
          }}
          services={[
            {
              id: "general-consultation",
              title: "General Clinical Consultation",
              price: selectedVet.consultationFee ?? 500,
              durationMinutes: 30,
            },
          ]}
          defaultServiceId="general-consultation"
        />
      )}
    </div>
  );
}
