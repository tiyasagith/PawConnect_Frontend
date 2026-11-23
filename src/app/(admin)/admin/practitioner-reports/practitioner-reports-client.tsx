"use client";

import React, { useState, useMemo } from "react";
import {
  useAdminPractitionerReports,
  useAdminVeterinarians,
  useAdminProviders,
  type PractitionerPerformanceReport,
  type PractitionerPatientVisit,
  type PractitionerReportFilters,
} from "@/lib/api/hooks";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { LoadingState, ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Stethoscope,
  Scissors,
  Award,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  FileSpreadsheet,
  Printer,
  FileText,
  RotateCcw,
  Eye,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Heart,
  User,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function PractitionerReportsClient() {
  const [practitionerType, setPractitionerType] = useState<
    "ALL" | "VETERINARIAN" | "SERVICE_PROVIDER" | "GROOMER" | "TRAINER"
  >("ALL");
  const [selectedPractitionerId, setSelectedPractitionerId] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedPractitioner, setSelectedPractitioner] =
    useState<PractitionerPerformanceReport | null>(null);
  const [patientSearch, setPatientSearch] = useState<string>("");

  const { data: allVets = [] } = useAdminVeterinarians();
  const { data: allProviders = [] } = useAdminProviders();

  // Build query filters for backend
  const apiFilters = useMemo<PractitionerReportFilters>(() => {
    const f: PractitionerReportFilters = {};
    if (practitionerType !== "ALL") f.type = practitionerType;
    if (selectedPractitionerId !== "ALL") {
      const num = Number(selectedPractitionerId.replace(/\D/g, ""));
      if (!isNaN(num) && num > 0) f.practitionerId = num;
    }
    if (startDate) f.startDate = startDate;
    if (endDate) f.endDate = endDate;
    if (statusFilter !== "ALL") f.status = statusFilter;
    return f;
  }, [practitionerType, selectedPractitionerId, startDate, endDate, statusFilter]);

  const {
    data: reports = [],
    isLoading,
    isError,
    refetch,
  } = useAdminPractitionerReports(apiFilters);

  // Client-side text and doctor selector filters
  const filteredReports = useMemo(() => {
    let result = reports;
    if (selectedPractitionerId !== "ALL") {
      const num = Number(selectedPractitionerId.replace(/\D/g, ""));
      result = result.filter((r) => r.practitionerId === num);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.clinicOrBusinessName?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.subType?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [reports, selectedPractitionerId, searchQuery]);

  // Overall KPI aggregations
  const stats = useMemo(() => {
    let activeVets = 0;
    let activeProviders = 0;
    let totalCompleted = 0;
    let totalConfirmed = 0;
    let totalRevenue = 0;
    let totalUniquePets = 0;

    const petIdSet = new Set<number>();

    reports.forEach((r) => {
      if (r.practitionerType === "VETERINARIAN") {
        activeVets++;
      } else {
        activeProviders++;
      }
      totalCompleted += r.completedCount || 0;
      totalConfirmed += r.confirmedCount || 0;
      totalRevenue += Number(r.totalRevenueEarned || 0);

      r.visits?.forEach((v) => {
        if (v.petId) petIdSet.add(v.petId);
      });
    });

    totalUniquePets = petIdSet.size;

    return {
      activeVets,
      activeProviders,
      totalCompleted,
      totalConfirmed,
      totalRevenue,
      totalUniquePets,
    };
  }, [reports]);

  // Filtered visits for the selected practitioner in drawer
  const selectedPractitionerVisits = useMemo(() => {
    if (!selectedPractitioner) return [];
    if (!patientSearch.trim()) return selectedPractitioner.visits || [];
    const q = patientSearch.toLowerCase().trim();
    return (selectedPractitioner.visits || []).filter(
      (v) =>
        v.petName?.toLowerCase().includes(q) ||
        v.ownerName?.toLowerCase().includes(q) ||
        v.referenceNo?.toLowerCase().includes(q) ||
        v.serviceOrReason?.toLowerCase().includes(q) ||
        v.petBreed?.toLowerCase().includes(q)
    );
  }, [selectedPractitioner, patientSearch]);

  const handleResetFilters = () => {
    setPractitionerType("ALL");
    setSelectedPractitionerId("ALL");
    setStartDate("");
    setEndDate("");
    setStatusFilter("ALL");
    setSearchQuery("");
  };

  // CSV Export: Practitioner Summary
  const handleExportSummaryCSV = () => {
    if (!filteredReports.length) return;
    const headers = [
      "Practitioner Name",
      "Type",
      "Specialization / Role",
      "Facility / Business Name",
      "Email",
      "Phone",
      "Unique Pets Checked",
      "Completed Visits",
      "Confirmed Upcoming",
      "Pending",
      "Cancelled",
      "No-Show",
      "Total Verified Revenue (INR)",
    ];

    const rows = filteredReports.map((r) => [
      `"${r.name || ""}"`,
      `"${r.practitionerType || ""}"`,
      `"${r.subType || ""}"`,
      `"${r.clinicOrBusinessName || ""}"`,
      `"${r.email || ""}"`,
      `"${r.phone || ""}"`,
      r.uniquePetsChecked || 0,
      r.completedCount || 0,
      r.confirmedCount || 0,
      r.pendingCount || 0,
      r.cancelledCount || 0,
      r.noShowCount || 0,
      (Number(r.totalRevenueEarned) || 0).toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `practitioner-performance-summary-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export: Detailed Patient Visits
  const handleExportDetailedVisitsCSV = () => {
    const visitsToExport: {
      practitioner: string;
      facility: string;
      v: PractitionerPatientVisit;
    }[] = [];

    const targetList = selectedPractitioner
      ? [selectedPractitioner]
      : filteredReports;

    targetList.forEach((r) => {
      r.visits?.forEach((v) => {
        visitsToExport.push({
          practitioner: r.name,
          facility: r.clinicOrBusinessName,
          v,
        });
      });
    });

    if (!visitsToExport.length) return;

    const headers = [
      "Practitioner Name",
      "Facility",
      "Reference No",
      "Booking Type",
      "Visit Date",
      "Start Time",
      "Pet Name",
      "Pet Species",
      "Pet Breed",
      "Owner Name",
      "Owner Phone",
      "Owner Email",
      "Service / Reason",
      "Session Status",
      "Payment Status",
      "Fee (INR)",
      "Clinical / Session Notes",
    ];

    const rows = visitsToExport.map(({ practitioner, facility, v }) => [
      `"${practitioner || ""}"`,
      `"${facility || ""}"`,
      `"${v.referenceNo || ""}"`,
      `"${v.bookingType || ""}"`,
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
      `patient-visit-history-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingState message="Loading practitioner tracking reports..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load practitioner reports"
        description="There was an error retrieving doctor and service provider tracking records. Please try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Print-only CSS styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm 12mm;
          }
          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, aside {
            display: none !important;
          }
          .no-print,
          [data-slot="sheet-overlay"],
          [data-slot="sheet-close"],
          button[data-slot="sheet-close"] {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>

      {/* Top Header & Export Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Doctor & Provider Tracking
            </h1>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Clinical & Care Audit
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time practitioner performance, verified patient logs, completed clinical visits, and revenue reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportSummaryCSV}
            className="text-xs h-9 rounded-xl gap-1.5"
            disabled={!filteredReports.length}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Summary CSV</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportDetailedVisitsCSV}
            className="text-xs h-9 rounded-xl gap-1.5"
            disabled={!filteredReports.length}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Patient Log CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={handlePrint}
            className="text-xs h-9 rounded-xl gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Clinical Report</span>
          </Button>
        </div>
      </div>

      <div
        id="printable-report-area"
        className={cn("space-y-6", selectedPractitioner && "print:hidden")}
      >
        {/* Printable Header Info (Visible on Print) */}
        <div className="hidden print:block border-b pb-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-paw-charcoal tracking-tight">
                PawConnect Platform — Practitioner Patient Activity Report
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Official Clinical & Specialist Performance Tracking Audit
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>Generated: {new Date().toLocaleString()}</p>
              <p>
                Period: {startDate || "All Time"} to {endDate || "Present"}
              </p>
            </div>
          </div>
        </div>

        {/* 1. Summary KPI Cards */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Active Doctors */}
          <div className="rounded-2xl border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Active Doctors
              </span>
              <div className="w-7 h-7 rounded-lg bg-paw-coral/10 flex items-center justify-center text-paw-coral">
                <Stethoscope className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black mt-2 text-foreground">
              {stats.activeVets}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Veterinary Practitioners
            </p>
          </div>

          {/* Active Providers */}
          <div className="rounded-2xl border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Service Providers
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                <Scissors className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black mt-2 text-foreground">
              {stats.activeProviders}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Groomers & Trainers
            </p>
          </div>

          {/* Patients Checked (Completed) */}
          <div className="rounded-2xl border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Completed Visits
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black mt-2 text-emerald-700 dark:text-emerald-400">
              {stats.totalCompleted}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {stats.totalUniquePets} Unique Pets Checked
            </p>
          </div>

          {/* Confirmed Upcoming */}
          <div className="rounded-2xl border bg-card p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Confirmed Upcoming
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black mt-2 text-amber-700 dark:text-amber-400">
              {stats.totalConfirmed}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Scheduled Sessions
            </p>
          </div>

          {/* Total Verified Revenue */}
          <div className="rounded-2xl border bg-card p-4 shadow-2xs min-[420px]:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Practitioner Revenue
              </span>
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black mt-2 text-foreground">
              ₹{stats.totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Verified & Paid Bookings
            </p>
          </div>
        </div>

        {/* 2. Interactive Filter Bar */}
        <div className="bg-card rounded-2xl border p-4 space-y-3 no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Filter Practitioner & Activity Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search by Doctor, Facility, or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            {/* Discipline / Practitioner Type */}
            <div>
              <select
                aria-label="Practitioner Discipline"
                value={practitionerType}
                onChange={(e) =>
                  setPractitionerType(
                    e.target.value as "ALL" | "VETERINARIAN" | "SERVICE_PROVIDER" | "GROOMER" | "TRAINER"
                  )
                }
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="ALL">All Disciplines</option>
                <option value="VETERINARIAN">Veterinarians (Doctors)</option>
                <option value="SERVICE_PROVIDER">All Service Providers</option>
                <option value="GROOMER">Pet Groomers</option>
                <option value="TRAINER">Canine Trainers</option>
              </select>
            </div>

            {/* Specific Doctor / Provider Selector */}
            <div>
              <select
                aria-label="Doctor or Service Provider Selector"
                value={selectedPractitionerId}
                onChange={(e) => setSelectedPractitionerId(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="ALL">All Doctors & Providers</option>
                {allVets.length > 0 && (
                  <optgroup label="Veterinary Doctors">
                    {allVets.map((v) => (
                      <option key={`vet-opt-${v.id}`} value={v.id}>
                        {v.name} ({v.specialization || "Doctor"})
                      </option>
                    ))}
                  </optgroup>
                )}
                {allProviders.length > 0 && (
                  <optgroup label="Specialists & Care Providers">
                    {allProviders.map((p) => (
                      <option key={`prov-opt-${p.id}`} value={p.id}>
                        {p.businessName || p.name} ({p.providerType})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Visit Status */}
            <div>
              <select
                aria-label="Visit Status Filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="ALL">All Visit Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="CONFIRMED">Confirmed / Upcoming</option>
                <option value="PENDING">Pending Payment / Confirmation</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="NO_SHOW">No-Show</option>
              </select>
            </div>

            {/* Reset */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs h-9 rounded-xl w-full text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Date range pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                From Date:
              </span>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 text-xs rounded-xl"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                To Date:
              </span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 text-xs rounded-xl"
              />
            </div>

            {(startDate || endDate) && (
              <div className="flex items-center text-[11px] text-primary font-medium">
                Active Date Range: {startDate || "Earliest"} → {endDate || "Latest"}
              </div>
            )}
          </div>
        </div>

        {/* 3. Practitioner Performance Leaderboard & Breakdown Table */}
        <div className="rounded-2xl border bg-card overflow-hidden shadow-2xs">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Practitioner Breakdown & Leaderboard
              </h3>
              <p className="text-xs text-muted-foreground">
                Showing {filteredReports.length} practitioners based on selected criteria
              </p>
            </div>
            <span className="text-xs font-mono font-semibold bg-muted px-2.5 py-1 rounded-lg">
              {filteredReports.reduce((acc, r) => acc + (r.visits?.length || 0), 0)} Total Patient Sessions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Practitioner & Discipline</th>
                  <th className="px-4 py-3">Facility Location</th>
                  <th className="px-4 py-3 text-center">Unique Pets</th>
                  <th className="px-4 py-3 text-center">Completed</th>
                  <th className="px-4 py-3 text-center">Upcoming</th>
                  <th className="px-4 py-3 text-center">Cancelled</th>
                  <th className="px-4 py-3 text-right">Verified Revenue</th>
                  <th className="px-5 py-3 text-right no-print">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                      No practitioners or patient records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => {
                    const isVet = r.practitionerType === "VETERINARIAN";
                    const isTrainer = r.subType?.toUpperCase().includes("TRAIN");

                    return (
                      <tr
                        key={`${r.practitionerType}-${r.practitionerId}`}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* Name & Role */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs",
                                isVet
                                  ? "bg-paw-coral/10 text-paw-coral border border-paw-coral/20"
                                  : isTrainer
                                  ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                                  : "bg-blue-500/10 text-blue-700 border border-blue-500/20"
                              )}
                            >
                              {isVet ? (
                                <Stethoscope className="w-4 h-4" />
                              ) : isTrainer ? (
                                <Award className="w-4 h-4" />
                              ) : (
                                <Scissors className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-sm">
                                {r.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 font-semibold"
                                >
                                  {isVet
                                    ? "Veterinarian"
                                    : isTrainer
                                    ? "Trainer"
                                    : "Groomer"}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground line-clamp-1">
                                  {r.subType}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Facility */}
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-foreground text-xs">
                            {r.clinicOrBusinessName}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {r.phone || r.email}
                          </p>
                        </td>

                        {/* Unique Pets Checked */}
                        <td className="px-4 py-3.5 text-center font-bold text-foreground">
                          {r.uniquePetsChecked}
                        </td>

                        {/* Completed */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                            {r.completedCount}
                          </span>
                        </td>

                        {/* Upcoming */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                            {r.confirmedCount}
                          </span>
                        </td>

                        {/* Cancelled */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400">
                            {r.cancelledCount}
                          </span>
                        </td>

                        {/* Revenue */}
                        <td className="px-4 py-3.5 text-right font-black text-foreground">
                          ₹{Number(r.totalRevenueEarned || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>

                        {/* Action */}
                        <td className="px-5 py-3.5 text-right no-print">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPractitioner(r);
                              setPatientSearch("");
                            }}
                            className="rounded-xl text-xs h-8 gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Patient Log</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Detailed Patient Log Drawer (Sheet) */}
      <Sheet
        open={Boolean(selectedPractitioner)}
        onOpenChange={(open) => !open && setSelectedPractitioner(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl md:max-w-3xl p-0 flex flex-col bg-background print:hidden"
        >
          {selectedPractitioner && (
            <>
              {/* Drawer Header */}
              <div className="p-6 border-b bg-card space-y-4">
                {/* Print-only Official Audit Header */}
                <div className="hidden print:block border-b pb-3 mb-2">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">
                      PawConnect Platform — Practitioner Patient & Session Log
                    </span>
                    <span>Printed: {new Date().toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <SheetTitle className="text-xl font-bold flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-primary" />
                      {selectedPractitioner.name} — Patient & Session Log
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground mt-1">
                      {selectedPractitioner.clinicOrBusinessName} • {selectedPractitioner.subType}
                    </SheetDescription>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 no-print">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportDetailedVisitsCSV}
                      className="text-xs rounded-xl gap-1"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Export CSV</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handlePrint}
                      className="text-xs rounded-xl gap-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-primary" />
                      <span>Print / PDF</span>
                    </Button>
                  </div>
                </div>

                {/* Quick stats chips */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <div className="bg-muted/50 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Total Visits
                    </span>
                    <p className="text-base font-extrabold text-foreground">
                      {selectedPractitioner.visits?.length || 0}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold">
                      Completed
                    </span>
                    <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                      {selectedPractitioner.completedCount}
                    </p>
                  </div>
                  <div className="bg-amber-500/10 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-semibold">
                      Upcoming
                    </span>
                    <p className="text-base font-extrabold text-amber-700 dark:text-amber-400">
                      {selectedPractitioner.confirmedCount}
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-xl p-2.5 text-center">
                    <span className="text-[10px] text-primary uppercase font-semibold">
                      Earned
                    </span>
                    <p className="text-base font-extrabold text-primary">
                      ₹{Number(selectedPractitioner.totalRevenueEarned).toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* Patient Search */}
                <div className="no-print">
                  <Input
                    placeholder="Search by pet name, breed, owner, or appointment number..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="h-8 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Patient Log List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {selectedPractitionerVisits.length === 0 ? (
                  <div className="p-12 text-center text-xs text-muted-foreground border rounded-2xl bg-card">
                    No matching patient visits recorded for this practitioner.
                  </div>
                ) : (
                  selectedPractitionerVisits.map((visit) => {
                    const isPaid = visit.paymentStatus === "PAID";
                    const isCompleted = visit.status === "COMPLETED";

                    return (
                      <div
                        key={visit.bookingId}
                        className="rounded-2xl border bg-card p-4 hover:border-primary/40 transition-all space-y-3 break-inside-avoid print:border print:border-border print:p-3.5 print:shadow-none"
                      >
                        {/* Top row: Reference & Timing */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg">
                              {visit.referenceNo}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-bold uppercase",
                                isCompleted
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                                  : visit.status === "CONFIRMED"
                                  ? "bg-amber-500/10 text-amber-700 border-amber-500/20"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {visit.status}
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
                              {isPaid ? "PAID" : "PAYMENT PENDING"}
                            </span>
                            <span className="font-bold text-foreground">
                              ₹{Number(visit.amount || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Pet & Owner Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-muted/30 text-xs">
                          {/* Pet */}
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                              <Heart className="w-3 h-3 text-paw-coral" /> Patient Pet
                            </span>
                            <p className="font-bold text-foreground text-sm">
                              {visit.petName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {visit.petBreed || visit.petSpecies || "Companion Pet"}
                            </p>
                          </div>

                          {/* Owner */}
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                              <User className="w-3 h-3 text-primary" /> Owner / Client
                            </span>
                            <p className="font-bold text-foreground text-sm">
                              {visit.ownerName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {visit.ownerPhone || visit.ownerEmail || "Client on file"}
                            </p>
                          </div>
                        </div>

                        {/* Reason & Date */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">
                              Service / Chief Complaint:
                            </span>
                            <span className="font-semibold text-foreground">
                              {visit.serviceOrReason}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-muted-foreground block">
                              Session Timing:
                            </span>
                            <span className="font-mono text-muted-foreground">
                              {visit.visitDate} • {visit.startTime}
                            </span>
                          </div>
                        </div>

                        {/* Clinical / Session Notes */}
                        {visit.clinicalOrSessionNotes && (
                          <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground block text-[11px] mb-0.5">
                              Clinical Remarks:
                            </span>
                            &quot;{visit.clinicalOrSessionNotes}&quot;
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* 5. Dedicated Printable Document for Selected Practitioner Patient Log (Print Only) */}
      {selectedPractitioner && (
        <div
          id="practitioner-print-document"
          className="hidden print:block text-slate-900 bg-white space-y-5"
        >
          {/* Header */}
          <div className="border-b-2 border-slate-900/10 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-rose-600" />
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    {selectedPractitioner.name} — Patient &amp; Session Log
                  </h1>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {selectedPractitioner.clinicOrBusinessName} • {selectedPractitioner.subType}
                </p>
                <div className="text-[11px] text-slate-500 mt-1 flex gap-4">
                  {selectedPractitioner.email && <span>Email: {selectedPractitioner.email}</span>}
                  {selectedPractitioner.phone && <span>Phone: {selectedPractitioner.phone}</span>}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <p className="font-semibold text-slate-800">PawConnect Health Platform</p>
                <p>
                  Printed:{" "}
                  {new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Quick Stats Cards (Colored backgrounds & borders) */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Total Visits
                </span>
                <p className="text-lg font-black text-slate-900 mt-0.5">
                  {selectedPractitioner.visits?.length || 0}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                <span className="text-[10px] text-emerald-700 uppercase font-bold tracking-wider">
                  Completed
                </span>
                <p className="text-lg font-black text-emerald-800 mt-0.5">
                  {selectedPractitioner.completedCount}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
                <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">
                  Upcoming
                </span>
                <p className="text-lg font-black text-amber-800 mt-0.5">
                  {selectedPractitioner.confirmedCount}
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center">
                <span className="text-[10px] text-rose-700 uppercase font-bold tracking-wider">
                  Earned
                </span>
                <p className="text-lg font-black text-rose-800 mt-0.5">
                  ₹{Number(selectedPractitioner.totalRevenueEarned).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>

          {/* Visits List */}
          <div className="space-y-3.5">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Patient Session Records ({selectedPractitionerVisits.length})
            </h2>

            {selectedPractitionerVisits.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-slate-200 rounded-xl bg-slate-50">
                No matching patient visits recorded for this practitioner.
              </div>
            ) : (
              selectedPractitionerVisits.map((visit) => {
                const isPaid = visit.paymentStatus === "PAID";
                const isCompleted = visit.status === "COMPLETED";

                return (
                  <div
                    key={visit.bookingId}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2.5 break-inside-avoid shadow-none"
                    style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                  >
                    {/* Top Row: Ref & Amount */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {visit.referenceNo}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
                            isCompleted
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : visit.status === "CONFIRMED"
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          )}
                        >
                          {visit.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
                            isPaid
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          )}
                        >
                          {isPaid ? "PAID" : "PAYMENT PENDING"}
                        </span>
                        <span className="font-black text-slate-900 text-sm">
                          ₹{Number(visit.amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Pet & Owner */}
                    <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Patient Pet
                        </span>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">
                          {visit.petName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {visit.petBreed || visit.petSpecies || "Companion Pet"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Owner / Client
                        </span>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">
                          {visit.ownerName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {visit.ownerPhone || visit.ownerEmail || "Client on file"}
                        </p>
                      </div>
                    </div>

                    {/* Bottom: Service & Timing */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Service / Chief Complaint:</span>
                        <span className="font-semibold text-slate-800">{visit.serviceOrReason}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Session Timing:</span>
                        <span className="font-mono text-slate-700">{visit.visitDate} • {visit.startTime}</span>
                      </div>
                    </div>

                    {/* Clinical notes if present */}
                    {visit.clinicalOrSessionNotes && (
                      <div className="p-2 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <span className="font-bold text-[10px] uppercase text-slate-500 block">Clinical Remarks:</span>
                        &quot;{visit.clinicalOrSessionNotes}&quot;
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
