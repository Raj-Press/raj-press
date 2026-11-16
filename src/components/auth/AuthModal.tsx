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
      setErrorMsg('Supabase URL/Key is not configured. Running in Local Offline Mode.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Registration successful! Please check your email.');
        onUserChange(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setSuccessMsg('Sign in successful!');
        onUserChange(data.user);
        setTimeout(() => onClose(), 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      onUserChange(null);
      setSuccessMsg('Signed out.');
      setTimeout(() => onClose(), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 dark:bg-black text-white">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#d9532f] rounded-xl">
              <Lock className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="text-base font-bold">Cloud Sync & Security</h2>
              <p className="text-xs text-stone-400">Supabase Auth & Database Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Cloud Config Status */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs space-y-1">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-stone-600 dark:text-stone-400">Database Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isSupabaseConfigured ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'}`}>
                {isSupabaseConfigured ? 'Supabase Connected' : 'Local Offline Mode'}
              </span>
            </div>
            <p className="text-stone-500 dark:text-stone-400 text-[11px]">
              {isSupabaseConfigured
                ? 'Your orders are synced in real-time to your secure PostgreSQL cloud database.'
                : 'All orders are saved offline in browser IndexedDB cache. Data stays on this device.'}
            </p>
          </div>

          {currentUser ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400">Signed in as:</p>
                <p className="text-sm font-bold text-stone-800 dark:text-stone-100 font-mono">{currentUser.email}</p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-700 text-stone-700 dark:text-stone-300 rounded-2xl text-xs font-bold border border-stone-200 dark:border-stone-700 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-3">
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  ✓ {successMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="rajpress.owner@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-[#d9532f]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:ring-2 focus:ring-[#d9532f]/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#d9532f] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Register Account' : 'Sign In'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-[#d9532f] hover:underline font-semibold"
                >
                  {isSignUp
                    ? 'Already have an account? Sign In'
                    : 'Need an account? Register'}
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 font-medium"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
