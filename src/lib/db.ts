import { get, set } from 'idb-keyval';
import { Order, Party, Preset, DeliveryDispatch, DaybookEntry, DaybookClosing } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const ORDERS_KEY = 'raj_press_orders_v3';
const PARTIES_KEY = 'raj_press_parties_v3';
const PRESETS_KEY = 'raj_press_presets_v3';
const DAYBOOK_ENTRIES_KEY = 'raj_press_daybook_entries_v1';
const DAYBOOK_CLOSINGS_KEY = 'raj_press_daybook_closings_v1';

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
              patrika_cost: remote.patrika_cost !== undefined ? remote.patrika_cost : (localMatch?.patrika_cost ?? null),
              paper_tertiary: remote.paper_tertiary !== undefined ? remote.paper_tertiary : (localMatch?.paper_tertiary ?? null)
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
      paper_secondary: orderData.paper_secondary !== undefined ? orderData.paper_secondary : (existing?.paper_secondary || null),
      paper_tertiary: orderData.paper_tertiary !== undefined ? orderData.paper_tertiary : (existing?.paper_tertiary || null),
      status: newStatus,
      delivered_date: delDate,
      dispatches: orderData.dispatches !== undefined ? orderData.dispatches : (existing?.dispatches || null),
      total_amount: total,
      advance_amount: advance,
      advance_mode: orderData.advance_mode || 'cash',
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
      paper_tertiary: orderData.paper_tertiary || null,
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
      advance_mode: orderData.advance_mode || 'cash',
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
        // If Supabase schema has not yet added optional columns like patrika_cost or paper_tertiary (PGRST204),
        // retry saving without them so the order is 100% saved in Supabase!
        if (error.code === 'PGRST204' || error.message?.includes('patrika_cost') || error.message?.includes('paper_tertiary') || error.message?.includes('advance_mode') || error.message?.includes('column')) {
          const fallbackPayload = { ...payload };
          delete fallbackPayload.patrika_cost;
          delete fallbackPayload.paper_tertiary;
          delete fallbackPayload.advance_mode;
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

  // Auto-sync advance into Daybook if advance is specified
  try {
    await syncOrderAdvanceToDaybook(updatedOrder);
  } catch (err) {
    console.warn('Failed to sync advance to daybook', err);
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

  // Also clean up linked order daybook entries
  try {
    const daybookEntries = await getDaybookEntries();
    const remainingDaybook = daybookEntries.filter(e => e.order_id !== id);
    if (remainingDaybook.length !== daybookEntries.length) {
      await set(DAYBOOK_ENTRIES_KEY, remainingDaybook);
    }
  } catch {
    // ignore
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

export async function clearOrderBalance(id: string, paymentMode: 'cash' | 'online' = 'cash'): Promise<Order | null> {
  const currentOrders = await getOrders();
  const index = currentOrders.findIndex(o => o.id === id);
  if (index === -1) return null;

  const previousBalance = Math.max(0, Number(currentOrders[index].balance_due || 0));

  currentOrders[index].advance_amount = currentOrders[index].total_amount;
  currentOrders[index].balance_due = 0;
  currentOrders[index].updated_at = new Date().toISOString();
  await set(ORDERS_KEY, currentOrders);

  await upsertPartyFromOrder(currentOrders[index], currentOrders);

  if (previousBalance > 0) {
    try {
      await saveDaybookEntry({
        entry_date: new Date().toISOString().split('T')[0],
        entry_type: 'jama',
        payment_mode: paymentMode,
        amount: previousBalance,
        party_name: `${currentOrders[index].party_name} (Balance Paid)`.trim(),
        category: 'Order',
        order_id: currentOrders[index].id,
        receipt_no: currentOrders[index].receipt_no,
        notes: `Balance cleared for Order #${currentOrders[index].receipt_no}`
      });
    } catch (e) {
      console.warn('Failed to post balance clearance to daybook', e);
    }
  }

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

// ==========================================
// Daily Daybook / Rojmel (दैनिक रोजमेळ) Engine
// ==========================================

export async function getDaybookEntries(targetDate?: string): Promise<DaybookEntry[]> {
  let entries = (await get<DaybookEntry[]>(DAYBOOK_ENTRIES_KEY)) || [];
  // Auto-purge any previous sample/mockup entries
  if (entries.some(e => e.id.startsWith('rp-sample-') || e.id.startsWith('sample-'))) {
    entries = entries.filter(e => !e.id.startsWith('rp-sample-') && !e.id.startsWith('sample-'));
    await set(DAYBOOK_ENTRIES_KEY, entries);
  }

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      // 1. Try querying native daily_daybook table first
      let query = supabase.from('daily_daybook').select('*').order('created_at', { ascending: false });
      if (targetDate) {
        query = query.eq('entry_date', targetDate);
      }
      const { data, error } = await query;

      if (!error && data) {
        const supabaseIds = new Set(data.map((e: any) => e.id));
        const localOnly = targetDate
          ? entries.filter(e => e.entry_date === targetDate && !supabaseIds.has(e.id))
          : entries.filter(e => !supabaseIds.has(e.id));
        const merged = [...localOnly, ...data];
        await set(DAYBOOK_ENTRIES_KEY, merged);
        return targetDate ? merged.filter(e => e.entry_date === targetDate) : merged;
      }

      // 2. If table does not exist (PGRST205), fall back to presets sync storage!
      if (error && (error.code === 'PGRST205' || error.message?.includes('not find the table') || error.message?.includes('schema cache'))) {
        const { data: presetData, error: presetError } = await supabase
          .from('presets')
          .select('id, created_at, value')
          .eq('category', 'daybook_entry')
          .order('created_at', { ascending: false });

        if (!presetError && presetData) {
          const remoteEntries: DaybookEntry[] = presetData
            .map((p: any) => {
              try {
                const parsed = JSON.parse(p.value);
                return {
                  ...parsed,
                  id: p.id,
                  created_at: parsed.created_at || p.created_at,
                  _synced: true,
                };
              } catch {
                return null;
              }
            })
            .filter(Boolean) as DaybookEntry[];

          const remoteIds = new Set(remoteEntries.map(e => e.id));
          const localOnly = entries.filter(e => !remoteIds.has(e.id));
          const merged = [...localOnly, ...remoteEntries];
          await set(DAYBOOK_ENTRIES_KEY, merged);

          // If local has unsynced entries that mobile/desktop created, push them to Supabase presets now
          for (const unsynced of localOnly) {
            try {
              await supabase.from('presets').upsert({
                id: unsynced.id,
                category: 'daybook_entry',
                value: JSON.stringify(unsynced),
              });
            } catch {
              // ignore
            }
          }

          return targetDate ? merged.filter(e => e.entry_date === targetDate) : merged;
        }
      }
    } catch (e) {
      console.warn('Supabase daybook fetch error', e);
    }
  }

  if (targetDate) {
    return entries.filter(e => e.entry_date === targetDate);
  }
  return entries;
}

export async function saveDaybookEntry(entryData: Partial<DaybookEntry>): Promise<DaybookEntry> {
  const currentEntries = await getDaybookEntries();
  let updated: DaybookEntry;

  if (entryData.id) {
    const existingIndex = currentEntries.findIndex(e => e.id === entryData.id);
    if (existingIndex !== -1) {
      updated = {
        ...currentEntries[existingIndex],
        ...entryData,
        amount: Number(entryData.amount !== undefined ? entryData.amount : currentEntries[existingIndex].amount)
      };
      currentEntries[existingIndex] = updated;
    } else {
      updated = {
        id: entryData.id,
        created_at: new Date().toISOString(),
        entry_date: entryData.entry_date || new Date().toISOString().split('T')[0],
        entry_type: entryData.entry_type || 'jama',
        payment_mode: entryData.payment_mode || 'cash',
        amount: Number(entryData.amount || 0),
        party_name: entryData.party_name || '',
        category: entryData.category || 'Direct',
        order_id: entryData.order_id || null,
        receipt_no: entryData.receipt_no || null,
        notes: entryData.notes || null,
        _synced: false
      };
      currentEntries.unshift(updated);
    }
  } else {
    const newId = crypto.randomUUID();
    updated = {
      id: newId,
      created_at: new Date().toISOString(),
      entry_date: entryData.entry_date || new Date().toISOString().split('T')[0],
      entry_type: entryData.entry_type || 'jama',
      payment_mode: entryData.payment_mode || 'cash',
      amount: Number(entryData.amount || 0),
      party_name: entryData.party_name || '',
      category: entryData.category || 'Direct',
      order_id: entryData.order_id || null,
      receipt_no: entryData.receipt_no || null,
      notes: entryData.notes || null,
      _synced: false
    };
    currentEntries.unshift(updated);
  }

  await set(DAYBOOK_ENTRIES_KEY, currentEntries);

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const payload: any = { ...updated };
      delete payload._synced;

      // 1. Try native daily_daybook table
      const { error } = await supabase.from('daily_daybook').upsert(payload);
      if (!error) {
        updated._synced = true;
      } else if (error.code === 'PGRST205' || error.message?.includes('not find the table') || error.message?.includes('schema cache')) {
        // 2. Fallback to presets sync store
        const fallbackRes = await supabase.from('presets').upsert({
          id: updated.id,
          category: 'daybook_entry',
          value: JSON.stringify(updated)
        });
        if (!fallbackRes.error) {
          updated._synced = true;
        } else {
          console.error('Supabase fallback presets error', fallbackRes.error);
        }
      } else {
        console.error('Supabase daybook error', error);
      }
    } catch (e) {
      console.warn('Supabase daybook save error', e);
    }
  }

  return updated;
}

