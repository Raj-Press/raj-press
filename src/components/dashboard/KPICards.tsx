import React from 'react';
import { KPIMetrics } from '../../types';

interface KPICardsProps {
  metrics: KPIMetrics;
  duePartiesCount?: number;
  onFilterBalanceDue?: () => void;
  onFilterActive?: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  metrics,
  duePartiesCount = 0,
  onFilterBalanceDue,
  onFilterActive,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Total Orders */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
        <span className="text-xs font-semibold text-stone-500 block">
          Total Orders (एकूण नोंदी)
        </span>
        <div className="text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
          {metrics.totalOrders}
        </div>
        <div className="text-xs text-stone-400 font-medium mt-1">
          In current ledger
        </div>
      </div>

      {/* 2. Active Press Jobs */}
      <div
        onClick={onFilterActive}
        className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer group"
      >
        <span className="text-xs font-semibold text-stone-500 block group-hover:text-blue-600 transition-colors">
          Active Press Jobs
        </span>
        <div className="text-3xl font-extrabold text-sky-600 tracking-tight mt-1">
          {metrics.activeJobs}
        </div>
        <div className="text-xs text-stone-400 font-medium mt-1">
          Printing / Binding / Ready
        </div>
      </div>

      {/* 3. Total Billed */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
        <span className="text-xs font-semibold text-stone-500 block">
          Total Billed (एकूण रक्कम)
        </span>
        <div className="text-3xl font-extrabold text-stone-900 tracking-tight mt-1">
          ₹{metrics.totalBilled.toLocaleString('en-IN')}
        </div>
        <div className="text-xs text-emerald-600 font-medium mt-1">
          ₹{metrics.totalAdvance.toLocaleString('en-IN')} Advance collected
        </div>
      </div>

      {/* 4. Pending Balance */}
      <div
        onClick={onFilterBalanceDue}
        className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer group"
      >
        <span className="text-xs font-semibold text-amber-900/80 block group-hover:underline">
          Pending Balance (येणे बाकी)
        </span>
        <div className="text-3xl font-extrabold text-[#c2410c] tracking-tight mt-1">
          ₹{metrics.pendingBalance.toLocaleString('en-IN')}
        </div>
        <div className="text-xs text-stone-400 font-medium mt-1">
          {duePartiesCount > 0 ? `${duePartiesCount} parties with dues` : 'No pending dues'}
        </div>
      </div>
    </div>
  );
};
