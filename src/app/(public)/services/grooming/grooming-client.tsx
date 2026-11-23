"use client";

import * as React from "react";
import { ProviderCard } from "@/components/shared/provider-card";
import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingState, ErrorState } from "@/components/shared/states";
import { useAuthModal } from "@/stores/auth-modal.store";
import { StaggerView, StaggerItem } from "@/lib/animations/motion-components";
import { toast } from "@/lib/utils/toast";
import { usePublicServiceProviders, type BackendPublicServiceProvider } from "@/lib/api/hooks";
import { RefreshIndicator } from "@/components/ui/paw-spinner";

interface GroomingClientProps {
  providers?: BackendPublicServiceProvider[];
}

export function GroomingClient({ providers: initialProviders }: GroomingClientProps = {}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [availableTodayOnly, setAvailableTodayOnly] = React.useState(false);
  const { openLogin } = useAuthModal();

  const { data: providers = initialProviders || [], isLoading, isFetching, isError, refetch } = usePublicServiceProviders({
    search: searchQuery.trim() || undefined,
    providerType: "GROOMER",
  });

  const filteredProviders = providers;

  const handleBookProvider = (provider: BackendPublicServiceProvider) => {
    toast.info("Sign in required", {
      description: `Please sign in to book a grooming slot with ${provider.businessName}.`,
    });
    openLogin();
  };

  return (
    <div className="space-y-8 sm:space-y-10 md:space-y-12">

      {/* ─── Grooming Salons & Mobile Specialists ────────────────────────────── */}
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4 border-b border-border pb-3 sm:pb-4">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-600">Certified Stylists</span>
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground">Verified Grooming Salons</h2>
            </div>
            <RefreshIndicator isRefreshing={isFetching && !isLoading} label="Refreshing..." />
          </div>
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            Fear-free certified & stress-free private suites
          </p>
        </div>

        {/* Filter controls */}
        <div className="rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/70 bg-white p-3.5 sm:p-5 shadow-sm dark:bg-card">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search salons, stylists, or special cuts..."
                className="w-full text-xs sm:text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:col-span-4 md:justify-end">
              <button
                onClick={() => setAvailableTodayOnly(!availableTodayOnly)}
                className={`rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold transition-[background-color,border-color,color] duration-150 motion-reduce:transition-none border ${
                  availableTodayOnly
                    ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-surface text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                ● Available Today
              </button>

              {(searchQuery || availableTodayOnly) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setAvailableTodayOnly(false);
                  }}
                  className="text-xs text-muted-foreground"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Providers Grid */}
        {isLoading ? (
          <div className="py-6">
            <LoadingState variant="provider-cards" count={6} />
          </div>
        ) : isError ? (
          <div className="py-12">
            <ErrorState
              title="Could not load salons"
              description="Failed to load grooming partner records."
              action={
                <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
                  Retry
                </Button>
              }
            />
          </div>
        ) : filteredProviders.length === 0 ? (
          <EmptyState
            title="No grooming salons available yet"
            description="Try adjusting your keywords or check back soon as certified grooming partners join our network."
            action={
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setAvailableTodayOnly(false);
                }}
                className="w-full sm:w-auto rounded-full shadow-sm"
              >
                Reset Search
              </Button>
            }
          />
        ) : (
          <StaggerView key={availableTodayOnly ? "available" : "all"} className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProviders.map((provider) => (
              <StaggerItem key={provider.id}>
                <ProviderCard
                  id={String(provider.id)}
                  name={provider.name}
                  title={provider.businessName}
                  specialty="Grooming & Spa Care"
                  location={provider.address || "PawConnect Care Center"}
                  rating={provider.rating ?? 0}
                  reviewCount={provider.reviewCount ?? 0}
                  fee={0}
                  feeLabel="Rates"
                  nextAvailable="Schedule appointment"
                  availableToday={false}
                  image={provider.profileImageUrl || ""}
                  badges={provider.experienceYears ? [`${provider.experienceYears} Years Experience`] : []}
                  detailsHref={`/app/services/grooming/${provider.id}`}
                  onSelect={() => handleBookProvider(provider)}
                />
              </StaggerItem>
            ))}
          </StaggerView>
        )}
      </div>
    </div>
  );
}
