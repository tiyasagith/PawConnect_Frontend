import { Badge } from "@/components/ui/badge";
import { CardGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div
      className="py-6 sm:py-10 md:py-12 lg:py-16 animate-in fade-in duration-200"
      role="status"
      aria-label="Loading pet shop catalog"
      aria-busy="true"
    >
      <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 md:space-y-10">
        {/* Page Header matching shop/page.tsx */}
        <div className="text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto px-1 sm:px-0">
          <Badge variant="cream" className="text-xs">
            PawConnect In-House Supply
          </Badge>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            The Pet Essentials Shop
          </h1>
          <p className="font-decorative text-xl xs:text-2xl sm:text-3xl font-bold text-primary leading-tight">
            Nutritious, durable, and veterinarian-approved
          </p>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground leading-relaxed">
            Every product in our store is directly stocked, tested, and shipped by PawConnect.
            No unverified third-party sellers, no counterfeit items—only the highest standard for your companion.
          </p>
        </div>

        {/* Filter Bar Skeleton matching ShopClient */}
        <div className="rounded-2xl sm:rounded-3xl lg:rounded-[32px] border border-border/70 bg-card p-4 sm:p-5 md:p-6 shadow-xs">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <Skeleton className="h-10 sm:h-11 w-full rounded-2xl" />
            </div>
            <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-2">
              <Skeleton className="h-9 sm:h-10 w-24 sm:w-28 rounded-full" />
              <Skeleton className="h-9 sm:h-10 w-24 sm:w-28 rounded-full" />
            </div>
          </div>
        </div>

        {/* Card Grid Skeleton matching 4-column product grid */}
        <CardGridSkeleton count={8} columns={4} />
      </div>
      <span className="sr-only">Loading products...</span>
    </div>
  );
}
