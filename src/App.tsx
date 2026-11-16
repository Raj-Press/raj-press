import React, { useState, useEffect, useMemo } from 'react';
import { Order, Party, Preset, KPIMetrics, OrderStatus } from './types';
import {
  getOrders,
  saveOrder,
  deleteOrder,
  updateOrderStatus,
  clearOrderBalance,
  getParties,
  getCustomPresets,
} from './lib/db';
import { exportOrdersToCSV, exportDatabaseJSON } from './lib/export';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Header } from './components/common/Header';
import { KPICards } from './components/dashboard/KPICards';
import { FilterBar, FilterCategory } from './components/dashboard/FilterBar';
import { OrderLedgerTable } from './components/orders/OrderLedgerTable';
import { OrderFormModal } from './components/orders/OrderFormModal';
import { JobTicketModal } from './components/orders/JobTicketModal';
import { CustomerKhataModal } from './components/parties/CustomerKhataModal';
import { AuthModal } from './components/auth/AuthModal';
import { ConfirmDialog } from './components/common/ConfirmDialog';

export const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);
  const [isKhataOpen, setIsKhataOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Current Auth User
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Initial Data Fetch
  const refreshData = async () => {
    try {
      const [orderList, partyList, presetList] = await Promise.all([
        getOrders(),
        getParties(),
        getCustomPresets(),
      ]);
      setOrders(orderList);
      setParties(partyList);
      setCustomPresets(presetList);
    } catch (err) {
      console.error('Failed to load initial data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Setup Supabase Realtime Listener if configured
    if (isSupabaseConfigured && supabase) {
      // Get current user session
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          setCurrentUser(data.session.user);
        }
      });

      const channel = supabase
        .channel('raj-press-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            refreshData();
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, []);

  // Compute Live Metrics
  const metrics: KPIMetrics = useMemo(() => {
    const totalOrders = orders.length;
    const activeJobs = orders.filter((o) => o.status !== 'Delivered').length;
    const totalBilled = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const totalAdvance = orders.reduce((sum, o) => sum + Number(o.advance_amount || 0), 0);
    const pendingBalance = orders.reduce((sum, o) => sum + Number(o.balance_due || 0), 0);

    return {
      totalOrders,
      activeJobs,
      totalBilled,
      totalAdvance,
      pendingBalance,
    };
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search Query
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (order.receipt_no && order.receipt_no.toLowerCase().includes(q)) ||
        (order.party_name && order.party_name.toLowerCase().includes(q)) ||
        (order.job_details && order.job_details.toLowerCase().includes(q)) ||
        (order.paper_primary && order.paper_primary.toLowerCase().includes(q)) ||
        (order.numbering_range && order.numbering_range.toLowerCase().includes(q)) ||
        (order.status && order.status.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // 2. Category Filter
      if (activeFilter === 'balance_due') {
        return order.balance_due > 0;
      }
      if (activeFilter === 'in_progress') {
        return ['Pending', 'Printing', 'Binding'].includes(order.status);
      }
      if (activeFilter === 'ready') {
        return order.status === 'Ready';
      }
      if (activeFilter === 'delivered') {
        return order.status === 'Delivered';
      }

      return true;
    });
  }, [orders, searchTerm, activeFilter]);

  // Handlers
  const handleSaveOrder = async (orderData: Partial<Order>) => {
    await saveOrder(orderData);
    await refreshData();
  };

  const handleDeleteOrder = async () => {
    if (deleteConfirmId) {
      await deleteOrder(deleteConfirmId);
      setDeleteConfirmId(null);
      await refreshData();
    }
  };

  const handleAdvanceStatus = async (id: string, currentStatus: OrderStatus) => {
    const nextMap: Record<OrderStatus, OrderStatus> = {
      Pending: 'Printing',
      Printing: 'Binding',
      Binding: 'Ready',
      Ready: 'Delivered',
      Delivered: 'Delivered',
    };
    const next = nextMap[currentStatus];
    if (next) {
      await updateOrderStatus(id, next);
      await refreshData();
    }
  };

  const handleClearBalance = async (id: string) => {
    await clearOrderBalance(id);
    await refreshData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Top Application Header */}
      <Header
        onNewOrder={() => {
          setEditingOrder(null);
          setIsOrderModalOpen(true);
        }}
        onOpenKhata={() => setIsKhataOpen(true)}
        onExportCSV={() => exportOrdersToCSV(orders)}
        onExportJSON={() => exportDatabaseJSON(orders)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 sm:px-6 space-y-5">
        {/* Real-time KPI Metric Cards */}
        <KPICards
          metrics={metrics}
          onFilterBalanceDue={() => setActiveFilter('balance_due')}
          onFilterActive={() => setActiveFilter('in_progress')}
        />

        {/* Search & Status Filters */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          totalFilteredCount={filteredOrders.length}
        />

        {/* Order Ledger Table & Mobile Cards */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 font-medium">
            डेटा लोड होत आहे, कृपया प्रतीक्षा करा...
          </div>
        ) : (
          <OrderLedgerTable
            orders={filteredOrders}
            onEdit={(order) => {
              setEditingOrder(order);
              setIsOrderModalOpen(true);
            }}
            onDelete={(id) => setDeleteConfirmId(id)}
            onPrintTicket={(order) => setTicketOrder(order)}
            onAdvanceStatus={handleAdvanceStatus}
            onClearBalance={handleClearBalance}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-4 text-center text-xs border-t border-slate-800 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>राज प्रेस (RAJ PRESS)</strong> — Commercial Printing & Binding Order Book & ERP
          </div>
          <div className="text-[11px] text-slate-500">
            100% Free-Forever Stack (Supabase PostgreSQL + Vite PWA + Cloudflare Pages)
          </div>
        </div>
      </footer>

      {/* Order Entry & Edit Modal */}
      <OrderFormModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleSaveOrder}
        editingOrder={editingOrder}
        existingParties={parties}
        customPresets={customPresets}
      />

      {/* Printable Job Ticket Modal (जॉब कार्ड) */}
      <JobTicketModal
        order={ticketOrder}
        onClose={() => setTicketOrder(null)}
      />

      {/* Customer Khata Directory Modal */}
      <CustomerKhataModal
        isOpen={isKhataOpen}
        onClose={() => setIsKhataOpen(false)}
        parties={parties}
        onSelectPartyOrders={(partyName) => {
          setSearchTerm(partyName);
          setActiveFilter('all');
        }}
      />

      {/* Supabase Cloud Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />

      {/* Order Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        title="ऑर्डर हटवण्याची खात्री करा"
        message="तुम्हाला ही ऑर्डर कायमची हटवायची आहे का? ही क्रिया पूर्ववत केली जाऊ शकत नाही."
        confirmLabel="होय, हटवा"
        cancelLabel="रद्द करा"
        onConfirm={handleDeleteOrder}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

export default App;
