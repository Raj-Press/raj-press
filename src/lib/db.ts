import { get, set } from 'idb-keyval';
import { Order, Party, Preset, DeliveryDispatch } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const ORDERS_KEY = 'raj_press_orders_v3';
const PARTIES_KEY = 'raj_press_parties_v3';
const PRESETS_KEY = 'raj_press_presets_v3';

const INITIAL_PARTIES: Party[] = [];

const INITIAL_ORDERS: Order[] = [];

export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (!error && data) {
        await set(ORDERS_KEY, data);
        return data as Order[];
      }
    } catch {
      // offline
    }
  }

  const cached = await get<Order[]>(ORDERS_KEY);
  if (cached && cached.length > 0) {
    return cached.map(o => ({
      ...o,
      printing_type: (o.printing_type || '').replace(/\s*\(\d+[^)]*\)/g, '').trim() || o.printing_type
    }));
  }

  await set(ORDERS_KEY, INITIAL_ORDERS);
  return INITIAL_ORDERS;
}

export async function saveOrder(orderData: Partial<Order>): Promise<Order> {
  const currentOrders = await getOrders();
  const total = Number(orderData.total_amount || 0);
  const advance = Number(orderData.advance_amount || 0);
  const balance = Math.max(0, total - advance);

  let updatedOrder: Order;

  if (orderData.id) {
    const existing = currentOrders.find(o => o.id === orderData.id);
    const newStatus = orderData.status || existing?.status || 'Pending';
    let delDate = orderData.delivered_date !== undefined ? orderData.delivered_date : existing?.delivered_date;
    if (newStatus === 'Delivered' && !delDate) {
      delDate = new Date().toISOString().split('T')[0];
    } else if (newStatus !== 'Delivered') {
      delDate = null;
    }

    updatedOrder = {
      ...existing!,
      ...orderData,
      status: newStatus,
      delivered_date: delDate,
      dispatches: orderData.dispatches !== undefined ? orderData.dispatches : (existing?.dispatches || null),
      total_amount: total,
      advance_amount: advance,
      balance_due: balance,
      updated_at: new Date().toISOString()
    } as Order;

    const index = currentOrders.findIndex(o => o.id === orderData.id);
    if (index !== -1) {
      currentOrders[index] = updatedOrder;
    }
  } else {
    const newId = crypto.randomUUID();
    const receiptNo = orderData.receipt_no || generateNextReceiptNo(currentOrders);
    const newStatus = orderData.status || 'Pending';
    const delDate = newStatus === 'Delivered'
      ? (orderData.delivered_date || new Date().toISOString().split('T')[0])
      : null;

    updatedOrder = {
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order_date: orderData.order_date || new Date().toISOString().split('T')[0],
      receipt_no: receiptNo,
      party_id: orderData.party_id || null,
      party_name: orderData.party_name || '',
      party_phone: orderData.party_phone || null,
      job_details: orderData.job_details || '',
      quantity: Number(orderData.quantity || 1),
      paper_primary: orderData.paper_primary || '9-map',
      paper_secondary: orderData.paper_secondary || null,
      paper_size: orderData.paper_size || '1/8',
      binding_type: orderData.binding_type || 'Regzin',
      ink_colours: orderData.ink_colours && orderData.ink_colours.length > 0 ? orderData.ink_colours : ['Black'],
      printing_type: orderData.printing_type || 'One-side',
      print_qty: orderData.print_qty || null,
      numbering_range: orderData.numbering_range || null,
      order_type: orderData.order_type || null,
      total_amount: total,
      advance_amount: advance,
      balance_due: balance,
      promise_date: orderData.promise_date || null,
      delivered_date: delDate,
      dispatches: orderData.dispatches || null,
      status: newStatus,
      notes: orderData.notes || null,
      _synced: false
    };

    currentOrders.unshift(updatedOrder);
  }

  await set(ORDERS_KEY, currentOrders);

  if (updatedOrder.party_name) {
    await upsertPartyFromOrder(updatedOrder, currentOrders);
  }

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const payload = { ...updatedOrder };
      delete payload._synced;
      await supabase.from('orders').upsert(payload);
    } catch (e) {
      console.warn('Supabase sync deferred', e);
    }
  }

  return updatedOrder;
}

export async function deleteOrder(id: string): Promise<void> {
  const currentOrders = await getOrders();
  const filtered = currentOrders.filter(o => o.id !== id);
  await set(ORDERS_KEY, filtered);

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('orders').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete error', e);
    }
  }
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
  const currentOrders = await getOrders();
  const index = currentOrders.findIndex(o => o.id === id);
  if (index === -1) return null;

  currentOrders[index].status = status;
  currentOrders[index].updated_at = new Date().toISOString();
  if (status === 'Delivered') {
    currentOrders[index].delivered_date = new Date().toISOString().split('T')[0];
  } else {
    currentOrders[index].delivered_date = null;
  }
  await set(ORDERS_KEY, currentOrders);

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('orders').update({
        status,
        delivered_date: currentOrders[index].delivered_date,
        updated_at: currentOrders[index].updated_at
      }).eq('id', id);
    } catch {
      // offline
    }
  }

  return currentOrders[index];
}

