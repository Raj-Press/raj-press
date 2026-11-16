import React, { useState } from 'react';
import { verifyPassword, unlockApp } from '../../lib/auth';
import { Lock, Eye, EyeOff, KeyRound, ShieldAlert, ArrowRight, ShieldCheck } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    try {
      const isValid = await verifyPassword(password);
      if (isValid) {
        unlockApp(rememberDevice);
        onUnlock();
      } else {
        setErrorMsg('Incorrect password. Please try again.');
      }
    } catch {
      setErrorMsg('Verification failed. Please retry.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0a09] text-stone-100 overflow-y-auto selection:bg-[#d9532f] selection:text-white">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#d9532f]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="space-y-2">
          <div className="w-14 h-14 bg-[#d9532f] text-white rounded-2xl flex items-center justify-center font-black text-2xl tracking-wider mx-auto shadow-lg shadow-[#d9532f]/20">
            RP
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              RAJ PRESS
            </h1>
            <p className="text-xs text-stone-400 font-medium">
              Commercial Printing & Production Workbench
            </p>
          </div>
        </div>

        {/* Security Shield Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-800/80 border border-stone-700 rounded-full text-xs font-semibold text-stone-300">
          <Lock className="w-3.5 h-3.5 text-[#d9532f]" />
          <span>Security Lock Active</span>
        </div>

        {/* Unlock Form */}
        <form onSubmit={handleUnlockSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Enter Password / PIN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter password to unlock..."
                className="w-full pl-10 pr-10 py-3 text-sm bg-stone-800/90 border border-stone-700 focus:border-[#d9532f] text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember on this device checkbox */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-stone-400 hover:text-stone-300">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-4 h-4 rounded bg-stone-800 border-stone-700 text-[#d9532f] focus:ring-[#d9532f]/40 accent-[#d9532f]"
              />
              <span>Remember on this device</span>
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-1.5 p-2.5 bg-rose-950/70 border border-rose-800 text-rose-300 text-xs rounded-xl font-medium animate-in shake">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Unlock Submit Button */}
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 bg-[#d9532f] hover:bg-[#c2410c] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#d9532f]/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isVerifying ? (
              'Verifying...'
            ) : (
              <>
                <span>Unlock Order Book</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Security Badge */}
        <div className="pt-2 border-t border-stone-800/80 text-[11px] text-stone-500">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
            <span>Protected by Raj Press Security Key</span>
          </p>
        </div>

      </div>
    </div>
  );
};
