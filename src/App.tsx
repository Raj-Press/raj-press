import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import { Order, Party, Preset, KPIMetrics, OrderStatus } from './types';
import {
  getOrders,
  saveOrder,
  deleteOrder,
  updateOrderStatus,
  clearOrderBalance,
  addOrderDispatch,
  removeOrderDispatch,
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
import { SplitDeliveryModal } from './components/orders/SplitDeliveryModal';
import { CustomerKhataModal } from './components/parties/CustomerKhataModal';
import { DailyDaybookModal } from './components/daybook/DailyDaybookModal';
import { AuthModal } from './components/auth/AuthModal';
import { LockScreen } from './components/auth/LockScreen';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { isAppUnlocked, lockApp } from './lib/auth';
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
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('ALL');

  // Editing & Repeat state for workbench
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [repeatSource, setRepeatSource] = useState<Order | null>(null);
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);
  const [splitDeliveryOrder, setSplitDeliveryOrder] = useState<Order | null>(null);
  const [isKhataOpen, setIsKhataOpen] = useState(false);
  const [isDaybookOpen, setIsDaybookOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isAppUnlocked());
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
      // Guarantee Customer Khata only shows parties that have orders in the order book
      const activePartyNames = new Set(orderList.map((o) => o.party_name.trim().toLowerCase()));
      const cleanedParties = partyList.filter((p) => activePartyNames.has(p.name.trim().toLowerCase()));

      setOrders(orderList);
      setParties(cleanedParties);
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

  const patrikaMetrics = useMemo(() => {
    const patrikaOrders = orders.filter(
      (o) => o.order_type === 'Patrika' || o.order_type === 'Patrika / Wedding Cards'
    );
    const totalOrders = patrikaOrders.length;
    const totalCost = patrikaOrders.reduce((sum, o) => sum + Number(o.patrika_cost || 0), 0);
    const totalBilled = patrikaOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const netProfit = totalBilled - totalCost;
    const profitMargin = totalBilled > 0 ? ((netProfit / totalBilled) * 100).toFixed(1) : '0';

    return {
      totalOrders,
      totalCost,
      totalBilled,
      netProfit,
      profitMargin,
    };
  }, [orders]);

  const availableOrderTypes = useMemo(() => {
    return Array.from(
      new Set([
        'General',
        'Patrika',
        'Saptah',
        'Special Order',
        ...customPresets.filter((p) => p.category === 'order_type').map((p) => p.value),
        ...orders.map((o) => {
          if (o.order_type === 'सप्ताह / Saptah') return 'Saptah';
          if (o.order_type === 'Patrika / Wedding Cards') return 'Patrika';
          return o.order_type;
        }).filter(Boolean) as string[],
      ])
    );
  }, [customPresets, orders]);

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const isDeliveredFilterActive = statusFilter === 'Delivered' || activeFilter === 'delivered';

      // Delivered orders are hidden from the view unless status filter is explicitly set to Delivered
      if (order.status === 'Delivered' && !isDeliveredFilterActive) {
        return false;
      }

      if (statusFilter !== 'ALL' && order.status !== statusFilter) {
        return false;
      }

      if (orderTypeFilter !== 'ALL') {
        if (orderTypeFilter === 'General') {
          if (order.order_type && order.order_type !== 'General') return false;
        } else if (orderTypeFilter === 'Saptah') {
          if (order.order_type !== 'Saptah' && order.order_type !== 'सप्ताह / Saptah') return false;
        } else if (orderTypeFilter === 'Patrika') {
          if (order.order_type !== 'Patrika' && order.order_type !== 'Patrika / Wedding Cards') return false;
        } else {
          if (order.order_type !== orderTypeFilter) return false;
        }
      }

      const q = deferredSearchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (order.receipt_no && order.receipt_no.toLowerCase().includes(q)) ||
        (order.party_name && order.party_name.toLowerCase().includes(q)) ||
        (order.job_details && order.job_details.toLowerCase().includes(q)) ||
        (order.order_type && order.order_type.toLowerCase().includes(q)) ||
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
  }, [orders, deferredSearchTerm, activeFilter, statusFilter, orderTypeFilter]);

  // Memoized Handlers with Optimistic Updates for Instant Zero-Lag Response
  const handleSaveOrder = useCallback(async (orderData: Partial<Order>) => {
    const saved = await saveOrder(orderData);
    setEditingOrder(null);
    setRepeatSource(null);
    // Optimistic UI state update so new order immediately appears in the ledger
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === saved.id);
      if (exists) {
        return prev.map((o) => (o.id === saved.id ? saved : o));
      }
      return [saved, ...prev];
    });
    await refreshData();
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingOrder(null);
    setRepeatSource(null);
  }, []);

  const handleCancelRepeat = useCallback(() => {
    setRepeatSource(null);
    setEditingOrder(null);
  }, []);

  const handleRepeatOrder = useCallback((order: Order) => {
    setRepeatSource(order);
    setEditingOrder({
      ...order,
      id: '', // Blank ID instructs saveOrder to create a fresh new order
      receipt_no: nextReceiptNo,
      order_date: new Date().toISOString().split('T')[0],
      advance_amount: 0,
      balance_due: order.total_amount,
      status: 'Pending',
      promise_date: '',
    });
    setMobileTab('workbench');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [nextReceiptNo]);

  const handleDeleteOrder = useCallback(async () => {
    if (deleteConfirmId) {
      const orderToDelete = orders.find((o) => o.id === deleteConfirmId);
      // 1. Optimistic delete from orders ledger
      const remainingOrders = orders.filter((o) => o.id !== deleteConfirmId);
      setOrders(remainingOrders);

      // 2. Optimistic update for Customer Khata
      if (orderToDelete) {
        const cleanName = orderToDelete.party_name.trim().toLowerCase();
        const partyRemaining = remainingOrders.filter((o) => o.party_name.trim().toLowerCase() === cleanName);

        setParties((prevParties) => {
          if (partyRemaining.length === 0) {
            // Customer has 0 orders left -> Remove immediately from Khata
            return prevParties.filter((p) => p.name.trim().toLowerCase() !== cleanName);
          } else {
            // Recalculate customer's balance & billing
            const newBilled = partyRemaining.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
            const newPending = partyRemaining.reduce((sum, o) => sum + Number(o.balance_due || 0), 0);
            return prevParties.map((p) =>
              p.name.trim().toLowerCase() === cleanName
                ? { ...p, total_billed: newBilled, total_pending: newPending }
                : p
            );
          }
        });
      }

      await deleteOrder(deleteConfirmId);
      setDeleteConfirmId(null);
      await refreshData();
    }
  }, [deleteConfirmId, orders]);

  const handleAdvanceStatus = useCallback(async (id: string, currentStatus: OrderStatus) => {
    const order = orders.find((o) => o.id === id);
    const isSpecial = order?.order_type === 'Special Order' || (order?.dispatches && order.dispatches.length > 0);

    if (isSpecial) {
      const specialNextMap: Record<OrderStatus, OrderStatus> = {
        Pending: 'Printing',
        Printing: 'Binding',
        Binding: 'Ready',
        Ready: 'Split Delivery',
        'Split Delivery': 'Split Delivery',
        Delivered: 'Delivered',
      };

      if (currentStatus === 'Split Delivery') {
        if (order) setSplitDeliveryOrder(order);
        return;
      }

      const next = specialNextMap[currentStatus];
      if (next && next !== currentStatus) {
        // Optimistic update
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
        await updateOrderStatus(id, next);
        await refreshData();
      }
      return;
    }

    const nextMap: Record<OrderStatus, OrderStatus> = {
      Pending: 'Printing',
      Printing: 'Binding',
      Binding: 'Ready',
      Ready: 'Delivered',
      'Split Delivery': 'Delivered',
      Delivered: 'Pending',
    };
    const next = nextMap[currentStatus];
    if (next) {
      // Instant Optimistic Update in 0ms
      const todayDate = new Date().toISOString().split('T')[0];
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== id) return o;
          const delDate = next === 'Delivered' ? (o.delivered_date || todayDate) : (currentStatus === 'Delivered' ? null : o.delivered_date);
          return { ...o, status: next, delivered_date: delDate };
        })
      );
      await updateOrderStatus(id, next);
      await refreshData();
    }
  }, [orders]);

  const handleSaveDispatch = useCallback(async (orderId: string, dispatch: { dispatch_date: string; quantity: number; notes?: string }) => {
    const updated = await addOrderDispatch(orderId, dispatch);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setSplitDeliveryOrder(updated);
    }
    await refreshData();
  }, []);

  const handleRemoveDispatch = useCallback(async (orderId: string, dispatchId: string) => {
    const updated = await removeOrderDispatch(orderId, dispatchId);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      setSplitDeliveryOrder(updated);
    }
    await refreshData();
  }, []);

  const handleClearBalance = useCallback(async (id: string) => {
    // Instant Optimistic UI Clear in 0ms
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, advance_amount: o.total_amount, balance_due: 0 } : o))
    );
    await clearOrderBalance(id);
    await refreshData();
  }, []);

  const handleEditOrderInWorkbench = useCallback((order: Order) => {
    setEditingOrder(order);
    setMobileTab('workbench');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleExportCSV = useCallback(() => {
    exportOrdersToCSV(orders);
  }, [orders]);

  const handleToggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const handleLockApp = useCallback(() => {
    lockApp();
    setIsUnlocked(false);
  }, []);

  // Password Lock Screen Gate
  if (!isUnlocked) {
    return <LockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f7f4] dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased font-sans transition-colors duration-200">
      {/* Top Application Header */}
      <Header
        onExportCSV={handleExportCSV}
        onOpenKhata={() => setIsKhataOpen(true)}
        onOpenDaybook={() => setIsDaybookOpen(true)}
        onRefresh={refreshData}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLockApp={handleLockApp}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        currentUser={currentUser}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />

      {/* Mobile Tab Switcher - Sticky below header for effortless 1-tap navigation */}
      <div className="lg:hidden px-3 pt-2 pb-2 sticky top-[57px] z-20 bg-[#f8f7f4]/95 dark:bg-stone-950/95 backdrop-blur-xs border-b border-stone-200/60 dark:border-stone-800/60 print:hidden">
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
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-2.5 py-3 sm:px-4 sm:py-3.5 print:hidden">
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
              onCancelEdit={handleCancelEdit}
              repeatSource={repeatSource}
              onCancelRepeat={handleCancelRepeat}
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
            {/* Top KPI Cards (Switches automatically to Patrika Analysis when Patrika is filtered) */}
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
              isPatrikaFilter={orderTypeFilter === 'Patrika'}
              patrikaMetrics={patrikaMetrics}
            />

            {/* Instant Search Bar & Status Filter Pills */}
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              orderTypeFilter={orderTypeFilter}
              onOrderTypeFilterChange={setOrderTypeFilter}
              availableOrderTypes={availableOrderTypes}
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
                onRepeatOrder={handleRepeatOrder}
                onOpenSplitDelivery={setSplitDeliveryOrder}
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

      {splitDeliveryOrder && (
        <SplitDeliveryModal
          order={splitDeliveryOrder}
          onClose={() => setSplitDeliveryOrder(null)}
          onSaveDispatch={handleSaveDispatch}
          onRemoveDispatch={handleRemoveDispatch}
        />
      )}

      <CustomerKhataModal
        isOpen={isKhataOpen}
        onClose={() => setIsKhataOpen(false)}
        parties={parties}
        onSelectPartyOrders={(partyName) => {
          setSearchTerm(partyName);
          const partyOrders = orders.filter(
            (o) => o.party_name.trim().toLowerCase() === partyName.trim().toLowerCase()
          );
          const hasActiveOrders = partyOrders.some((o) => o.status !== 'Delivered');
          setActiveFilter(hasActiveOrders ? 'all' : 'delivered');
          setStatusFilter(hasActiveOrders ? 'ALL' : 'Delivered');
          setMobileTab('register');
        }}
      />

      <DailyDaybookModal
        isOpen={isDaybookOpen}
        onClose={() => setIsDaybookOpen(false)}
        orders={orders}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
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
