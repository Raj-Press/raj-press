import React, { useState, useEffect } from 'react';
import { Order, Party } from '../../types';
import { DynamicSelect } from '../common/DynamicSelect';
import { InkColorPicker } from './InkColorPicker';
import {
  DEFAULT_PAPERS,
  DEFAULT_SIZES,
  DEFAULT_BINDINGS,
  DEFAULT_PRINTINGS,
  STATUS_PROGRESSION,
} from '../../lib/constants';
import { saveCustomPreset } from '../../lib/db';
import { X, Save, FileSpreadsheet } from 'lucide-react';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Partial<Order>) => Promise<void>;
  editingOrder?: Order | null;
  existingParties: Party[];
  customPresets: { category: string; value: string }[];
}

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingOrder,
  existingParties,
  customPresets,
}) => {
  if (!isOpen) return null;

  // Form State
  const [receiptNo, setReceiptNo] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [jobDetails, setJobDetails] = useState('');
  const [quantity, setQuantity] = useState<number | string>(100);

  const [paperPrimary, setPaperPrimary] = useState(DEFAULT_PAPERS[0]);
  const [paperSecondary, setPaperSecondary] = useState('');
  const [paperSize, setPaperSize] = useState(DEFAULT_SIZES[0]);
  const [bindingType, setBindingType] = useState(DEFAULT_BINDINGS[0]);
  const [inkColours, setInkColours] = useState<string[]>(['Black']);
  const [printingType, setPrintingType] = useState(DEFAULT_PRINTINGS[0]);
  const [printQty, setPrintQty] = useState('');
  const [numberingRange, setNumberingRange] = useState('');

  const [totalAmount, setTotalAmount] = useState<number | string>(0);
  const [advanceAmount, setAdvanceAmount] = useState<number | string>(0);
  const [promiseDate, setPromiseDate] = useState('');
  const [status, setStatus] = useState<Order['status']>('Pending');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Combine default options with custom saved presets
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

  // Initialize form when opening for edit or create
  useEffect(() => {
    if (editingOrder) {
      setReceiptNo(editingOrder.receipt_no || '');
      setOrderDate(editingOrder.order_date || new Date().toISOString().split('T')[0]);
      setPartyName(editingOrder.party_name || '');
      setPartyPhone(editingOrder.party_phone || '');
      setJobDetails(editingOrder.job_details || '');
      setQuantity(editingOrder.quantity || 1);
      setPaperPrimary(editingOrder.paper_primary || DEFAULT_PAPERS[0]);
      setPaperSecondary(editingOrder.paper_secondary || '');
      setPaperSize(editingOrder.paper_size || DEFAULT_SIZES[0]);
      setBindingType(editingOrder.binding_type || DEFAULT_BINDINGS[0]);
      setInkColours(editingOrder.ink_colours || ['Black']);
      setPrintingType(editingOrder.printing_type || DEFAULT_PRINTINGS[0]);
      setPrintQty(editingOrder.print_qty || '');
      setNumberingRange(editingOrder.numbering_range || '');
      setTotalAmount(editingOrder.total_amount || 0);
      setAdvanceAmount(editingOrder.advance_amount || 0);
      setPromiseDate(editingOrder.promise_date || '');
      setStatus(editingOrder.status || 'Pending');
      setNotes(editingOrder.notes || '');
    } else {
      // Defaults for brand new order
      setReceiptNo('');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setPartyName('');
      setPartyPhone('');
      setJobDetails('');
      setQuantity(100);
      setPaperPrimary(DEFAULT_PAPERS[0]);
      setPaperSecondary('');
      setPaperSize(DEFAULT_SIZES[0]);
      setBindingType(DEFAULT_BINDINGS[0]);
      setInkColours(['Black']);
      setPrintingType(DEFAULT_PRINTINGS[0]);
      setPrintQty('');
      setNumberingRange('');
      setTotalAmount(0);
      setAdvanceAmount(0);
      setPromiseDate('');
      setStatus('Pending');
      setNotes('');
    }
  }, [editingOrder, isOpen]);

  // Handle party name selection to autofill phone if known
  const handlePartyNameChange = (val: string) => {
    setPartyName(val);
    const found = existingParties.find(
      (p) => p.name.trim().toLowerCase() === val.trim().toLowerCase()
    );
    if (found && found.phone && !partyPhone) {
      setPartyPhone(found.phone);
    }
  };

  const calculatedBalance = Math.max(0, Number(totalAmount || 0) - Number(advanceAmount || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!partyName.trim()) {
      setValidationError('कृपया ग्राहकाचे नांव प्रविष्ट करा (Party Name is required).');
      return;
    }
    if (!jobDetails.trim()) {
      setValidationError('कृपया कामाचा तपशील प्रविष्ट करा (Job Details are required).');
      return;
    }
    if (inkColours.length === 0) {
      setValidationError('किमान १ शाई कलर निवडा (Please select at least 1 ink colour).');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save any custom inputs to presets
      if (paperPrimary && !DEFAULT_PAPERS.includes(paperPrimary)) {
        await saveCustomPreset('paper_primary', paperPrimary);
      }
      if (paperSecondary && !DEFAULT_PAPERS.includes(paperSecondary)) {
        await saveCustomPreset('paper_secondary', paperSecondary);
      }
      if (paperSize && !DEFAULT_SIZES.includes(paperSize)) {
        await saveCustomPreset('paper_size', paperSize);
      }
      if (bindingType && !DEFAULT_BINDINGS.includes(bindingType)) {
        await saveCustomPreset('binding_type', bindingType);
      }
      if (printingType && !DEFAULT_PRINTINGS.includes(printingType)) {
        await saveCustomPreset('printing_type', printingType);
      }

      await onSave({
        id: editingOrder?.id,
        receipt_no: receiptNo || undefined,
        order_date: orderDate,
        party_name: partyName.trim(),
        party_phone: partyPhone.trim() || null,
        job_details: jobDetails.trim(),
        quantity: Number(quantity) || 1,
        paper_primary: paperPrimary,
        paper_secondary: paperSecondary || null,
        paper_size: paperSize,
        binding_type: bindingType,
        ink_colours: inkColours,
        printing_type: printingType,
        print_qty: printQty.trim() || null,
        numbering_range: numberingRange.trim() || null,
        total_amount: Number(totalAmount) || 0,
        advance_amount: Number(advanceAmount) || 0,
        balance_due: calculatedBalance,
        promise_date: promiseDate || null,
        status,
        notes: notes.trim() || null,
      });

      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'त्रुटी आली, कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-600 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="text-lg font-bold">
                {editingOrder ? 'ऑर्डर दुरुस्त करा (Edit Order)' : 'नवीन ऑर्डर नोंदणी (New Order Entry)'}
              </h2>
              <p className="text-xs text-slate-300">
                राज प्रेस कमर्शियल प्रिंटिंग ऑर्डर बुक व जॉब तिकीट
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold">
              ⚠️ {validationError}
            </div>
          )}

          {/* Section 1: Order Meta & Party */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
            {/* Order Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                तारीख <span className="text-slate-400">(Order Date)</span> *
              </label>
              <input
                type="date"
                required
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Receipt No */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                पावती क्र. <span className="text-slate-400">(Receipt No)</span>
              </label>
              <input
                type="text"
                placeholder="उदा. RP-2026-0005 (ऑटो)"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>

            {/* Party Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                नांव / पार्टी <span className="text-slate-400">(Customer Name)</span> *
              </label>
              <input
                type="text"
                required
                list="party-suggestions"
                placeholder="उदा. श्री. आनंद कुलकर्णी / फर्म नांव"
                value={partyName}
                onChange={(e) => handlePartyNameChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-medium"
              />
              <datalist id="party-suggestions">
                {existingParties.map((p) => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </div>

            {/* Party Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                मोबाईल क्र. <span className="text-slate-400">(WhatsApp No.)</span>
              </label>
              <input
                type="tel"
                placeholder="उदा. 9822012345"
                value={partyPhone}
                onChange={(e) => setPartyPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>
          </div>

          {/* Section 2: Job Specification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                कामाचा तपशील <span className="text-slate-400">(Job Details / Description)</span> *
              </label>
              <input
                type="text"
                required
                placeholder="उदा. टॅक्स इन्व्हॉईस बिल बुक (1+2 प्रत) / लग्नपत्रिका / पावती पुस्तक"
                value={jobDetails}
                onChange={(e) => setJobDetails(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                नग संख्या <span className="text-slate-400">(Quantity)</span> *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-bold text-blue-900"
              />
            </div>
          </div>

          {/* Section 3: Paper, Size, Binding, Printing Dynamic Selects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DynamicSelect
              label="कागदाची जात (मुख्य)"
              labelEn="Primary Paper"
              options={papers}
              value={paperPrimary}
              onChange={setPaperPrimary}
              required
              onCustomAdd={(val) => saveCustomPreset('paper_primary', val)}
            />

            <DynamicSelect
              label="दुय्यम कागद (ऐच्छिक)"
              labelEn="Secondary Paper / Copy"
              options={papers}
              value={paperSecondary}
              onChange={setPaperSecondary}
              placeholder="-- लागू नाही (None) --"
              onCustomAdd={(val) => saveCustomPreset('paper_secondary', val)}
            />

            <DynamicSelect
              label="कागद साईज"
              labelEn="Paper Size"
              options={sizes}
              value={paperSize}
              onChange={setPaperSize}
              required
              onCustomAdd={(val) => saveCustomPreset('paper_size', val)}
            />

            <DynamicSelect
              label="बायडिंग प्रकार"
              labelEn="Binding Type"
              options={bindings}
              value={bindingType}
              onChange={setBindingType}
              required
              onCustomAdd={(val) => saveCustomPreset('binding_type', val)}
            />

            <DynamicSelect
              label="प्रिंटींग प्रकार"
              labelEn="Printing Type"
              options={printings}
              value={printingType}
              onChange={setPrintingType}
              required
              onCustomAdd={(val) => saveCustomPreset('printing_type', val)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                नंबरींग <span className="text-slate-400">(Numbering Range)</span>
              </label>
              <input
                type="text"
                placeholder="उदा. 0001 ते 5000 / नाही"
                value={numberingRange}
                onChange={(e) => setNumberingRange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>
          </div>

          {/* Section 4: Interactive Ink Colours Pill Selection */}
          <InkColorPicker
            selectedColors={inkColours}
            onChange={setInkColours}
          />

          {/* Section 5: Amounts & Calculations */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
            {/* Total Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                एकूण रक्कम ₹ <span className="text-slate-500">(Total Amount)</span> *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Advance Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                ॲडव्हान्स जमा ₹ <span className="text-slate-500">(Advance)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-base font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 text-emerald-800"
                />
              </div>
            </div>

            {/* Balance Due (Auto-Computed) */}
            <div>
              <label className="block text-xs font-bold text-rose-800 mb-1">
                येणे बाकी ₹ <span className="text-rose-600">(Balance Due)</span>
              </label>
              <div className="px-3 py-2 text-base font-extrabold bg-rose-100/80 border border-rose-300 rounded-lg text-rose-800">
                ₹{calculatedBalance.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Promise Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                वायदा तारीख <span className="text-slate-500">(Promise Date)</span>
              </label>
              <input
                type="date"
                value={promiseDate}
                onChange={(e) => setPromiseDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Section 6: Status & Special Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ऑर्डर स्थिती <span className="text-slate-400">(Job Status)</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Order['status'])}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-semibold text-slate-800"
              >
                {STATUS_PROGRESSION.map((st) => (
                  <option key={st} value={st}>
                    {st === 'Pending' && 'प्रलंबित (Pending)'}
                    {st === 'Printing' && 'प्रिंटिंग चालू (Printing)'}
                    {st === 'Binding' && 'बायडिंग चालू (Binding)'}
                    {st === 'Ready' && 'तयार (Ready for Delivery)'}
                    {st === 'Delivered' && 'डिलिव्हर झाले (Delivered)'}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                विशेष सूचना / नोट्स <span className="text-slate-400">(Special Instructions)</span>
              </label>
              <input
                type="text"
                placeholder="उदा. प्रूफ चेकिंग ग्राहकाकडून करून घेणे, कटिंग नीट करणे..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              रद्द करा (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-lg transition-all hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'सेव्ह होत आहे...' : 'ऑर्डर सेव्ह करा (Save Order)'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
