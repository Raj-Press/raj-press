import { get, set } from 'idb-keyval';
import { Order, Party, Preset } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const ORDERS_KEY = 'raj_press_orders_v2';
const PARTIES_KEY = 'raj_press_parties_v2';
const PRESETS_KEY = 'raj_press_presets_v2';

const INITIAL_PARTIES: Party[] = [
  {
    id: 'p1',
    name: 'आदित्य इंजिनिअर्स / Aditya Engineers',
    phone: '9822011223',
    total_billed: 1500,
    total_pending: 500
  },
  {
    id: 'p2',
    name: 'शिवाजी महाविद्यालय, पंढरपूर / Shivaji Mahavidyalaya',
    phone: '9423055443',
    total_billed: 850,
    total_pending: 0
  },
  {
    id: 'p3',
    name: 'डॉ. सुहास राऊत / Dr. Suhas Raut',
    phone: '9890123789',
    total_billed: 950,
    total_pending: 450
  },
  {
    id: 'p4',
    name: 'नालेवाडी फूड & पॅकेजिंग / Nalewadi Food & Packaging',
    phone: '9765432098',
    total_billed: 1200,
    total_pending: 600
  },
  {
    id: 'p5',
    name: 'गजानन लॅब / Gajanan Lab',
    phone: '9823456781',
    total_billed: 1600,
    total_pending: 0
  },
  {
    id: 'p6',
    name: 'करवळ कृषी सेवा केंद्र / Karawale Krushi Seva',
    phone: '9922114455',
    total_billed: 1200,
    total_pending: 200
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    created_at: '2026-11-14T10:00:00.000Z',
    order_date: '2026-11-14',
    receipt_no: '101',
    party_id: 'p1',
    party_name: 'आदित्य इंजिनिअर्स / Aditya Engineers',
    party_phone: '9822011223',
    job_details: 'डिलिव्हरी चलन (Delivery Challan)',
    quantity: 10,
    paper_primary: 'SPB [Yellow]',
    paper_secondary: 'White (पांढरा)',
    paper_size: '1/8',
    binding_type: 'Regzin',
    ink_colours: ['Brown'],
    printing_type: 'One-side',
    print_qty: '2000',
    numbering_range: '1 to 1000',
    total_amount: 1500,
    advance_amount: 1000,
    balance_due: 500,
    promise_date: '2026-11-16',
    status: 'Printing',
    notes: 'पिवळी व पांढरी प्रत'
  },
  {
    id: 'ord-102',
    created_at: '2026-11-14T11:30:00.000Z',
    order_date: '2026-11-14',
    receipt_no: '102',
    party_id: 'p2',
    party_name: 'शिवाजी महाविद्यालय, पंढरपूर / Shivaji Mahavidyalaya',
    party_phone: '9423055443',
    job_details: 'बोनाफाईट सर्टिफिकेट (Bonafide Certificate)',
    quantity: 2,
    paper_primary: 'Ledgore (80)',
    paper_secondary: '',
    paper_size: '20x30 (1/8)',
    binding_type: 'Cloth',
    ink_colours: ['Red', 'Black'],
    printing_type: 'One-side',
    print_qty: '400',
    numbering_range: '2001 to 2200',
    total_amount: 850,
    advance_amount: 850,
    balance_due: 0,
    promise_date: '2026-11-17',
    status: 'Ready',
    notes: '२ पुस्तके'
  },
  {
    id: 'ord-103',
    created_at: '2026-11-15T09:15:00.000Z',
    order_date: '2026-11-15',
    receipt_no: '103',
    party_id: 'p3',
    party_name: 'डॉ. सुहास राऊत / Dr. Suhas Raut',
    party_phone: '9890123789',
    job_details: 'मुख्य बाह्य रजिस्टर (200 पानी)',
    quantity: 1,
    paper_primary: '9-map',
    paper_secondary: '',
    paper_size: '1/4',
    binding_type: 'Cloth (Regzin)',
    ink_colours: ['Black'],
    printing_type: 'F/b',
    print_qty: '200',
    numbering_range: '1 to 200',
    total_amount: 950,
    advance_amount: 500,
    balance_due: 450,
    promise_date: '2026-11-19',
    status: 'Binding',
    notes: 'हार्ड बायडिंग'
  },
  {
    id: 'ord-104',
    created_at: '2026-11-15T14:40:00.000Z',
    order_date: '2026-11-15',
    receipt_no: '104',
    party_id: 'p4',
    party_name: 'नालेवाडी फूड & पॅकेजिंग / Nalewadi Food & Packaging',
    party_phone: '9765432098',
    job_details: 'कॅश / क्रेडिट मेमो (100x2)',
    quantity: 5,
    paper_primary: '7.7-map',
    paper_secondary: 'Pink (गुलाबी)',
    paper_size: '1/8',
    binding_type: 'Regzin',
    ink_colours: ['Orange'],
    printing_type: 'Duplicate',
    print_qty: '1000',
    numbering_range: '1 to 500',
    total_amount: 1200,
    advance_amount: 600,
    balance_due: 600,
    promise_date: '2026-11-20',
    status: 'Pending',
    notes: '५ पुस्तके'
  },
  {
    id: 'ord-105',
    created_at: '2026-11-16T09:00:00.000Z',
    order_date: '2026-11-16',
    receipt_no: '105',
    party_id: 'p5',
    party_name: 'गजानन लॅब / Gajanan Lab',
    party_phone: '9823456781',
    job_details: 'लेटरहेड पॅड (Letterhead Pads)',
    quantity: 20,
    paper_primary: '9-map',
    paper_secondary: '',
    paper_size: '1/8',
    binding_type: 'Perforation Pad',
    ink_colours: ['Orange'],
    printing_type: 'One-side',
    print_qty: '2000',
    numbering_range: '',
    total_amount: 1600,
    advance_amount: 1600,
    balance_due: 0,
    promise_date: '2026-11-16',
    status: 'Delivered',
    notes: '२० पॅड डिस्पॅच पूर्ण'
  },
  {
    id: 'ord-106',
    created_at: '2026-11-16T11:00:00.000Z',
    order_date: '2026-11-16',
    receipt_no: '106',
    party_id: 'p6',
    party_name: 'करवळ कृषी सेवा केंद्र / Karawale Krushi Seva',
    party_phone: '9922114455',
    job_details: 'बिल बुक (डुप्लिकेट) / Duplicate Bill Book',
    quantity: 5,
    paper_primary: 'SPB [Yellow]',
    paper_secondary: 'Pink (गुलाबी)',
    paper_size: '1/8',
    binding_type: 'Regzin',
    ink_colours: ['Orange'],
    printing_type: 'Duplicate',
    print_qty: '1000',
    numbering_range: '1 to 500',
    total_amount: 1200,
    advance_amount: 1000,
    balance_due: 200,
    promise_date: '2026-11-21',
    status: 'Pending',
    notes: 'कव्हर प्रिंटींग काळी'
  }
];

export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (!error && data && data.length > 0) {
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
    updatedOrder = {
      ...currentOrders.find(o => o.id === orderData.id)!,
      ...orderData,
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
      total_amount: total,
      advance_amount: advance,
      balance_due: balance,
      promise_date: orderData.promise_date || null,
      status: orderData.status || 'Pending',
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
  await set(ORDERS_KEY, currentOrders);

  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      await supabase.from('orders').update({ status, updated_at: currentOrders[index].updated_at }).eq('id', id);
    } catch {
      // offline
    }
  }

  return currentOrders[index];
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
      if (!error && data && data.length > 0) {
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
