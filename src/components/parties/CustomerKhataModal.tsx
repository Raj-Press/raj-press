import React, { useState } from 'react';
import { Party } from '../../types';
import { X, Search, MessageSquare, AlertTriangle, Users } from 'lucide-react';

interface CustomerKhataModalProps {
  isOpen: boolean;
  onClose: () => void;
  parties: Party[];
  onSelectPartyOrders: (partyName: string) => void;
}

export const CustomerKhataModal: React.FC<CustomerKhataModalProps> = ({
  isOpen,
  onClose,
  parties,
  onSelectPartyOrders,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = parties.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search))
  );

  const totalKhataBilled = parties.reduce((sum, p) => sum + (p.total_billed || 0), 0);
  const totalKhataPending = parties.reduce((sum, p) => sum + (p.total_pending || 0), 0);

  const sendPaymentReminder = (party: Party) => {
    if (!party.phone) {
      alert('Customer mobile number is not available.');
      return;
    }
    const cleanPhone = party.phone.replace(/[^0-9]/g, '');
    const phone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    const msg = encodeURIComponent(
      `नमस्कार *${party.name}*,\n\n` +
      `आपले खाते बाकी रक्कम:\n` +
      `*बाकी: ₹${Number(party.total_pending).toLocaleString('en-IN')}*\n\n` +
      `कृपया सदर रक्कम लवकर जमा करावी ही नम्र विनंती.\n\n` +
      `धन्यवाद!\n` +
      `Raj Press Barshi`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-900 dark:bg-black text-white">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#d9532f] rounded-xl">
              <Users className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="text-lg font-bold">Customer Khata Ledger</h2>
              <p className="text-xs text-stone-400">Total customer billing & pending dues</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khata Summary Stats */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl">
              <span className="text-xs text-stone-500 dark:text-stone-400 block">Total Customers:</span>
              <strong className="text-xl text-stone-800 dark:text-stone-100">{parties.length}</strong>
            </div>

            <div className="p-3 bg-blue-50/70 dark:bg-sky-950/40 border border-blue-200 dark:border-sky-800 rounded-2xl">
              <span className="text-xs text-sky-700 dark:text-sky-400 block">Total Billed:</span>
              <strong className="text-xl text-sky-900 dark:text-sky-200 font-mono">
                ₹{totalKhataBilled.toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="p-3 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl">
              <span className="text-xs text-rose-700 dark:text-rose-400 font-bold block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Pending Dues:
              </span>
              <strong className="text-xl text-[#c2410c] dark:text-[#ea580c] font-mono font-extrabold">
                ₹{totalKhataPending.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d9532f]/40"
            />
          </div>

          {/* Customer Table */}
          <div className="border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden max-h-[50vh] overflow-y-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold uppercase tracking-wider text-[11px] sticky top-0">
                <tr>
                  <th className="p-3">Customer / Party</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3 text-right">Total Billed</th>
                  <th className="p-3 text-right">Due Balance</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
                {filtered.map((party) => (
                  <tr key={party.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-stone-900 dark:text-stone-100">{party.name}</div>
                      {party.address && (
                        <div className="text-[11px] text-stone-400 truncate max-w-xs">{party.address}</div>
                      )}
                    </td>

                    <td className="p-3 font-mono text-stone-600 dark:text-stone-400">
                      {party.phone || '-'}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-stone-900 dark:text-stone-100">
                      ₹{Number(party.total_billed || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-sm">
                      <span className={party.total_pending > 0 ? 'text-[#c2410c] dark:text-[#ea580c] font-extrabold' : 'text-stone-400'}>
                        ₹{Number(party.total_pending || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="p-3 text-center space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectPartyOrders(party.name);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        View Orders
                      </button>

                      {party.total_pending > 0 && party.phone && (
                        <button
                          type="button"
                          onClick={() => sendPaymentReminder(party)}
                          title="Send WhatsApp payment reminder"
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" /> Remind
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
};
