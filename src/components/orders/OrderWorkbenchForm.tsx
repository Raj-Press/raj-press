import React, { useState, useEffect, useMemo } from 'react';
import { Order, Party } from '../../types';
import {
  DEFAULT_PAPERS,
  DEFAULT_SIZES,
  DEFAULT_BINDINGS,
  DEFAULT_PRINTINGS,
  DEFAULT_ORDER_TYPES,
  INK_COLORS,
  FREQUENT_JOBS,
  STATUS_PROGRESSION,
} from '../../lib/constants';
import { saveCustomPreset } from '../../lib/db';
import { formatDDMMYYYY } from '../../lib/date';
import { SelectWithOther } from '../common/SelectWithOther';
import { Check, RotateCcw, AlertCircle, Copy } from 'lucide-react';

interface OrderWorkbenchFormProps {
  onSave: (order: Partial<Order>) => Promise<void>;
  editingOrder: Order | null;
  onCancelEdit: () => void;
  repeatSource?: Order | null;
  onCancelRepeat?: () => void;
  existingParties: Party[];
  customPresets: { category: string; value: string }[];
  nextReceiptNo: string;
}

export const OrderWorkbenchForm: React.FC<OrderWorkbenchFormProps> = React.memo(({
  onSave,
  editingOrder,
  onCancelEdit,
  repeatSource,
  onCancelRepeat,
  existingParties,
  customPresets,
  nextReceiptNo,
}) => {
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptNo, setReceiptNo] = useState(nextReceiptNo);
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [jobDetails, setJobDetails] = useState('');
  const [quantity, setQuantity] = useState<number | string>(10);

  const [paperPrimary, setPaperPrimary] = useState(DEFAULT_PAPERS[0]);
  const [paperSecondary, setPaperSecondary] = useState('None (Single Paper)');
  const [paperTertiary, setPaperTertiary] = useState('None (Single Paper)');
  const [paperSize, setPaperSize] = useState(DEFAULT_SIZES[2] || '8');
  const [bindingType, setBindingType] = useState(DEFAULT_BINDINGS[0] || 'Regzin');
  const [inkColours, setInkColours] = useState<string[]>(['Black']);

  const [printingType, setPrintingType] = useState(DEFAULT_PRINTINGS[1] || 'One-side');
  const [printQty, setPrintQty] = useState('');
  const [numberingRange, setNumberingRange] = useState('');
  const [orderType, setOrderType] = useState(DEFAULT_ORDER_TYPES[0] || 'General');
  const [isCustomOrderType, setIsCustomOrderType] = useState(false);
  const [patrikaCost, setPatrikaCost] = useState<number | string>('');
  const [notes, setNotes] = useState('');

  const [totalAmount, setTotalAmount] = useState<number | string>(1500);
  const [advanceAmount, setAdvanceAmount] = useState<number | string>(1000);
  const [promiseDate, setPromiseDate] = useState('');
  const [status, setStatus] = useState<Order['status']>('Pending');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [inkWarning, setInkWarning] = useState('');

  // Memoized options to prevent lag during rapid typing
  const papers = useMemo(() => Array.from(
    new Set([
      ...DEFAULT_PAPERS,
      ...customPresets.filter((p) => p.category === 'paper_primary' || p.category === 'paper_secondary' || p.category === 'paper_tertiary').map((p) => p.value),
    ])
  ), [customPresets]);

  const sizes = useMemo(() => Array.from(
    new Set([
      ...DEFAULT_SIZES,
      ...customPresets.filter((p) => p.category === 'paper_size').map((p) => p.value),
    ])
  ), [customPresets]);

  const bindings = useMemo(() => Array.from(
    new Set([
      ...DEFAULT_BINDINGS,
      ...customPresets.filter((p) => p.category === 'binding_type').map((p) => p.value),
    ])
  ), [customPresets]);

  const printings = useMemo(() => Array.from(
    new Set([
      ...DEFAULT_PRINTINGS,
      ...customPresets.filter((p) => p.category === 'printing_type').map((p) => p.value),
    ])
  ), [customPresets]);

  const orderTypes = useMemo(() => Array.from(
    new Set([
      ...DEFAULT_ORDER_TYPES,
      ...customPresets.filter((p) => p.category === 'order_type').map((p) => p.value),
    ])
  ), [customPresets]);

  const maxInksAllowed = printingType.toLowerCase().includes('triplicate') ? 3 : 2;

  useEffect(() => {
    if (!inkColours.includes('F/C') && inkColours.length > maxInksAllowed) {
      setInkColours((prev) => prev.slice(0, maxInksAllowed));
      setInkWarning(`Max ${maxInksAllowed} colours for ${printingType}`);
      setTimeout(() => setInkWarning(''), 3000);
    }
  }, [printingType, maxInksAllowed, inkColours]);

  useEffect(() => {
    if (editingOrder) {
      setDate(editingOrder.order_date || new Date().toISOString().split('T')[0]);
      setReceiptNo(editingOrder.receipt_no || '');
      setPartyName(editingOrder.party_name || '');
      setPartyPhone(editingOrder.party_phone || '');
      setJobDetails(editingOrder.job_details || '');
      setQuantity(editingOrder.quantity || 1);
      setPaperPrimary(editingOrder.paper_primary || DEFAULT_PAPERS[0]);
      setPaperSecondary(editingOrder.paper_secondary || 'None (Single Paper)');
      setPaperTertiary(editingOrder.paper_tertiary || 'None (Single Paper)');
      setPaperSize(editingOrder.paper_size || DEFAULT_SIZES[2] || '8');
      setBindingType(editingOrder.binding_type || DEFAULT_BINDINGS[0] || 'Regzin');
      setInkColours(editingOrder.ink_colours && editingOrder.ink_colours.length > 0 ? editingOrder.ink_colours : ['Black']);
      setPrintingType(editingOrder.printing_type || DEFAULT_PRINTINGS[1] || 'One-side');
      setPrintQty(editingOrder.print_qty || '');
      setNumberingRange(editingOrder.numbering_range || '');
      let ot = editingOrder.order_type || DEFAULT_ORDER_TYPES[0] || 'General';
      if (ot === 'Patrika / Wedding Cards') ot = 'Patrika';
      if (ot === 'सप्ताह / Saptah') ot = 'Saptah';
      setOrderType(ot);
      setIsCustomOrderType(!orderTypes.includes(ot) && ot !== 'General');
      setPatrikaCost(editingOrder.patrika_cost != null ? editingOrder.patrika_cost : '');
      setNotes(editingOrder.notes || '');
      setTotalAmount(editingOrder.total_amount || 0);
      setAdvanceAmount(editingOrder.advance_amount || 0);
      setPromiseDate(editingOrder.promise_date || '');
      setStatus(editingOrder.status || 'Pending');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setReceiptNo(nextReceiptNo);
      setPartyName('');
      setPartyPhone('');
      setJobDetails('');
      setQuantity(10);
      setPaperPrimary(DEFAULT_PAPERS[0]);
      setPaperSecondary('None (Single Paper)');
      setPaperTertiary('None (Single Paper)');
      setPaperSize(DEFAULT_SIZES[2] || '8');
      setBindingType(DEFAULT_BINDINGS[0] || 'Regzin');
      setInkColours(['Black']);
      setPrintingType('One-side');
      setPrintQty('');
      setNumberingRange('');
      setOrderType(DEFAULT_ORDER_TYPES[0] || 'General');
      setIsCustomOrderType(false);
      setPatrikaCost('');
      setNotes('');
      setTotalAmount(1500);
      setAdvanceAmount(1000);
      setPromiseDate('');
      setStatus('Pending');
    }
  }, [editingOrder, nextReceiptNo]);

  const total = Number(totalAmount || 0);
  const adv = Number(advanceAmount || 0);
  const balance = Math.max(0, total - adv);

  const isPatrikaOrder = orderType === 'Patrika';
  const isSaptahOrder = orderType === 'Saptah';
  const isStandardOrder = !isPatrikaOrder && !isSaptahOrder;

  const isDuplicate = isStandardOrder && printingType.toLowerCase().includes('duplicate');
  const isTriplicate = isStandardOrder && printingType.toLowerCase().includes('triplicate');

  const patrikaCostNum = Number(patrikaCost) || 0;
  const finalPriceNum = total;
  const patrikaProfit = finalPriceNum - patrikaCostNum;
  const patrikaMarginPercent = finalPriceNum > 0 ? ((patrikaProfit / finalPriceNum) * 100).toFixed(1) : '0';

  const toggleInk = (inkId: string) => {
    setInkWarning('');

    if (inkId === 'F/C') {
      setInkColours(['F/C']);
      return;
    }

    let current = inkColours.filter((c) => c !== 'F/C');

    if (current.includes(inkId)) {
      current = current.filter((c) => c !== inkId);
      if (current.length === 0) {
        current = ['Black'];
      }
      setInkColours(current);
    } else {
      if (current.length >= maxInksAllowed) {
        current = [...current.slice(1), inkId];
        setInkWarning(`Max ${maxInksAllowed} colours allowed. Replaced earliest.`);
        setTimeout(() => setInkWarning(''), 3000);
      } else {
        current.push(inkId);
      }
      setInkColours(current);
    }
  };

  const handleFrequentJobClick = (job: string) => {
    setJobDetails(job);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!partyName.trim()) {
      setErrorMsg('Please enter Customer / Party Name.');
      return;
    }
    if (!jobDetails.trim()) {
      setErrorMsg('Please enter Job Details.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalPaperPrimary = paperPrimary;
      let finalPaperSecondary: string | null = null;
      let finalPaperTertiary: string | null = null;
      let finalPaperSize = paperSize;
      let finalBinding = bindingType;
      let finalPrinting = printingType;
      let finalPrintQty: string | null = printQty.trim() || null;
      let finalNumbering: string | null = numberingRange.trim() || null;

      if (isPatrikaOrder) {
        finalPaperPrimary = 'Patrika Card';
        finalPaperSecondary = null;
        finalPaperTertiary = null;
        finalPaperSize = 'Card';
        finalBinding = 'None';
        finalPrinting = 'Card';
        finalNumbering = null;
      } else if (isSaptahOrder) {
        finalPaperPrimary = paperPrimary;
        finalPaperSecondary = null;
        finalPaperTertiary = null;
        finalPaperSize = 'Standard';
        finalBinding = 'None';
        finalPrinting = 'One-side';
        finalPrintQty = null;
        finalNumbering = null;
      } else {
        finalPaperPrimary = paperPrimary;
        finalPaperSecondary = (isDuplicate || isTriplicate) && paperSecondary !== 'None (Single Paper)' && paperSecondary !== 'None' ? paperSecondary : null;
        finalPaperTertiary = isTriplicate && paperTertiary !== 'None (Single Paper)' && paperTertiary !== 'None' ? paperTertiary : null;
      }

      await onSave({
        id: editingOrder?.id,
        receipt_no: receiptNo || nextReceiptNo,
        order_date: date,
        party_name: partyName.trim(),
        party_phone: partyPhone.trim() || null,
        job_details: jobDetails.trim(),
        quantity: Number(quantity) || 1,
        paper_primary: finalPaperPrimary,
        paper_secondary: finalPaperSecondary,
        paper_tertiary: finalPaperTertiary,
        paper_size: finalPaperSize,
        binding_type: finalBinding,
        ink_colours: inkColours,
        printing_type: finalPrinting,
        print_qty: finalPrintQty,
        numbering_range: finalNumbering,
        order_type: orderType,
        patrika_cost: isPatrikaOrder && patrikaCost !== '' ? Number(patrikaCost) : null,
        total_amount: total,
        advance_amount: adv,
        balance_due: balance,
        promise_date: promiseDate || null,
        status,
        notes: notes.trim() || null,
      });

      if (!editingOrder) {
        setPartyName('');
        setPartyPhone('');
        setJobDetails('');
        setQuantity(10);
        setPaperPrimary(DEFAULT_PAPERS[0]);
        setPaperSecondary('None (Single Paper)');
        setPaperTertiary('None (Single Paper)');
        setPrintQty('');
        setNumberingRange('');
        setOrderType(DEFAULT_ORDER_TYPES[0] || 'General');
        setIsCustomOrderType(false);
        setPatrikaCost('');
        setNotes('');
        setTotalAmount(0);
        setAdvanceAmount(0);
        setPromiseDate('');
        setStatus('Pending');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-stone-900 rounded-3xl shadow-sm border border-stone-200/90 dark:border-stone-800 overflow-hidden transition-colors">
      {/* Sleek Dark Header */}
      <div className="bg-[#18181b] dark:bg-black text-white px-4 py-3 sm:px-4 sm:py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {repeatSource ? (
              <Copy className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-[#d9532f] animate-pulse"></span>
            )}
            <h2 className="text-sm sm:text-base font-bold tracking-tight">
              {editingOrder
                ? `Edit Ticket #${editingOrder.receipt_no}`
                : repeatSource
                ? `Repeat Order #${repeatSource.receipt_no}`
                : 'New Job Ticket'}
            </h2>
          </div>
          {(editingOrder || repeatSource) && (
            <button
              type="button"
              onClick={editingOrder ? onCancelEdit : onCancelRepeat}
              className="flex items-center gap-1 text-[11px] text-stone-300 hover:text-white bg-stone-800 px-2 py-0.5 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Cancel
            </button>
          )}
        </div>
        <p className="text-[11px] text-stone-400 mt-0.5 font-normal">
          {repeatSource
            ? `Copied specs from #${repeatSource.receipt_no}. Edit and save as a new ticket.`
            : 'Fast counter entry workbench'}
        </p>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 space-y-3">
        {errorMsg && (
          <div className="p-2 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Row 1: Date & Receipt No. */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                Date
              </label>
              <span className="text-[10px] font-mono font-bold text-[#d9532f]">
                {formatDDMMYYYY(date)}
              </span>
            </div>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
              Receipt No.
            </label>
            <input
              type="text"
              required
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              placeholder="107"
              className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-bold font-mono focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40"
            />
          </div>
        </div>

        {/* Row 2: Party / Customer Name & Mobile No. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
              Party / Customer Name *
            </label>
            <input
              type="text"
              required
              list="customer-datalist"
              placeholder="Customer or Firm Name"
              value={partyName}
              onChange={(e) => {
                const val = e.target.value;
                setPartyName(val);
                const matched = existingParties.find(
                  (p) => p.name.toLowerCase() === val.toLowerCase()
                );
                if (matched && matched.phone && !partyPhone) {
                  setPartyPhone(matched.phone);
                }
              }}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 placeholder:text-stone-400"
            />
            <datalist id="customer-datalist">
              {existingParties.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
              Mobile No.
            </label>
            <input
              type="tel"
              placeholder="e.g. 9822011223"
              value={partyPhone}
              onChange={(e) => setPartyPhone(e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium font-mono focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Row 3: Job Details & Qty + Frequent Job Pills */}
        <div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Job Details *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Delivery Challan, Bill Book, Receipt Book"
                value={jobDetails}
                onChange={(e) => setJobDetails(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-2 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-bold text-center focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40"
              />
            </div>
          </div>

          {/* Quick-pick Frequent Job Pills (Highlighter box in light green colour) */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {FREQUENT_JOBS.map((job) => (
              <button
                key={job}
                type="button"
                onClick={() => handleFrequentJobClick(job)}
                className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/80 rounded text-[10px] font-semibold transition-colors"
              >
                {job}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3.5: Order Type Bubble Selector */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300">
              Order Type
            </label>
            <span className="text-xs font-bold text-[#d9532f] dark:text-[#f97316]">
              {orderType || 'General'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {orderTypes.map((type) => {
              const isSelected = orderType === type && !isCustomOrderType;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setIsCustomOrderType(false);
                    setOrderType(type);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-white shadow-2xs'
                      : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 border border-black/10 ${
                      isSelected
                        ? 'bg-amber-400'
                        : 'bg-stone-300 dark:bg-stone-600'
                    }`}
                  />
                  <span>{type}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setIsCustomOrderType(true);
                if (orderTypes.includes(orderType)) {
                  setOrderType('');
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all border ${
                isCustomOrderType
                  ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-white shadow-2xs'
                  : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 border border-black/10 ${
                  isCustomOrderType
                    ? 'bg-amber-400'
                    : 'bg-stone-300 dark:bg-stone-600'
                }`}
              />
              <span>Other(s)</span>
            </button>
          </div>

          {isCustomOrderType && (
            <div className="mt-2 flex gap-1.5">
              <input
                type="text"
                autoFocus
                placeholder="Type custom order type..."
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (orderType.trim()) {
                      saveCustomPreset('order_type', orderType.trim());
                      setIsCustomOrderType(false);
                    }
                  }
                }}
                className="flex-1 px-2.5 py-1 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40"
              />
              {orderType.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    saveCustomPreset('order_type', orderType.trim());
                    setIsCustomOrderType(false);
                  }}
                  className="px-3 py-1 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* CONDITIONAL SPECIFICATIONS BASED ON ORDER TYPE           */}
        {/* ======================================================== */}

        {/* -------------------------------------------------------- */}
        {/* MODE 1: PATRIKA ORDER                                    */}
        {/* Display: Patrika Cost & Profit, Inks, Copies/Imp, Remarks */}
        {/* -------------------------------------------------------- */}
        {isPatrikaOrder && (
          <div className="space-y-3">
            {/* Patrika Pricing & Profit Analysis */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 rounded-2xl p-2.5 sm:p-3 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  Patrika Cost & Profit
                </span>
                {patrikaCostNum > 0 && finalPriceNum > 0 && (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {patrikaMarginPercent}% Margin
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                    Card Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={patrikaCost}
                    onChange={(e) => setPatrikaCost(e.target.value)}
                    placeholder="e.g. 3000"
                    className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-bold bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                    Final Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="e.g. 5500"
                    className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-bold bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 font-mono"
                  />
                </div>
              </div>

              {/* Horizontal Net Profit Strip */}
              <div
                className={`px-3 py-1.5 rounded-xl border flex items-center justify-between font-mono ${
                  patrikaCostNum > 0 && patrikaProfit >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : patrikaCostNum > 0 && patrikaProfit < 0
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                    : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-amber-200 dark:border-stone-700'
                }`}
              >
                <span className="text-[11px] font-sans font-semibold text-stone-700 dark:text-stone-300">
                  Net Profit
                </span>
                <span className="text-sm font-black tracking-tight">
                  {patrikaCostNum > 0
                    ? `${patrikaProfit >= 0 ? '+' : ''}₹${patrikaProfit.toLocaleString('en-IN')}`
                    : '₹0'}
                </span>
              </div>
            </div>

            {/* Ink Colour Pill Swatches */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                  Ink Colour (Max {maxInksAllowed})
                </label>
                <span className="text-xs font-bold text-[#d9532f]">
                  {inkColours.join(', ')}
                </span>
              </div>

              {inkWarning && (
                <div className="flex items-center gap-1 p-1 mb-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] rounded-lg">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{inkWarning}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {INK_COLORS.map((ink) => {
                  const isSelected = inkColours.includes(ink.id);
                  return (
                    <button
                      key={ink.id}
                      type="button"
                      onClick={() => toggleInk(ink.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all border ${
                        isSelected
                          ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-white shadow-2xs'
                          : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0 border border-black/10"
                        style={{ background: ink.hex }}
                      />
                      <span>{ink.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Copies / Impressions */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Copies / Impressions
              </label>
              <input
                type="text"
                placeholder="e.g. 500"
                value={printQty}
                onChange={(e) => setPrintQty(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40"
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Remarks / Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Proof checking, card design, delivery notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 placeholder:text-stone-400"
              />
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* MODE 2: SAPTAH ORDER                                     */}
        {/* Display: Paper Type (Primary only), Inks, Remarks        */}
        {/* -------------------------------------------------------- */}
        {isSaptahOrder && (
          <div className="space-y-3">
            {/* Primary Paper only */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Paper Type
              </label>
              <SelectWithOther
                options={papers}
                value={paperPrimary}
                onChange={setPaperPrimary}
                placeholder=""
                onCustomSave={(val) => saveCustomPreset('paper_primary', val)}
              />
            </div>

            {/* Ink Colour Pill Swatches */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                  Ink Colour (Max {maxInksAllowed})
                </label>
                <span className="text-xs font-bold text-[#d9532f]">
                  {inkColours.join(', ')}
                </span>
              </div>

              {inkWarning && (
                <div className="flex items-center gap-1 p-1 mb-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] rounded-lg">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{inkWarning}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {INK_COLORS.map((ink) => {
                  const isSelected = inkColours.includes(ink.id);
                  return (
                    <button
                      key={ink.id}
                      type="button"
                      onClick={() => toggleInk(ink.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all border ${
                        isSelected
                          ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-white shadow-2xs'
                          : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0 border border-black/10"
                        style={{ background: ink.hex }}
                      />
                      <span>{ink.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Remarks / Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Saptah booklet instructions, dates, program details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 placeholder:text-stone-400"
              />
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* MODE 3: STANDARD / GENERAL ORDERS                        */}
        {/* Printing Type, Dynamic Paper Grid, Size & Binding, Inks, */}
        {/* Copies & Numbering, Remarks                              */}
        {/* -------------------------------------------------------- */}
        {isStandardOrder && (
          <div className="space-y-3">
            {/* Printing */}
            <div className="w-full min-w-0">
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Printing
              </label>
              <SelectWithOther
                options={printings}
                value={printingType}
                onChange={setPrintingType}
                placeholder=""
                onCustomSave={(val) => saveCustomPreset('printing_type', val)}
              />
            </div>

            {/* Dynamic Paper Type Grid: 1 col for One-side/F/b, 2 cols for Duplicate, 3 cols for Triplicate */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                  Paper Type
                </label>
                {isTriplicate ? (
                  <span className="text-[10px] text-stone-400">
                    Triplicate (3 paper layers)
                  </span>
                ) : isDuplicate ? (
                  <span className="text-[10px] text-stone-400">
                    Duplicate (2 paper layers)
                  </span>
                ) : null}
              </div>

              <div
                className={`grid gap-2 ${
                  isTriplicate
                    ? 'grid-cols-1 sm:grid-cols-3'
                    : isDuplicate
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1'
                }`}
              >
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                    Primary Paper
                  </span>
                  <SelectWithOther
                    options={papers}
                    value={paperPrimary}
                    onChange={setPaperPrimary}
                    placeholder=""
                    onCustomSave={(val) => saveCustomPreset('paper_primary', val)}
                  />
                </div>

                {(isDuplicate || isTriplicate) && (
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                      + Secondary Layer
                    </span>
                    <SelectWithOther
                      options={papers}
                      value={paperSecondary}
                      onChange={setPaperSecondary}
                      allowNone
                      noneLabel="None (Single Paper)"
                      placeholder=""
                      onCustomSave={(val) => saveCustomPreset('paper_secondary', val)}
                    />
                  </div>
                )}

                {isTriplicate && (
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-0.5">
                      + Tertiary Layer
                    </span>
                    <SelectWithOther
                      options={papers}
                      value={paperTertiary}
                      onChange={setPaperTertiary}
                      allowNone
                      noneLabel="None (Single Paper)"
                      placeholder=""
                      onCustomSave={(val) => saveCustomPreset('paper_tertiary', val)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Size & Binding */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  Size
                </label>
                <SelectWithOther
                  options={sizes}
                  value={paperSize}
                  onChange={setPaperSize}
                  placeholder=""
                  onCustomSave={(val) => saveCustomPreset('paper_size', val)}
                />
              </div>

              <div className="min-w-0">
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  Binding
                </label>
                <SelectWithOther
                  options={bindings}
                  value={bindingType}
                  onChange={setBindingType}
                  placeholder=""
                  onCustomSave={(val) => saveCustomPreset('binding_type', val)}
                />
              </div>
            </div>

            {/* Ink Colour Pill Swatches */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300">
                  Ink Colour (Max {maxInksAllowed})
                </label>
                <span className="text-xs font-bold text-[#d9532f]">
                  {inkColours.join(', ')}
                </span>
              </div>

              {inkWarning && (
                <div className="flex items-center gap-1 p-1 mb-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[10px] rounded-lg">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{inkWarning}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {INK_COLORS.map((ink) => {
                  const isSelected = inkColours.includes(ink.id);
                  return (
                    <button
                      key={ink.id}
                      type="button"
                      onClick={() => toggleInk(ink.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all border ${
                        isSelected
                          ? 'bg-stone-900 text-white border-stone-900 dark:bg-stone-100 dark:text-stone-900 dark:border-white shadow-2xs'
                          : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0 border border-black/10"
                        style={{ background: ink.hex }}
                      />
                      <span>{ink.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Copies/Imp. and Numbering */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  Copies / Impressions
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1000"
                  value={printQty}
                  onChange={(e) => setPrintQty(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  Numbering
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 to 1000"
                  value={numberingRange}
                  onChange={(e) => setNumberingRange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 font-mono"
                />
              </div>
            </div>

            {/* Remarks Section */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Remarks / Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Proof checking, cutting, finishing notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 placeholder:text-stone-400"
              />
            </div>
          </div>
        )}

        {/* Row 9: Dark Financial & Schedule Box */}
        <div className="bg-[#18181b] dark:bg-black text-white rounded-2xl p-3 sm:p-3.5 space-y-2.5 border border-stone-800">
          {/* Amounts */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-stone-400 block mb-1">
                {isPatrikaOrder ? 'Final Price (₹)' : 'Total (₹)'}
              </span>
              <input
                type="number"
                min="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full px-2 py-1 text-xs sm:text-sm font-bold bg-stone-800 dark:bg-stone-900 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-[#d9532f]"
              />
            </div>

            <div>
              <span className="text-[10px] text-stone-400 block mb-1">
                Advance (₹)
              </span>
              <input
                type="number"
                min="0"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                className="w-full px-2 py-1 text-xs sm:text-sm font-bold bg-stone-800 dark:bg-stone-900 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-[#d9532f]"
              />
            </div>

            <div>
              <span className="text-[10px] text-stone-400 block mb-1">
                Balance (₹)
              </span>
              <div
                className={`px-2 py-1 text-xs sm:text-sm font-extrabold rounded-lg text-center font-mono ${
                  balance > 0 ? 'bg-amber-950/80 text-amber-400 border border-amber-800' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                }`}
              >
                ₹{balance.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Promise Date & Job Status */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-800">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] text-stone-400">
                  Promise / Delivery Date
                </span>
                {promiseDate && (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    {formatDDMMYYYY(promiseDate)}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={promiseDate}
                onChange={(e) => setPromiseDate(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-stone-800 dark:bg-stone-900 border border-stone-700 rounded-lg text-stone-200 focus:outline-none focus:border-[#d9532f]"
              />
            </div>

            <div>
              <span className="text-[10px] text-stone-400 block mb-0.5">
                Status
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Order['status'])}
                className="w-full px-2 py-1 text-xs bg-stone-800 dark:bg-stone-900 border border-stone-700 rounded-lg text-stone-200 font-semibold focus:outline-none focus:border-[#d9532f]"
              >
                {STATUS_PROGRESSION.map((st) => (
                  <option key={st} value={st}>
                    {st === 'Pending' ? 'Pending' : st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Big Vibrant Save Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 sm:py-3 bg-[#d9532f] hover:bg-[#c2410c] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? (
            'Saving...'
          ) : editingOrder ? (
            <>
              <Check className="w-4 h-4" /> Update Job Ticket
            </>
          ) : (
            '+ Save Job Ticket to Order Book'
          )}
        </button>
      </form>
    </div>
  );
});
