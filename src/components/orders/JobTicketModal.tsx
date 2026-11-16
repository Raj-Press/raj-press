import React from 'react';
import { Order } from '../../types';
import { X, Printer, MessageCircle } from 'lucide-react';
import { openWhatsApp } from '../../lib/whatsapp';
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
              <h2 className="text-base font-bold">Operator Instructions (ऑपरेटर सूचना)</h2>
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

        {/* Printable Job Ticket Content - Clean for Machine Operator (Strictly Monochrome B&W) */}
        <div className="p-4 sm:p-5 text-black bg-white print:p-2 printable-area overflow-y-auto flex-1">
          {/* Simple Operator Instructions Heading */}
          <div className="border-b-2 border-black pb-2 mb-3 text-center">
            <h1 className="text-xl sm:text-2xl font-black text-black tracking-wide uppercase">
              Operator Instructions (ऑपरेटर सूचना)
            </h1>
          </div>

          {/* Job Ticket Meta */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-white border-2 border-black rounded-lg mb-3 text-xs sm:text-sm">
            <div>
              <span className="text-xs text-black/70 block font-medium">पावती क्र. (Receipt No):</span>
              <strong className="text-base text-black font-mono font-black">#{order.receipt_no}</strong>
            </div>
            <div className="text-right">
              <span className="text-xs text-black/70 block font-medium">ऑर्डर तारीख (Date):</span>
              <strong className="text-sm text-black font-mono font-bold">{formatDDMMYYYY(order.order_date)}</strong>
            </div>
            <div className="col-span-2 pt-2 border-t border-black flex justify-between items-center">
              <div>
                <span className="text-xs text-black/70 block font-medium">ग्राहकाचे नांव (Customer / Party):</span>
                <strong className="text-base text-black font-bold">{order.party_name}</strong>
              </div>
              {order.party_phone && (
                <div className="text-right">
                  <span className="text-xs text-black/70 block font-medium">संपर्क (Mobile):</span>
                  <strong className="text-sm font-mono text-black font-bold">{order.party_phone}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Operator Specifications Matrix */}
          <div className="border-2 border-black rounded-lg overflow-hidden mb-3">
            <table className="w-full text-xs text-left border-collapse">
              <tbody>
                <tr className="border-b border-black bg-stone-100 font-bold">
                  <td className="p-2.5 w-1/3 text-black font-bold border-r border-black">कामाचा तपशील (Job Details)</td>
                  <td className="p-2.5 text-sm font-black text-black" colSpan={3}>
                    {order.job_details}
                  </td>
                </tr>

                <tr className="border-b border-black">
                  <td className="p-2.5 text-black font-semibold bg-stone-50 border-r border-black">नग संख्या (Quantity)</td>
                  <td className="p-2.5 font-bold text-sm text-black border-r border-black">{order.quantity} नग / प्रती</td>
                  <td className="p-2.5 text-black font-semibold bg-stone-50 border-r border-black">साईज (Paper Size)</td>
                  <td className="p-2.5 font-bold text-sm text-black">{order.paper_size}</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="p-2.5 text-black font-semibold bg-stone-50 border-r border-black">मुख्य कागद (Paper)</td>
                  <td className="p-2.5 font-bold text-black border-r border-black">{order.paper_primary}</td>
                  <td className="p-2.5 text-black font-semibold bg-stone-50 border-r border-black">दुय्यम प्रत (Secondary)</td>
                  <td className="p-2.5 font-semibold text-black">{order.paper_secondary || 'नाही (None)'}</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="p-2.5 text-black font-semibold bg-stone-50 border-r border-black">शाई कलर (Ink Colours)</td>
                  <td className="p-2.5 border-r border-black">
                    <div className="flex flex-wrap gap-1">
                      {order.ink_colours.map((c) => (
                        <span key={c} className="px-2 py-0.5 bg-white text-black rounded font-bold text-xs border border-black">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-2.5 text-black font-semibold bg-stone-50 border-r border-black">प्रिंटींग पद्धत (Printing)</td>
                  <td className="p-2.5 font-bold text-black">{order.printing_type}</td>
                </tr>

                <tr className="border-b border-black">
                  <td className="p-2.5 text-black font-semibold bg-stone-50 border-r border-black">बायडिंग (Binding)</td>
                  <td className="p-2.5 font-bold text-black border-r border-black">{order.binding_type}</td>
                  <td className="p-2.5 text-black font-semibold bg-stone-50 border-r border-black">नंबरींग (Numbering)</td>
                  <td className="p-2.5 font-mono font-bold text-black">{order.numbering_range || 'नाही'}</td>
                </tr>

                {order.print_qty && (
                  <tr className="border-b border-black">
                    <td className="p-2.5 text-black font-semibold bg-stone-50 border-r border-black">इम्प्रेशन / कॉपीज (Copies)</td>
                    <td className="p-2.5 font-mono font-bold text-black" colSpan={3}>
                      {order.print_qty}
                    </td>
                  </tr>
                )}

                {order.notes && (
                  <tr className="border-b border-black bg-stone-100">
                    <td className="p-2.5 text-black font-bold border-r border-black">विशेष सूचना (Instructions)</td>
                    <td className="p-2.5 text-black font-bold text-sm" colSpan={3}>
                      {order.notes}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Operator Production & Delivery Checklist (NO MONEY / ADVANCE SHOWN) */}
          <div className="p-3 bg-white border-2 border-black rounded-lg mb-3 text-xs">
            <div className="grid grid-cols-2 gap-3 mb-2 pb-2 border-b border-black">
              <div>
                <span className="text-black/70 block font-medium">डिलिव्हरी वायदा तारीख (Promise Date):</span>
                <strong className="text-sm text-black font-bold font-mono">
                  {order.promise_date ? formatDDMMYYYY(order.promise_date) : 'लवकरात लवकर (Urgent)'}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-black/70 block font-medium">सद्यस्थिती (Status):</span>
                <span className="inline-block px-2 py-0.5 border border-black bg-stone-100 text-black rounded font-bold uppercase text-xs">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Press Floor Quality Checklist */}
            <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-black pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-black border border-black rounded-xs" />
                <span>[ ] प्लेट / प्रूफ तपासणी</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-black border border-black rounded-xs" />
                <span>[ ] छपाई व शाई चेक</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-black border border-black rounded-xs" />
                <span>[ ] कटिंग व पॅकिंग पूर्ण</span>
              </label>
            </div>
          </div>

          {/* Footer Sign-off for Machine Operator */}
          <div className="flex justify-between items-end pt-3 border-t-2 border-black text-xs text-black">
            <div className="space-y-0.5 font-medium">
              <p>• मशीनवर छपाई सुरू करण्यापूर्वी नमुना व मजकूर तपासावा.</p>
              <p>• कटिंग व बायडिंग अचूक दिलेल्या साईजमध्ये करावी.</p>
            </div>
            <div className="text-center w-36">
              <div className="border-b-2 border-black h-8 mb-1"></div>
              <span className="font-bold text-black">ऑपरेटर स्वाक्षरी</span>
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
