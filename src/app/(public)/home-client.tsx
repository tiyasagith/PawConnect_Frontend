"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { getRoleDashboardPath } from "@/lib/api/auth";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TestimonialCard } from "@/components/shared/testimonial-card";
import { ProviderCard } from "@/components/shared/provider-card";
import { ProductCard } from "@/components/shared/product-card";
import { SafeImage } from "@/components/shared/safe-image";
import { PawSymbol } from "@/components/shared/brand-logo";
import {
  FadeInView,
  StaggerView,
  StaggerItem,
  FloatingElement,
} from "@/lib/animations/motion-components";
import {
  Stethoscope,
  Scissors,
  Award,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Clock,
  Sparkles,
  CheckCircle2,
  PackageCheck,
  FileText,
  ChevronDown,
  MessageSquareHeart,
} from "lucide-react";
import {
  usePublicReviews,
  usePublicVeterinarians,
  usePublicServiceProviders,
  useProducts,
  type BackendPublicVeterinarian,
  type BackendPublicServiceProvider,
  type EnrichedProductItem,
  type ProductItem,
} from "@/lib/api/hooks";

interface HomeClientProps {
  initialVets?: BackendPublicVeterinarian[];
  initialProviders?: BackendPublicServiceProvider[];
  initialProducts?: EnrichedProductItem[];
}

