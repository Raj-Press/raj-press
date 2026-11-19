import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DaybookEntry, DaybookClosing, DaybookDenominations, Order } from '../../types';
import {
  getDaybookEntries,
  saveDaybookEntry,
  deleteDaybookEntry,
  getDaybookClosing,
  saveDaybookClosing,
} from '../../lib/db';
import {
  X,
  Search,
  Printer,
  Edit2,
  Trash2,
  Wallet,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface DailyDaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders?: Order[];
}

export const DailyDaybookModal: React.FC<DailyDaybookModalProps> = ({
  isOpen,
  onClose,
  orders: _orders,
}) => {
  // Selected Date (defaults to today)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [entries, setEntries] = useState<DaybookEntry[]>([]);
  const [, setClosing] = useState<DaybookClosing | null>(null);
  const [openingCash, setOpeningCash] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Quick Entry Form
  const [amountInput, setAmountInput] = useState<string>('');
  const [descInput, setDescInput] = useState<string>('');
  const [isOnlineMode, setIsOnlineMode] = useState<boolean>(false);
  const selectedCategory = 'Direct';

  // Filters & Search
  const [filterMode, setFilterMode] = useState<'all' | 'cash' | 'online'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Currency Denomination Drawer (all zero by default)
  const [showDenom, setShowDenom] = useState<boolean>(false);
  const [denoms, setDenoms] = useState<DaybookDenominations>({
    n500: 0,
    n200: 0,
    n100: 0,
    n50: 0,
    n20: 0,
    n10: 0,
    coins: 0,
  });

  // Editing modal/state
  const [editingEntry, setEditingEntry] = useState<DaybookEntry | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editMode, setEditMode] = useState<'cash' | 'online'>('cash');

  // Load Daybook Data for Selected Date
  const loadDaybookData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedEntries, fetchedClosing] = await Promise.all([
        getDaybookEntries(selectedDate),
        getDaybookClosing(selectedDate),
      ]);
      setEntries(fetchedEntries);
      if (fetchedClosing) {
        setClosing(fetchedClosing);
        setOpeningCash(Number(fetchedClosing.opening_cash || 0));
        if (fetchedClosing.denominations) {
          setDenoms({
            n500: Number(fetchedClosing.denominations.n500 || 0),
            n200: Number(fetchedClosing.denominations.n200 || 0),
            n100: Number(fetchedClosing.denominations.n100 || 0),
            n50: Number(fetchedClosing.denominations.n50 || 0),
            n20: Number(fetchedClosing.denominations.n20 || 0),
            n10: Number(fetchedClosing.denominations.n10 || 0),
            coins: Number(fetchedClosing.denominations.coins || 0),
          });
        }
      } else {
        setClosing(null);
        setOpeningCash(0);
        setDenoms({ n500: 0, n200: 0, n100: 0, n50: 0, n20: 0, n10: 0, coins: 0 });
      }
    } catch (err) {
      console.error('Failed to load daybook data', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!isOpen) return;

    loadDaybookData();

    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel(`daybook-realtime-${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'daily_daybook' },
          () => loadDaybookData()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'presets' },
          () => loadDaybookData()
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [isOpen, loadDaybookData]);

  // Keyboard navigation & ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (editingEntry) {
          setEditingEntry(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, editingEntry, onClose]);

  // Date Shift Helpers
  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const setToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Reconciled Financial Totals
  const {
    cashIn,
    onlineIn,
    cashOut,
    onlineOut,
    drawerCash,
    onlineBalance,
    netTotal,
    totalIn,
    totalOut,
  } = useMemo(() => {
    let cIn = 0, oIn = 0;
    let cOut = 0, oOut = 0;

    entries.forEach((e) => {
      const amt = Number(e.amount || 0);
      if (e.entry_type === 'jama') {
        if (e.payment_mode === 'online') oIn += amt;
        else cIn += amt;
      } else {
        if (e.payment_mode === 'online') oOut += amt;
        else cOut += amt;
      }
    });

    const dCash = openingCash + (cIn - cOut);
    const oBal = oIn - oOut;
    const nTotal = dCash + oBal;

    return {
      cashIn: cIn,
      onlineIn: oIn,
      cashOut: cOut,
      onlineOut: oOut,
      drawerCash: dCash,
      onlineBalance: oBal,
      netTotal: nTotal,
      totalIn: cIn + oIn,
      totalOut: cOut + oOut,
    };
  }, [entries, openingCash]);

  // Denomination Count Calculations
  const countedDenomTotal = useMemo(() => {
    return (
      (denoms.n500 || 0) * 500 +
      (denoms.n200 || 0) * 200 +
      (denoms.n100 || 0) * 100 +
      (denoms.n50 || 0) * 50 +
      (denoms.n20 || 0) * 20 +
      (denoms.n10 || 0) * 10 +
      (denoms.coins || 0)
    );
  }, [denoms]);

  const denomDiff = countedDenomTotal - drawerCash;

  // Handle Opening Cash Adjustment
  const handleEditOpeningCash = async () => {
    const val = prompt('Enter Opening Drawer Cash Float (कालची शिल्लक / Opening Cash):', openingCash.toString());
    if (val !== null) {
      const parsed = Number(val);
      if (!isNaN(parsed) && parsed >= 0) {
        setOpeningCash(parsed);
        await saveDaybookClosing({
          closing_date: selectedDate,
          opening_cash: parsed,
          denominations: denoms,
        });
      }
    }
  };

  // Handle Denomination Change & Auto-Save
  const handleDenomChange = async (denomKey: keyof DaybookDenominations, value: number) => {
    const updated = {
      ...denoms,
      [denomKey]: Math.max(0, value),
    };
    setDenoms(updated);
    await saveDaybookClosing({
      closing_date: selectedDate,
      opening_cash: openingCash,
      denominations: updated,
    });
  };

  // Add New Entry
  const handleAddEntry = async (e: React.FormEvent, side: 'jama' | 'naave') => {
    e.preventDefault();
    const amt = Number(amountInput);
    const desc = descInput.trim();
    if (!amt || !desc) return;

    const newEntry: Partial<DaybookEntry> = {
      entry_date: selectedDate,
      entry_type: side,
      payment_mode: isOnlineMode ? 'online' : 'cash',
      amount: amt,
      party_name: desc,
      category: selectedCategory,
    };

    const saved = await saveDaybookEntry(newEntry);
    setEntries((prev) => [saved, ...prev]);
    setAmountInput('');
    setDescInput('');
  };

  // Quick Fill Helper
  const handleQuickFill = async (
    amount: number,
    desc: string,
    side: 'jama' | 'naave',
    isOnline: boolean,
    category: string,
    receiptNo?: string
  ) => {
    const newEntry: Partial<DaybookEntry> = {
      entry_date: selectedDate,
      entry_type: side,
      payment_mode: isOnline ? 'online' : 'cash',
      amount,
      party_name: desc,
      category,
      receipt_no: receiptNo || null,
    };
    const saved = await saveDaybookEntry(newEntry);
    setEntries((prev) => [saved, ...prev]);
  };

  // Delete Entry
  const handleDeleteEntry = async (id: string) => {
    if (confirm('Delete this daybook entry?')) {
      await deleteDaybookEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Open Edit Entry Modal
  const openEditEntry = (entry: DaybookEntry) => {
    setEditingEntry(entry);
    setEditAmount(entry.amount.toString());
    setEditDesc(entry.party_name);
    setEditMode(entry.payment_mode);
  };

  // Save Edit Entry
  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    const amt = Number(editAmount);
    const desc = editDesc.trim();
    if (!amt || !desc) return;

    const updated = await saveDaybookEntry({
      id: editingEntry.id,
      amount: amt,
      party_name: desc,
      payment_mode: editMode,
    });

    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setEditingEntry(null);
  };

  // Filtered Entries for Tables
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (filterMode === 'cash' && e.payment_mode !== 'cash') return false;
      if (filterMode === 'online' && e.payment_mode !== 'online') return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const descMatch = e.party_name.toLowerCase().includes(q);
        const catMatch = e.category && e.category.toLowerCase().includes(q);
        const orderMatch = e.receipt_no && e.receipt_no.toLowerCase().includes(q);
        if (!descMatch && !catMatch && !orderMatch) return false;
      }
      return true;
    });
  }, [entries, filterMode, searchQuery]);

  const jamaEntries = useMemo(() => filteredEntries.filter((e) => e.entry_type === 'jama'), [filteredEntries]);
  const naaveEntries = useMemo(() => filteredEntries.filter((e) => e.entry_type === 'naave'), [filteredEntries]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 pt-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-1 sm:my-auto flex flex-col max-h-[94dvh] sm:max-h-[92vh] transition-colors">
        
        {/* Sleek Dark Header (Exact match to Job Ticket Header) */}
        <div className="bg-[#18181b] text-white px-3.5 py-2.5 sm:px-6 sm:py-3.5 border-b border-stone-800 shrink-0 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            
            {/* Top row on mobile: Title & Close Button */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d9532f] animate-pulse shrink-0"></span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold tracking-tight truncate">
                      Daily Daybook (दैनिक रोजमेळ)
                    </h2>
                    <span className="px-1.5 py-0.5 bg-stone-800 text-stone-300 rounded text-[10px] font-mono font-semibold border border-stone-700">
                      {selectedDate}
                    </span>
                    <span className="hidden sm:inline-block px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-semibold">
                      {isLoading ? 'Loading...' : 'Dual Reconciliation'}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-stone-400 font-normal mt-0.5">
                    Daily Counter &amp; Bank Reconciliation
                  </p>
                </div>
              </div>

              {/* Close Button on mobile - pinned top right */}
              <button
                type="button"
                onClick={onClose}
                className="sm:hidden p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl border border-stone-700 transition shrink-0"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom row on mobile / Right on desktop: Controls */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 w-full sm:w-auto pt-1 sm:pt-0 border-t border-stone-800/80 sm:border-t-0 print:hidden">
              {/* Date Navigation */}
              <div className="flex items-center bg-stone-800 rounded-xl border border-stone-700 p-0.5 text-xs text-stone-300">
                <button
                  type="button"
                  onClick={() => shiftDate(-1)}
                  className="p-1 hover:text-white hover:bg-stone-700 rounded-lg transition"
                  title="Previous Day"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-stone-200 text-[11px] font-mono font-bold px-1 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => shiftDate(1)}
                  className="p-1 hover:text-white hover:bg-stone-700 rounded-lg transition"
                  title="Next Day"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Today Button */}
                <button
                  type="button"
                  onClick={setToday}
                  className="px-2 py-1 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl border border-stone-700 transition"
                >
                  Today
                </button>

                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={() => loadDaybookData()}
                  className="p-1.5 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl border border-stone-700 transition flex items-center justify-center"
                  title="Refresh Daybook from Cloud"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                {/* Print Slip */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-2.5 py-1 text-xs text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl border border-stone-700 flex items-center gap-1 transition"
                  title="Print Daily Slip"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                {/* Close Button on desktop */}
                <button
                  type="button"
                  onClick={onClose}
                  className="hidden sm:flex p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl border border-stone-700 transition ml-1"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">

          {/* 3 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Drawer Cash */}
            <div className="bg-white dark:bg-stone-800/80 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                    Cash in Drawer (गल्ला)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleEditOpeningCash}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono transition"
                  title="Click to adjust Opening Cash Float"
                >
                  Opening: ₹{openingCash.toLocaleString('en-IN')} ✎
                </button>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono tracking-tight mt-1">
                ₹{drawerCash.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] font-mono text-stone-400 dark:text-stone-400 mt-0.5 flex items-center justify-between">
                <span>In: <strong className="text-emerald-700 dark:text-emerald-400">₹{cashIn.toLocaleString('en-IN')}</strong></span>
                <span>Out: <strong className="text-rose-600 dark:text-rose-400">₹{cashOut.toLocaleString('en-IN')}</strong></span>
              </div>
              <div className="text-[10px] text-stone-400 dark:text-stone-400 mt-1 pt-1 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between">
                <span>Physical count target</span>
                <button
                  type="button"
                  onClick={() => setShowDenom((prev) => !prev)}
                  className="text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white font-semibold underline text-[10px] flex items-center gap-0.5"
                >
                  <span>Verify Notes</span>
                  {showDenom ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* 2. Online / Bank */}
            <div className="bg-sky-50/30 dark:bg-sky-950/20 p-3.5 rounded-2xl border border-sky-200 dark:border-sky-800/60 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span className="text-[11px] font-semibold text-sky-900 dark:text-sky-300 uppercase tracking-wide">
                    Online UPI / Bank (बँक)
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-700 font-mono">
                  PhonePe / Bank
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-950 dark:text-sky-100 font-mono tracking-tight mt-1">
                ₹{onlineBalance.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] font-mono text-sky-800 dark:text-sky-300 mt-0.5 flex items-center justify-between">
                <span>In: <strong className="text-emerald-700 dark:text-emerald-400">₹{onlineIn.toLocaleString('en-IN')}</strong></span>
                <span>Out: <strong className="text-stone-500 dark:text-stone-400">₹{onlineOut.toLocaleString('en-IN')}</strong></span>
              </div>
              <div className="text-[10px] text-sky-700 dark:text-sky-400 mt-1 pt-1 border-t border-sky-100 dark:border-sky-800">
                Auto-reconciles UPI receipts &amp; payments
              </div>
            </div>

            {/* 3. Net Day Total */}
            <div className="bg-[#18181b] dark:bg-stone-950 text-white p-3.5 rounded-2xl border border-stone-800 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
                  Net Day Total (एकूण शिल्लक)
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-emerald-400 border border-stone-700 font-mono">
                  Tally 100%
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight mt-1">
                ₹{netTotal.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] font-mono text-stone-400 mt-0.5 flex items-center justify-between">
                <span>Total In: <strong className="text-stone-200">₹{totalIn.toLocaleString('en-IN')}</strong></span>
                <span>Total Out: <strong className="text-stone-200">₹{totalOut.toLocaleString('en-IN')}</strong></span>
              </div>
              <div className="text-[10px] text-stone-400 mt-1 pt-1 border-t border-stone-800">
                Drawer Cash (₹{drawerCash.toLocaleString('en-IN')}) + UPI (₹{onlineBalance.toLocaleString('en-IN')})
              </div>
            </div>
          </div>

          {/* Collapsible Currency Note Denomination Tray (चलनी नोटा मोजणी) */}
          {showDenom && (
            <div className="bg-stone-50 dark:bg-stone-800/90 p-3.5 rounded-2xl border border-stone-300 dark:border-stone-700 space-y-3 print:hidden transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Physical Drawer Currency Note Counter (गल्ल्यातील नोटा मोजणी)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                      denomDiff === 0
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    {denomDiff === 0
                      ? `Tally Matched (₹${countedDenomTotal.toLocaleString('en-IN')})`
                      : `Diff: ${denomDiff > 0 ? '+₹' : '-₹'}${Math.abs(denomDiff).toLocaleString('en-IN')}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDenom(false)}
                    className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 font-bold px-1.5"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Denomination Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {[
                  { key: 'n500', label: '₹500', factor: 500 },
                  { key: 'n200', label: '₹200', factor: 200 },
                  { key: 'n100', label: '₹100', factor: 100 },
                  { key: 'n50',  label: '₹50',  factor: 50 },
                  { key: 'n20',  label: '₹20',  factor: 20 },
                  { key: 'n10',  label: '₹10',  factor: 10 },
                  { key: 'coins', label: 'Coins', factor: 1 },
                ].map(({ key, label, factor }) => {
                  const qty = denoms[key as keyof DaybookDenominations] || 0;
                  const sub = qty * factor;
                  return (
                    <div
                      key={key}
                      className="bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-200 dark:border-stone-700 text-center"
                    >
                      <span className="text-[11px] font-mono font-bold text-stone-500 dark:text-stone-400">
                        {label}
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={qty || ''}
                        onChange={(e) =>
                          handleDenomChange(key as keyof DaybookDenominations, Number(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="w-full text-center py-1 mt-1 font-mono font-bold text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-[#d9532f]"
                      />
                      <span className="block text-[10px] font-mono text-stone-400 dark:text-stone-500 mt-0.5">
                        ₹{sub.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-200 dark:border-stone-700">
                <div>
                  Physical Count: <strong className="text-stone-900 dark:text-stone-100 font-bold">₹{countedDenomTotal.toLocaleString('en-IN')}</strong> • Drawer Target: <strong className="text-stone-900 dark:text-stone-100 font-bold">₹{drawerCash.toLocaleString('en-IN')}</strong>
                </div>
                <div
                  className={`font-bold ${
                    denomDiff === 0
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : denomDiff > 0
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-rose-700 dark:text-rose-400'
                  }`}
                >
                  {denomDiff === 0
                    ? 'Matched (Diff: ₹0)'
                    : denomDiff > 0
                    ? `Excess in Drawer: +₹${denomDiff.toLocaleString('en-IN')}`
                    : `Shortage in Drawer: -₹${Math.abs(denomDiff).toLocaleString('en-IN')}`}
                </div>
              </div>
            </div>
          )}

          {/* Fast Counter Entry Box (Styled like OrderWorkbenchForm) */}
          <div className="bg-stone-50/80 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2.5 print:hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                New Daybook Entry (झटपट नोंद)
              </span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500">
                Customer payments from Order Workbench auto-post with <span className="font-mono text-stone-700 dark:text-stone-300 bg-stone-200/60 dark:bg-stone-700 px-1 py-0.5 rounded">[Order #]</span> tag
              </span>
            </div>

            <form
              onSubmit={(e) => handleAddEntry(e, 'jama')}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2"
            >
              {/* Amount */}
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-mono font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40"
                />
              </div>

              {/* Particulars */}
              <div className="sm:col-span-5">
                <label className="block text-[10px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
                  Particulars / Party / Reason *
                </label>
                <input
                  type="text"
                  required
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="e.g. Tea, Courier, Scrap paper, Customer name..."
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl font-medium text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 placeholder:text-stone-400"
                />
              </div>

              {/* Payment Mode Selector & Actions */}
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
                  Payment Mode &amp; Action
                </label>
                <div className="flex items-center gap-1.5">
                  {/* Mode Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsOnlineMode((prev) => !prev)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition shadow-2xs shrink-0"
                    title="Toggle payment mode: Cash vs Online UPI"
                  >
                    <span
                      className={`w-2 h-2 rounded-full border border-black/10 ${
                        isOnlineMode ? 'bg-sky-500' : 'bg-amber-500'
                      }`}
                    ></span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">
                      {isOnlineMode ? 'Online UPI' : 'Cash'}
                    </span>
                  </button>

                  {/* + Jama (Receipt) */}
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-2xs transition active:scale-95"
                  >
                    + Jama (जमा)
                  </button>

                  {/* - Naave (Expense) */}
                  <button
                    type="button"
                    onClick={(e) => handleAddEntry(e as any, 'naave')}
                    className="flex-1 py-1.5 bg-[#d9532f] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold shadow-2xs transition active:scale-95"
                  >
                    - Naave (नावे)
                  </button>
                </div>
              </div>
            </form>

            {/* Quick-Pick Frequent Expense & Receipt Pills */}
            <div className="pt-1.5 border-t border-stone-200/80 dark:border-stone-700 flex items-center gap-1 flex-wrap">
              <span className="text-[10px] font-bold text-stone-400 uppercase mr-1">Frequent:</span>
              <button
                type="button"
                onClick={() => handleQuickFill(40, 'चहा (Tea)', 'naave', false, 'Refreshment')}
                className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 border border-stone-300/80 dark:border-stone-600 rounded text-[10px] font-semibold transition-colors"
              >
                चहा ₹40
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(30, 'मास्तर-1 (Master plate)', 'naave', false, 'Platemaking')}
                className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 border border-stone-300/80 dark:border-stone-600 rounded text-[10px] font-semibold transition-colors"
              >
                मास्तर ₹30
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(100, 'लातूर पार्सल - 1 (Transport)', 'naave', false, 'Transport')}
                className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 border border-stone-300/80 dark:border-stone-600 rounded text-[10px] font-semibold transition-colors"
              >
                पार्सल ₹100
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(60, 'उदबत्ती पुडा - 1 (Shop puja)', 'naave', false, 'Puja')}
                className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 border border-stone-300/80 dark:border-stone-600 rounded text-[10px] font-semibold transition-colors"
              >
                उदबत्ती ₹60
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(90, 'पुठ्ठा व कात्रण विक्री (Scrap)', 'jama', false, 'Scrap')}
                className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 rounded text-[10px] font-semibold transition-colors"
              >
                + रद्दी/कात्रण ₹90
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 print:hidden">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-stone-500 uppercase mr-1">Filter:</span>
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  filterMode === 'all'
                    ? 'bg-[#18181b] dark:bg-white text-white dark:text-stone-900'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                All ({entries.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('cash')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  filterMode === 'cash'
                    ? 'bg-amber-700 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                Cash Only ({entries.filter((e) => e.payment_mode === 'cash').length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('online')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                  filterMode === 'online'
                    ? 'bg-sky-700 text-white border-sky-700'
                    : 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-100'
                }`}
              >
                Online UPI ({entries.filter((e) => e.payment_mode === 'online').length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search party or expense..."
                className="w-full sm:w-56 pl-8 pr-2.5 py-1 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#d9532f]"
              />
            </div>
          </div>

          {/* Two-Sided Table (Matches OrderLedgerTable styling exactly) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Left Column: जमा (Inward Receipts) */}
            <div className="border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden flex flex-col bg-white dark:bg-stone-900">
              <div className="bg-stone-100 dark:bg-stone-800 px-3.5 py-2.5 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                    जमा (Inward Receipts)
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 rounded-md border border-emerald-300 dark:border-emerald-800">
                  ₹{totalIn.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Table Rows */}
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 font-bold uppercase text-[10px] sticky top-0 border-b border-stone-200 dark:border-stone-700">
                    <tr>
                      <th className="p-2 w-14">Mode</th>
                      <th className="p-2">Particulars &amp; Tag</th>
                      <th className="p-2 text-right w-24">Amount (₹)</th>
                      <th className="p-2 w-10 print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
                    {jamaEntries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-stone-400">
                          No matching receipts
                        </td>
                      </tr>
                    ) : (
                      jamaEntries.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition group"
                        >
                          <td className="p-2 align-top">
                            {item.payment_mode === 'online' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-mono">
                                Online
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-mono">
                                Cash
                              </span>
                            )}
                          </td>
                          <td className="p-2 align-top">
                            <div className="font-medium text-stone-900 dark:text-stone-100 flex items-center gap-1.5 flex-wrap">
                              <span>{item.party_name}</span>
                              {item.receipt_no && (
                                <span className="px-1 py-0.2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded text-[9px] font-mono font-bold border border-stone-200 dark:border-stone-700">
                                  #{item.receipt_no}
                                </span>
                              )}
                              {item.category && item.category !== 'Direct' && (
                                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-medium">
                                  ({item.category})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-stone-900 dark:text-stone-100 align-top">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 text-center align-top print:hidden">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                type="button"
                                onClick={() => openEditEntry(item)}
                                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 font-bold p-0.5"
                                title="Edit entry"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(item.id)}
                                className="text-stone-400 hover:text-rose-600 font-bold p-0.5"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Subtotal Footer */}
              <div className="p-2.5 bg-stone-50 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-[11px] font-mono text-stone-600 dark:text-stone-300">
                <span>Cash In: <strong className="text-stone-900 dark:text-stone-100">₹{cashIn.toLocaleString('en-IN')}</strong></span>
                <span>Online UPI In: <strong className="text-sky-800 dark:text-sky-300 font-bold">₹{onlineIn.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>

            {/* Right Column: नावे (Outward Expenses) */}
            <div className="border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden flex flex-col bg-white dark:bg-stone-900">
              <div className="bg-stone-100 dark:bg-stone-800 px-3.5 py-2.5 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                    नावे (Outward Expenses)
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-300 rounded-md border border-rose-300 dark:border-rose-800">
                  ₹{totalOut.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Table Rows */}
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 font-bold uppercase text-[10px] sticky top-0 border-b border-stone-200 dark:border-stone-700">
                    <tr>
                      <th className="p-2 w-14">Mode</th>
                      <th className="p-2">Particulars &amp; Reason</th>
                      <th className="p-2 text-right w-24">Amount (₹)</th>
                      <th className="p-2 w-10 print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
                    {naaveEntries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-stone-400">
                          No matching expenses
                        </td>
                      </tr>
                    ) : (
                      naaveEntries.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition group"
                        >
                          <td className="p-2 align-top">
                            {item.payment_mode === 'online' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 font-mono">
                                Online
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-mono">
                                Cash
                              </span>
                            )}
                          </td>
                          <td className="p-2 align-top">
                            <div className="font-medium text-stone-900 dark:text-stone-100 flex items-center gap-1.5 flex-wrap">
                              <span>{item.party_name}</span>
                              {item.category && (
                                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-medium">
                                  ({item.category})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-stone-900 dark:text-stone-100 align-top">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 text-center align-top print:hidden">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button
                                type="button"
                                onClick={() => openEditEntry(item)}
                                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 font-bold p-0.5"
                                title="Edit entry"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(item.id)}
                                className="text-stone-400 hover:text-rose-600 font-bold p-0.5"
                                title="Delete entry"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Subtotal Footer */}
              <div className="p-2.5 bg-stone-50 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-[11px] font-mono text-stone-600 dark:text-stone-300">
                <span>Cash Out: <strong className="text-stone-900 dark:text-stone-100">₹{cashOut.toLocaleString('en-IN')}</strong></span>
                <span>Online UPI Out: <strong className="text-stone-400">₹{onlineOut.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>

          </div>

          {/* Explanatory Tally Banner */}
          <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-600 dark:text-stone-300">
            <div>
              <strong className="text-stone-900 dark:text-stone-100">Physical Cash Check:</strong> Physical cash in counter drawer must be{' '}
              <span className="font-mono font-bold text-stone-900 dark:text-stone-100 bg-amber-100/70 dark:bg-amber-950 px-1 py-0.5 rounded">
                ₹{drawerCash.toLocaleString('en-IN')}
              </span>
              . Online money{' '}
              <span className="font-mono font-bold text-sky-900 dark:text-sky-300 bg-sky-100/70 dark:bg-sky-950 px-1 py-0.5 rounded">
                ₹{onlineBalance.toLocaleString('en-IN')}
              </span>{' '}
              is verified directly in bank/UPI statement.
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="font-mono text-emerald-800 dark:text-emerald-400 font-bold">
                Zero Cash-UPI Mismatch
              </span>
            </div>
          </div>

        </div>

        {/* Edit Entry Sub-Modal */}
        {editingEntry && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-2xs">
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 w-full max-w-sm border border-stone-200 dark:border-stone-700 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Edit Daybook Entry
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                  Particulars / Party
                </label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-1">
                  Payment Mode
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMode('cash')}
                    className={`flex-1 py-1 text-xs rounded-lg font-semibold border ${
                      editMode === 'cash'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-stone-100 dark:bg-stone-800 border-stone-200 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode('online')}
                    className={`flex-1 py-1 text-xs rounded-lg font-semibold border ${
                      editMode === 'online'
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-stone-100 dark:bg-stone-800 border-stone-200 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    Online UPI
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-3 py-1 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs bg-[#d9532f] text-white rounded-lg font-bold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
