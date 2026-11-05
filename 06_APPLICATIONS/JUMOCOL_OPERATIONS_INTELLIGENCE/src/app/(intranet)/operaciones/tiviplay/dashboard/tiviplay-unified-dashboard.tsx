"use client";

import React from "react";
import { 
  TiviplayPaymentsSnapshot, 
  DashboardMetrics 
} from "@/features/tiviplay-payments/domain";

interface TiviplayUnifiedDashboardProps {
  commercialData: any;
  paymentsSnapshot: TiviplayPaymentsSnapshot;
}

export function TiviplayUnifiedDashboardPage({ 
  commercialData, 
  paymentsSnapshot 
}: TiviplayUnifiedDashboardProps) {
  
  if (paymentsSnapshot.state === "error" || paymentsSnapshot.state === "file-not-found") {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <h2 className="text-lg font-bold">Data Source Error</h2>
        <p>{paymentsSnapshot.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <header className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">TiviPlay Command Center</h1>
          <p className="text-slate-500">Operational Intelligence | September MVP</p>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>Source: {paymentsSnapshot.source?.fileName || "Unknown"}</p>
          <p>Last Updated: {paymentsSnapshot.source?.fileUpdatedAt || "N/A"}</p>
          <p>Hash: {paymentsSnapshot.source?.hashPrefix || "N/A"}</p>
        </div>
      </header>

      {/* --- COMMERCIAL SECTION --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded-full" />
          Commercial Pipeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Total Leads</p>
            <p className="text-3xl font-bold">{commercialData.totalLeads || 0}</p>
          </div>
          <div className="p-4 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Conversion Rate</p>
            <p className="text-3xl font-bold text-blue-600">--%</p>
          </div>
          <div className="p-4 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Pipeline Health</p>
            <p className="text-3xl font-bold text-green-600">Stable</p>
          </div>
        </div>
      </section>

      {/* --- FINANCIAL SECTION --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-green-500 rounded-full" />
          Financial Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Collection Rate</p>
            <p className="text-3xl font-bold text-green-600">
              {paymentsSnapshot.state === "ready" ? " la calcular" : "N/A"}
            </p>
          </div>
          <div className="p-4 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Total Confirmed</p>
            <p className="text-3xl font-bold">
              {paymentsSnapshot.payments.length} <span className="text-sm font-normal text-slate-400">records</span>
            </p>
          </div>
          <div className="p-4 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Revenue (USD)</p>
            <p className="text-3xl font-bold text-slate-900">
               $ --
            </p>
          </div>
          <div className="p-4 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Billing Records</p>
            <p className="text-3xl font-bold">
              {paymentsSnapshot.billings.length}
            </p>
          </div>
        </div>
      </section>

      {/* --- OPERATIONAL HEALTH SECTION --- */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-amber-500 rounded-full" />
          Data Quality & Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Data Quality Score</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">{paymentsSnapshot.quality.length === 0 ? "100%" : "Calculating..."}</p>
              <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded">Attention</span>
            </div>
          </div>
          <div className="p-4 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Coverage Status</p>
            <p className="text-3xl font-bold">
               {paymentsSnapshot.state === "ready" ? "Full" : "Partial"}
            </p>
          </div>
          <div className="p-4 bg-white border rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Missing Months</p>
            <p className="text-3xl font-bold text-red-500">
              {paymentsSnapshot.missingExpectedMonths.length}
            </p>
          </div>
        </div>
      </section>

      <footer className="pt-8 text-center text-xs text-slate-400 border-t">
        <p>© 2026 JUMOCOL Operations Intelligence | Read-Only Operational View</p>
        <p>Strictly prohibited to modify source records from this interface.</p>
      </footer>
    </div>
  );
}
