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
  Copy,
  Lock,
  Truck,
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
  onRepeatOrder: (order: Order) => void;
  onOpenSplitDelivery: (order: Order) => void;
}

export const OrderLedgerTable: React.FC<OrderLedgerTableProps> = React.memo(({
  orders,
  onEdit,
  onDelete,
  onPrintTicket,
  onAdvanceStatus,
  onClearBalance,
  onRepeatOrder,
  onOpenSplitDelivery,
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

      {/* MOBILE CARD VIEW: Dedicated touch-optimized layout for phones (< 768px) */}
      <div className="md:hidden divide-y divide-stone-100 dark:divide-stone-800 p-2 sm:p-3 space-y-2.5">
        {orders.map((order) => {
          const statusMeta = STATUS_LABELS[order.status] || STATUS_LABELS.Pending;
          const hasBalance = order.balance_due > 0;
          const isSpecialOrder = order.order_type === 'Special Order' || (order.dispatches && order.dispatches.length > 0);
          const totalDelivered = (order.dispatches || []).reduce((sum, d) => sum + Number(d.quantity || 0), 0);
          const remainingQty = Math.max(0, order.quantity - totalDelivered);
          const isFullyDelivered = order.status === 'Delivered' || (isSpecialOrder && totalDelivered >= order.quantity && order.quantity > 0);

          return (
            <div
              key={`m-${order.id}`}
              className="bg-stone-50/60 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-700/80 rounded-2xl p-3 space-y-2.5 transition-colors"
            >
              {/* Card Header: Receipt, Date & Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-[#18181b] dark:bg-black text-white font-mono font-bold rounded-lg text-xs shadow-2xs">
                    #{order.receipt_no}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                    {formatDDMMYYYY(order.order_date)}
                  </span>
                  {order.promise_date && (
                    <span className="text-xs text-[#ea580c] dark:text-[#f97316] font-semibold font-mono">
                      Due: {formatDDMMYYYY(order.promise_date)}
                    </span>
                  )}
                </div>

                {/* Status Badge (Large Thumb Target) */}
                <div>
                  {isFullyDelivered ? (
                    <span
                      title="Order fully delivered and locked. Use Edit to modify."
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-2xs bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 select-none"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Delivered</span>
                      <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                    </span>
                  ) : order.status === 'Split Delivery' ? (
                    <button
                      type="button"
                      onClick={() => onOpenSplitDelivery(order)}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold border shadow-2xs transition-all active:scale-95 bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800"
                    >
                      {totalDelivered > 0 ? `Split (${totalDelivered}/${order.quantity})` : 'Split Delivery'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAdvanceStatus(order.id, order.status)}
                      title="Tap to advance status"
                      className={`px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs transition-all active:scale-95 ${statusMeta.badge}`}
                    >
                      {statusMeta.en}
                    </button>
                  )}
                </div>
              </div>

              {/* Customer & Job Details */}
              <div>
                <div className="font-bold text-stone-900 dark:text-stone-100 text-sm leading-snug">
                  {order.party_name}
                </div>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-800 rounded font-semibold text-xs">
                    {order.job_details}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded text-xs font-bold">
                    Qty: {order.quantity.toLocaleString('en-IN')}
                  </span>
                  {order.order_type && order.order_type !== 'General' && (
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-bold border bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                      {order.order_type === 'सप्ताह / Saptah' ? 'Saptah' : order.order_type}
                    </span>
                  )}
                  {order.party_phone && (
                    <button
                      type="button"
                      onClick={() => openWhatsApp(order)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-mono hover:underline flex items-center gap-0.5"
                    >
                      <MessageCircle className="w-3 h-3" /> {order.party_phone}
                    </button>
                  )}
                </div>
              </div>

              {/* Special Order Delivery Progress */}
              {isSpecialOrder && (
                <div className="bg-sky-50/70 dark:bg-sky-950/30 p-2 rounded-xl border border-sky-200/60 dark:border-sky-800/60 text-xs flex items-center justify-between">
                  <span className="text-sky-800 dark:text-sky-300 font-semibold font-mono">
                    Delivered: {totalDelivered}/{order.quantity} (Left: {remainingQty})
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenSplitDelivery(order)}
                    className="px-2 py-0.5 bg-sky-600 text-white rounded text-[11px] font-bold hover:bg-sky-700"
                  >
                    Manage
                  </button>
                </div>
              )}

              {/* Specs: Paper, Size, Ink, Printing, Binding */}
              <div className="text-[11px] text-stone-600 dark:text-stone-400 flex flex-wrap items-center gap-1.5 pt-0.5 border-t border-stone-200/60 dark:border-stone-700/60">
                <span className="font-semibold text-stone-800 dark:text-stone-200">{order.paper_primary}</span>
                {order.paper_secondary && <span>+{order.paper_secondary}</span>}
                <span>• Size: {order.paper_size}</span>
                <span>• Bind: {order.binding_type}</span>
                <span>• {order.printing_type.replace(/\s*\(\d+[^)]*\)/g, '')}</span>
                {order.ink_colours.map((ink) => (
                  <span key={ink} className="px-1.5 py-0.2 bg-stone-200 dark:bg-stone-700 rounded text-[10px] font-bold text-stone-800 dark:text-stone-200">
                    {ink}
                  </span>
                ))}
              </div>

              {/* Billing & Action Bar */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-200/60 dark:border-stone-700/60 flex-wrap">
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    ₹{Number(order.total_amount).toLocaleString('en-IN')}
                  </span>
                  <span className="text-stone-500">
                    (Adv: ₹{Number(order.advance_amount).toLocaleString('en-IN')})
                  </span>
                  {hasBalance ? (
                    <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-200 font-bold rounded text-[11px]">
                      Due: ₹{order.balance_due}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold rounded text-[11px]">
                      Paid
                    </span>
                  )}
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center gap-1">
                  {hasBalance && (
                    <button
                      type="button"
                      onClick={() => onClearBalance(order.id)}
                      className="px-2 py-1 text-xs font-bold text-white bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-2xs"
                    >
                      Clear
                    </button>
                  )}
                  {isSpecialOrder && (
                    <button
                      type="button"
                      onClick={() => onOpenSplitDelivery(order)}
                      className="p-1.5 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg"
                    >
                      <Truck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onPrintTicket(order)}
                    className="p-1.5 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openWhatsApp(order)}
                    className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRepeatOrder(order)}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(order)}
                    className="p-1.5 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(order.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP & TABLET VIEW: Wide dense tabular register (>= 768px) */}
      <div className="hidden md:block overflow-x-auto w-full">
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
              const isSpecialOrder = order.order_type === 'Special Order' || (order.dispatches && order.dispatches.length > 0);
              const totalDelivered = (order.dispatches || []).reduce((sum, d) => sum + Number(d.quantity || 0), 0);
              const remainingQty = Math.max(0, order.quantity - totalDelivered);
              const isFullyDelivered = order.status === 'Delivered' || (isSpecialOrder && totalDelivered >= order.quantity && order.quantity > 0);

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
                      <div className="text-xs text-[#ea580c] dark:text-[#f97316] font-semibold font-mono mt-0.5">
                        Promise: {formatDDMMYYYY(order.promise_date)}
                      </div>
                    )}
                    {/* Special Order split delivery tracking in date column */}
                    {isSpecialOrder && totalDelivered > 0 && !isFullyDelivered && (
                      <div className="mt-1 space-y-0.5">
                        <div className="text-xs text-sky-600 dark:text-sky-400 font-bold font-mono">
                          Delivered: {totalDelivered.toLocaleString('en-IN')}/{order.quantity.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold font-mono">
                          Left: {remainingQty.toLocaleString('en-IN')}
                        </div>
                      </div>
                    )}
                    {isFullyDelivered && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono mt-0.5">
                        Delivered: {formatDDMMYYYY(order.delivered_date || order.promise_date || order.order_date)}
                        {isSpecialOrder && ` (${order.quantity.toLocaleString('en-IN')} complete)`}
                      </div>
                    )}
                  </td>

                  {/* Column 2: Party & Job Details */}
                  <td className="px-3 py-3 align-top">
                    <div className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base leading-snug">
                      {order.party_name}
                    </div>
                    <div className="mt-1">
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-800 rounded font-semibold text-xs sm:text-sm">
                        {order.job_details}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded text-xs font-bold">
                        Qty: {order.quantity.toLocaleString('en-IN')}
                      </span>
                      {order.order_type && order.order_type !== 'General' && (
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold border ${
                          order.order_type === 'Special Order'
                            ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                            : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        }`}>
                          {order.order_type === 'सप्ताह / Saptah' ? 'Saptah' : order.order_type}
                        </span>
                      )}
                      {/* Split delivery progress badge */}
                      {isSpecialOrder && (
                        isFullyDelivered ? (
                          <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded text-[11px] font-bold">
                            All Dispatches Complete ({order.quantity.toLocaleString('en-IN')})
                          </span>
                        ) : totalDelivered > 0 ? (
                          <button
                            type="button"
                            onClick={() => onOpenSplitDelivery(order)}
                            title="View split delivery details"
                            className="px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 rounded text-[11px] font-bold hover:bg-sky-100 transition-colors"
                          >
                            Dispatch: {totalDelivered.toLocaleString('en-IN')}/{order.quantity.toLocaleString('en-IN')} (Left: {remainingQty.toLocaleString('en-IN')})
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenSplitDelivery(order)}
                            title="Record split delivery"
                            className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 rounded text-[11px] font-semibold hover:bg-amber-100 transition-colors"
                          >
                            Pending Dispatch
                          </button>
                        )
                      )}
                      {order.party_phone && (
                        <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
                          • {order.party_phone}
                        </span>
                      )}
                    </div>
                    {order.notes && (
                      <div className="text-xs text-stone-500 dark:text-stone-400 italic mt-1 bg-stone-50 dark:bg-stone-800/80 px-2 py-0.5 rounded border border-stone-200/50 dark:border-stone-700">
                        "{order.notes}"
                      </div>
                    )}
                  </td>

                  {/* Column 3: Paper, Size & Ink */}
                  <td className="px-3 py-3 align-top space-y-1">
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {order.paper_primary}
                      {order.paper_secondary && (
                        <span className="text-stone-600 dark:text-stone-400 font-normal"> + {order.paper_secondary}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded text-xs font-semibold border border-stone-200 dark:border-stone-700">
                        Size: {order.paper_size}
                      </span>
                      {order.ink_colours.map((ink) => (
                        <span
                          key={ink}
                          className="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded text-xs font-bold border border-stone-200 dark:border-stone-700"
                        >
                          {ink}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Column 4: Print & Binding */}
                  <td className="px-3 py-3 align-top space-y-1">
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {order.printing_type.replace(/\s*\(\d+[^)]*\)/g, '')}
                    </div>
                    {order.print_qty && (
                      <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                        Imp: <strong className="text-stone-900 dark:text-stone-100 font-mono font-bold">{order.print_qty}</strong>
                      </div>
                    )}
                    <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                      Bind: <strong className="text-stone-900 dark:text-stone-100 font-semibold">{order.binding_type}</strong>
                    </div>
                    {order.numbering_range && (
                      <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-mono">
                        No: <strong className="text-stone-900 dark:text-stone-100 font-bold">{order.numbering_range}</strong>
                      </div>
                    )}
                  </td>

                  {/* Column 5: Billing & Balance */}
                  <td className="px-3 py-3 align-top whitespace-nowrap space-y-1">
                    <div className="text-sm font-bold text-stone-900 dark:text-stone-100 font-mono">
                      Total: ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-mono">
                      Adv: ₹{Number(order.advance_amount).toLocaleString('en-IN')}
                    </div>
                    <div className="pt-0.5">
                      {hasBalance ? (
                        <span className="inline-block px-2.5 py-1 bg-amber-100/90 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-lg text-xs sm:text-sm font-bold font-mono shadow-2xs">
                          Due: ₹{Number(order.balance_due).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs sm:text-sm font-bold shadow-2xs">
                          Paid
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Column 6: Status & Action */}
                  <td className="px-3 py-3 align-top text-right whitespace-nowrap space-y-2">
                    <div className="flex items-center justify-end">
                      {isFullyDelivered ? (
                        <span
                          title={`Order fully delivered (${order.quantity.toLocaleString('en-IN')} units) and locked. Use Edit to modify if needed.`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold border shadow-2xs bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 cursor-default select-none"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Delivered</span>
                          <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                        </span>
                      ) : order.status === 'Split Delivery' ? (
                        <button
                          type="button"
                          onClick={() => onOpenSplitDelivery(order)}
                          title="Record Split Delivery"
                          className="px-3 py-1 rounded-xl text-xs sm:text-sm font-bold border shadow-2xs transition-all hover:scale-[1.03] active:scale-[0.98] bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800"
                        >
                          {totalDelivered > 0 ? `Split Delivery (${totalDelivered.toLocaleString('en-IN')}/${order.quantity.toLocaleString('en-IN')})` : 'Split Delivery'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAdvanceStatus(order.id, order.status)}
                          title="Click to advance status"
                          className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-bold border shadow-2xs transition-all hover:scale-[1.03] active:scale-[0.98] ${statusMeta.badge}`}
                        >
                          {statusMeta.en}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1">
                      {hasBalance && (
                        <button
                          type="button"
                          onClick={() => onClearBalance(order.id)}
                          title="Clear remaining balance"
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-all hover:scale-[1.02]"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Clear ₹{order.balance_due}</span>
                        </button>
                      )}

                      {isSpecialOrder && (
                        <button
                          type="button"
                          onClick={() => onOpenSplitDelivery(order)}
                          title="Record Split Delivery"
                          className="p-1.5 text-sky-600 dark:text-sky-400 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors"
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onPrintTicket(order)}
                        title="Print Job Slip / Ticket"
                        className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openWhatsApp(order)}
                        title="Send WhatsApp Receipt"
                        className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onRepeatOrder(order)}
                        title="Repeat Order as new job ticket"
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(order)}
                        title="Edit Order in Workbench"
                        className="p-1.5 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(order.id)}
                        title="Delete Order"
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
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
});
