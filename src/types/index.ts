// TypeScript Models for Raj Press ERP

export type OrderStatus = 'Pending' | 'Printing' | 'Binding' | 'Ready' | 'Delivered';

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
  paper_size: string;
  binding_type: string;
  ink_colours: string[];
  printing_type: string;
  print_qty?: string | null;
  numbering_range?: string | null;
  order_type?: string | null;
  total_amount: number;
  advance_amount: number;
  balance_due: number;
  promise_date?: string | null; // YYYY-MM-DD
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
  category: 'paper_primary' | 'paper_secondary' | 'paper_size' | 'binding_type' | 'printing_type' | 'order_type' | 'status';
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
