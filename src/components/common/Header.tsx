import React, { useState, useEffect } from 'react';
import {
  Plus,
  Users,
  Download,
  Database,
  Lock,
  Wifi,
  WifiOff,
  UserCheck,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  onNewOrder: () => void;
  onOpenKhata: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onOpenAuth: () => void;
  currentUser: any;
}

export const Header: React.FC<HeaderProps> = ({
  onNewOrder,
  onOpenKhata,
  onExportCSV,
  onExportJSON,
  onOpenAuth,
  currentUser,
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-40 print:hidden">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand & Network Badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo Badge */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center font-bold text-lg text-white shadow-inner border border-blue-400/30">
              रा
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight font-serif text-white">
                  राज प्रेस <span className="text-blue-400 font-sans font-semibold text-sm sm:text-base">(RAJ PRESS)</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-[10px] font-semibold">
                  ERP v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                कमर्शियल प्रिंटिंग व बायडिंग प्रोडक्शन ऑर्डर लेजर
              </p>
            </div>
          </div>

          {/* Mobile Online Pill */}
          <div className="flex md:hidden items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'ऑनलाइन' : 'ऑफलाइन'}
            </span>
          </div>
        </div>

        {/* Action Controls & Toolbar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Desktop Online & Cloud Pill */}
          <div className="hidden md:flex items-center gap-2 pr-2 border-r border-slate-800">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isOnline
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? 'ऑनलाइन (Online)' : 'ऑफलाइन (Offline Mode)'}
            </span>

            <span
              onClick={onOpenAuth}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer border ${
                isSupabaseConfigured
                  ? 'bg-blue-950/60 text-blue-300 border-blue-800/60 hover:bg-blue-900/40'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/60 hover:bg-amber-900/40'
              }`}
              title="क्लाउड डेटाबेस व सुरक्षा सेटिंग"
            >
              <Database className="w-3 h-3" />
              {isSupabaseConfigured ? 'क्लाउड सिंक' : 'लोकल कॅशे'}
            </span>
          </div>

          {/* Customer Khata Button */}
          <button
            type="button"
            onClick={onOpenKhata}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">ग्राहक वही</span> (Khata)
          </button>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={onExportCSV}
            title="मराठी फॉन्टसह मायक्रोसॉफ्ट एक्सेल CSV फाईल डाऊनलोड करा"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">एक्सेल</span> CSV
          </button>

          {/* JSON Backup Button */}
          <button
            type="button"
            onClick={onExportJSON}
            title="सर्व डेटाबेसचा सुरक्षित JSON बॅकअप डाऊनलोड करा"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            बॅकअप
          </button>

          {/* Login / Auth Button */}
          <button
            type="button"
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors border text-xs font-semibold ${
              currentUser
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title={currentUser ? `लॉगिन: ${currentUser.email}` : 'लॉगिन / सुरक्षा सेटिंग'}
          >
            {currentUser ? <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{currentUser ? 'लॉगिन' : 'सुरक्षा'}</span>
          </button>

          {/* Primary Action: + New Order Button */}
          <button
            type="button"
            onClick={onNewOrder}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] border border-blue-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>नवीन ऑर्डर नोंदणी</span>
          </button>
        </div>

      </div>
    </header>
  );
};
