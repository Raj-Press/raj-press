import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { X, Lock, Mail, ShieldCheck, Key, LogOut } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUserChange: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg('Supabase URL किंवा Key कॉन्फिगर केलेली नाही. तुम्ही लोकल ऑफलाइन मोड वापरत आहात.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('नोंदणी यशस्वी झाली! कृपया आपला ईमेल तपासा.');
        onUserChange(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSuccessMsg('लॉगिन यशस्वी झाले!');
        onUserChange(data.user);
        setTimeout(() => onClose(), 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'लॉगिन करण्यात अडचण आली.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      onUserChange(null);
      setSuccessMsg('लॉगआऊट पूर्ण झाले.');
      setTimeout(() => onClose(), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-600 rounded-lg">
              <Lock className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="text-base font-bold">राज प्रेस सुरक्षा व लॉगिन</h2>
              <p className="text-xs text-slate-300">Supabase Auth & Cloud Sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Cloud Config Status */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-600">क्लाउड डेटाबेस स्थिती:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {isSupabaseConfigured ? 'Supabase Connected' : 'Offline / Standalone Mode'}
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              {isSupabaseConfigured
                ? 'तुमचा डेटा सुरक्षित Supabase PostgreSQL क्लाउडवर रिअल-टाईम सिंक होत आहे.'
                : 'सध्या सर्व डेटा ब्राउझरच्या स्थानिक IndexedDB मध्ये 100% ऑफलाइन सुरक्षित साठवला जात आहे.'}
            </p>
          </div>

          {currentUser ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500">लॉगिन केलेले खाते:</p>
                <p className="text-sm font-bold text-slate-800 font-mono">{currentUser.email}</p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors"
              >
                <LogOut className="w-4 h-4" /> लॉगआऊट करा (Sign Out)
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-3">
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-semibold">
                  ✓ {successMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ईमेल (Email Address)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="rajpress.owner@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">पासवर्ड (Password)</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                {loading ? 'कृपया थांबा...' : isSignUp ? 'नवीन खाते नोंदवा (Register)' : 'लॉगिन करा (Sign In)'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-blue-700 hover:underline font-semibold"
                >
                  {isSignUp
                    ? 'आधीच खाते आहे? लॉगिन करा'
                    : 'नवीन खाते तयार करायचे आहे? येथे क्लिक करा'}
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              बंद करा (Close)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
