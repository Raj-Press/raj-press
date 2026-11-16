import React from 'react';
import { Search, X } from 'lucide-react';

export type FilterCategory = 'all' | 'balance_due' | 'in_progress' | 'delivered';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeFilter: FilterCategory;
  onFilterChange: (cat: FilterCategory) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-2">
      {/* Search Input Box */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Party Name, Receipt No. (पावती नं.), or Job..."
          className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-stone-200/90 rounded-2xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 focus:border-[#d9532f] transition-all placeholder:text-stone-400"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all border ${
            activeFilter === 'all'
              ? 'bg-[#18181b] text-white border-[#18181b] shadow-xs'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          All Orders
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('balance_due')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all border ${
            activeFilter === 'balance_due'
              ? 'bg-[#c2410c] text-white border-[#c2410c] shadow-xs'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          येणे बाकी (Balance Due)
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('in_progress')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all border ${
            activeFilter === 'in_progress'
              ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          In Progress
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('delivered')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all border ${
            activeFilter === 'delivered'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Delivered
        </button>
      </div>
    </div>
  );
};
