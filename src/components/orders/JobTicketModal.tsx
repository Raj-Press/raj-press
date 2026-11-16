import React from 'react';
import { Order } from '../../types';
import { X, Printer, MessageCircle } from 'lucide-react';
import { openWhatsApp, RAJ_PRESS_PHONE } from '../../lib/whatsapp';
import { formatDDMMYYYY } from '../../lib/date';

interface JobTicketModalProps {
  order: Order | null;
  onClose: () => void;
}

export const JobTicketModal: React.FC<JobTicketModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none">
        
        {/* Modal Header (Hidden during print) */}
        <div className="flex items-center justify-between px-5 py-3 bg-stone-900 dark:bg-black text-white print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-[#d9532f] rounded-xl">
              <Printer className="w-4 h-4 text-white" />
            </span>
            <div>
              <h2 className="text-base font-bold">प्रेस ऑपरेटर जॉब कार्ड (Press Floor Ticket)</h2>
              <p className="text-xs text-stone-400">पावती क्र: #{order.receipt_no}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Job Ticket Content - Clean for Machine Operator */}
        <div className="p-4 sm:p-5 text-stone-900 bg-white print:p-2 printable-area overflow-y-auto flex-1">
          {/* Press Header */}
          <div className="border-b-2 border-stone-900 pb-3 mb-3 text-center relative">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">
              Commercial Offset & Digital Printing Press
            </div>
            <h1 className="text-2xl font-black text-stone-900 mt-0.5 tracking-wide">
              राज प्रेस <span className="text-lg font-normal text-stone-600">(RAJ PRESS)</span>
            </h1>
            <p className="text-xs text-stone-600 mt-0.5 font-medium">
              स्टेशन रोड, मुख्य बाजार, महाराष्ट्र | मो. {RAJ_PRESS_PHONE}
            </p>
            <div className="inline-block mt-1.5 px-3 py-0.5 bg-stone-900 text-white text-[11px] font-bold rounded-full">
              ★ मशीन ऑपरेटर जॉब कार्ड (Press Floor Production Order) ★
            </div>
          </div>

          {/* Job Ticket Meta */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 border border-stone-300 rounded-xl mb-3 text-xs sm:text-sm">
            <div>
              <span className="text-xs text-stone-500 block">पावती क्र. (Receipt No):</span>
              <strong className="text-base text-stone-900 font-mono font-black">#{order.receipt_no}</strong>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-500 block">ऑर्डर तारीख (Date):</span>
              <strong className="text-sm text-stone-800 font-mono">{formatDDMMYYYY(order.order_date)}</strong>
            </div>
            <div className="col-span-2 pt-2 border-t border-stone-200 flex justify-between items-center">
              <div>
                <span className="text-xs text-stone-500 block">ग्राहकाचे नांव (Customer / Party):</span>
                <strong className="text-base text-stone-900 font-bold">{order.party_name}</strong>
              </div>
              {order.party_phone && (
                <div className="text-right">
                  <span className="text-xs text-stone-500 block">संपर्क (Mobile):</span>
                  <strong className="text-sm font-mono text-stone-800">{order.party_phone}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Operator Specifications Matrix */}
          <div className="border border-stone-400 rounded-xl overflow-hidden mb-3">
            <table className="w-full text-xs text-left border-collapse">
              <tbody>
                <tr className="border-b border-stone-300 bg-stone-100/90 font-bold">
                  <td className="p-2.5 w-1/3 text-stone-600">कामाचा तपशील (Job Details)</td>
                  <td className="p-2.5 text-sm font-bold text-stone-900" colSpan={3}>
                    {order.job_details}
                  </td>
                </tr>

                <tr className="border-b border-stone-300">
                  <td className="p-2.5 text-stone-600 bg-stone-50">नग संख्या (Quantity)</td>
                  <td className="p-2.5 font-bold text-sm text-stone-900">{order.quantity} नग / प्रती</td>
                  <td className="p-2.5 text-stone-600 bg-stone-50">साईज (Paper Size)</td>
                  <td className="p-2.5 font-bold text-sm text-stone-900">{order.paper_size}</td>
                </tr>

                <tr className="border-b border-stone-300">
                  <td className="p-2.5 text-stone-600 bg-stone-50">मुख्य कागद (Paper)</td>
                  <td className="p-2.5 font-bold text-stone-900">{order.paper_primary}</td>
                  <td className="p-2.5 text-stone-600 bg-stone-50">दुय्यम प्रत (Secondary)</td>
                  <td className="p-2.5 font-medium">{order.paper_secondary || 'नाही (None)'}</td>
                </tr>

                <tr className="border-b border-stone-300">
                  <td className="p-2.5 text-stone-600 bg-slate-50">शाई कलर (Ink Colours)</td>
                  <td className="p-2.5">
                    <div className="flex flex-wrap gap-1">
                      {order.ink_colours.map((c) => (
                        <span key={c} className="px-2 py-0.5 bg-stone-200 text-stone-900 rounded font-bold text-xs border border-stone-400">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-2.5 text-stone-600 bg-slate-50">प्रिंटींग पद्धत (Printing)</td>
                  <td className="p-2.5 font-bold text-stone-900">{order.printing_type}</td>
                </tr>

                <tr className="border-b border-stone-300">
                  <td className="p-2.5 text-stone-600 bg-stone-50">बायडिंग (Binding)</td>
                  <td className="p-2.5 font-bold text-stone-900">{order.binding_type}</td>
                  <td className="p-2.5 text-stone-600 bg-stone-50">नंबरींग (Numbering)</td>
                  <td className="p-2.5 font-mono font-bold">{order.numbering_range || 'नाही'}</td>
                </tr>

                {order.print_qty && (
                  <tr className="border-b border-stone-300">
                    <td className="p-2.5 text-stone-600 bg-stone-50">इम्प्रेशन / कॉपीज (Copies)</td>
                    <td className="p-2.5 font-mono font-bold text-stone-900" colSpan={3}>
                      {order.print_qty}
                    </td>
                  </tr>
                )}

                {order.notes && (
                  <tr className="bg-amber-50/50">
                    <td className="p-2.5 text-stone-600 font-bold bg-amber-100/50">विशेष सूचना (Instructions)</td>
                    <td className="p-2.5 text-stone-900 font-bold text-sm" colSpan={3}>
                      ⚠️ {order.notes}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Operator Production & Delivery Checklist (NO MONEY / ADVANCE SHOWN) */}
          <div className="p-3 bg-stone-50 border border-stone-300 rounded-xl mb-3 text-xs">
            <div className="grid grid-cols-2 gap-3 mb-2 pb-2 border-b border-stone-200">
              <div>
                <span className="text-stone-500 block">डिलिव्हरी वायदा तारीख (Promise Date):</span>
                <strong className="text-sm text-stone-900 font-bold font-mono">
                  {order.promise_date ? formatDDMMYYYY(order.promise_date) : 'लवकरात लवकर (Urgent)'}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-stone-500 block">सद्यस्थिती (Status):</span>
                <span className="inline-block px-2 py-0.5 bg-stone-200 text-stone-900 rounded font-bold uppercase text-xs">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Press Floor Quality Checklist */}
            <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-stone-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                <span>[ ] प्लेट / प्रूफ तपासणी</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                <span>[ ] छपाई व शाई चेक</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                <span>[ ] कटिंग व पॅकिंग पूर्ण</span>
              </label>
            </div>
          </div>

          {/* Footer Sign-off for Machine Operator */}
          <div className="flex justify-between items-end pt-3 border-t border-dashed border-stone-300 text-xs text-stone-600">
            <div className="space-y-0.5">
              <p>• मशीनवर छपाई सुरू करण्यापूर्वी नमुना व मजकूर तपासावा.</p>
              <p>• कटिंग व बायडिंग अचूक दिलेल्या साईजमध्ये करावी.</p>
            </div>
            <div className="text-center w-36">
              <div className="border-b border-stone-400 h-7 mb-1"></div>
              <span className="font-bold text-stone-800">ऑपरेटर स्वाक्षरी</span>
            </div>
          </div>
        </div>

        {/* Modal Actions (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5 sm:py-3.5 bg-stone-100 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 print:hidden transition-colors shrink-0">
          <button
            type="button"
            onClick={() => openWhatsApp(order)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            व्हॉट्सॲप पावती पाठवा (WhatsApp Receipt)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-600 rounded-xl text-xs font-semibold transition-colors"
            >
              बंद करा (Close)
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#d9532f] hover:bg-[#c2410c] text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
            >
              <Printer className="w-4 h-4" />
              प्रिंट जॉब कार्ड (Print A5 / Slip)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
