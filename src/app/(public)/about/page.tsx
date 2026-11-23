import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FadeInView,
  StaggerView,
  StaggerItem,
} from "@/lib/animations/motion-components";
import {
  PawPrint,
  Heart,
  ShieldCheck,
  Stethoscope,
  Scissors,
  Award,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About PawConnect - Our Mission & Pet Care Philosophy",
  description:
    "Learn why we built PawConnect: unifying veterinary medical care, certified grooming, humane dog training, and guaranteed in-house pet essentials.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-12 py-6 sm:gap-20 sm:py-10 md:gap-24 md:py-12 lg:gap-28 lg:py-16 overflow-hidden">
      {/* ─── 1. About Hero ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 w-full">
        <div className="grid items-center gap-8 sm:gap-10 md:gap-12 lg:grid-cols-12 lg:gap-8">
          <FadeInView
            aboveTheFold
            direction="left"
            distance={24}
            className="space-y-4 sm:space-y-6 text-center lg:col-span-7 lg:text-left min-w-0"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/40 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <PawPrint className="h-3.5 w-3.5" />
              <span>Our Story & Mission</span>
            </div>

            <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.18] sm:leading-[1.1] break-words">
              Redefining how we care for our four-legged family
            </h1>

            <p className="font-decorative text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight">
              Because pets deserve unified, trusted care
            </p>

            <p className="text-xs xs:text-sm sm:text-base md:text-lg leading-relaxed text-muted-foreground px-1 sm:px-0">
              PawConnect was born out of a simple frustration: why are veterinary records,
              grooming appointments, dog training sessions, and pet food scattered across
              disconnected apps, unverified online directories, and paper binders?
            </p>

            <p className="text-xs xs:text-sm sm:text-base leading-relaxed text-muted-foreground px-1 sm:px-0">
              We built PawConnect as one integrated pet-care ecosystem where every specialist
              is licensed, every product is stored in-house with zero counterfeit risk, and every
              milestone of your companion’s health is preserved in one place.
            </p>

            <div className="flex flex-col gap-2.5 sm:gap-3 pt-2 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-6 sm:px-7 shadow-md">
                <Link href="/services">Discover Our Services</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-6 sm:px-7">
                <Link href="/shop">Explore In-House Shop</Link>
              </Button>
            </div>
          </FadeInView>

          <FadeInView
            direction="right"
            distance={24}
            delay={0.15}
            className="relative mx-auto w-full max-w-xs sm:max-w-md lg:col-span-5 lg:max-w-none pt-2 sm:pt-0"
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[40px] border-2 sm:border-4 border-white bg-primary-soft/40 shadow-2xl transition-transform duration-500 hover:scale-[1.02] dark:border-card">
              <Image
                src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80"
                alt="Veterinarian hugging a healthy golden retriever"
                fill
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                className="object-cover"
              />
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ─── 2. Core Pillars ────────────────────────────────────────────────── */}
      <section className="bg-surface/50 py-10 sm:py-14 md:py-16 dark:bg-muted/20">
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
          <FadeInView className="text-center space-y-2.5 sm:space-y-3 mb-8 sm:mb-12 md:mb-14">
            <Badge variant="cream" className="text-xs">The PawConnect Standards</Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Built on 4 uncompromised principles
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-xs sm:text-sm md:text-base">
              Every feature and partnership on our platform exists to protect animal wellbeing.
            </p>
          </FadeInView>

          <StaggerView className="grid gap-5 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <div className="h-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/70 bg-white p-5 sm:p-7 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:will-change-transform motion-reduce:transition-none dark:bg-card">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-primary-soft text-primary mb-4 sm:mb-5">
                  <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">Rigorous Specialist Vetting</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  We independently verify clinical licenses, malpractice standing, facility sanitation, and customer reviews before approval.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/70 bg-white p-5 sm:p-7 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:will-change-transform motion-reduce:transition-none dark:bg-card">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-cream text-amber-900 mb-4 sm:mb-5">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">100% Fear-Free Handling</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Our groomers and trainers prioritize positive reinforcement and calm body language to keep pet anxiety at zero.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/70 bg-white p-5 sm:p-7 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:will-change-transform motion-reduce:transition-none dark:bg-card">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 mb-4 sm:mb-5">
                  <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">Strict In-House Inventory</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  No third-party marketplace or unauthorized drop-shippers. Every product is stored in temperature-controlled PawConnect facilities.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="h-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/70 bg-white p-5 sm:p-7 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:will-change-transform motion-reduce:transition-none dark:bg-card">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-soft text-sky-800 dark:bg-blue-950 dark:text-blue-300 mb-4 sm:mb-5">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">Unified Health Profiles</h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Your veterinarian, groomer, and trainer can coordinate care with one centralized digital pet record.
                </p>
              </div>
            </StaggerItem>
          </StaggerView>
        </div>
      </section>

      {/* ─── 3. The 4 Service Domains ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        <FadeInView className="text-center space-y-2.5 sm:space-y-3 mb-8 sm:mb-12">
          <Badge variant="secondary" className="text-xs">Holistic Ecosystem</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Everything your pet needs in one journey
          </h2>
        </FadeInView>

        <StaggerView className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <div className="h-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/70 bg-white p-5 sm:p-6 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:will-change-transform motion-reduce:transition-none dark:bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-4">
                <Stethoscope className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Veterinary Care</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Diagnostic imaging, dental care, annual boosters, surgery, and 24/7 urgent care access.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="h-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/70 bg-white p-5 sm:p-6 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:will-change-transform motion-reduce:transition-none dark:bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-amber-950 mb-4">
                <Scissors className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Grooming & Spas</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Breed-specific haircuts, organic oatmeal treatments, paw balm conditioning, and gentle de-shedding.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="h-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/70 bg-white p-5 sm:p-6 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:will-change-transform motion-reduce:transition-none dark:bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400 text-sky-950 mb-4">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Canine Coaching</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Certified positive trainers for puppy manners, leash reactivity reset, and agility enrichment.
              </p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="h-full rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/70 bg-white p-5 sm:p-6 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg hover:will-change-transform motion-reduce:transition-none dark:bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background mb-4">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">In-House Essentials</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Nutrient-dense kibble, freeze-dried treats, non-toxic toys, and memory foam orthopedic beds.
              </p>
            </div>
          </StaggerItem>
        </StaggerView>
      </section>

      {/* ─── 4. About CTA ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
        <FadeInView className="rounded-2xl sm:rounded-3xl lg:rounded-[40px] bg-primary-soft/40 border border-primary/20 p-6 sm:p-10 md:p-14 text-center space-y-3 sm:space-y-4">
          <p className="font-decorative text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
            Join the PawConnect community
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
            Give your companion the thoughtful care they deserve
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
            Browse our directory of verified specialists or discover delicious, healthy meals in our shop.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto rounded-full px-6 sm:px-7">
              <Link href="/services">Explore Care Services</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-6 sm:px-7">
              <Link href="/contact">Get In Touch</Link>
            </Button>
          </div>
        </FadeInView>
      </section>
    </div>
  );
}

