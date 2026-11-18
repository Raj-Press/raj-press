// TypeScript Models for Raj Press ERP

export type OrderStatus = 'Pending' | 'Printing' | 'Binding' | 'Ready' | 'Split Delivery' | 'Delivered';

export interface DeliveryDispatch {
  id: string;
  dispatch_date: string; // YYYY-MM-DD
  quantity: number;
  notes?: string | null;
  created_at?: string;
}

export interface Order {
  id: string;
  created_at: string;
  updated_at?: string;
  order_date: string; // YYYY-MM-DD
  receipt_no: string;
  party_id?: string | null;
  party_name: string;
  party_phone?: string | null;
  job_details: string;
  quantity: number;
  paper_primary: string;
  paper_secondary?: string | null;
  paper_tertiary?: string | null;
  paper_size: string;
  binding_type: string;
  ink_colours: string[];
  printing_type: string;
  print_qty?: string | null;
  numbering_range?: string | null;
  order_type?: string | null;
  patrika_cost?: number | null; // Purchase cost of blank patrika card
  total_amount: number;
  advance_amount: number;
  advance_mode?: 'cash' | 'online';
  balance_due: number;
  promise_date?: string | null; // YYYY-MM-DD
  delivered_date?: string | null; // YYYY-MM-DD
  dispatches?: DeliveryDispatch[] | null;
  status: OrderStatus;
  notes?: string | null;
  user_id?: string | null;
  _synced?: boolean; // For offline local sync tracking
}

export interface Party {
  id: string;
  created_at?: string;
  name: string;
  phone?: string | null;
  gst_no?: string | null;
  address?: string | null;
  notes?: string | null;
  total_billed: number;
  total_pending: number;
  user_id?: string | null;
}

export interface Preset {
  id?: string;
  category: 'paper_primary' | 'paper_secondary' | 'paper_tertiary' | 'paper_size' | 'binding_type' | 'printing_type' | 'order_type' | 'status';
  value: string;
  user_id?: string | null;
}

export interface InkColorOption {
  id: string;
  nameEn: string;
  nameMr: string;
  hex: string;
  textDark?: boolean;
}

export interface KPIMetrics {
  totalOrders: number;
  activeJobs: number;
  totalBilled: number;
  totalAdvance: number;
  pendingBalance: number;
}

// Daily Daybook / Rojmel (दैनिक रोजमेळ) Models
export interface DaybookEntry {
  id: string;
  created_at: string;
  entry_date: string; // YYYY-MM-DD
  entry_type: 'jama' | 'naave'; // 'jama' = Receipt, 'naave' = Expense
  payment_mode: 'cash' | 'online'; // 'cash' vs 'online'
  amount: number;
  party_name: string;
  category?: string | null; // e.g. 'Order', 'Tea', 'Transport', 'Platemaking', 'Scrap', 'Maintenance', 'Personal', 'General'
  order_id?: string | null;
  receipt_no?: string | null;
  notes?: string | null;
  user_id?: string | null;
  _synced?: boolean;
}

export interface DaybookDenominations {
  n500: number;
  n200: number;
  n100: number;
  n50: number;
  n20: number;
  n10: number;
  coins: number;
}

export interface DaybookClosing {
  id?: string;
  closing_date: string; // YYYY-MM-DD
  opening_cash: number;
  denominations?: DaybookDenominations | null;
  notes?: string | null;
  updated_at?: string;
}
