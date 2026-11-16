import React from 'react';
import { KPIMetrics } from '../../types';
import { FileText, Cog, IndianRupee, CheckCircle2, AlertTriangle } from 'lucide-react';

interface KPICardsProps {
  metrics: KPIMetrics;
  onFilterBalanceDue?: () => void;
  onFilterActive?: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  metrics,
  onFilterBalanceDue,
  onFilterActive,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* 1. Total Orders */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">एकूण ऑर्डर्स</span>
          <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-800 tracking-tight">
          {metrics.totalOrders}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">Total Registered Jobs</div>
      </div>

      {/* 2. Active Press Jobs */}
      <div
        onClick={onFilterActive}
        className="bg-white border border-blue-200/80 rounded-xl p-3.5 shadow-sm hover:shadow transition-shadow cursor-pointer group"
      >
        <div className="flex items-center justify-between text-blue-600 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider group-hover:underline">प्रेस कामे चालू</span>
          <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg animate-pulse">
            <Cog className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-blue-900 tracking-tight">
          {metrics.activeJobs}
        </div>
        <div className="text-[11px] text-blue-500 mt-0.5">Printing & Binding Active</div>
      </div>

      {/* 3. Total Billed */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">एकूण बिलिंग</span>
          <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          ₹{metrics.totalBilled.toLocaleString('en-IN')}
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5">Total Order Value</div>
      </div>

      {/* 4. Advance Collected */}
      <div className="bg-white border border-emerald-200/80 rounded-xl p-3.5 shadow-sm hover:shadow transition-shadow">
        <div className="flex items-center justify-between text-emerald-600 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider">जमा ॲडव्हान्स</span>
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-emerald-800 tracking-tight">
          ₹{metrics.totalAdvance.toLocaleString('en-IN')}
        </div>
        <div className="text-[11px] text-emerald-600 mt-0.5">Advance Collected</div>
      </div>

      {/* 5. Pending Balance (येणे बाकी) */}
      <div
        onClick={onFilterBalanceDue}
        className={`bg-white border rounded-xl p-3.5 shadow-sm hover:shadow transition-shadow cursor-pointer col-span-2 sm:col-span-1 group ${
          metrics.pendingBalance > 0
            ? 'border-rose-300 bg-rose-50/20'
            : 'border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between text-rose-700 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider group-hover:underline flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> येणे बाकी ₹
          </span>
          <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-rose-700 tracking-tight">
          ₹{metrics.pendingBalance.toLocaleString('en-IN')}
        </div>
        <div className="text-[11px] text-rose-600/80 mt-0.5">Pending Customer Dues</div>
      </div>
    </div>
  );
};
