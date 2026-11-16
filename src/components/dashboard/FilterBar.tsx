import React from 'react';
import { Search, X } from 'lucide-react';

export type FilterCategory = 'all' | 'balance_due' | 'in_progress' | 'ready' | 'delivered';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeFilter: FilterCategory;
  onFilterChange: (cat: FilterCategory) => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  totalFilteredCount,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="शोधा: पावती क्र., ग्राहक, कामाचा तपशील, कागद, नंबरींग... (Search orders)"
          className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          सर्व ऑर्डर्स (All)
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('balance_due')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            activeFilter === 'balance_due'
              ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
          }`}
        >
          ⚠️ येणे बाकी (Balance Due)
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('in_progress')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            activeFilter === 'in_progress'
              ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
              : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
          }`}
        >
          ⚙️ प्रेस कामे (In Progress)
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('ready')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            activeFilter === 'ready'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          ✅ तयार (Ready)
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('delivered')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            activeFilter === 'delivered'
              ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          📦 डिलिव्हर (Delivered)
        </button>

        <div className="hidden lg:flex items-center text-xs text-slate-500 font-medium pl-2 border-l border-slate-200">
          एकूण: <strong className="text-slate-800 ml-1">{totalFilteredCount}</strong>
        </div>
      </div>
    </div>
  );
};
