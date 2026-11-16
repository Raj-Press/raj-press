import React from 'react';
import { Order, OrderStatus } from '../../types';
import { STATUS_LABELS, STATUS_PROGRESSION } from '../../lib/constants';
import {
  Printer,
  MessageCircle,
  Edit2,
  Trash2,
  CheckCircle,
  ArrowRightCircle,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { openWhatsApp } from '../../lib/whatsapp';

interface OrderLedgerTableProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onPrintTicket: (order: Order) => void;
  onAdvanceStatus: (id: string, currentStatus: OrderStatus) => void;
  onClearBalance: (id: string) => void;
}

export const OrderLedgerTable: React.FC<OrderLedgerTableProps> = ({
  orders,
  onEdit,
  onDelete,
  onPrintTicket,
  onAdvanceStatus,
  onClearBalance,
}) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">कोणतीही ऑर्डर आढळली नाही</h3>
        <p className="text-xs text-slate-500 mt-1">
          कृपया नवीन ऑर्डर नोंदवण्यासाठी वर दिलेल्या "+ नवीन ऑर्डर" बटणावर क्लिक करा.
        </p>
      </div>
    );
  }

  const getNextStatus = (curr: OrderStatus): OrderStatus | null => {
    const idx = STATUS_PROGRESSION.indexOf(curr);
    if (idx !== -1 && idx < STATUS_PROGRESSION.length - 1) {
      return STATUS_PROGRESSION[idx + 1];
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Desktop / Tablet Full Table */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold tracking-wider">
                <th className="p-3 whitespace-nowrap">पावती क्र. & ता.</th>
                <th className="p-3">ग्राहक (Party)</th>
                <th className="p-3 min-w-[180px]">कामाचा तपशील (Job Details)</th>
                <th className="p-3 text-center">नग</th>
                <th className="p-3">कागद व साईज</th>
                <th className="p-3">शाई & बायडिंग</th>
                <th className="p-3 text-right">एकूण / ॲडव्हान्स</th>
                <th className="p-3 text-right">येणे बाकी ₹</th>
                <th className="p-3 text-center">स्थिती (Status)</th>
                <th className="p-3 text-center whitespace-nowrap">ॲक्शन्स</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {orders.map((order) => {
                const statusMeta = STATUS_LABELS[order.status] || STATUS_LABELS.Pending;
                const nextStatus = getNextStatus(order.status);
                const hasPendingBalance = order.balance_due > 0;

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    {/* Receipt No & Date */}
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-blue-900">{order.receipt_no}</div>
                      <div className="text-[11px] text-slate-500">{order.order_date}</div>
                    </td>

                    {/* Customer */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{order.party_name}</div>
                      {order.party_phone ? (
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {order.party_phone}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">-</span>
                      )}
                    </td>

                    {/* Job Details */}
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{order.job_details}</div>
                      {order.numbering_range && (
                        <div className="text-[11px] text-indigo-700 font-mono mt-0.5">
                          नंबरींग: {order.numbering_range}
                        </div>
                      )}
                      {order.notes && (
                        <div className="text-[11px] text-amber-700 italic mt-0.5">
                          "{order.notes}"
                        </div>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="p-3 text-center font-bold text-slate-800">
                      {order.quantity}
                    </td>

                    {/* Paper & Size */}
                    <td className="p-3 text-slate-700 space-y-0.5">
                      <div className="truncate max-w-[150px] font-semibold text-slate-900" title={order.paper_primary}>
                        {order.paper_primary}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[150px]" title={order.paper_size}>
                        {order.paper_size}
                      </div>
                    </td>

                    {/* Ink & Binding */}
                    <td className="p-3 space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {order.ink_colours.map((ink) => (
                          <span
                            key={ink}
                            className="px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded font-semibold text-[10px] border border-slate-200"
                          >
                            {ink}
                          </span>
                        ))}
                      </div>
                      <div className="text-[11px] text-slate-600 truncate max-w-[130px]" title={order.binding_type}>
                        {order.binding_type}
                      </div>
                    </td>

                    {/* Total / Advance */}
                    <td className="p-3 text-right">
                      <div className="font-bold text-slate-900 font-mono">
                        ₹{Number(order.total_amount).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-mono">
                        जमा: ₹{Number(order.advance_amount).toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Balance Due & Quick Settle */}
                    <td className="p-3 text-right">
                      <div
                        className={`font-mono font-extrabold text-sm ${
                          hasPendingBalance ? 'text-rose-700' : 'text-slate-400'
                        }`}
                      >
                        ₹{Number(order.balance_due).toLocaleString('en-IN')}
                      </div>
                      {hasPendingBalance && (
                        <button
                          type="button"
                          onClick={() => onClearBalance(order.id)}
                          title="बाकी रक्कम पूर्ण जमा करा (Clear Balance)"
                          className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition-colors"
                        >
                          <CheckCircle className="w-2.5 h-2.5" /> जमा ✓
                        </button>
                      )}
                    </td>

                    {/* Status & Next Step */}
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusMeta.bg} ${statusMeta.color}`}
                      >
                        {statusMeta.mr}
                      </span>
                      {nextStatus && (
                        <button
                          type="button"
                          onClick={() => onAdvanceStatus(order.id, order.status)}
                          className="mt-1.5 flex items-center justify-center gap-1 w-full text-[10px] font-bold text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          <ArrowRightCircle className="w-3 h-3" />
                          पुढील पायरी
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPrintTicket(order)}
                          title="जॉब तिकीट प्रिंट करा (Print Job Slip)"
                          className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openWhatsApp(order)}
                          title="व्हॉट्सॲप पावती पाठवा (WhatsApp Receipt)"
                          className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(order)}
                          title="बदल करा (Edit Order)"
                          className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(order.id)}
                          title="ऑर्डर हटवा (Delete Order)"
                          className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile-Friendly Cards (for shop floor operators & mobile screens) */}
      <div className="lg:hidden space-y-3">
        {orders.map((order) => {
          const statusMeta = STATUS_LABELS[order.status] || STATUS_LABELS.Pending;
          const nextStatus = getNextStatus(order.status);
          const hasPendingBalance = order.balance_due > 0;

          return (
            <div
              key={order.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
            >
              {/* Header: Receipt & Status */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-base font-extrabold text-blue-900 font-mono">
                    {order.receipt_no}
                  </span>
                  <span className="text-xs text-slate-400 block">{order.order_date}</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusMeta.bg} ${statusMeta.color}`}
                >
                  {statusMeta.mr}
                </span>
              </div>

              {/* Customer & Job Info */}
              <div>
                <div className="text-base font-bold text-slate-900">{order.party_name}</div>
                <div className="text-sm font-semibold text-blue-950 mt-0.5">{order.job_details}</div>
                <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-2">
                  <span>नग: <strong className="text-slate-900">{order.quantity}</strong></span>
                  <span>|</span>
                  <span>साईज: <strong className="text-slate-900">{order.paper_size}</strong></span>
                  <span>|</span>
                  <span>कागद: <strong className="text-slate-900">{order.paper_primary}</strong></span>
                </div>
              </div>

              {/* Ink & Binding Tags */}
              <div className="flex flex-wrap gap-1.5">
                {order.ink_colours.map((c) => (
                  <span key={c} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-xs border border-slate-200">
                    {c}
                  </span>
                ))}
                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded text-xs font-medium">
                  {order.binding_type}
                </span>
              </div>

              {/* Financial Breakdown */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl text-center text-xs">
                <div>
                  <div className="text-slate-400 text-[10px]">एकूण (Total)</div>
                  <div className="font-bold text-slate-800 font-mono">₹{order.total_amount}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">जमा (Advance)</div>
                  <div className="font-bold text-emerald-700 font-mono">₹{order.advance_amount}</div>
                </div>
                <div>
                  <div className="text-rose-500 text-[10px] font-bold">बाकी (Due)</div>
                  <div className="font-extrabold text-rose-700 font-mono">₹{order.balance_due}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onPrintTicket(order)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    <Printer className="w-3.5 h-3.5" /> तिकीट
                  </button>

                  <button
                    type="button"
                    onClick={() => openWhatsApp(order)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> व्हॉट्सॲप
                  </button>

                  {hasPendingBalance && (
                    <button
                      type="button"
                      onClick={() => onClearBalance(order.id)}
                      className="px-2 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold"
                    >
                      ✓ बाकी शून्य
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {nextStatus && (
                    <button
                      type="button"
                      onClick={() => onAdvanceStatus(order.id, order.status)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold"
                    >
                      पुढे <ArrowRightCircle className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onEdit(order)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(order.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
