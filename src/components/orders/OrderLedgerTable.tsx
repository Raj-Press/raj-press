import React from 'react';
import { Order, OrderStatus } from '../../types';
import { STATUS_LABELS } from '../../lib/constants';
import {
  Printer,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  MessageCircle,
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
      <div className="bg-white border border-stone-200/90 rounded-3xl p-12 text-center shadow-2xs">
        <AlertCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-stone-700">No Orders in Register</h3>
        <p className="text-xs text-stone-400 mt-1">
          Use the workbench on the left to add your first job ticket.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200/90 rounded-3xl shadow-2xs overflow-hidden">
      {/* Table Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-stone-200/80 gap-1.5">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
            Live Order Register
          </h2>
          <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full text-xs font-bold border border-stone-200">
            {orders.length}
          </span>
        </div>
        <p className="text-xs text-stone-500 font-medium">
          Click status badge to advance workflow • Click ticket icon to print
        </p>
      </div>

      {/* Responsive Table for Desktop & Tablet */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[850px]">
          <thead>
            <tr className="bg-stone-50/80 text-stone-500 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200/80">
              <th className="p-3.5 sm:px-4 sm:py-3 whitespace-nowrap">Receipt / Date</th>
              <th className="p-3.5 sm:px-4 sm:py-3 min-w-[200px]">Party & Job Details</th>
              <th className="p-3.5 sm:px-4 sm:py-3 min-w-[150px]">Paper, Size & Ink</th>
              <th className="p-3.5 sm:px-4 sm:py-3">Print & Binding</th>
              <th className="p-3.5 sm:px-4 sm:py-3 whitespace-nowrap">Billing & Balance</th>
              <th className="p-3.5 sm:px-4 sm:py-3 text-right whitespace-nowrap">Status & Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-normal">
            {orders.map((order) => {
              const statusMeta = STATUS_LABELS[order.status] || STATUS_LABELS.Pending;
              const hasBalance = order.balance_due > 0;

              return (
                <tr
                  key={order.id}
                  className="hover:bg-amber-50/20 transition-colors group"
                >
                  {/* Column 1: Receipt & Date */}
                  <td className="p-3.5 sm:px-4 sm:py-3.5 align-top whitespace-nowrap">
                    <span className="inline-block px-2.5 py-1 bg-[#18181b] text-white font-mono font-bold rounded-lg text-xs shadow-2xs mb-1">
                      #{order.receipt_no}
                    </span>
                    <div className="text-xs text-stone-500 font-mono">
                      {order.order_date}
                    </div>
                    {order.promise_date && (
                      <div className="text-[11px] text-[#c2410c] font-medium font-mono mt-0.5">
                        वायदा: {order.promise_date}
                      </div>
                    )}
                  </td>

                  {/* Column 2: Party & Job Details */}
                  <td className="p-3.5 sm:px-4 sm:py-3.5 align-top">
                    <div className="font-bold text-stone-900 text-sm sm:text-base leading-snug">
                      {order.party_name}
                    </div>
                    <div className="text-xs text-stone-600 font-medium mt-0.5">
                      {order.job_details}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded text-[11px] font-bold">
                        नग: {order.quantity}
                      </span>
                      {order.party_phone && (
                        <span className="text-[11px] text-stone-400 font-mono">
                          • {order.party_phone}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 3: Paper, Size & Ink */}
                  <td className="p-3.5 sm:px-4 sm:py-3.5 align-top space-y-1">
                    <div className="text-xs font-semibold text-stone-800">
                      {order.paper_primary}
                      {order.paper_secondary && (
                        <span className="text-stone-500 font-normal"> + {order.paper_secondary}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[11px] font-medium border border-stone-200">
                        Size: {order.paper_size}
                      </span>
                      {order.ink_colours.map((ink) => (
                        <span
                          key={ink}
                          className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[11px] font-semibold border border-stone-200"
                        >
                          {ink}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Column 4: Print & Binding */}
                  <td className="p-3.5 sm:px-4 sm:py-3.5 align-top space-y-0.5 text-xs">
                    <div className="text-stone-800 font-medium">
                      {order.printing_type}
                      {order.print_qty ? ` (${order.print_qty})` : ''}
                    </div>
                    <div className="text-stone-500">
                      Bind: <strong className="text-stone-700 font-medium">{order.binding_type}</strong>
                    </div>
                    {order.numbering_range && (
                      <div className="text-stone-500 font-mono">
                        No: <strong className="text-stone-700">{order.numbering_range}</strong>
                      </div>
                    )}
                  </td>

                  {/* Column 5: Billing & Balance */}
                  <td className="p-3.5 sm:px-4 sm:py-3.5 align-top whitespace-nowrap text-xs space-y-0.5">
                    <div className="font-semibold text-stone-800">
                      Total: ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-stone-500">
                      Adv: ₹{Number(order.advance_amount).toLocaleString('en-IN')}
                    </div>
                    <div className="pt-1">
                      {hasBalance ? (
                        <span className="inline-block px-2 py-0.5 bg-amber-100/80 text-amber-900 border border-amber-300 rounded text-xs font-bold font-mono">
                          बाकी: ₹{Number(order.balance_due).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded text-xs font-bold">
                          Paid • पूर्ण
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 6: Status & Action */}
                  <td className="p-3.5 sm:px-4 sm:py-3.5 align-top text-right whitespace-nowrap space-y-2">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Status progression pill button */}
                      <button
                        type="button"
                        onClick={() => onAdvanceStatus(order.id, order.status)}
                        title="Click to cycle status"
                        className={`px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs transition-all hover:scale-[1.03] active:scale-[0.98] ${statusMeta.badge}`}
                      >
                        {statusMeta.en}
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-1.5">
                      {/* Settle Remaining Balance Button */}
                      {hasBalance && (
                        <button
                          type="button"
                          onClick={() => onClearBalance(order.id)}
                          title="बाकी रक्कम पूर्ण जमा करा"
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-all hover:scale-[1.02]"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Clear ₹{order.balance_due}</span>
                        </button>
                      )}

                      {/* Print Ticket Button */}
                      <button
                        type="button"
                        onClick={() => onPrintTicket(order)}
                        title="Print Job Slip / Ticket"
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* WhatsApp Receipt Button */}
                      <button
                        type="button"
                        onClick={() => openWhatsApp(order)}
                        title="Send WhatsApp Receipt"
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => onEdit(order)}
                        title="Edit Order in Workbench"
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => onDelete(order.id)}
                        title="Delete Order"
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
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
  );
};
