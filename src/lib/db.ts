import { get, set } from 'idb-keyval';
import { Order, Party, Preset, DeliveryDispatch } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const ORDERS_KEY = 'raj_press_orders_v3';
const PARTIES_KEY = 'raj_press_parties_v3';
const PRESETS_KEY = 'raj_press_presets_v3';

const INITIAL_PARTIES: Party[] = [];

const INITIAL_ORDERS: Order[] = [];

export async function getOrders(): Promise<Order[]> {
  const cached = (await get<Order[]>(ORDERS_KEY)) || [];

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (!error && data) {
        // Merge Supabase orders with any local orders that have not synced yet
        const supabaseIds = new Set(data.map((o: any) => o.id));
        const localOnly = cached.filter(o => !supabaseIds.has(o.id));

        // Preserve local fields (like patrika_cost) if remote Supabase doesn't have the column yet
        const merged: Order[] = [
          ...localOnly,
          ...data.map((remote: any) => {
            const localMatch = cached.find(c => c.id === remote.id);
            return {
              ...remote,
              printing_type: (remote.printing_type || '').replace(/\s*\(\d+[^)]*\)/g, '').trim() || remote.printing_type,
              patrika_cost: remote.patrika_cost !== undefined ? remote.patrika_cost : (localMatch?.patrika_cost ?? null)
            } as Order;
          })
        ];

        await set(ORDERS_KEY, merged);
        return merged;
      }
    } catch {
      // offline
    }
  }

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
  let oldPartyName: string | undefined;

  if (orderData.id) {
    const existing = currentOrders.find(o => o.id === orderData.id);
    oldPartyName = existing?.party_name;
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
      patrika_cost: orderData.patrika_cost !== undefined ? orderData.patrika_cost : null,
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
  if (oldPartyName && oldPartyName.trim().toLowerCase() !== updatedOrder.party_name.trim().toLowerCase()) {
    await updateOrRemovePartyAfterOrderChange(oldPartyName, currentOrders);
  }

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const payload: any = { ...updatedOrder };
      delete payload._synced;
      delete payload.balance_due; // Crucial: PostgreSQL balance_due is GENERATED ALWAYS STORED column

      const { error } = await supabase.from('orders').upsert(payload);

      if (error) {
        console.warn('Supabase initial upsert returned error:', error.message);
        // If Supabase schema has not yet added the patrika_cost column (PGRST204),
        // retry saving without patrika_cost so the order is 100% saved in Supabase!
        if (error.code === 'PGRST204' || error.message?.includes('patrika_cost') || error.message?.includes('column')) {
          const fallbackPayload = { ...payload };
          delete fallbackPayload.patrika_cost;
          const retry = await supabase.from('orders').upsert(fallbackPayload);
          if (!retry.error) {
            updatedOrder._synced = true;
          } else {
            console.error('Supabase fallback upsert failed:', retry.error);
          }
        }
      } else {
        updatedOrder._synced = true;
      }
    } catch (e) {
      console.warn('Supabase sync deferred', e);
    }
  }

  return updatedOrder;
}

export async function deleteOrder(id: string): Promise<void> {
  const currentOrders = await getOrders();
  const deletedOrder = currentOrders.find(o => o.id === id);
  const filtered = currentOrders.filter(o => o.id !== id);
  await set(ORDERS_KEY, filtered);

  if (deletedOrder && deletedOrder.party_name) {
    await updateOrRemovePartyAfterOrderChange(deletedOrder.party_name, filtered);
  }

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

export async function updateOrRemovePartyAfterOrderChange(partyName: string, allOrders: Order[]): Promise<void> {
  if (!partyName) return;
  const parties = await getParties();
  const cleanName = partyName.trim().toLowerCase();
  const remainingPartyOrders = allOrders.filter(o => o.party_name.trim().toLowerCase() === cleanName);

  const existingIndex = parties.findIndex(p => p.name.trim().toLowerCase() === cleanName);
  const existingParty = existingIndex !== -1 ? parties[existingIndex] : null;

  if (remainingPartyOrders.length === 0) {
    // If no orders remain for this party, completely delete from Khata
    if (existingParty) {
      parties.splice(existingIndex, 1);
      await set(PARTIES_KEY, parties);

      if (isSupabaseConfigured && supabase && navigator.onLine) {
        try {
          await supabase.from('parties').delete().eq('id', existingParty.id);
        } catch (e) {
          console.warn('Supabase party delete error', e);
        }
      }
    }
  } else {
    // Recalculate customer's balance & billing from remaining orders
    const totalBilled = remainingPartyOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const totalPending = remainingPartyOrders.reduce((sum, o) => sum + Number(o.balance_due || 0), 0);

    if (existingParty) {
      existingParty.total_billed = totalBilled;
      existingParty.total_pending = totalPending;
      await set(PARTIES_KEY, parties);

      if (isSupabaseConfigured && supabase && navigator.onLine) {
        try {
          await supabase.from('parties').upsert(existingParty);
        } catch (e) {
          console.warn('Supabase party update error', e);
        }
      }
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
