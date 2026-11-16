import React from 'react';
import {
  FileSpreadsheet,
  Users,
  RefreshCw,
  Globe,
  Lock,
  UserCheck,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  onExportCSV: () => void;
  onOpenKhata: () => void;
  onRefresh: () => void;
  onOpenAuth: () => void;
  currentUser: any;
}

export const Header: React.FC<HeaderProps> = ({
  onExportCSV,
  onOpenKhata,
  onRefresh,
  onOpenAuth,
  currentUser,
}) => {
  return (
    <header className="bg-[#f8f7f4] border-b border-stone-200/80 px-4 py-3 sm:px-6 sticky top-0 z-30 print:hidden">
      <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand Info */}
        <div className="flex items-center gap-3">
          {/* Logo Badge: Terracotta "RP" */}
          <div className="w-10 h-10 rounded-xl bg-[#d9532f] text-white flex items-center justify-center font-black text-lg tracking-wider shadow-sm shrink-0">
            RP
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                RAJ PRESS
              </h1>
              <span className="px-2.5 py-0.5 bg-stone-200/70 text-stone-700 rounded-full text-xs font-semibold">
                ऑर्डर बुक • Order Ledger
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium">
              Commercial Printing & Binding Production Workbench
            </p>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Free Domain / Cloudflare Guide Button */}
          <a
            href="https://pages.cloudflare.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/80 hover:bg-amber-100/80 text-amber-900 border border-amber-200/80 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            <Globe className="w-4 h-4 text-amber-700" />
            <span>Free Domain Guide</span>
          </a>

          {/* Customer Khata Directory */}
          <button
            type="button"
            onClick={onOpenKhata}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Customer Khata (ग्राहक वही)</span>
          </button>

          {/* Export Excel / CSV */}
          <button
            type="button"
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel / CSV</span>
          </button>

          {/* Refresh Icon Button */}
          <button
            type="button"
            onClick={onRefresh}
            title="डेटा रिफ्रेश करा (Refresh data)"
            className="p-2 bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 rounded-xl shadow-2xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Cloud Auth / Account */}
          <button
            type="button"
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-colors ${
              currentUser
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white hover:bg-stone-100 text-stone-600 border-stone-200'
            }`}
            title={currentUser ? `Signed in as ${currentUser.email}` : 'Cloud Database & Auth Settings'}
          >
            {currentUser ? <UserCheck className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {currentUser ? 'Online Sync' : isSupabaseConfigured ? 'Cloud Sync' : 'Local'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
