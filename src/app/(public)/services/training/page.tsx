import type { Metadata } from "next";
import { TrainingClient } from "./training-client";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Dog Training & Behavior Specialists - PawConnect",
  description:
    "Explore positive reinforcement puppy training, behavioral consultation, and agility coaching from certified CPDT-KA trainers.",
};

export default function TrainingPage() {
  return (
    <div className="py-6 sm:py-10 md:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 md:space-y-10">
        {/* Page Header */}
        <div className="text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto px-1 sm:px-0">
          <Badge variant="secondary" className="text-xs">
            Positive Dog Training
          </Badge>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Certified Canine Coaching
          </h1>
          <p className="font-decorative text-xl xs:text-2xl sm:text-3xl font-bold text-sky-600 leading-tight">
            Humane, science-backed learning that works
          </p>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground leading-relaxed">
            From basic puppy socialization to complex reactivity rehabilitation,
            our certified trainers build lasting harmony between you and your pet.
          </p>
        </div>

        {/* Interactive Client Discovery */}
        <TrainingClient />
      </div>
    </div>
  );
}
