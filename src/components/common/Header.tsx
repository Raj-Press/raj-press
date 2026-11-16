import React from 'react';
import {
  FileSpreadsheet,
  Users,
  RefreshCw,
  Lock,
  UserCheck,
  Moon,
  Sun,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  onExportCSV: () => void;
  onOpenKhata: () => void;
  onRefresh: () => void;
  onOpenAuth: () => void;
  currentUser: any;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  onExportCSV,
  onOpenKhata,
  onRefresh,
  onOpenAuth,
  currentUser,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="bg-[#f8f7f4] dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 px-4 py-3 sm:px-6 sticky top-0 z-30 print:hidden transition-colors">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand Info */}
        <div className="flex items-center gap-3">
          {/* Logo Badge: Terracotta "RP" */}
          <div className="w-10 h-10 rounded-xl bg-[#d9532f] text-white flex items-center justify-center font-black text-lg tracking-wider shadow-sm shrink-0">
            RP
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                RAJ PRESS
              </h1>
              <span className="px-2.5 py-0.5 bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-full text-xs font-semibold">
                Order Ledger
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Commercial Printing & Binding Production Workbench
            </p>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-stone-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Customer Khata Directory */}
          <button
            type="button"
            onClick={onOpenKhata}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
          >
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Customer Khata</span>
          </button>

          {/* Export Excel / CSV */}
          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* Refresh Icon Button */}
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh Ledger"
            className="p-2 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Cloud Auth / Account */}
          <button
            type="button"
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-colors ${
              currentUser
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}
            title={currentUser ? `Signed in as ${currentUser.email}` : 'Cloud Database & Auth Settings'}
          >
            {currentUser ? <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Lock className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {currentUser ? 'Online Sync' : isSupabaseConfigured ? 'Cloud Sync' : 'Local'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
});