export function HomeClient({
  initialVets,
  initialProviders,
  initialProducts,
}: HomeClientProps = {}) {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  const { primaryRole } = useAuthStore();

  React.useEffect(() => {
    if (initialized && isAuthenticated) {
      router.replace(getRoleDashboardPath(primaryRole));
    }
  }, [initialized, isAuthenticated, primaryRole, router]);
  const { data: realReviews = [] } = usePublicReviews();
  const { data: backendVets = initialVets || [] } = usePublicVeterinarians();
  const { data: backendProviders = initialProviders || [] } = usePublicServiceProviders();
  const { data: backendProducts = initialProducts || [] } = useProducts();

  const [activeFaq, setActiveFaq] = React.useState<number | null>(0);
  const [selectedPetCategory, setSelectedPetCategory] = React.useState<string>("all");

  return (
    <div className="flex flex-col gap-10 pb-12 sm:gap-14 sm:pb-16 md:gap-16 lg:gap-20 lg:pb-20 overflow-x-hidden">
      {/* ─── 1. HERO SECTION (MODERN, WARM & ENGAGING) ─────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-rose-50/25 to-background dark:from-stone-900/60 dark:via-background dark:to-background pt-5 sm:pt-10 md:pt-12 lg:pt-16 pb-8 sm:pb-12 md:pb-16 lg:pb-20 border-b border-border/40">
        {/* Subtle Decorative Ambient Glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 select-none" aria-hidden="true">
          <div
            className="absolute -top-24 -left-24 h-64 w-64 sm:h-96 sm:w-96 md:h-[28rem] md:w-[28rem] rounded-full opacity-40 blur-3xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, var(--primary-soft) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-12 right-[-10%] sm:right-[-5%] h-64 w-64 sm:h-[28rem] sm:w-[28rem] md:h-[32rem] md:w-[32rem] rounded-full opacity-35 blur-3xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, var(--cream) 0%, transparent 70%)",
            }}
          />
          <FloatingElement
            deltaY={6}
            duration={5}
            delay={0.5}
            className="absolute top-1/4 left-[5%] hidden lg:block opacity-25 text-primary"
          >
            <PawSymbol className="h-10 w-10 rotate-[-15deg]" />
          </FloatingElement>
          <FloatingElement
            deltaY={8}
            duration={5.5}
            delay={1.2}
            className="absolute bottom-16 right-[8%] hidden lg:block opacity-25 text-primary"
          >
            <PawSymbol className="h-12 w-12 rotate-[20deg]" />
          </FloatingElement>
        </div>

        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 w-full max-w-full">
          <div className="grid items-center gap-6 sm:gap-10 md:gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Heading, Value Proposition & Actions */}
            <div className="space-y-3.5 sm:space-y-5 md:space-y-6 text-center lg:col-span-7 lg:text-left min-w-0">
              {/* Trust Badge */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-primary/25 bg-background/90 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-primary shadow-xs backdrop-blur-sm max-w-full"
              >
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />
                <span className="text-left leading-tight sm:leading-normal">
                  <span className="xs:inline hidden">India&apos;s Trusted </span>Pet-Care &amp; In-House Supply Network
                </span>
              </motion.div>

              {/* Headings */}
              <div className="space-y-1.5 sm:space-y-2.5">
                <motion.h1
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.18 }}
                  className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.18] sm:leading-[1.12] break-words"
                >
                  Compassionate, certified care for your best friend.
                </motion.h1>

                <motion.p
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.26 }}
                  className="font-decorative text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight"
                >
                  Everything your pet needs, all in one place
                </motion.p>
              </div>

              {/* Value Proposition */}
              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.34 }}
                className="mx-auto max-w-2xl text-xs xs:text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground lg:mx-0 px-1 sm:px-0"
              >
                Connect with verified veterinarians, book stress-free grooming and positive trainers,
                and shop guaranteed genuine pet nutrition and essentials with transparent Indian Rupee (₹) pricing.
              </motion.p>

              {/* Interactive Quick Category Selector */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.38 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 pt-1"
              >
                {[
                  { id: "all", label: "🐾 All Services", href: "/services" },
                  { id: "vets", label: "🩺 Veterinarians", href: "/services/veterinary" },
                  { id: "grooming", label: "✂️ Grooming & Spa", href: "/services/grooming" },
                  { id: "training", label: "🎾 Dog Training", href: "/services/training" },
                  { id: "shop", label: "🛍️ In-House Shop", href: "/shop" },
                ].map((chip) => (
                  <Link
                    key={chip.id}
                    href={chip.href}
                    onClick={() => setSelectedPetCategory(chip.id)}
                    className={`rounded-full px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold transition-all whitespace-normal ${
                      selectedPetCategory === chip.id
                        ? "bg-primary text-primary-foreground shadow-xs scale-105"
                        : "bg-surface text-muted-foreground border border-primary/30 hover:border-primary hover:bg-primary-soft/25 hover:text-foreground"
                    }`}
                  >
                    {chip.label}
                  </Link>
                ))}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.44 }}
                className="flex flex-col gap-2.5 sm:gap-3 pt-2 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start"
              >
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto rounded-full shadow-md px-5 sm:px-7 group/btn text-xs sm:text-sm h-11 sm:h-12"
                >
                  <Link href="/services/veterinary" className="flex items-center justify-center gap-2">
                    <Stethoscope className="h-4 w-4 shrink-0" />
                    <span className="truncate">Find a Veterinarian</span>
                    <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-5 sm:px-7 shadow-xs border-2 border-primary text-foreground hover:bg-primary-soft/30 hover:border-primary transition-all duration-300 text-xs sm:text-sm h-11 sm:h-12"
                >
                  <Link href="/services/grooming" className="flex items-center justify-center gap-2">
                    <Scissors className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">Book Grooming Spa</span>
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-5 sm:px-7 group/shop text-xs sm:text-sm h-11 sm:h-12"
                >
                  <Link href="/shop" className="flex items-center justify-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-primary shrink-0 transition-transform duration-200 group-hover/shop:scale-110" />
                    <span className="truncate">Shop Essentials</span>
                  </Link>
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="grid grid-cols-2 xs:flex xs:flex-wrap items-center justify-center gap-2 xs:gap-3 sm:gap-4 md:gap-5 pt-2 text-[11px] sm:text-xs font-medium text-muted-foreground lg:justify-start"
              >
                <div className="inline-flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>100% Verified Specialists</span>
                </div>
                <div className="inline-flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Direct In-House Stock</span>
                </div>
                <div className="inline-flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Consultations from ₹500</span>
                </div>
                <div className="inline-flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Digital Health Passport</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Hero Visual Showcase with Layered Floating Cards */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.22, ease: [0.215, 0.61, 0.355, 1] }}
              className="relative mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg lg:col-span-5 lg:max-w-none pt-2 sm:pt-0"
            >
              <div className="relative aspect-[4/3] sm:aspect-[4/3] lg:aspect-[4/3.2] max-h-[300px] xs:max-h-[340px] sm:max-h-[380px] lg:max-h-[420px] overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/80 bg-surface shadow-2xl dark:border-border/40">
                <Image
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1000&q=80"
                  alt="Happy, healthy pet companion receiving loving care"
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw"
                  className="object-cover"
                />

                {/* Floating Interactive Badge 1: Real-time Doctor Availability */}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.48, duration: 0.4 }}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                  className="absolute bottom-2.5 left-2.5 sm:bottom-5 sm:left-5 rounded-xl sm:rounded-2xl bg-background/95 p-2 sm:p-3.5 shadow-lg backdrop-blur-md border border-border/70 transition-shadow cursor-default max-w-[55%] sm:max-w-none"
                >
                  <div className="flex items-center gap-1.5 sm:gap-3">
                    <div className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shrink-0">
                      <Clock className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[11px] font-semibold text-muted-foreground truncate">Doctor Availability</p>
                      <p className="text-[11px] sm:text-sm font-bold text-foreground truncate">Real-Time Booking</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Interactive Badge 2: Certified Fear-Free */}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.56, duration: 0.4 }}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                  className="absolute right-2.5 top-2.5 sm:right-5 sm:top-5 rounded-xl sm:rounded-2xl bg-background/95 p-2 sm:p-3.5 shadow-lg backdrop-blur-md border border-border/70 transition-shadow cursor-default"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2.5">
                    <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-md sm:rounded-lg bg-primary-soft text-primary shrink-0">
                      <HeartHandshake className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-bold text-foreground">100% Fear-Free</p>
                      <p className="text-[8px] sm:text-[10px] text-muted-foreground">Certified Protocol</p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Pill: Pricing Transparency */}
                <div className="absolute top-2.5 left-2.5 sm:top-5 sm:left-5 rounded-full bg-primary/95 text-primary-foreground px-2 sm:px-3.5 py-0.5 sm:py-1 text-[9px] sm:text-[11px] font-bold shadow-md backdrop-blur-sm">
                  From ₹500
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 2. PRIMARY CARE MODULES (ATTRACTIVE VISUAL SERVICE CARDS) ───────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInView className="text-center space-y-2 mb-8 sm:mb-10 md:mb-12">
          <Badge variant="primary" className="text-xs px-3 py-1">Care Modules</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            What does your companion need today?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed">
            Select a specialized care discipline or shop directly from our verified in-house temperature-controlled inventory.
          </p>
        </FadeInView>

        <StaggerView className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {/* Card 1: Veterinary Medicine */}
          <StaggerItem>
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[30px] border border-border/80 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl">
              <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-surface shrink-0">
                <SafeImage
                  src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80"
                  fallbackSrc="https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80"
                  alt="Veterinary examination with stethoscope"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" size="sm" className="bg-background/90 backdrop-blur-sm font-semibold shadow-xs">
                    Clinical Care
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 rounded-xl bg-black/60 px-3 py-1.5 text-white backdrop-blur-md border border-white/10 shadow-xs">
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90 block leading-none">From</span>
                  <p className="text-sm sm:text-base font-bold leading-tight">₹500</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 md:p-6 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary shrink-0">
                      <Stethoscope className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      Veterinary Medicine
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground min-h-[2.5rem] line-clamp-2">
                    Physical health checkups, booster vaccines, digital pet passport records, and rapid diagnostics.
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-border/60">
                  <Button
                    asChild
                    size="sm"
                    className="relative w-full overflow-hidden rounded-full font-semibold shadow-xs hover:shadow-lg hover:shadow-rose-300/40 dark:hover:shadow-rose-950/40 hover:ring-2 hover:ring-primary-soft/60 transition-all duration-300 group/btn bg-primary text-white hover:bg-primary-hover active:scale-[0.98]"
                  >
                    <Link
                      href="/services/veterinary"
                      className="relative flex items-center justify-center gap-2 overflow-hidden py-2"
                    >
                      <span
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pink-300/0 via-pink-200/25 to-pink-300/0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"
                        aria-hidden="true"
                      />
                      <span
                        className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-pink-200/80 via-[#FFDADA]/90 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full"
                        aria-hidden="true"
                      />
                      <span className="relative z-10 text-white font-semibold">Find a Clinic</span>
                      <ArrowRight className="relative z-10 h-3.5 w-3.5 text-white transition-transform duration-300 ease-out group-hover/btn:translate-x-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Card 2: Luxury Grooming Spa */}
          <StaggerItem>
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[30px] border border-border/80 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl">
              <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-surface shrink-0">
                <SafeImage
                  src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=600&q=80"
                  alt="Pet grooming spa"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge variant="cream" size="sm" className="font-semibold shadow-xs">
                    Spa &amp; Hygiene
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 rounded-xl bg-black/60 px-3 py-1.5 text-white backdrop-blur-md border border-white/10 shadow-xs">
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90 block leading-none">From</span>
                  <p className="text-sm sm:text-base font-bold leading-tight">₹800</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 md:p-6 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 shrink-0">
                      <Scissors className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      Luxury Grooming Spa
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground min-h-[2.5rem] line-clamp-2">
                    Breed-specific styling, soothing oatmeal baths, de-shedding treatments, and fear-free hygiene.
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-border/60">
                  <Button
                    asChild
                    size="sm"
                    className="relative w-full overflow-hidden rounded-full font-semibold shadow-xs hover:shadow-lg hover:shadow-rose-300/40 dark:hover:shadow-rose-950/40 hover:ring-2 hover:ring-primary-soft/60 transition-all duration-300 group/btn bg-primary text-white hover:bg-primary-hover active:scale-[0.98]"
                  >
                    <Link
                      href="/services/grooming"
                      className="relative flex items-center justify-center gap-2 overflow-hidden py-2"
                    >
                      <span
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pink-300/0 via-pink-200/25 to-pink-300/0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"
                        aria-hidden="true"
                      />
                      <span
                        className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-pink-200/80 via-[#FFDADA]/90 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full"
                        aria-hidden="true"
                      />
                      <span className="relative z-10 text-white font-semibold">Book Grooming</span>
                      <ArrowRight className="relative z-10 h-3.5 w-3.5 text-white transition-transform duration-300 ease-out group-hover/btn:translate-x-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Card 3: Dog Training & Coaching */}
          <StaggerItem>
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[30px] border border-border/80 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl">
              <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-surface shrink-0">
                <SafeImage
                  src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80"
                  alt="Dog training session"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge variant="pending" size="sm" className="font-semibold shadow-xs">
                    Positive Behavior
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 rounded-xl bg-black/60 px-3 py-1.5 text-white backdrop-blur-md border border-white/10 shadow-xs">
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90 block leading-none">From</span>
                  <p className="text-sm sm:text-base font-bold leading-tight">₹1,200</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 md:p-6 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 shrink-0">
                      <Award className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      Positive Coaching
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground min-h-[2.5rem] line-clamp-2">
                    Humane reinforcement methods, puppy socialization, loose-leash training, and reactivity coaching.
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-border/60">
                  <Button
                    asChild
                    size="sm"
                    className="relative w-full overflow-hidden rounded-full font-semibold shadow-xs hover:shadow-lg hover:shadow-rose-300/40 dark:hover:shadow-rose-950/40 hover:ring-2 hover:ring-primary-soft/60 transition-all duration-300 group/btn bg-primary text-white hover:bg-primary-hover active:scale-[0.98]"
                  >
                    <Link
                      href="/services/training"
                      className="relative flex items-center justify-center gap-2 overflow-hidden py-2"
                    >
                      <span
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pink-300/0 via-pink-200/25 to-pink-300/0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"
                        aria-hidden="true"
                      />
                      <span
                        className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-pink-200/80 via-[#FFDADA]/90 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full"
                        aria-hidden="true"
                      />
                      <span className="relative z-10 text-white font-semibold">Meet Trainers</span>
                      <ArrowRight className="relative z-10 h-3.5 w-3.5 text-white transition-transform duration-300 ease-out group-hover/btn:translate-x-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Card 4: In-House Pet Shop */}
          <StaggerItem>
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[30px] border border-border/80 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl">
              <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-surface shrink-0">
                <SafeImage
                  src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80"
                  alt="Pet store essentials"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <Badge variant="default" size="sm" className="bg-primary text-primary-foreground font-semibold shadow-xs">
                    In-House Store
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 rounded-xl bg-black/60 px-3 py-1.5 text-white backdrop-blur-md border border-white/10 shadow-xs">
                  <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90 block leading-none">From</span>
                  <p className="text-sm sm:text-base font-bold leading-tight">₹249</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 md:p-6 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-foreground shrink-0">
                      <ShoppingBag className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      In-House Essentials
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground min-h-[2.5rem] line-clamp-2">
                    100% genuine pet food, veterinary-approved supplements, durable chew toys, and orthopedic bedding.
                  </p>
                </div>

                <div className="mt-auto pt-3 border-t border-border/60">
                  <Button
                    asChild
                    size="sm"
                    className="relative w-full overflow-hidden rounded-full font-semibold shadow-xs hover:shadow-lg hover:shadow-rose-300/40 dark:hover:shadow-rose-950/40 hover:ring-2 hover:ring-primary-soft/60 transition-all duration-300 group/btn bg-primary text-white hover:bg-primary-hover active:scale-[0.98]"
                  >
                    <Link
                      href="/shop"
                      className="relative flex items-center justify-center gap-2 overflow-hidden py-2"
                    >
                      <span
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pink-300/0 via-pink-200/25 to-pink-300/0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"
                        aria-hidden="true"
                      />
                      <span
                        className="pointer-events-none absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-pink-200/80 via-[#FFDADA]/90 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full"
                        aria-hidden="true"
                      />
                      <span className="relative z-10 text-white font-semibold">Shop Essentials</span>
                      <ArrowRight className="relative z-10 h-3.5 w-3.5 text-white transition-transform duration-300 ease-out group-hover/btn:translate-x-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </StaggerItem>
        </StaggerView>
      </section>

      {/* ─── 3. HOW PAWCONNECT WORKS (SEAMLESS 3-STEP JOURNEY) ──────────────── */}
      <section className="bg-surface/60 py-12 sm:py-16 md:py-20 dark:bg-muted/15 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView className="text-center space-y-2.5 sm:space-y-3 mb-8 sm:mb-12">
            <Badge variant="secondary" className="text-xs px-3 py-1">Effortless Care</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              How PawConnect simplifies pet parenting
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm md:text-base">
              A transparent, streamlined experience from your first appointment booking to in-house doorstep delivery.
            </p>
          </FadeInView>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
            <div className="relative rounded-2xl sm:rounded-3xl lg:rounded-[28px] border border-border/70 bg-card p-5 sm:p-7 shadow-xs">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-primary text-primary-foreground font-bold text-base sm:text-lg mb-4 sm:mb-5 shadow-xs">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Choose Your Care Specialty</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Browse licensed veterinary clinics, certified fear-free groomers, positive trainers, or curated nutrition.
              </p>
            </div>

            <div className="relative rounded-2xl sm:rounded-3xl lg:rounded-[28px] border border-border/70 bg-card p-5 sm:p-7 shadow-xs">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500 text-white font-bold text-base sm:text-lg mb-4 sm:mb-5 shadow-xs">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Book with Transparent ₹ Pricing</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Select real-time calendar slots with instant confirmation. Zero phone tag, no hidden consultation add-ons.
              </p>
            </div>

            <div className="relative rounded-2xl sm:rounded-3xl lg:rounded-[28px] border border-border/70 bg-card p-5 sm:p-7 shadow-xs">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-600 text-white font-bold text-base sm:text-lg mb-4 sm:mb-5 shadow-xs">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Unified Digital Pet Passport</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Prescriptions, vaccination reminders, booking statuses, and direct in-house orders remain organized in your account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. FEATURED PET PRODUCTS (DYNAMIC IN-HOUSE CATALOGUE) ──────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInView className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div className="space-y-1.5">
            <Badge variant="primary" className="text-xs px-3 py-1">In-House Quality</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Featured Pet Essentials
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Guaranteed genuine food, supplements, and accessories stored and fulfilled directly by PawConnect.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto rounded-full shrink-0 group/shop self-start sm:self-auto">
            <Link href="/shop" className="flex items-center justify-center gap-1.5">
              <span>Browse Complete Store</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/shop:translate-x-1" />
            </Link>
          </Button>
        </FadeInView>

        {backendProducts.length === 0 ? (
          <div className="rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-dashed border-border/80 bg-surface/40 p-6 sm:p-10 md:p-12 text-center max-w-2xl mx-auto space-y-4">
            <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary shadow-xs">
              <PackageCheck className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-foreground">In-House Inventory Dispatching Soon</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Our temperature-controlled warehouse stock is currently being indexed. Visit the store catalogue to explore categories, healthcare supplies, and upcoming items.
              </p>
            </div>
            <Button asChild size="sm" className="w-full sm:w-auto rounded-full">
              <Link href="/shop">Open Pet Shop</Link>
            </Button>
          </div>
        ) : (
          <StaggerView className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-stretch">
            {backendProducts.slice(0, 4).map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard
                  product={product}
                  href={`/app/shop/products/${product.id}`}
                />
              </StaggerItem>
            ))}
          </StaggerView>
        )}
      </section>

      {/* ─── 5. VERIFIED SPECIALISTS (DYNAMIC VETS & CARE PROVIDERS) ────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInView className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div className="space-y-1.5">
            <Badge variant="primary" className="text-xs px-3 py-1">Verified Practitioners</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
              Certified Care Specialists
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Book consultations and spa sessions with licensed veterinarians and certified trainers.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto rounded-full shrink-0 group/all self-start sm:self-auto">
            <Link href="/services" className="flex items-center justify-center gap-1.5">
              <span>Explore All Practitioners</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/all:translate-x-1" />
            </Link>
          </Button>
        </FadeInView>

        {(() => {
          const displayedSpecialists = [
            ...backendVets.map((vet) => ({ type: "vet" as const, data: vet })),
            ...backendProviders.map((prov) => ({ type: "provider" as const, data: prov })),
          ].slice(0, 4);

          if (displayedSpecialists.length === 0) {
            return (
              <div className="rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-dashed border-border/80 bg-surface/40 p-6 sm:p-10 md:p-12 text-center max-w-2xl mx-auto space-y-4">
                <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary shadow-xs">
                  <Stethoscope className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">Certified Specialists Joining Soon</h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    Veterinary doctors, groomers, and trainers are undergoing verification. Check back shortly or browse services to see category availability.
                  </p>
                </div>
                <Button asChild size="sm" className="w-full sm:w-auto rounded-full">
                  <Link href="/services">Browse Care Services</Link>
                </Button>
              </div>
            );
          }

          const gridColsClass =
            displayedSpecialists.length === 1
              ? "grid gap-5 sm:gap-6 max-w-md mx-auto items-stretch"
              : displayedSpecialists.length === 2
              ? "grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto items-stretch"
              : displayedSpecialists.length === 3
              ? "grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto items-stretch"
              : "grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 items-stretch";

          return (
            <StaggerView className={gridColsClass}>
              {displayedSpecialists.map((item) => {
                if (item.type === "vet") {
                  const vet = item.data;
                  return (
                    <StaggerItem key={`vet-${vet.id}`}>
                      <ProviderCard
                        id={String(vet.id)}
                        name={vet.name}
                        title={vet.specialization || "Licensed Veterinarian"}
                        specialty={
                          vet.qualification ||
                          (vet.experienceYears ? `${vet.experienceYears}y clinical practice` : "Veterinary Medicine")
                        }
                        location={vet.clinicName || vet.clinicAddress || "Veterinary Practice"}
                        rating={vet.rating || 0}
                        reviewCount={vet.reviewCount || 0}
                        fee={vet.consultationFee || 500}
                        feeLabel="Consultation"
                        nextAvailable={vet.isAvailableToday ? "Available Today" : "Book Online"}
                        availableToday={vet.isAvailableToday ?? false}
                        image={vet.profileImageUrl || vet.photo || vet.profileImage || ""}
                        badges={[
                          ...(vet.specialization ? [vet.specialization.split(",")[0].trim()] : ["Veterinarian"]),
                          ...(vet.experienceYears ? [`${vet.experienceYears}y exp`] : ["Licensed"]),
                        ]}
                        bio={vet.bio}
                        detailsHref={`/app/services/veterinary/${vet.id}`}
                      />
                    </StaggerItem>
                  );
                } else {
                  const provider = item.data;
                  return (
                    <StaggerItem key={`prov-${provider.id}`}>
                      <ProviderCard
                        id={String(provider.id)}
                        name={provider.name}
                        title={
                          provider.businessName ||
                          (provider.providerType === "GROOMER" ? "Grooming & Spa" : "Canine Coaching")
                        }
                        specialty={
                          provider.description ||
                          (provider.providerType === "GROOMER"
                            ? "Luxury Grooming Spa"
                            : "Positive Behavior Coaching")
                        }
                        location={provider.address || "Certified Facility"}
                        rating={provider.rating || 0}
                        reviewCount={provider.reviewCount || 0}
                        fee={provider.providerType === "GROOMER" ? 800 : 1200}
                        feeLabel="Starting at"
                        nextAvailable="Book Online"
                        availableToday={true}
                        image={provider.profileImageUrl || provider.photo || provider.profileImage || ""}
                        badges={[provider.providerType === "GROOMER" ? "Groomer" : "Trainer"]}
                        detailsHref={
                          provider.providerType === "GROOMER"
                            ? `/app/services/grooming/${provider.id}`
                            : `/app/services/training/${provider.id}`
                        }
                      />
                    </StaggerItem>
                  );
                }
              })}
            </StaggerView>
          );
        })()}
      </section>

      {/* ─── 6. TRUST PILLARS (WHY PET PARENTS CHOOSE PAWCONNECT) ────────────── */}
      <section className="bg-surface/50 py-12 sm:py-16 md:py-20 dark:bg-muted/15 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView className="text-center space-y-2.5 sm:space-y-3 mb-10 sm:mb-14">
            <Badge variant="secondary" className="text-xs">Peace Of Mind</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Why pet owners trust PawConnect
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm md:text-base">
              A modern pet-care ecosystem built with transparency, clinical safety, and genuine care at its core.
            </p>
          </FadeInView>

          <StaggerView className="grid gap-5 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <div className="h-full rounded-2xl sm:rounded-3xl lg:rounded-[28px] border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all duration-300 hover:shadow-card hover:-translate-y-1">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 mb-4 sm:mb-5">
                  <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">Strict Clinical Vetting</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Every doctor, clinic, and groomer completes identity verification, medical licensing review, and safety checks.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full rounded-2xl sm:rounded-3xl lg:rounded-[28px] border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all duration-300 hover:shadow-card hover:-translate-y-1">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-primary-soft text-primary mb-4 sm:mb-5">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">Digital Pet Passport</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Preserve vaccinations, prescription logs, dietary preferences, and appointment records in one unified place.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full rounded-2xl sm:rounded-3xl lg:rounded-[28px] border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all duration-300 hover:shadow-card hover:-translate-y-1">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 mb-4 sm:mb-5">
                  <PackageCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">Zero Counterfeit Stock</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  No unauthorized third-party dropshippers. All products are verified, stored, and fulfilled directly by PawConnect.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full rounded-2xl sm:rounded-3xl lg:rounded-[28px] border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all duration-300 hover:shadow-card hover:-translate-y-1">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 mb-4 sm:mb-5">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">Instant Slot Booking</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Transparent pricing in Indian Rupees (₹) with real-time specialist calendars, instant confirmations, and zero phone tag.
                </p>
              </div>
            </StaggerItem>
          </StaggerView>
        </div>
      </section>

      {/* ─── 7. AUTHENTIC REVIEWS & TESTIMONIALS (DYNAMIC ONLY) ──────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInView className="text-center space-y-2.5 sm:space-y-3 mb-8 sm:mb-12">
          <Badge variant="primary" className="text-xs">Client Feedback</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Verified Pet Parent Reviews
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm md:text-base">
            Honest feedback from pet owners who completed veterinary visits, grooming sessions, and coaching programs.
          </p>
        </FadeInView>

        {realReviews.length === 0 ? (
          <div className="rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-dashed border-border/80 bg-surface/40 p-6 sm:p-10 md:p-12 text-center max-w-2xl mx-auto space-y-4">
            <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary shadow-xs">
              <MessageSquareHeart className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-foreground">Be the First to Review</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Authentic reviews from verified pet parents appear here once appointments, grooming sessions, and product orders are completed.
              </p>
            </div>
            <Button asChild size="sm" variant="secondary" className="w-full sm:w-auto rounded-full">
              <Link href="/services">Book a Service</Link>
            </Button>
          </div>
        ) : (
          <StaggerView className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {realReviews.slice(0, 4).map((rev) => (
              <StaggerItem key={rev.id}>
                <TestimonialCard
                  testimonial={{
                    id: String(rev.id),
                    author: rev.reviewerName,
                    petName: rev.targetTitle || "Companion Pet",
                    petBreed: "Verified Client",
                    quote: rev.reviewText,
                    rating: rev.rating,
                    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
                    serviceType: rev.targetType ? rev.targetType.replace("_", " ") : "Pet Care",
                  }}
                />
              </StaggerItem>
            ))}
          </StaggerView>
        )}
      </section>

      {/* ─── 8. FREQUENTLY ASKED QUESTIONS (ACCORDION FAQ) ───────────────────── */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <FadeInView className="text-center space-y-2.5 sm:space-y-3 mb-8 sm:mb-12">
          <Badge variant="secondary" className="text-xs">Got Questions?</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
            Clear answers about specialist verification, transparent pricing in ₹, and in-house fulfillment.
          </p>
        </FadeInView>

        <div className="space-y-3">
          {[
            {
              q: "How are veterinarians and groomers verified on PawConnect?",
              a: "Every doctor and care professional must provide verified medical credentials, state veterinary council registration, facility safety audits, and agree to our Fear-Free animal handling code of conduct before their calendar is enabled.",
            },
            {
              q: "Who fulfills and ships pet products ordered from the shop?",
              a: "All pet food, treats, toys, and healthcare supplies are directly stocked, quality-checked, and dispatched from PawConnect's temperature-controlled fulfillment centers. We do not host unvetted third-party dropshippers.",
            },
            {
              q: "How do appointment bookings and payments work?",
              a: "You select a verified doctor or salon, choose an available date and slot, and complete payment securely in Indian Rupees (₹). You receive an instant booking confirmation code and automated visit reminder.",
            },
            {
              q: "What should I do in a pet medical emergency?",
              a: "For acute emergencies, visit our Veterinary portal to locate 24/7 emergency clinics nearby or call our emergency triage helpline. Doctor slots marked 'Available Today' provide immediate appointments.",
            },
            {
              q: "What is your return policy for pet shop items?",
              a: "We offer an unconditional 30-day money-back guarantee on unopened pet food, accessories, and toys. If your pet is not satisfied, our support team will replace or refund promptly.",
            },
          ].map((item, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="overflow-hidden rounded-xl sm:rounded-2xl border border-border/80 bg-card transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-4 sm:p-5 text-left font-bold text-foreground text-sm sm:text-base"
                >
                  <span className="pr-2">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm leading-relaxed text-muted-foreground border-t border-border/40 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 9. CALL TO ACTION BANNER (VIBRANT GRADIENT CARD) ─────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeInView className="relative overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[36px] bg-gradient-to-r from-primary via-primary/95 to-amber-600/90 p-6 sm:p-10 md:p-12 lg:p-14 text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
            <p className="font-decorative text-2xl sm:text-3xl md:text-4xl font-bold text-cream">
              Give your pet the royal treatment
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Ready to book your first consultation or order healthy meals?
            </h2>
            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-white/90">
              Join thousands of pet owners who enjoy stress-free appointments,
              verified local clinics, and premium in-house nutrition delivered to their door.
            </p>

            <div className="flex flex-col gap-2.5 sm:gap-3 pt-3 sm:pt-4 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto rounded-full bg-white text-foreground hover:bg-white/90 px-6 sm:px-7 shadow-md font-semibold text-center">
                <Link href="/services">Find Local Services</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full border-white/50 text-white hover:bg-white/10 px-6 sm:px-7 font-semibold text-center">
                <Link href="/shop">Explore In-House Shop</Link>
              </Button>
            </div>
          </div>

          <FloatingElement
            deltaY={6}
            duration={5}
            className="pointer-events-none absolute -bottom-6 -right-6 hidden sm:block text-white/15"
          >
            <PawSymbol className="h-44 w-44 md:h-56 md:w-56 lg:h-64 lg:w-64 rotate-[15deg]" />
          </FloatingElement>
        </FadeInView>
      </section>
    </div>
  );
}
