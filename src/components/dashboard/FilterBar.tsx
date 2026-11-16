import React from 'react';
import { Search, X, Filter, Bookmark } from 'lucide-react';

export type FilterCategory = 'all' | 'balance_due' | 'in_progress' | 'delivered';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeFilter: FilterCategory;
  onFilterChange: (cat: FilterCategory) => void;
  statusFilter: string;
  onStatusFilterChange: (st: string) => void;
  orderTypeFilter: string;
  onOrderTypeFilterChange: (type: string) => void;
  availableOrderTypes?: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  statusFilter,
  onStatusFilterChange,
  orderTypeFilter,
  onOrderTypeFilterChange,
  availableOrderTypes = ['General', 'Patrika / Wedding Cards', 'सप्ताह / Saptah', 'Special Order'],
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 my-2">
      {/* Shortened Search Input Box */}
      <div className="relative w-full sm:w-64 md:w-72 lg:w-80 shrink-0">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Party, Receipt, Job..."
          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-stone-200/90 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-2xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 focus:border-[#d9532f] transition-all placeholder:text-stone-400"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Tablets: Order Type + Status + Quick Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0 flex-wrap">
        {/* Order Type Filter Tablet */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xs">
          <Bookmark className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Type:</span>
          <select
            value={orderTypeFilter}
            onChange={(e) => onOrderTypeFilterChange(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="dark:bg-stone-800">All Types</option>
            {availableOrderTypes.map((type) => (
              <option key={type} value={type} className="dark:bg-stone-800">
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Status Tablet / Dropdown Filter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-2xs">
          <Filter className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="dark:bg-stone-800">All Statuses</option>
            <option value="Pending" className="dark:bg-stone-800">Pending</option>
            <option value="Printing" className="dark:bg-stone-800">Printing</option>
            <option value="Binding" className="dark:bg-stone-800">Binding</option>
            <option value="Ready" className="dark:bg-stone-800">Ready</option>
            <option value="Split Delivery" className="dark:bg-stone-800">Split Delivery</option>
            <option value="Delivered" className="dark:bg-stone-800">Delivered</option>
          </select>
        </div>

        {/* Quick Filter Category Pills */}
        <button
          type="button"
          onClick={() => {
            onFilterChange('all');
            onStatusFilterChange('ALL');
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all border ${
            activeFilter === 'all' && statusFilter === 'ALL'
              ? 'bg-[#18181b] dark:bg-stone-100 text-white dark:text-stone-900 border-[#18181b] dark:border-white shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
          }`}
        >
          All Orders
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('balance_due')}
          className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all border ${
            activeFilter === 'balance_due'
              ? 'bg-[#c2410c] text-white border-[#c2410c] shadow-xs'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
          }`}
        >
          येणे बाकी (Due)
        </button>
      </div>
    </div>
  );
};