export async function addOrderDispatch(
  orderId: string,
  dispatch: Omit<DeliveryDispatch, 'id'>
): Promise<Order | null> {
  const currentOrders = await getOrders();
  const index = currentOrders.findIndex(o => o.id === orderId);
  if (index === -1) return null;

  const order = currentOrders[index];
  const newDispatch: DeliveryDispatch = {
    id: crypto.randomUUID(),
    dispatch_date: dispatch.dispatch_date || new Date().toISOString().split('T')[0],
    quantity: Number(dispatch.quantity) || 0,
    notes: dispatch.notes?.trim() || null,
  };

  const currentDispatches = order.dispatches ? [...order.dispatches] : [];
  currentDispatches.push(newDispatch);

  const totalDelivered = currentDispatches.reduce((sum, d) => sum + Number(d.quantity || 0), 0);
  const isFullyDelivered = totalDelivered >= order.quantity && order.quantity > 0;

  const newStatus: Order['status'] = isFullyDelivered ? 'Delivered' : 'Split Delivery';
  const delivered_date = isFullyDelivered ? newDispatch.dispatch_date : (order.delivered_date || null);

  const updated: Order = {
    ...order,
    dispatches: currentDispatches,
    status: newStatus,
    delivered_date,
    updated_at: new Date().toISOString(),
  };

  currentOrders[index] = updated;
  await set(ORDERS_KEY, currentOrders);

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('orders').update({
        dispatches: currentDispatches,
        status: newStatus,
        delivered_date,
        updated_at: updated.updated_at
      }).eq('id', orderId);
    } catch {
      // offline
    }
  }

  return updated;
}

export async function removeOrderDispatch(orderId: string, dispatchId: string): Promise<Order | null> {
  const currentOrders = await getOrders();
  const index = currentOrders.findIndex(o => o.id === orderId);
  if (index === -1) return null;

  const order = currentOrders[index];
  const currentDispatches = (order.dispatches || []).filter(d => d.id !== dispatchId);
  const totalDelivered = currentDispatches.reduce((sum, d) => sum + Number(d.quantity || 0), 0);
  const isFullyDelivered = totalDelivered >= order.quantity && order.quantity > 0;

  const newStatus: Order['status'] = isFullyDelivered ? 'Delivered' : (order.status === 'Delivered' ? 'Ready' : order.status);
  const delivered_date = isFullyDelivered ? (currentDispatches[currentDispatches.length - 1]?.dispatch_date || new Date().toISOString().split('T')[0]) : null;

  const updated: Order = {
    ...order,
    dispatches: currentDispatches,
    status: newStatus,
    delivered_date,
    updated_at: new Date().toISOString(),
  };

  currentOrders[index] = updated;
  await set(ORDERS_KEY, currentOrders);

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('orders').update({
        dispatches: currentDispatches,
        status: newStatus,
        delivered_date,
        updated_at: updated.updated_at
      }).eq('id', orderId);
    } catch {
      // offline
    }
  }

  return updated;
}

export async function clearOrderBalance(id: string): Promise<Order | null> {
  const currentOrders = await getOrders();
  const index = currentOrders.findIndex(o => o.id === id);
  if (index === -1) return null;

  currentOrders[index].advance_amount = currentOrders[index].total_amount;
  currentOrders[index].balance_due = 0;
  currentOrders[index].updated_at = new Date().toISOString();
  await set(ORDERS_KEY, currentOrders);

  await upsertPartyFromOrder(currentOrders[index], currentOrders);

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase
        .from('orders')
        .update({ advance_amount: currentOrders[index].total_amount, updated_at: currentOrders[index].updated_at })
        .eq('id', id);
    } catch {
      // offline
    }
  }

  return currentOrders[index];
}

export function generateNextReceiptNo(orders: Order[]): string {
  let maxNum = 100;

  orders.forEach(o => {
    const raw = (o.receipt_no || '').replace(/[^0-9]/g, '');
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  });

  return String(maxNum + 1);
}

export async function getParties(): Promise<Party[]> {
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const { data, error } = await supabase.from('parties').select('*').order('name');
      if (!error && data) {
        await set(PARTIES_KEY, data);
        return data as Party[];
      }
    } catch {
      // ignore
    }
  }

  const cached = await get<Party[]>(PARTIES_KEY);
  if (cached && cached.length > 0) {
    return cached;
  }

  await set(PARTIES_KEY, INITIAL_PARTIES);
  return INITIAL_PARTIES;
}

export async function upsertPartyFromOrder(order: Order, allOrders: Order[]): Promise<void> {
  const parties = await getParties();
  const partyOrders = allOrders.filter(o => o.party_name.trim().toLowerCase() === order.party_name.trim().toLowerCase());
  
  const totalBilled = partyOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalPending = partyOrders.reduce((sum, o) => sum + Number(o.balance_due || 0), 0);

  let existing = parties.find(p => p.name.trim().toLowerCase() === order.party_name.trim().toLowerCase());

  if (existing) {
    existing.total_billed = totalBilled;
    existing.total_pending = totalPending;
    if (order.party_phone && !existing.phone) {
      existing.phone = order.party_phone;
    }
  } else {
    existing = {
      id: crypto.randomUUID(),
      name: order.party_name,
      phone: order.party_phone || null,
      total_billed: totalBilled,
      total_pending: totalPending
    };
    parties.push(existing);
  }

  await set(PARTIES_KEY, parties);

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('parties').upsert(existing);
    } catch {
      // offline
    }
  }
}

export async function getCustomPresets(): Promise<Preset[]> {
  const cached = await get<Preset[]>(PRESETS_KEY);
  return cached || [];
}

export async function saveCustomPreset(category: Preset['category'], value: string): Promise<void> {
  if (!value || !value.trim()) return;
  const cleanVal = value.trim();

  const presets = await getCustomPresets();
  const exists = presets.some(p => p.category === category && p.value.toLowerCase() === cleanVal.toLowerCase());
  if (exists) return;

  const newPreset: Preset = {
    id: crypto.randomUUID(),
    category,
    value: cleanVal
  };

  presets.push(newPreset);
  await set(PRESETS_KEY, presets);

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('presets').insert(newPreset);
    } catch {
      // offline
    }
  }
}
