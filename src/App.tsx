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
  generateNextReceiptNo,
} from './lib/db';
import { exportOrdersToCSV } from './lib/export';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Header } from './components/common/Header';
import { KPICards } from './components/dashboard/KPICards';
import { FilterBar, FilterCategory } from './components/dashboard/FilterBar';
import { OrderWorkbenchForm } from './components/orders/OrderWorkbenchForm';
import { OrderLedgerTable } from './components/orders/OrderLedgerTable';
import { JobTicketModal } from './components/orders/JobTicketModal';
import { CustomerKhataModal } from './components/parties/CustomerKhataModal';
import { AuthModal } from './components/auth/AuthModal';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { PlusCircle, ListOrdered } from 'lucide-react';

export const App: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dark Mode State
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('raj_press_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('raj_press_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('raj_press_theme', 'light');
    }
  }, [isDark]);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Editing state for workbench
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);
  const [isKhataOpen, setIsKhataOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Mobile View Tab Switcher ('workbench' | 'register')
  const [mobileTab, setMobileTab] = useState<'workbench' | 'register'>('workbench');

  // Current Auth User
  const [currentUser, setCurrentUser] = useState<any>(null);

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

    if (isSupabaseConfigured && supabase) {
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

  const nextReceiptNo = useMemo(() => {
    return generateNextReceiptNo(orders);
  }, [orders]);

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

  const duePartiesCount = useMemo(() => {
    const uniqueDueParties = new Set(
      orders.filter((o) => o.balance_due > 0).map((o) => o.party_name.trim().toLowerCase())
    );
    return uniqueDueParties.size;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'ALL' && order.status !== statusFilter) {
        return false;
      }

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

      if (activeFilter === 'balance_due') {
        return order.balance_due > 0;
      }
      if (activeFilter === 'in_progress') {
        return ['Pending', 'Printing', 'Binding', 'Ready'].includes(order.status);
      }
      if (activeFilter === 'delivered') {
        return order.status === 'Delivered';
      }

      return true;
    });
  }, [orders, searchTerm, activeFilter, statusFilter]);

  // Handlers
  const handleSaveOrder = async (orderData: Partial<Order>) => {
    await saveOrder(orderData);
    setEditingOrder(null);
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
      Delivered: 'Pending',
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

  const handleEditOrderInWorkbench = (order: Order) => {
    setEditingOrder(order);
    setMobileTab('workbench');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f4] dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased font-sans transition-colors duration-200">
      {/* Top Application Header */}
      <Header
        onExportCSV={() => exportOrdersToCSV(orders)}
        onOpenKhata={() => setIsKhataOpen(true)}
        onRefresh={refreshData}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
      />

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden px-3 pt-2 pb-1">
        <div className="grid grid-cols-2 p-1 bg-stone-200/80 dark:bg-stone-800 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setMobileTab('workbench')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'workbench'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#d9532f]" />
            <span>New Ticket</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('register')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'register'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Order Register ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Column Split Workbench Layout (Fitted for 100% Zoom) */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-2.5 py-3 sm:px-4 sm:py-3.5">
        <div className="flex flex-col lg:flex-row gap-3.5 sm:gap-4 items-start">
          
          {/* Left Column: Fixed Counter Entry Workbench (tuned ~340px) */}
          <div
            className={`w-full lg:w-[320px] xl:w-[345px] 2xl:w-[365px] shrink-0 lg:sticky lg:top-16 ${
              mobileTab === 'workbench' ? 'block' : 'hidden lg:block'
            }`}
          >
            <OrderWorkbenchForm
              onSave={handleSaveOrder}
              editingOrder={editingOrder}
              onCancelEdit={() => setEditingOrder(null)}
              existingParties={parties}
              customPresets={customPresets}
              nextReceiptNo={nextReceiptNo}
            />
          </div>

          {/* Right Column: KPIs + Filter + Live Order Register */}
          <div
            className={`flex-1 min-w-0 w-full space-y-3 sm:space-y-3.5 ${
              mobileTab === 'register' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* 4 Clean Top KPI Cards */}
            <KPICards
              metrics={metrics}
              duePartiesCount={duePartiesCount}
              onFilterBalanceDue={() => {
                setActiveFilter('balance_due');
                setStatusFilter('ALL');
              }}
              onFilterActive={() => {
                setActiveFilter('in_progress');
                setStatusFilter('ALL');
              }}
            />

            {/* Instant Search Bar & Status Filter Pills */}
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
            />

            {/* Live Order Register Table */}
            {isLoading ? (
              <div className="bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 rounded-3xl p-10 text-center text-stone-500 font-medium">
                Loading orders...
              </div>
            ) : (
              <OrderLedgerTable
                orders={filteredOrders}
                onEdit={handleEditOrderInWorkbench}
                onDelete={(id) => setDeleteConfirmId(id)}
                onPrintTicket={(order) => setTicketOrder(order)}
                onAdvanceStatus={handleAdvanceStatus}
                onClearBalance={handleClearBalance}
              />
            )}
          </div>

        </div>
      </main>

      {/* Modals & Dialogs */}
      <JobTicketModal
        order={ticketOrder}
        onClose={() => setTicketOrder(null)}
      />

      <CustomerKhataModal
        isOpen={isKhataOpen}
        onClose={() => setIsKhataOpen(false)}
        parties={parties}
        onSelectPartyOrders={(partyName) => {
          setSearchTerm(partyName);
          setActiveFilter('all');
          setStatusFilter('ALL');
          setMobileTab('register');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Order"
        message="Are you sure you want to permanently delete this job ticket from the ledger?"
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteOrder}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

export default App;
