"use client";

import React, { useState, useMemo } from "react";
import { useVetPatientReport, type PractitionerPatientVisit } from "@/lib/api/hooks";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Stethoscope,
  Heart,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function VetReportsClient() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filters = useMemo(() => {
    const f: { startDate?: string; endDate?: string; status?: string } = {};
    if (startDate) f.startDate = startDate;
    if (endDate) f.endDate = endDate;
    if (statusFilter !== "ALL") f.status = statusFilter;
    return f;
  }, [startDate, endDate, statusFilter]);

  const { data: report, isLoading, isError, refetch } = useVetPatientReport(filters);

  const visits = useMemo(() => {
    const list = report?.visits || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (v) =>
        v.petName?.toLowerCase().includes(q) ||
        v.petBreed?.toLowerCase().includes(q) ||
        v.ownerName?.toLowerCase().includes(q) ||
        v.referenceNo?.toLowerCase().includes(q) ||
        v.serviceOrReason?.toLowerCase().includes(q)
    );
  }, [report, searchQuery]);

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter("ALL");
    setSearchQuery("");
  };

  const handleExportCSV = () => {
    if (!visits.length) return;
    const headers = [
      "Appointment Ref",
      "Visit Date",
      "Start Time",
      "Pet Name",
      "Species",
      "Breed",
      "Owner Name",
      "Owner Phone",
      "Owner Email",
      "Chief Complaint / Reason",
      "Status",
      "Payment Status",
      "Consultation Fee (INR)",
      "Clinical Notes",
    ];

    const rows = visits.map((v) => [
      `"${v.referenceNo || ""}"`,
      `"${v.visitDate || ""}"`,
      `"${v.startTime || ""}"`,
      `"${v.petName || ""}"`,
      `"${v.petSpecies || ""}"`,
      `"${v.petBreed || ""}"`,
      `"${v.ownerName || ""}"`,
      `"${v.ownerPhone || ""}"`,
      `"${v.ownerEmail || ""}"`,
      `"${v.serviceOrReason || ""}"`,
      `"${v.status || ""}"`,
      `"${v.paymentStatus || ""}"`,
      (Number(v.amount) || 0).toFixed(2),
      `"${(v.clinicalOrSessionNotes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `vet-patient-records-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingState message="Loading your clinical patient report..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load clinical records"
        description="Unable to retrieve your patient activity history right now. Please try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-vet-report,
          #printable-vet-report * {
            visibility: visible;
          }
          #printable-vet-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Clinical Patient Tracking & Reports
            </h1>
            <Badge variant="outline" className="text-xs bg-paw-coral/10 text-paw-coral border-paw-coral/20">
              Practice Analytics
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {report?.clinicOrBusinessName || "Veterinary Practice"} • {report?.subType || "Clinical Medicine"}
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            disabled={!visits.length}
            className="text-xs h-9 rounded-xl gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="text-xs h-9 rounded-xl gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      <div id="printable-vet-report" className="space-y-6">
        {/* Printable Header */}
        <div className="hidden print:block border-b pb-4 mb-4">
          <h2 className="text-2xl font-black text-paw-charcoal">
            {report?.name || "Dr. Veterinarian"} — Clinical Patient Audit
          </h2>
          <p className="text-xs text-muted-foreground">
            Facility: {report?.clinicOrBusinessName} • Printed: {new Date().toLocaleString()}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="rounded-2xl border bg-card p-4 shadow-2xs">
            <span className="text-xs font-medium text-muted-foreground">Unique Pets</span>
            <p className="text-2xl font-black mt-2 text-foreground">
              {report?.uniquePetsChecked || 0}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Patients Examined</p>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-2xs">
            <span className="text-xs font-medium text-muted-foreground">Completed</span>
            <p className="text-2xl font-black mt-2 text-emerald-700 dark:text-emerald-400">
              {report?.completedCount || 0}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Consultations Done</p>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-2xs">
            <span className="text-xs font-medium text-muted-foreground">Upcoming</span>
            <p className="text-2xl font-black mt-2 text-amber-700 dark:text-amber-400">
              {report?.confirmedCount || 0}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Scheduled Ahead</p>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-2xs">
            <span className="text-xs font-medium text-muted-foreground">Cancelled</span>
            <p className="text-2xl font-black mt-2 text-rose-700 dark:text-rose-400">
              {report?.cancelledCount || 0}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Discontinued</p>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-2xs col-span-2 lg:col-span-1">
            <span className="text-xs font-medium text-muted-foreground">Total Revenue</span>
            <p className="text-2xl font-black mt-2 text-foreground">
              ₹{Number(report?.totalRevenueEarned || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Verified Collections</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-card rounded-2xl border p-4 space-y-3 no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Filter className="w-3.5 h-3.5 text-paw-coral" />
            <span>Filter Patient History & Date Range</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search patient pet, owner, breed, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div>
              <select
                aria-label="Visit Status Filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="CONFIRMED">Confirmed / Upcoming</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No-Show</option>
              </select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs h-9 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-muted-foreground shrink-0">From:</span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-muted-foreground shrink-0">To:</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Patient Visits Log */}
        <div className="rounded-2xl border bg-card overflow-hidden shadow-2xs">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">
              Patient Consultations & Treatment Log ({visits.length})
            </h3>
            <span className="text-xs font-mono font-semibold bg-muted px-2.5 py-1 rounded-lg">
              {report?.uniquePetsChecked || 0} Distinct Patients
            </span>
          </div>

          <div className="divide-y divide-border/60">
            {visits.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground">
                No patient visit records found for this period.
              </div>
            ) : (
              visits.map((v) => {
                const isPaid = v.paymentStatus === "PAID";
                const isCompleted = v.status === "COMPLETED";

                return (
                  <div key={v.bookingId} className="p-5 hover:bg-muted/20 transition-colors space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-muted px-2 py-0.5 rounded-lg text-foreground">
                          {v.referenceNo}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold uppercase",
                            isCompleted
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                              : v.status === "CONFIRMED"
                              ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {v.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40"
                          )}
                        >
                          {isPaid ? "PAID" : "PENDING"}
                        </span>
                        <span className="font-bold text-foreground">
                          ₹{Number(v.amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/30 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                          <Heart className="w-3 h-3 text-paw-coral" /> Patient
                        </span>
                        <p className="font-bold text-foreground text-sm">{v.petName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {v.petBreed || v.petSpecies || "Companion Animal"}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                          <User className="w-3 h-3 text-primary" /> Pet Parent
                        </span>
                        <p className="font-bold text-foreground text-sm">{v.ownerName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {v.ownerPhone || v.ownerEmail || "Client on file"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-border/50">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">
                          Reason / Chief Complaint:
                        </span>
                        <span className="font-semibold text-foreground">
                          {v.serviceOrReason}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground block">Timing:</span>
                        <span className="font-mono text-muted-foreground">
                          {v.visitDate} • {v.startTime}
                        </span>
                      </div>
                    </div>

                    {v.clinicalOrSessionNotes && (
                      <div className="p-2.5 rounded-xl bg-paw-coral/5 border border-paw-coral/10 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground block text-[11px] mb-0.5">
                          Clinical Notes:
                        </span>
                        &quot;{v.clinicalOrSessionNotes}&quot;
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
