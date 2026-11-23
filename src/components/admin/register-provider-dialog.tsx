"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/image-upload";
import {
  useCreateAdminServiceProvider,
  useUpdateAdminServiceProvider,
  type AdminRegisterProviderInput,
} from "@/lib/api/hooks";
import { toast } from "@/lib/utils/toast";
import { Sparkles, Loader2, AlertCircle, MapPin, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LocationPickerModal } from "@/components/shared/location";
import type { ServiceProviderProfile } from "@/lib/mock/professionals";

interface RegisterProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider?: ServiceProviderProfile | null;
}

export function RegisterProviderDialog({ open, onOpenChange, provider }: RegisterProviderDialogProps) {
  const { mutateAsync: registerProvider, isPending: isRegistering } = useCreateAdminServiceProvider();
  const { mutateAsync: updateProvider, isPending: isUpdating } = useUpdateAdminServiceProvider();
  const isPending = isRegistering || isUpdating;
  const isEdit = Boolean(provider);

  const [error, setError] = useState<string | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    photo: "",
    providerType: "GROOMER" as "GROOMER" | "TRAINER",
    businessName: "",
    businessPhone: "",
    description: "",
    address: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    experienceYears: 4,
  });

  useEffect(() => {
    if (!open) {
      setError(null);
      return;
    }

    if (provider) {
      const nameParts = (provider.name || "").trim().split(/\s+/);
      const firstName = provider.firstName || nameParts[0] || "";
      const lastName = provider.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
      const provType: "GROOMER" | "TRAINER" =
        (provider.providerType || "").toUpperCase() === "TRAINING" || (provider.providerType || "").toUpperCase() === "TRAINER"
          ? "TRAINER"
          : "GROOMER";

      setForm({
        firstName,
        lastName,
        email: provider.email || "",
        phone: provider.phone || "",
        password: "",
        photo: provider.photo || "",
        providerType: provType,
        businessName: provider.businessName || "",
        businessPhone: provider.businessPhone || provider.phone || "",
        description: provider.bio || (provider.specializations && provider.specializations.join(", ")) || "",
        address: provider.location || "",
        latitude: provider.latitude,
        longitude: provider.longitude,
        experienceYears: provider.experienceYears ?? 4,
      });
    } else {
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        photo: "",
        providerType: "GROOMER",
        businessName: "",
        businessPhone: "",
        description: "",
        address: "",
        latitude: undefined,
        longitude: undefined,
        experienceYears: 4,
      });
    }
    setError(null);
  }, [open, provider]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "experienceYears" ? Number(value) : value,
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("A valid email address is required.");
      return;
    }
    if (!form.businessName.trim()) {
      setError("Business or studio display name is required.");
      return;
    }
    if (!form.businessPhone.trim()) {
      setError("Business contact phone number is required.");
      return;
    }

    try {
      const payload: AdminRegisterProviderInput = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim().replace(/[\s-()]/g, '') || undefined,
        password: form.password.trim() || undefined,
        providerType: form.providerType,
        businessName: form.businessName.trim(),
        description: form.description.trim() || undefined,
        businessPhone: form.businessPhone.trim().replace(/[\s-()]/g, ''),
        address: form.address.trim() || undefined,
        latitude: form.latitude,
        longitude: form.longitude,
        experienceYears: Number(form.experienceYears) || 0,
        profileImage: form.photo.trim() || undefined,
        isActive: provider?.isActive ?? true,
      };

      if (isEdit && provider) {
        await updateProvider({ id: provider.id, input: payload });
        toast.success("Service Provider Updated", {
          description: `${form.businessName} (${form.providerType}) details have been updated.`,
        });
      } else {
        await registerProvider(payload);
        toast.success("Service Provider Registered", {
          description: `${form.businessName} (${form.providerType}) has been registered with SERVICE_PROVIDER credentials.`,
        });
      }

      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isEdit ? "Failed to update service provider" : "Failed to register service provider";
      setError(msg);
      toast.error(isEdit ? "Update Failed" : "Registration Failed", { description: msg });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="wide">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {isEdit ? "Edit Partner Governance" : "Partner Governance"}
            </span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            {isEdit ? "Edit Service Provider Profile" : "Register Service Provider"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update service contractor profile, discipline, specialties, and facility location."
              : "Authorize and onboard dedicated groomers and trainers with SERVICE_PROVIDER credentials."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogBody className="space-y-6">
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 text-xs text-destructive bg-destructive/10 rounded-2xl border border-destructive/20 animate-in fade-in duration-150">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Section 1: Contractor User Profile */}
            <div className="rounded-2xl border border-border/60 bg-surface/30 p-5 space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-border/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  1. Contractor Personal Details
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="e.g. Liam"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    className="h-10.5 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="e.g. Vance"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className="h-10.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="e.g. liam@tailwagstudio.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="h-10.5 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold">Personal Mobile</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="e.g. +1 (555) 392-1084"
                    value={form.phone}
                    onChange={handleChange}
                    className="h-10.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold">
                  {isEdit ? "Reset Password (Optional, leave blank to keep unchanged)" : "Temporary Password (Optional)"}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={isEdit ? "Leave blank to keep current password" : "Leave blank to auto-generate temporary credentials"}
                  value={form.password}
                  onChange={handleChange}
                  className="h-10.5 rounded-xl text-sm"
                />
              </div>

              <div className="pt-1">
                <ImageUpload
                  label="Provider Profile / Studio Avatar"
                  folder="providers"
                  value={form.photo}
                  onChange={(url) => {
                    setForm((prev) => ({ ...prev, photo: url }));
                    if (error) setError(null);
                  }}
                  helperText="Upload a studio logo or professional headshot (stored in public/uploads/providers)."
                />
              </div>
            </div>

            {/* Section 2: Service Discipline & Business Setup */}
            <div className="rounded-2xl border border-border/60 bg-surface/30 p-5 space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-border/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  2. Business & Service Category
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="providerType" className="text-xs font-semibold">Discipline / Provider Type *</Label>
                  <Select
                    value={form.providerType}
                    disabled={isEdit}
                    onValueChange={(val: "GROOMER" | "TRAINER") => {
                      setForm((prev) => ({ ...prev, providerType: val }));
                      if (error) setError(null);
                    }}
                  >
                    <SelectTrigger id="providerType" className="h-10.5 rounded-xl text-sm disabled:opacity-75 disabled:cursor-not-allowed bg-muted/30">
                      <SelectValue placeholder="Select provider discipline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GROOMER">Professional Groomer (Salon & Spa)</SelectItem>
                      <SelectItem value="TRAINER">Certified Dog Trainer (Behavioral & Obedience)</SelectItem>
                    </SelectContent>
                  </Select>
                  {isEdit && (
                    <p className="text-[11px] text-muted-foreground">
                      Discipline / Provider type cannot be changed once created.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="experienceYears" className="text-xs font-semibold">Years of Professional Experience</Label>
                  <Input
                    id="experienceYears"
                    name="experienceYears"
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={form.experienceYears}
                    onChange={handleChange}
                    className="h-10.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="businessName" className="text-xs font-semibold">Business / Studio Display Name *</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    placeholder="e.g. Paws & Bubbles Grooming Studio"
                    value={form.businessName}
                    onChange={handleChange}
                    required
                    className="h-10.5 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="businessPhone" className="text-xs font-semibold">Business Contact Phone *</Label>
                  <Input
                    id="businessPhone"
                    name="businessPhone"
                    placeholder="e.g. +1 (415) 555-8822"
                    value={form.businessPhone}
                    onChange={handleChange}
                    required
                    className="h-10.5 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Physical Studio Location & Geo-Coordinates */}
            <div className="rounded-2xl border border-border/60 bg-surface/30 p-5 space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-border/30">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  3. Studio Location & Service Hub
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="address" className="text-xs font-semibold">Facility Street Address</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLocationPickerOpen(true)}
                    className="h-7 text-xs rounded-lg gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Navigation className="h-3 w-3" />
                    Pick on Map
                  </Button>
                </div>
                <Input
                  id="address"
                  name="address"
                  placeholder="e.g. 450 King St, San Francisco, CA 94158"
                  value={form.address}
                  onChange={handleChange}
                  className="h-10.5 rounded-xl text-sm"
                />
              </div>

              {/* Coordinates display badge */}
              {form.latitude != null && form.longitude != null && (
                <div className="flex items-center gap-2 p-2.5 bg-primary/5 rounded-xl border border-primary/20 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="font-mono text-foreground">
                    Lat: {form.latitude.toFixed(6)}, Lng: {form.longitude.toFixed(6)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, latitude: undefined, longitude: undefined }))}
                    className="ml-auto text-[11px] text-muted-foreground hover:text-destructive underline"
                  >
                    Clear Pin
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold">Service Philosophy / Overview</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe salon facilities, grooming styles, or training philosophies..."
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="rounded-2xl text-sm resize-y"
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="px-6 py-4 border-t border-border/50 bg-surface/50 gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-5 rounded-full text-sm"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 px-6 rounded-full text-sm font-semibold gap-2 shadow-sm"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Register Service Provider"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <LocationPickerModal
        open={isLocationPickerOpen}
        onOpenChange={setIsLocationPickerOpen}
        title="Pinpoint Studio & Service Location"
        description="Search your salon or studio, or drag the pin to your exact facility doorstep."
        initialCoordinates={
          form.latitude != null && form.longitude != null
            ? { lat: form.latitude, lng: form.longitude }
            : null
        }
        initialAddressText={form.address}
        onConfirmLocation={(result) => {
          setForm((prev) => ({
            ...prev,
            address: result.formattedAddress || result.address.street,
            latitude: result.coordinates.lat,
            longitude: result.coordinates.lng,
          }));
          if (error) setError(null);
        }}
      />
    </Dialog>
  );
}