export async function deleteDaybookEntry(id: string): Promise<void> {
  const currentEntries = await getDaybookEntries();
  const filtered = currentEntries.filter(e => e.id !== id);
  await set(DAYBOOK_ENTRIES_KEY, filtered);

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('daily_daybook').delete().eq('id', id);
      await supabase.from('presets').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase daybook delete error', e);
    }
  }
}

export async function getDaybookClosing(date: string): Promise<DaybookClosing | null> {
  let closings = await get<DaybookClosing[]>(DAYBOOK_CLOSINGS_KEY);
  if (closings && closings.some(c => c.closing_date === '2026-01-10' && c.notes?.includes('Saturday closing tally'))) {
    closings = closings.filter(c => !(c.closing_date === '2026-01-10' && c.notes?.includes('Saturday closing tally')));
    await set(DAYBOOK_CLOSINGS_KEY, closings);
  }
  if (!closings) {
    closings = [];
  }

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      // 1. Try native table
      const { data, error } = await supabase.from('daybook_closings').select('*').eq('closing_date', date).maybeSingle();
      if (!error && data) {
        return data as DaybookClosing;
      }

      // 2. Fallback to presets table
      if (error && (error.code === 'PGRST205' || error.message?.includes('not find the table') || error.message?.includes('schema cache'))) {
        const { data: pData } = await supabase
          .from('presets')
          .select('id, value')
          .eq('category', 'daybook_closing')
          .limit(100);

        if (pData) {
          for (const item of pData) {
            try {
              const parsed = JSON.parse(item.value);
              if (parsed.closing_date === date) {
                return parsed as DaybookClosing;
              }
            } catch {
              // ignore
            }
          }
        }
      }
    } catch {
      // offline
    }
  }

  const found = closings.find(c => c.closing_date === date);
  return found || null;
}

