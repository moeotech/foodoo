import React, { useState } from 'react';
import {
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Scale,
  Receipt,
  Percent,
  CheckCircle,
  FileCheck,
} from 'lucide-react';
import { JournalEntry, Tenant, Branch } from '../types/restaurant';

interface AccountingViewProps {
  tenant: Tenant;
  branch: Branch;
  journals: JournalEntry[];
  summary: {
    grossSales: number;
    taxCollected: number;
    cogs: number;
    grossProfit: number;
    foodCostPct: number;
    orderCount: number;
  };
}

export const AccountingView: React.FC<AccountingViewProps> = ({
  tenant,
  branch,
  journals,
  summary,
}) => {
  const [activeTab, setActiveTab] = useState<'PL' | 'JOURNALS'>('PL');

  // Verify balanced debit/credit
  const totalDebits = journals.reduce(
    (acc, j) => acc + j.lines.reduce((s, l) => s + l.debit, 0),
    0
  );
  const totalCredits = journals.reduce(
    (acc, j) => acc + j.lines.reduce((s, l) => s + l.credit, 0),
    0
  );
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 flex flex-col h-[calc(100vh-6rem)] overflow-y-auto">
      {/* Accounting Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-extrabold text-white">
              Financials & Double-Entry Accounting
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time P&L Statement, ZATCA Tax Liability & Balanced General Ledger Journals
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('PL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'PL' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            P&L Statement & KPIs
          </button>
          <button
            onClick={() => setActiveTab('JOURNALS')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'JOURNALS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            General Ledger ({journals.length})
          </button>
        </div>
      </div>

      {/* View 1: P&L Statement & KPIs */}
      {activeTab === 'PL' && (
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Gross Sales Revenue</span>
              <div className="text-2xl font-black text-white mt-1">
                {(summary?.grossSales ?? 0).toFixed(2)} {tenant.currency}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{summary?.orderCount ?? 0} paid checks</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">{tenant.taxName} Tax Payable</span>
              <div className="text-2xl font-black text-indigo-400 mt-1">
                {(summary?.taxCollected ?? 0).toFixed(2)} {tenant.currency}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Accrued to Tax Authority ({tenant.taxRatePct}%)</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">COGS (BOM Food Cost)</span>
              <div className="text-2xl font-black text-rose-400 mt-1">
                {(summary?.cogs ?? 0).toFixed(2)} {tenant.currency}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Food Cost: <span className="font-bold text-amber-400">{(summary?.foodCostPct ?? 0).toFixed(1)}%</span> (Industry target &lt;32%)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Gross Margin Profit</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {(summary?.grossProfit ?? 0).toFixed(2)} {tenant.currency}
              </div>
              <p className="text-[10px] text-emerald-500/80 mt-1 font-semibold">Healthy Operating Margin</p>
            </div>
          </div>

          {/* Detailed Statement */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Executive Income Statement (P&L)
            </h3>

            <div className="divide-y divide-slate-800/80 text-xs font-mono">
              <div className="py-2.5 flex justify-between font-sans">
                <span className="text-slate-300 font-semibold">Gross Food & Beverage Revenue</span>
                <span className="font-bold text-white">
                  {(summary?.grossSales ?? 0).toFixed(2)} {tenant.currency}
                </span>
              </div>

              <div className="py-2.5 flex justify-between font-sans text-rose-400">
                <span>Less: Cost of Goods Sold (BOM Recipe Ingredients Used)</span>
                <span className="font-bold">
                  -{(summary?.cogs ?? 0).toFixed(2)} {tenant.currency}
                </span>
              </div>

              <div className="py-3 flex justify-between font-sans text-sm font-bold bg-slate-950/60 px-3 rounded-xl border border-slate-800">
                <span className="text-white">Gross Operating Profit</span>
                <span className="text-emerald-400 font-extrabold">
                  {(summary?.grossProfit ?? 0).toFixed(2)} {tenant.currency} (
                  {(summary?.grossSales ?? 0) > 0 ? (((summary?.grossProfit ?? 0) / summary.grossSales) * 100).toFixed(1) : '0.0'}%)
                </span>
              </div>

              <div className="py-2.5 flex justify-between font-sans text-slate-400 pt-3">
                <span>Output VAT Accrual (Account 2200 - Not in P&L, balance sheet pass-through)</span>
                <span className="font-semibold text-indigo-400">
                  {(summary?.taxCollected ?? 0).toFixed(2)} {tenant.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Automated Double-Entry General Ledger */}
      {activeTab === 'JOURNALS' && (
        <div className="space-y-3">
          {/* Balancing Audit Pill */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">Double-Entry Ledger Audit:</span>
              <span className="text-slate-400">Total Debits = Total Credits</span>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-slate-300">Debits: {(totalDebits ?? 0).toFixed(2)}</span>
              <span className="text-slate-300">Credits: {(totalCredits ?? 0).toFixed(2)}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isBalanced ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {isBalanced ? 'Balanced ✓' : 'Discrepancy'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {journals.map((journal) => (
              <div
                key={journal.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs shadow-md"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400">{journal.entryNumber}</span>
                    <span className="text-slate-300 font-semibold">{journal.description}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(journal.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Journal lines */}
                <div className="divide-y divide-slate-800/60 font-mono">
                  {journal.lines.map((line, idx) => (
                    <div
                      key={idx}
                      className="py-1.5 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2 w-2/3">
                        <span className="font-bold text-slate-400">{line.accountCode}</span>
                        <span className="text-slate-200">{line.accountName}</span>
                      </div>
                      <div className="w-1/6 text-right font-bold text-emerald-400">
                        {(line.debit ?? 0) > 0 ? `${(line.debit ?? 0).toFixed(2)} DR` : ''}
                      </div>
                      <div className="w-1/6 text-right font-bold text-rose-400">
                        {(line.credit ?? 0) > 0 ? `${(line.credit ?? 0).toFixed(2)} CR` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
