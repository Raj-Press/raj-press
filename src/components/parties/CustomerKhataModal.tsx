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
      alert('ग्राहकाचा मोबाईल नंबर उपलब्ध नाही.');
      return;
    }
    const cleanPhone = party.phone.replace(/[^0-9]/g, '');
    const phone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
    const msg = encodeURIComponent(
      `*राज प्रेस (RAJ PRESS) - येणे बाकी आठवण*\n` +
      `नमस्कार ${party.name},\n` +
      `आपल्या मागील प्रिंटिंग कामाची एकूण बाकी रक्कम: *₹${Number(party.total_pending).toLocaleString('en-IN')}* येणे बाकी आहे.\n` +
      `कृपया ही रक्कम लवकर जमा करावी ही नम्र विनंती.\n` +
      `धन्यवाद! - राज प्रेस`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-600 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="text-lg font-bold">ग्राहक वही व खाते (Customer Khata Ledger)</h2>
              <p className="text-xs text-slate-300">ग्राहकांची एकूण बिलिंग व येणे बाकी शिल्लक यादी</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khata Summary Stats */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block">एकूण नोंदणीकृत ग्राहक:</span>
              <strong className="text-xl text-slate-800">{parties.length}</strong>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-xs text-blue-600 block">एकूण पार्टी बिलिंग:</span>
              <strong className="text-xl text-blue-900 font-mono">
                ₹{totalKhataBilled.toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-xs text-rose-600 font-bold block flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> एकूण येणे बाकी शिल्लक:
              </span>
              <strong className="text-xl text-rose-700 font-mono font-extrabold">
                ₹{totalKhataPending.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ग्राहक नांव किंवा फोन नंबर शोधा..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Customer Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[50vh] overflow-y-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="p-3">ग्राहकाचे नांव</th>
                  <th className="p-3">मोबाईल क्र.</th>
                  <th className="p-3 text-right">एकूण बिलिंग</th>
                  <th className="p-3 text-right">येणे बाकी ₹</th>
                  <th className="p-3 text-center">ॲक्शन्स</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filtered.map((party) => (
                  <tr key={party.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{party.name}</div>
                      {party.address && (
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{party.address}</div>
                      )}
                    </td>

                    <td className="p-3 font-mono text-slate-600">
                      {party.phone || '-'}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ₹{Number(party.total_billed || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-sm">
                      <span className={party.total_pending > 0 ? 'text-rose-700 font-extrabold' : 'text-slate-400'}>
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
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                      >
                        ऑर्डर्स पहा
                      </button>

                      {party.total_pending > 0 && party.phone && (
                        <button
                          type="button"
                          onClick={() => sendPaymentReminder(party)}
                          title="बाकी रकमेचा व्हॉट्सॲप मेसेज पाठवा"
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" /> आठवण
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
