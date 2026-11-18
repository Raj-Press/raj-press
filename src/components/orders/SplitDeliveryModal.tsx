import React, { useState } from 'react';
import { Order } from '../../types';
import { formatDDMMYYYY } from '../../lib/date';
import { Truck, X, Plus, Trash2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

interface SplitDeliveryModalProps {
  order: Order;
  onClose: () => void;
  onSaveDispatch: (orderId: string, dispatch: { dispatch_date: string; quantity: number; notes?: string }) => Promise<void>;
  onRemoveDispatch: (orderId: string, dispatchId: string) => Promise<void>;
}

export const SplitDeliveryModal: React.FC<SplitDeliveryModalProps> = ({
  order,
  onClose,
  onSaveDispatch,
  onRemoveDispatch,
}) => {
  const dispatches = order.dispatches || [];
  const totalDelivered = dispatches.reduce((sum, d) => sum + Number(d.quantity || 0), 0);
  const remainingQty = Math.max(0, order.quantity - totalDelivered);
  const isComplete = totalDelivered >= order.quantity && order.quantity > 0;
  const progressPercent = Math.min(100, Math.round((totalDelivered / Math.max(1, order.quantity)) * 100));

  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [dispatchQty, setDispatchQty] = useState<number | string>(remainingQty > 0 ? remainingQty : '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(dispatchQty);
    if (!qty || qty <= 0) {
      setErrorMsg('Please enter a valid quantity (> 0)');
      return;
    }
    if (qty > remainingQty) {
      setErrorMsg(`Dispatch quantity cannot exceed remaining balance (Max allowed: ${remainingQty.toLocaleString('en-IN')})`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSaveDispatch(order.id, {
        dispatch_date: dispatchDate,
        quantity: qty,
        notes: notes.trim() || undefined,
      });
      setNotes('');
      // If there's still balance left, update default
      const newRemaining = remainingQty - qty;
      setDispatchQty(newRemaining > 0 ? newRemaining : '');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error recording dispatch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickQty = (amount: number) => {
    setDispatchQty(Math.min(remainingQty, Math.max(1, amount)));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh] sm:max-h-[92vh] transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-stone-900 dark:bg-black text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-tight">
                Split Delivery Tracking
              </h2>
              <p className="text-xs text-stone-400 font-mono">
                Receipt #{order.receipt_no} • {order.party_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* Job summary & Progress */}
          <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 space-y-2.5">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block">
                  Job Details
                </span>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {order.job_details}
                </span>
              </div>
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700 rounded text-xs font-bold">
                Special Order
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 block font-semibold">Total Quantity</span>
                <span className="text-sm sm:text-base font-bold font-mono text-stone-900 dark:text-stone-100">
                  {order.quantity.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 bg-sky-50 dark:bg-sky-950/50 rounded-xl border border-sky-200 dark:border-sky-800">
                <span className="text-[10px] text-sky-600 dark:text-sky-400 block font-semibold">Delivered (Sent)</span>
                <span className="text-sm sm:text-base font-bold font-mono text-sky-700 dark:text-sky-300">
                  {totalDelivered.toLocaleString('en-IN')}
                </span>
              </div>
              <div className={`p-2 rounded-xl border ${
                remainingQty === 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
              }`}>
                <span className={`text-[10px] block font-semibold ${
                  remainingQty === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                }`}>
                  Remaining Qty
                </span>
                <span className={`text-sm sm:text-base font-bold font-mono ${
                  remainingQty === 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'
                }`}>
                  {remainingQty.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                <span>Delivery Progress</span>
                <span>{progressPercent}% Complete</span>
              </div>
              <div className="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isComplete ? 'bg-emerald-600' : 'bg-sky-600'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Previous Dispatches History */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              Dispatch History ({dispatches.length})
            </h3>
            {dispatches.length === 0 ? (
              <p className="text-xs text-stone-400 italic bg-stone-50 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-200/60 dark:border-stone-700/60 text-center">
                No dispatches recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800 border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
                {dispatches.map((disp, idx) => (
                  <div key={disp.id || idx} className="flex items-center justify-between p-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold text-[10px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-stone-900 dark:text-stone-100 font-mono">
                          {formatDDMMYYYY(disp.dispatch_date)} — <span className="text-sky-600 dark:text-sky-400">{Number(disp.quantity).toLocaleString('en-IN')} units</span>
                        </div>
                        {disp.notes && (
                          <div className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                            "{disp.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveDispatch(order.id, disp.id)}
                      title="Remove dispatch entry"
                      className="p-1 text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New Dispatch Form (if remaining > 0) */}
          {remainingQty > 0 ? (
            <form onSubmit={handleAddDispatch} className="bg-sky-50/50 dark:bg-stone-800/80 p-3.5 rounded-2xl border border-sky-200/80 dark:border-stone-700 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 dark:text-sky-200">
                <Plus className="w-4 h-4 text-sky-600" />
                <span>Add New Dispatch Lot</span>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1 p-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                    Dispatch Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dispatchDate}
                    onChange={(e) => setDispatchDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                    Dispatch Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={remainingQty}
                    value={dispatchQty}
                    onChange={(e) => setDispatchQty(e.target.value)}
                    placeholder={`Max ${remainingQty}`}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Quick Pick Qty Buttons */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 mr-1">Quick select:</span>
                <button
                  type="button"
                  onClick={() => handleQuickQty(remainingQty)}
                  className="px-2 py-0.5 bg-sky-100 dark:bg-sky-950/80 hover:bg-sky-200 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700 rounded text-[10px] font-bold"
                >
                  Full Remaining ({remainingQty})
                </button>
                {remainingQty >= 2000 && (
                  <button
                    type="button"
                    onClick={() => handleQuickQty(1000)}
                    className="px-2 py-0.5 bg-white dark:bg-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600 rounded text-[10px] font-semibold"
                  >
                    1,000
                  </button>
                )}
                {remainingQty >= 4000 && (
                  <button
                    type="button"
                    onClick={() => handleQuickQty(2000)}
                    className="px-2 py-0.5 bg-white dark:bg-stone-700 hover:bg-stone-100 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600 rounded text-[10px] font-semibold"
                  >
                    2,000
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  Notes / Dispatch Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 2nd dispatch, tempo delivery, challan #12..."
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {Number(dispatchQty) === remainingQty && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>With this dispatch, full order quantity is delivered and status will lock as <strong>Delivered</strong>.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Saving dispatch...' : `+ Record Dispatch (${dispatchQty || 0} units)`}
              </button>
            </form>
          ) : (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  All {order.quantity.toLocaleString('en-IN')} units have been delivered.
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Order delivery status is locked.
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-100 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-600 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
