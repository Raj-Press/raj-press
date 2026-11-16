import { InkColorOption, OrderStatus } from '../types';

export const INK_COLORS: InkColorOption[] = [
  { id: 'Black', nameEn: 'Black', nameMr: 'Black', hex: '#18181b' },
  { id: 'Red', nameEn: 'Red', nameMr: 'Red', hex: '#dc2626' },
  { id: 'Blue', nameEn: 'Blue', nameMr: 'Blue', hex: '#2563eb' },
  { id: 'Peacock-Blue', nameEn: 'Peacock-Blue', nameMr: 'Peacock-Blue', hex: '#0284c7' },
  { id: 'Magenta', nameEn: 'Magenta', nameMr: 'Magenta', hex: '#db2777' },
  { id: 'Violet', nameEn: 'Violet', nameMr: 'Violet', hex: '#7c3aed' },
  { id: 'Orange', nameEn: 'Orange', nameMr: 'Orange', hex: '#ea580c' },
  { id: 'Green', nameEn: 'Green', nameMr: 'Green', hex: '#16a34a' },
  { id: 'Brown', nameEn: 'Brown', nameMr: 'Brown', hex: '#78350f' },
  { id: 'Yellow', nameEn: 'Yellow', nameMr: 'Yellow', hex: '#eab308', textDark: true },
  { id: 'F/C', nameEn: 'F/C (Full Colour)', nameMr: 'F/C (Full Colour)', hex: 'linear-gradient(135deg, #06b6d4, #ec4899, #eab308, #18181b)' },
];

export const FREQUENT_PARTIES = [
  'Cash Customer (रोख)',
  'Regular Party (नियमित)',
  'Counter / Walk-in',
  'Shop / Trader (व्यापारी)',
  'School / College',
  'Hospital / Clinic'
];

export const FREQUENT_JOBS = [
  'Delivery Challan',
  'Bill Book',
  'Receipt Book',
  'Letterhead / पॅड',
  'Certificate',
  'Labels / स्टिकर'
];

// Exact Paper varieties from Raj Press order sheet
export const DEFAULT_PAPERS = [
  '9-map',
  '7.7-map',
  'SPB [Yellow]',
  'SPB [Green]',
  'SPB [Pink]',
  'SPB [Blue]',
  'GVG [Green]',
  'GVG [Yellow]',
  'GVG [Pink]',
  'GVG [Blue]',
  'Duplicate',
  'Ledgore (70)',
  'Ledgore (80)',
  'Bond',
  'Ruling',
  'SPB-70 [Yellow]',
  'SPB-70 [Green]',
  'SPB-70 [Pink]',
  'SPB-70 [Blue]',
  'MS Cover [Yellow]',
  'MS Cover [Green]',
  'MS Cover [Pink]',
  'MS Cover [Blue]',
  'Cardsheet [Yellow]',
  'Cardsheet [Green]',
  'Cardsheet [Pink]',
  'Cardsheet [Blue]',
  'Cardsheet [White]'
];

// Exact Sizes from Raj Press order sheet
export const DEFAULT_SIZES = [
  '16',
  '12',
  '8',
  '6',
  '5',
  '4',
  '2',
  'L8',
  'L6'
];

// Exact Binding types from Raj Press order sheet
export const DEFAULT_BINDINGS = [
  'Regzin',
  'Cloth (Regzin)',
  'Cloth',
  'Lapeta',
  'Double-Puttha'
];

// Exact Printing types from Raj Press order sheet (clean without numbers)
export const DEFAULT_PRINTINGS = [
  'F/b',
  'One-side',
  'Duplicate',
  'Triplicate'
];

export const STATUS_PROGRESSION: OrderStatus[] = [
  'Pending',
  'Printing',
  'Binding',
  'Ready',
  'Delivered'
];

export const STATUS_LABELS: Record<OrderStatus, { en: string; mr: string; color: string; bg: string; badge: string }> = {
  Pending: {
    en: 'Pending',
    mr: 'Pending',
    color: 'text-stone-700 dark:text-stone-300',
    bg: 'bg-stone-100 border-stone-300 dark:bg-stone-800 dark:border-stone-700',
    badge: 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700'
  },
  Printing: {
    en: 'Printing',
    mr: 'Printing',
    color: 'text-sky-800 dark:text-sky-300',
    bg: 'bg-sky-50 border-sky-300 dark:bg-sky-950/60 dark:border-sky-800',
    badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800'
  },
  Binding: {
    en: 'Binding',
    mr: 'Binding',
    color: 'text-purple-800 dark:text-purple-300',
    bg: 'bg-purple-50 border-purple-300 dark:bg-purple-950/60 dark:border-purple-800',
    badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800'
  },
  Ready: {
    en: 'Ready',
    mr: 'Ready',
    color: 'text-amber-800 dark:text-amber-300',
    bg: 'bg-amber-50 border-amber-300 dark:bg-amber-950/60 dark:border-amber-800',
    badge: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800'
  },
  Delivered: {
    en: 'Delivered',
    mr: 'Delivered',
    color: 'text-emerald-800 dark:text-emerald-300',
    bg: 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
  }
};
