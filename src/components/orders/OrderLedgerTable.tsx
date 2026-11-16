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
import { formatDDMMYYYY } from '../../lib/date';
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
      <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-10 text-center shadow-2xs transition-colors">
        <AlertCircle className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2.5" />
        <h3 className="text-base font-bold text-stone-700 dark:text-stone-300">No Orders Match Filter</h3>
        <p className="text-xs text-stone-400 mt-1">
          Try clearing search filters or add a new job ticket on the left.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl shadow-2xs overflow-hidden transition-colors">
      {/* Table Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-stone-200/80 dark:border-stone-800 gap-1.5">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Live Order Register
          </h2>
          <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-full text-xs font-bold border border-stone-200 dark:border-stone-700">
            {orders.length}
          </span>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
          Click status to advance • Click ticket icon to print
        </p>
      </div>

      {/* Responsive Table fitted for standard screens */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-stone-50/80 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200/80 dark:border-stone-800">
              <th className="px-3 py-2.5 whitespace-nowrap w-[13%]">Receipt / Date</th>
              <th className="px-3 py-2.5 w-[26%]">Party & Job Details</th>
              <th className="px-3 py-2.5 w-[20%]">Paper, Size & Ink</th>
              <th className="px-3 py-2.5 w-[16%]">Print & Binding</th>
              <th className="px-3 py-2.5 whitespace-nowrap w-[13%]">Billing & Balance</th>
              <th className="px-3 py-2.5 text-right whitespace-nowrap w-[12%]">Status & Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-normal">
            {orders.map((order) => {
              const statusMeta = STATUS_LABELS[order.status] || STATUS_LABELS.Pending;
              const hasBalance = order.balance_due > 0;

              return (
                <tr
                  key={order.id}
                  className="hover:bg-amber-50/30 dark:hover:bg-stone-800/50 transition-colors group"
                >
                  {/* Column 1: Receipt & Date */}
                  <td className="px-3 py-3 align-top whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 bg-[#18181b] dark:bg-black text-white font-mono font-bold rounded-lg text-xs shadow-2xs mb-1">
                      #{order.receipt_no}
                    </span>
                    <div className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                      {formatDDMMYYYY(order.order_date)}
                    </div>
                    {order.promise_date && (
                      <div className="text-[11px] text-[#c2410c] dark:text-[#ea580c] font-medium font-mono mt-0.5">
                        वायदा: {formatDDMMYYYY(order.promise_date)}
                      </div>
                    )}
                  </td>

                  {/* Column 2: Party & Job Details */}
                  <td className="px-3 py-3 align-top">
                    <div className="font-bold text-stone-900 dark:text-stone-100 text-sm leading-snug">
                      {order.party_name}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-300 font-medium mt-0.5">
                      {order.job_details}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded text-[11px] font-bold">
                        नग: {order.quantity}
                      </span>
                      {order.party_phone && (
                        <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                          • {order.party_phone}
                        </span>
                      )}
                    </div>
                    {order.notes && (
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 italic mt-1 bg-stone-50 dark:bg-stone-800/80 px-2 py-0.5 rounded border border-stone-200/50 dark:border-stone-700">
                        "{order.notes}"
                      </div>
                    )}
                  </td>

                  {/* Column 3: Paper, Size & Ink */}
                  <td className="px-3 py-3 align-top space-y-1">
                    <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      {order.paper_primary}
                      {order.paper_secondary && (
                        <span className="text-stone-500 dark:text-stone-400 font-normal"> + {order.paper_secondary}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      <span className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded text-[11px] font-medium border border-stone-200 dark:border-stone-700">
                        Size: {order.paper_size}
                      </span>
                      {order.ink_colours.map((ink) => (
                        <span
                          key={ink}
                          className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded text-[11px] font-semibold border border-stone-200 dark:border-stone-700"
                        >
                          {ink}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Column 4: Print & Binding */}
                  <td className="px-3 py-3 align-top space-y-0.5 text-xs">
                    <div className="text-stone-800 dark:text-stone-200 font-medium">
                      {order.printing_type}
                      {order.print_qty ? ` (${order.print_qty})` : ''}
                    </div>
                    <div className="text-stone-500 dark:text-stone-400">
                      Bind: <strong className="text-stone-700 dark:text-stone-300 font-medium">{order.binding_type}</strong>
                    </div>
                    {order.numbering_range && (
                      <div className="text-stone-500 dark:text-stone-400 font-mono">
                        No: <strong className="text-stone-700 dark:text-stone-300">{order.numbering_range}</strong>
                      </div>
                    )}
                  </td>

                  {/* Column 5: Billing & Balance */}
                  <td className="px-3 py-3 align-top whitespace-nowrap text-xs space-y-0.5">
                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                      Total: ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-stone-500 dark:text-stone-400">
                      Adv: ₹{Number(order.advance_amount).toLocaleString('en-IN')}
                    </div>
                    <div className="pt-0.5">
                      {hasBalance ? (
                        <span className="inline-block px-2 py-0.5 bg-amber-100/80 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded text-xs font-bold font-mono">
                          बाकी: ₹{Number(order.balance_due).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded text-xs font-bold">
                          Paid • पूर्ण
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 6: Status & Action */}
                  <td className="px-3 py-3 align-top text-right whitespace-nowrap space-y-1.5">
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => onAdvanceStatus(order.id, order.status)}
                        title="Click to cycle status"
                        className={`px-2.5 py-0.5 rounded-xl text-xs font-bold border shadow-2xs transition-all hover:scale-[1.03] active:scale-[0.98] ${statusMeta.badge}`}
                      >
                        {statusMeta.en}
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-1">
                      {hasBalance && (
                        <button
                          type="button"
                          onClick={() => onClearBalance(order.id)}
                          title="बाकी रक्कम पूर्ण जमा करा"
                          className="flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-all hover:scale-[1.02]"
                        >
                          <Check className="w-3 h-3" />
                          <span>Clear ₹{order.balance_due}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onPrintTicket(order)}
                        title="Print Job Slip / Ticket"
                        className="p-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openWhatsApp(order)}
                        title="Send WhatsApp Receipt"
                        className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(order)}
                        title="Edit Order in Workbench"
                        className="p-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(order.id)}
                        title="Delete Order"
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
