import React from 'react';
import {
  FileSpreadsheet,
  Users,
  RefreshCw,
  Lock,
  UserCheck,
  Moon,
  Sun,
  KeyRound,
  BookOpen,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  onExportCSV: () => void;
  onOpenKhata: () => void;
  onOpenDaybook: () => void;
  onRefresh: () => void;
  onOpenAuth: () => void;
  onLockApp: () => void;
  onOpenChangePassword: () => void;
  currentUser: any;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  onExportCSV,
  onOpenKhata,
  onOpenDaybook,
  onRefresh,
  onOpenAuth,
  onLockApp,
  onOpenChangePassword,
  currentUser,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="bg-[#f8f7f4] dark:bg-stone-900 border-b border-stone-200/80 dark:border-stone-800 px-3 py-2 sm:px-6 sm:py-3 relative sm:sticky sm:top-0 z-30 print:hidden transition-colors">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
        
        {/* Brand Info */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Logo Badge: Terracotta "RP" */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#d9532f] text-white flex items-center justify-center font-black text-base sm:text-lg tracking-wider shadow-sm shrink-0">
            RP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                RAJ PRESS
              </h1>
              <span className="px-2 py-0.5 bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-full text-xs font-semibold">
                Ledger
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Action Buttons (Swipeable on mobile, flex-wrap on desktop) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5 sm:py-0 w-full md:w-auto">
          {/* Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-colors shrink-0"
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

          {/* Daily Daybook (दैनिक रोजमेळ) */}
          <button
            type="button"
            onClick={onOpenDaybook}
            title="Open Daily Daybook & Cash Drawer Reconciliation"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors shrink-0"
          >
            <BookOpen className="w-4 h-4 text-[#d9532f]" />
            <span>Daybook</span>
          </button>

          {/* Customer Khata Directory */}
          <button
            type="button"
            onClick={onOpenKhata}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors shrink-0"
          >
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Khata</span>
          </button>

          {/* Export Excel / CSV */}
          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export</span>
          </button>

          {/* Refresh Icon Button */}
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh Ledger"
            className="p-2 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xs transition-colors shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Change Security Password */}
          <button
            type="button"
            onClick={onOpenChangePassword}
            title="Change Security Password / PIN"
            className="p-2 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xs transition-colors shrink-0"
          >
            <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </button>

          {/* Immediate App Lock Button */}
          <button
            type="button"
            onClick={onLockApp}
            title="Lock Order Book Immediately"
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 border border-stone-200 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-colors shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>

          {/* Cloud Auth / Account */}
          <button
            type="button"
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs sm:text-sm font-bold shadow-2xs transition-colors shrink-0 ${
              currentUser
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}
            title={currentUser ? `Signed in as ${currentUser.email}` : 'Cloud Database & Auth Settings'}
          >
            {currentUser ? <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Lock className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {currentUser ? 'Online' : isSupabaseConfigured ? 'Sync' : 'Local'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
});
