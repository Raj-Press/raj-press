import React from 'react';
import { KPIMetrics } from '../../types';

interface KPICardsProps {
  metrics: KPIMetrics;
  duePartiesCount?: number;
  onFilterBalanceDue?: () => void;
  onFilterActive?: () => void;
}

export const KPICards: React.FC<KPICardsProps> = React.memo(({
  metrics,
  duePartiesCount = 0,
  onFilterBalanceDue,
  onFilterActive,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
      {/* 1. Total Orders */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-3 sm:p-4 shadow-2xs hover:shadow-xs transition-colors">
        <span className="text-[11px] sm:text-xs font-semibold text-stone-500 dark:text-stone-400 block truncate">
          Total Orders
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mt-0.5 sm:mt-1">
          {metrics.totalOrders}
        </div>
        <div className="text-[11px] sm:text-xs text-stone-400 dark:text-stone-500 font-medium mt-0.5 sm:mt-1">
          In current ledger
        </div>
      </div>

      {/* 2. Active Press Jobs */}
      <div
        onClick={onFilterActive}
        className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-3 sm:p-4 shadow-2xs hover:shadow-xs transition-colors cursor-pointer group"
      >
        <span className="text-[11px] sm:text-xs font-semibold text-stone-500 dark:text-stone-400 block group-hover:text-sky-500 transition-colors truncate">
          Active Press Jobs
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400 tracking-tight mt-0.5 sm:mt-1">
          {metrics.activeJobs}
        </div>
        <div className="text-[11px] sm:text-xs text-stone-400 dark:text-stone-500 font-medium mt-0.5 sm:mt-1">
          Printing / Binding / Ready
        </div>
      </div>

      {/* 3. Total Billed */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-3 sm:p-4 shadow-2xs hover:shadow-xs transition-colors">
        <span className="text-[11px] sm:text-xs font-semibold text-stone-500 dark:text-stone-400 block truncate">
          Total Billed
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mt-0.5 sm:mt-1">
          ₹{metrics.totalBilled.toLocaleString('en-IN')}
        </div>
        <div className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 sm:mt-1 truncate">
          ₹{metrics.totalAdvance.toLocaleString('en-IN')} collected
        </div>
      </div>

      {/* 4. Pending Balance */}
      <div
        onClick={onFilterBalanceDue}
        className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl p-3 sm:p-4 shadow-2xs hover:shadow-xs transition-colors cursor-pointer group"
      >
        <span className="text-[11px] sm:text-xs font-semibold text-amber-900/80 dark:text-amber-400 block group-hover:underline truncate">
          Pending Balance
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#c2410c] dark:text-[#ea580c] tracking-tight mt-0.5 sm:mt-1">
          ₹{metrics.pendingBalance.toLocaleString('en-IN')}
        </div>
        <div className="text-[11px] sm:text-xs text-stone-400 dark:text-stone-500 font-medium mt-0.5 sm:mt-1 truncate">
          {duePartiesCount > 0 ? `${duePartiesCount} parties with dues` : 'No pending dues'}
        </div>
      </div>
    </div>
  );
});