export async function saveDaybookClosing(closing: DaybookClosing): Promise<DaybookClosing> {
  let closings = (await get<DaybookClosing[]>(DAYBOOK_CLOSINGS_KEY)) || [];
  const index = closings.findIndex(c => c.closing_date === closing.closing_date);

  const updated: DaybookClosing = {
    ...closing,
    id: closing.id || crypto.randomUUID(),
    updated_at: new Date().toISOString()
  };

  if (index !== -1) {
    closings[index] = updated;
  } else {
    closings.push(updated);
  }

  await set(DAYBOOK_CLOSINGS_KEY, closings);

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      // 1. Try native
      const { error } = await supabase.from('daybook_closings').upsert(updated);
      if (error && (error.code === 'PGRST205' || error.message?.includes('not find the table') || error.message?.includes('schema cache'))) {
        // 2. Fallback to presets
        const { data: existingPreset } = await supabase
          .from('presets')
          .select('id, value')
          .eq('category', 'daybook_closing');

        let presetId = updated.id;
        if (existingPreset) {
          const match = existingPreset.find(p => {
            try { return JSON.parse(p.value).closing_date === updated.closing_date; } catch { return false; }
          });
          if (match) presetId = match.id;
        }

        await supabase.from('presets').upsert({
          id: presetId,
          category: 'daybook_closing',
          value: JSON.stringify(updated)
        });
      }
    } catch {
      // offline
    }
  }

  return updated;
}

export async function syncOrderAdvanceToDaybook(order: Order): Promise<void> {
  if (!order || Number(order.advance_amount || 0) <= 0) return;
  const entries = await getDaybookEntries();
  const existingIndex = entries.findIndex(e => e.order_id === order.id && e.category === 'Order');
  const advanceAmount = Number(order.advance_amount);
  const paymentMode = order.advance_mode || 'cash';
  const entryDate = order.order_date || new Date().toISOString().split('T')[0];
  const partyName = order.party_name || 'Customer';

  if (existingIndex !== -1) {
    entries[existingIndex].amount = advanceAmount;
    entries[existingIndex].payment_mode = paymentMode;
    entries[existingIndex].party_name = `${partyName} ${order.job_details ? `(${order.job_details})` : ''}`.trim();
    entries[existingIndex].receipt_no = order.receipt_no;
    entries[existingIndex].entry_date = entryDate;
    await set(DAYBOOK_ENTRIES_KEY, entries);
  } else {
    const newEntry: DaybookEntry = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      entry_date: entryDate,
      entry_type: 'jama',
      payment_mode: paymentMode,
      amount: advanceAmount,
      party_name: `${partyName} ${order.job_details ? `(${order.job_details})` : ''}`.trim(),
      category: 'Order',
      order_id: order.id,
      receipt_no: order.receipt_no,
      notes: `Advance for Order #${order.receipt_no}`,
      _synced: false
    };
    entries.unshift(newEntry);
    await set(DAYBOOK_ENTRIES_KEY, entries);
  }
}
