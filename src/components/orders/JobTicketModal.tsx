import React from 'react';
import { Order } from '../../types';
import { X, Printer, MessageCircle } from 'lucide-react';
import { openWhatsApp } from '../../lib/whatsapp';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none">
        
        {/* Modal Header (Hidden during print) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 rounded-lg">
              <Printer className="w-4 h-4 text-white" />
            </span>
            <div>
              <h2 className="text-base font-bold">जॉब कार्ड व पावती (Press Floor Ticket)</h2>
              <p className="text-xs text-slate-300">पावती क्र: {order.receipt_no}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Job Ticket Content */}
        <div className="p-6 text-slate-800 bg-white print:p-4 printable-area">
          {/* Press Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center relative">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Commercial Offset, Screen & Digital Printing Press
            </div>
            <h1 className="text-3xl font-extrabold text-blue-950 mt-1 font-serif tracking-wide">
              राज प्रेस <span className="text-xl font-normal text-slate-600">(RAJ PRESS)</span>
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              स्टेशन रोड, मुख्य बाजार, महाराष्ट्र | मो. ९८२२०००००० / ९४२३००००००
            </p>
            <div className="inline-block mt-2 px-3 py-0.5 bg-slate-900 text-white text-xs font-bold rounded-full">
              ★ प्रेस जॉब कार्ड व ग्राहक प्रत (Job Slip & Work Order) ★
            </div>
          </div>

          {/* Key Order Header Row */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">पावती क्र. (Receipt No):</span>
              <strong className="text-base text-blue-900 font-mono">{order.receipt_no}</strong>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">ऑर्डर तारीख (Date):</span>
              <strong className="text-sm text-slate-800">{order.order_date}</strong>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-500 block">ग्राहकाचे नांव (Customer / Party):</span>
                <strong className="text-base text-slate-900 font-bold">{order.party_name}</strong>
              </div>
              {order.party_phone && (
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">संपर्क (Mobile):</span>
                  <strong className="text-sm font-mono text-slate-800">{order.party_phone}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Technical Specifications Matrix */}
          <div className="border border-slate-300 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-xs text-left">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-100/70 font-semibold">
                  <td className="p-2.5 w-1/3 text-slate-600">कामाचा तपशील (Job Details)</td>
                  <td className="p-2.5 text-sm font-bold text-slate-900" colSpan={3}>
                    {order.job_details}
                  </td>
                </tr>

                <tr className="border-b border-slate-200">
                  <td className="p-2.5 text-slate-600 bg-slate-50">नग संख्या (Quantity)</td>
                  <td className="p-2.5 font-bold text-sm text-blue-900">{order.quantity} नग / प्रती</td>
                  <td className="p-2.5 text-slate-600 bg-slate-50">साईज (Paper Size)</td>
                  <td className="p-2.5 font-bold">{order.paper_size}</td>
                </tr>

                <tr className="border-b border-slate-200">
                  <td className="p-2.5 text-slate-600 bg-slate-50">मुख्य कागद (Paper)</td>
                  <td className="p-2.5 font-medium">{order.paper_primary}</td>
                  <td className="p-2.5 text-slate-600 bg-slate-50">दुय्यम कागद (Secondary)</td>
                  <td className="p-2.5">{order.paper_secondary || '-'}</td>
                </tr>

                <tr className="border-b border-slate-200">
                  <td className="p-2.5 text-slate-600 bg-slate-50">शाई कलर (Ink Colours)</td>
                  <td className="p-2.5">
                    <div className="flex flex-wrap gap-1">
                      {order.ink_colours.map((c) => (
                        <span key={c} className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold text-[11px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-2.5 text-slate-600 bg-slate-50">प्रिंटींग पद्धत</td>
                  <td className="p-2.5 font-medium">{order.printing_type}</td>
                </tr>

                <tr className="border-b border-slate-200">
                  <td className="p-2.5 text-slate-600 bg-slate-50">बायडिंग (Binding)</td>
                  <td className="p-2.5 font-medium">{order.binding_type}</td>
                  <td className="p-2.5 text-slate-600 bg-slate-50">नंबरींग (Numbering)</td>
                  <td className="p-2.5 font-mono">{order.numbering_range || 'नाही'}</td>
                </tr>

                {order.notes && (
                  <tr>
                    <td className="p-2.5 text-slate-600 bg-slate-50">विशेष सूचना (Instructions)</td>
                    <td className="p-2.5 text-rose-700 font-medium" colSpan={3}>
                      {order.notes}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment & Delivery Summary */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">वायदा तारीख (Promise Date):</span>
                <strong>{order.promise_date || 'ठरवायची आहे'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">सद्यस्थिती (Status):</span>
                <span className="font-bold text-blue-800 uppercase">{order.status}</span>
              </div>
            </div>

            <div className="border-l border-slate-200 pl-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">एकूण रक्कम (Total):</span>
                <strong className="text-slate-900 font-mono">₹{Number(order.total_amount).toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>जमा ॲडव्हान्स (Advance):</span>
                <strong className="font-mono">₹{Number(order.advance_amount).toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-300 text-sm font-bold text-rose-700">
                <span>येणे बाकी (Balance):</span>
                <span className="font-mono">₹{Number(order.balance_due).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="flex justify-between items-end pt-4 border-t border-dashed border-slate-300 text-xs text-slate-500">
            <div className="space-y-0.5">
              <p>• प्रूफ तपासणीची सर्वस्वी जबाबदारी ग्राहकाची राहील.</p>
              <p>• डिलिव्हरीच्या वेळी बाकी रक्कम देणे आवश्यक आहे.</p>
            </div>
            <div className="text-center w-36">
              <div className="border-b border-slate-400 h-8 mb-1"></div>
              <span className="font-bold text-slate-700">राज प्रेस करिता</span>
            </div>
          </div>
        </div>

        {/* Modal Actions (Hidden during print) */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 bg-slate-100 border-t border-slate-200 print:hidden">
          <button
            type="button"
            onClick={() => openWhatsApp(order)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            व्हॉट्सॲप मेसेज पाठवा (WhatsApp Receipt)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              बंद करा (Close)
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
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
