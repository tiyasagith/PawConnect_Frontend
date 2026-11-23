"use client";

import React, { useState, useMemo } from "react";
import {
  useProviderServices,
  useCreateProviderService,
  useUpdateProviderService,
  useToggleProviderServiceActive,
  useDeleteProviderService,
} from "@/lib/api/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ServiceFormModal } from "@/components/professional/service-form-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils/money";
import { toast } from "@/lib/utils/toast";
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { ProviderService } from "@/lib/mock/professionals";
import type { ServiceFormData } from "@/components/professional/service-form-modal";

export function ProviderServicesClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ProviderService | null>(null);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [togglingServiceId, setTogglingServiceId] = useState<string | null>(null);

  const { data: services = [], isLoading, isError, error, refetch } = useProviderServices();
  const { mutateAsync: createService, isPending: isCreating } = useCreateProviderService();
  const { mutateAsync: updateService, isPending: isUpdating } = useUpdateProviderService();
  const { mutateAsync: toggleActive } = useToggleProviderServiceActive();
  const { mutateAsync: deleteService, isPending: isDeleting } = useDeleteProviderService();

  const filteredServices = useMemo(() => {
    let result = [...services];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [services, searchQuery]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: ProviderService) => {
    setEditingService(srv);
    setIsModalOpen(true);
  };

  const handleSaveService = async (formData: ServiceFormData) => {
    try {
      if (editingService) {
        await updateService({
          id: editingService.id,
          input: formData,
        });
        toast.success("Service Updated", {
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        await createService(formData);
        toast.success("Service Created", {
          description: `${formData.name} added to your offering catalog.`,
        });
      }
      setIsModalOpen(false);
      setEditingService(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not save service changes. Please retry.";
      toast.error("Operation Failed", {
        description: msg,
      });
      throw err;
    }
  };

  const handleToggleActive = async (id: string, name: string, current: boolean) => {
    try {
      setTogglingServiceId(id);
      await toggleActive(id);
      toast.success(current ? "Service Deactivated" : "Service Activated", {
        description: `${name} is now ${current ? "inactive" : "active"} for client booking.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not toggle service status.";
      toast.error("Status Change Failed", {
        description: msg,
      });
    } finally {
      setTogglingServiceId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingServiceId) return;
    try {
      await deleteService(deletingServiceId);
      toast.success("Service Removed", {
        description: "Service has been removed or archived from your catalog.",
      });
      setDeletingServiceId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not remove service.";
      toast.error("Delete Failed", {
        description: msg,
      });
    }
  };

  const isRowActionDisabled = isCreating || isUpdating || isDeleting;

  const columns: Column<ProviderService>[] = [
    {
      key: "name",
      header: "Service Package",
      cell: (row) => (
        <div className="max-w-md">
          <span className="font-bold text-xs text-foreground block">{row.name}</span>
          <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed mt-0.5">
            {row.description || "No description provided."}
          </p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (row) => (
        <span className="text-xs font-bold text-foreground">
          {formatMoney(row.price)}
        </span>
      ),
    },
    {
      key: "durationMinutes",
      header: "Duration",
      cell: (row) => (
        <span className="text-xs text-muted-foreground font-medium">
          {row.durationMinutes} mins
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge
          status={row.active ? "active" : "inactive"}
          size="sm"
        />
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => {
        const isToggling = togglingServiceId === row.id;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              disabled={isRowActionDisabled || isToggling}
              onClick={() => handleToggleActive(row.id, row.name, row.active)}
              title={row.active ? "Deactivate service" : "Activate service"}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
            >
              {isToggling ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Power className={`h-4 w-4 ${row.active ? "text-emerald-600" : "text-muted-foreground"}`} />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={isRowActionDisabled}
              onClick={() => handleOpenEdit(row)}
              title="Edit service details"
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              disabled={isRowActionDisabled}
              onClick={() => setDeletingServiceId(row.id)}
              title="Delete service"
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      <PageHeader
        title="Service Packages & Offerings"
        description="Create and manage your grooming treatments, behavioral coaching workshops, and pricing tiers."
      >
        <Button
          onClick={handleOpenCreate}
          disabled={isRowActionDisabled}
          className="rounded-xl text-xs font-semibold gap-1.5 h-9"
        >
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search service name or description..."
          />
        </div>
      </div>

      {/* Services Table */}
      {isLoading ? (
        <LoadingState variant="cards" count={6} columns={3} />
      ) : isError ? (
        <ErrorState
          title="Could not load services"
          description={
            error instanceof Error
              ? error.message
              : "Encountered an issue retrieving your service packages. Please retry."
          }
          action={
            <Button onClick={() => refetch()} variant="outline" className="rounded-xl">
              Retry
            </Button>
          }
        />
      ) : (
        <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <DataTable
            columns={columns}
            data={filteredServices}
            emptyTitle={
              services.length === 0
                ? "You have not added any services yet."
                : "No matching services found"
            }
            emptyDescription={
              services.length === 0
                ? "Create your first service package to begin accepting client bookings."
                : searchQuery
                ? `No service offerings match "${searchQuery}".`
                : "No matching service packages found."
            }
            emptyAction={
              <Button onClick={handleOpenCreate} size="sm" className="rounded-xl text-xs mt-2">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Service
              </Button>
            }
            emptyIcon={<Sparkles className="h-8 w-8 text-muted-foreground" />}
          />
        </div>
      )}

      {/* Add / Edit Service Modal */}
      <ServiceFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        service={editingService}
        onSubmit={handleSaveService}
        loading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingServiceId)}
        onOpenChange={(op) => !op && setDeletingServiceId(null)}
        title="Delete this service package?"
        description="Are you sure you want to remove this service from your catalog? Historical bookings will preserve their recorded data."
        confirmLabel="Yes, Delete Service"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
