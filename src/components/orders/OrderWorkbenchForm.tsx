import React, { useState, useEffect } from 'react';
import { Order, Party } from '../../types';
import {
  DEFAULT_PAPERS,
  DEFAULT_SIZES,
  DEFAULT_BINDINGS,
  DEFAULT_PRINTINGS,
  DEFAULT_ORDER_TYPES,
  INK_COLORS,
  FREQUENT_PARTIES,
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

export const OrderWorkbenchForm: React.FC<OrderWorkbenchFormProps> = ({
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
  const [paperSize, setPaperSize] = useState(DEFAULT_SIZES[2] || '8');
  const [bindingType, setBindingType] = useState(DEFAULT_BINDINGS[0] || 'Regzin');
  const [inkColours, setInkColours] = useState<string[]>(['Black']);

  const [printingType, setPrintingType] = useState(DEFAULT_PRINTINGS[1] || 'One-side');
  const [printQty, setPrintQty] = useState('');
  const [numberingRange, setNumberingRange] = useState('');
  const [orderType, setOrderType] = useState(DEFAULT_ORDER_TYPES[0] || 'General');
  const [notes, setNotes] = useState('');

  const [totalAmount, setTotalAmount] = useState<number | string>(1500);
  const [advanceAmount, setAdvanceAmount] = useState<number | string>(1000);
  const [promiseDate, setPromiseDate] = useState('');
  const [status, setStatus] = useState<Order['status']>('Pending');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [inkWarning, setInkWarning] = useState('');

  // Combined options
  const papers = Array.from(
    new Set([
      ...DEFAULT_PAPERS,
      ...customPresets.filter((p) => p.category === 'paper_primary' || p.category === 'paper_secondary').map((p) => p.value),
    ])
  );

  const sizes = Array.from(
    new Set([
      ...DEFAULT_SIZES,
      ...customPresets.filter((p) => p.category === 'paper_size').map((p) => p.value),
    ])
  );

  const bindings = Array.from(
    new Set([
      ...DEFAULT_BINDINGS,
      ...customPresets.filter((p) => p.category === 'binding_type').map((p) => p.value),
    ])
  );

  const printings = Array.from(
    new Set([
      ...DEFAULT_PRINTINGS,
      ...customPresets.filter((p) => p.category === 'printing_type').map((p) => p.value),
    ])
  );

  const orderTypes = Array.from(
    new Set([
      ...DEFAULT_ORDER_TYPES,
      ...customPresets.filter((p) => p.category === 'order_type').map((p) => p.value),
    ])
  );

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
      setPaperSize(editingOrder.paper_size || DEFAULT_SIZES[2] || '8');
      setBindingType(editingOrder.binding_type || DEFAULT_BINDINGS[0] || 'Regzin');
      setInkColours(editingOrder.ink_colours && editingOrder.ink_colours.length > 0 ? editingOrder.ink_colours : ['Black']);
      setPrintingType(editingOrder.printing_type || DEFAULT_PRINTINGS[1] || 'One-side');
      setPrintQty(editingOrder.print_qty || '');
      setNumberingRange(editingOrder.numbering_range || '');
      setOrderType(editingOrder.order_type || DEFAULT_ORDER_TYPES[0] || 'General');
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
      setPaperSize(DEFAULT_SIZES[2] || '8');
      setBindingType(DEFAULT_BINDINGS[0] || 'Regzin');
      setInkColours(['Black']);
      setPrintingType('One-side');
      setPrintQty('');
      setNumberingRange('');
      setOrderType(DEFAULT_ORDER_TYPES[0] || 'General');
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

  const handleFrequentPartyClick = (frequent: string) => {
    setPartyName(frequent);
    const found = existingParties.find((p) => p.name.includes(frequent.split(' ')[0]));
    if (found && found.phone) {
      setPartyPhone(found.phone);
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
      await onSave({
        id: editingOrder?.id,
        receipt_no: receiptNo || nextReceiptNo,
        order_date: date,
        party_name: partyName.trim(),
        party_phone: partyPhone.trim() || null,
        job_details: jobDetails.trim(),
        quantity: Number(quantity) || 1,
        paper_primary: paperPrimary,
        paper_secondary: paperSecondary === 'None (Single Paper)' || paperSecondary === 'None' ? null : paperSecondary,
        paper_size: paperSize,
        binding_type: bindingType,
        ink_colours: inkColours,
        printing_type: printingType,
        print_qty: printQty.trim() || null,
        numbering_range: numberingRange.trim() || null,
        order_type: orderType,
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
        setPrintQty('');
        setNumberingRange('');
        setOrderType(DEFAULT_ORDER_TYPES[0] || 'General');
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
                : 'New Job Ticket • नवीन ऑर्डर'}
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
                Date (तारीख)
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
              Receipt No. (पावती नं.)
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

        {/* Row 2: Party / Customer Name + Frequent Pills */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300">
              Party / Customer Name (नांव) *
            </label>
            <span className="text-[10px] text-stone-400">
              Pick frequent
            </span>
          </div>
          <input
            type="text"
            required
            list="customer-datalist"
            placeholder="उदा. ग्राहक किंवा फर्मचे नांव (Customer / Firm Name)"
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 placeholder:text-stone-400"
          />
          <datalist id="customer-datalist">
            {existingParties.map((p) => (
              <option key={p.id} value={p.name} />
            ))}
          </datalist>

          {/* Quick-pick Frequent Party Pills */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {FREQUENT_PARTIES.map((party) => (
              <button
                key={party}
                type="button"
                onClick={() => handleFrequentPartyClick(party)}
                className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded text-[10px] font-medium transition-colors border border-stone-200/60 dark:border-stone-700"
              >
                {party}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Job Details & Qty + Frequent Job Pills */}
        <div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Job Details (कामाचा तपशील) *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. बिल बुक, लेटरहेड, चलन (Job / Item Description)"
                value={jobDetails}
                onChange={(e) => setJobDetails(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 placeholder:text-stone-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                Qty (नग) *
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

        {/* Row 3.5: Order Type Dropdown */}
        <div className="w-full min-w-0">
          <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
            Order Type (ऑर्डर प्रकार)
          </label>
          <SelectWithOther
            options={orderTypes}
            value={orderType}
            onChange={setOrderType}
            placeholder="Select Order Type"
            onCustomSave={(val) => saveCustomPreset('order_type', val)}
          />
        </div>

        {/* Row 4: Paper Type (Primary + Secondary) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300">
              Paper Type (कागदाची जात)
            </label>
            <span className="text-[10px] text-stone-400">
              Combine 2 if multi-part
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          </div>
        </div>

        {/* Row 5: Size & Binding */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="min-w-0">
            <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
              Size (साईज)
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
              Binding (बायडिंग)
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

        {/* Row 6: Ink Colour Pill Swatches */}
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

        {/* Row 7A: Printing */}
        <div className="w-full min-w-0">
          <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
            Printing (प्रिंटींग)
          </label>
          <SelectWithOther
            options={printings}
            value={printingType}
            onChange={setPrintingType}
            placeholder=""
            onCustomSave={(val) => saveCustomPreset('printing_type', val)}
          />
        </div>

        {/* Row 7B: Copies/Imp. and Numbering */}
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
              Numbering (नंबरींग)
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

        {/* Row 8: Remarks Section */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
            Remarks / Instructions (नोंदी / सूचना)
          </label>
          <input
            type="text"
            placeholder="e.g. प्रूफ तपासणी, कटिंग फिनिशिंग..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-1.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl font-medium focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40 placeholder:text-stone-400"
          />
        </div>

        {/* Row 9: Dark Financial & Schedule Box */}
        <div className="bg-[#18181b] dark:bg-black text-white rounded-2xl p-3 sm:p-3.5 space-y-2.5 border border-stone-800">
          {/* Amounts */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-stone-400 block mb-1">
                Total (₹)
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
};
