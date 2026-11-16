import { get, set } from 'idb-keyval';
import { Order, Party, Preset } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const ORDERS_KEY = 'raj_press_orders_v1';
const PARTIES_KEY = 'raj_press_parties_v1';
const PRESETS_KEY = 'raj_press_presets_v1';

// Initial realistic seed records for Raj Press
const INITIAL_PARTIES: Party[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'श्री. आनंद कुलकर्णी (Kulkarni Traders)',
    phone: '9822012345',
    gst_no: '27AABCK1234F1Z5',
    address: 'मेन रोड, जुना बाजार, सोलापूर, महाराष्ट्र',
    total_billed: 14500,
    total_pending: 3500
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'देशमुख ॲग्रो एजन्सी (Deshmukh Agro)',
    phone: '9423056789',
    gst_no: '27AAECD5678G1Z1',
    address: 'मार्केट यार्ड, लातूर, महाराष्ट्र',
    total_billed: 8200,
    total_pending: 0
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'डॉ. सुहास जोशी (Joshi Hospital)',
    phone: '9890123456',
    address: 'स्टेशन रोड, पुणे, महाराष्ट्र',
    total_billed: 6400,
    total_pending: 1400
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'माऊली मंगल कार्यालय (Mauli Mangal Karyalaya)',
    phone: '9765432100',
    address: 'पंढरपूर बायपास, उस्मानाबाद, महाराष्ट्र',
    total_billed: 19800,
    total_pending: 6800
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    order_date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    receipt_no: 'RP-2026-0001',
    party_id: '11111111-1111-1111-1111-111111111111',
    party_name: 'श्री. आनंद कुलकर्णी (Kulkarni Traders)',
    party_phone: '9822012345',
    job_details: 'GST टॅक्स इन्व्हॉईस बिल बुक (3 प्रती - White/Pink/Yellow)',
    quantity: 50,
    paper_primary: '70 GSM Maplitho (७० मॅपलिथो)',
    paper_secondary: '55 GSM Pink / Yellow Tint (५५ बिल बुक प्रत)',
    paper_size: '1/4 Demmy (११ x ८.५ इंच - 1/4 डेमी)',
    binding_type: 'Side Pin & Cloth Tape Binding (साईड पिन व पट्टी)',
    ink_colours: ['Red', 'Black'],
    printing_type: 'Single Side Offset (सिंगल साईड ऑफसेट)',
    print_qty: '50 पुस्तके x 100 पाने',
    numbering_range: '0001 ते 5000',
    total_amount: 9500,
    advance_amount: 6000,
    balance_due: 3500,
    promise_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    status: 'Printing',
    notes: 'प्रूफ चेकिंग पूर्ण झाले आहे. लाल आणि काळा शाई कलर वापरावा.'
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    order_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    receipt_no: 'RP-2026-0002',
    party_id: '22222222-2222-2222-2222-222222222222',
    party_name: 'देशमुख ॲग्रो एजन्सी (Deshmukh Agro)',
    party_phone: '9423056789',
    job_details: 'कंपनी लेटरहेड व व्हिजिटिंग कार्ड (Letterhead & Visiting Cards)',
    quantity: 1000,
    paper_primary: '80 GSM Royal Executive Bond (८० बॉण्ड)',
    paper_secondary: '300 GSM Art Card (३०० आर्ट कार्ड)',
    paper_size: 'A4 Size (८.२७ x ११.६९ इंच)',
    binding_type: 'Pad Binding / Top Gumming (पॅड गमिंग)',
    ink_colours: ['Peacock-Blue', 'Black'],
    printing_type: 'Multicolour 4-Color Process (फोर कलर प्रोसेस)',
    print_qty: '1000 लेटरहेड + 500 कार्ड',
    numbering_range: 'नाही',
    total_amount: 8200,
    advance_amount: 8200,
    balance_due: 0,
    promise_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    status: 'Ready',
    notes: 'पॅकिंग करून डिस्पॅचसाठी तयार ठेवणे.'
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    order_date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    receipt_no: 'RP-2026-0003',
    party_id: '33333333-3333-3333-3333-333333333333',
    party_name: 'डॉ. सुहास जोशी (Joshi Hospital)',
    party_phone: '9890123456',
    job_details: 'ओपीडी प्रिस्क्रिप्शन पॅड्स (OPD Prescription Slips)',
    quantity: 30,
    paper_primary: '70 GSM Maplitho (७० मॅपलिथो)',
    paper_secondary: '',
    paper_size: '1/8 Demmy (८.५ x ५.५ इंच - 1/8 डेमी)',
    binding_type: 'Pad Binding / Top Gumming (पॅड गमिंग)',
    ink_colours: ['Blue'],
    printing_type: 'Single Side Offset (सिंगल साईड ऑफसेट)',
    print_qty: '30 पॅड x 100 पाने',
    numbering_range: 'नाही',
    total_amount: 3400,
    advance_amount: 2000,
    balance_due: 1400,
    promise_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    status: 'Binding',
    notes: 'टॉप गमिंग मजबूत करा.'
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    created_at: new Date().toISOString(),
    order_date: new Date().toISOString().split('T')[0],
    receipt_no: 'RP-2026-0004',
    party_id: '44444444-4444-4444-4444-444444444444',
    party_name: 'माऊली मंगल कार्यालय (Mauli Mangal Karyalaya)',
    party_phone: '9765432100',
    job_details: 'शाही लग्नपत्रिका व स्वागत लिफाफे (Royal Wedding Cards)',
    quantity: 500,
    paper_primary: '300 GSM Art Card (३०० आर्ट कार्ड)',
    paper_secondary: '',
    paper_size: '12 x 18 Digital Sheet (१२ x १८ डिजिटल)',
    binding_type: 'Center Pinning (सेंटर पिन)',
    ink_colours: ['Red', 'F/C'],
    printing_type: 'Multicolour 4-Color Process (फोर कलर प्रोसेस)',
    print_qty: '500 संच',
    numbering_range: 'नाही',
    total_amount: 19800,
    advance_amount: 13000,
    balance_due: 6800,
    promise_date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    status: 'Pending',
    notes: 'गोल्डन फॉईल व लाल मखमली फिनिशिंग.'
  }
];

// --- Order Repository Operations ---

export async function getOrders(): Promise<Order[]> {
  // If Supabase is connected and online, sync from Supabase
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (!error && data && data.length > 0) {
        // Cache to IndexedDB for offline resilience
        await set(ORDERS_KEY, data);
        return data as Order[];
      }
    } catch {
      // Fallback silently to IndexedDB
    }
  }

  // Load from IndexedDB
  const cached = await get<Order[]>(ORDERS_KEY);
  if (cached && cached.length > 0) {
    return cached;
  }

  // Fallback to initial seed
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
    // Edit existing order
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
    // Create new order
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
      paper_primary: orderData.paper_primary || '',
      paper_secondary: orderData.paper_secondary || null,
      paper_size: orderData.paper_size || '',
      binding_type: orderData.binding_type || '',
      ink_colours: orderData.ink_colours || ['Black'],
      printing_type: orderData.printing_type || '',
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

  // Update local IndexedDB
  await set(ORDERS_KEY, currentOrders);

  // Auto-upsert Party / Customer Directory
  if (updatedOrder.party_name) {
    await upsertPartyFromOrder(updatedOrder, currentOrders);
  }

  // Background Cloud Sync
  if (isSupabaseConfigured && supabase && navigator.onLine) {
    try {
      const payload = { ...updatedOrder };
      delete payload._synced;
      await supabase.from('orders').upsert(payload);
    } catch (e) {
      console.warn('Supabase sync deferred to next reconnect', e);
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

  // Clear balance: set advance_amount equal to total_amount
  currentOrders[index].advance_amount = currentOrders[index].total_amount;
  currentOrders[index].balance_due = 0;
  currentOrders[index].updated_at = new Date().toISOString();
  await set(ORDERS_KEY, currentOrders);

  // Recalculate party khata
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
  const year = new Date().getFullYear();
  let maxSeq = 0;

  orders.forEach(o => {
    if (o.receipt_no && o.receipt_no.startsWith(`RP-${year}-`)) {
      const parts = o.receipt_no.split('-');
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });

  return `RP-${year}-${String(maxSeq + 1).padStart(4, '0')}`;
}

// --- Parties Repository ---

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

// --- Presets (Custom Dropdown Additions from "Others") ---

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
