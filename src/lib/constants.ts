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
  'Aditya Eng. (आदित्य इंजिनिअर्स)',
  'Shivaji College (शिवाजी महाविद्यालय)',
  'Dr. Suhas Raut (डॉ. सुहास राऊत)',
  'Karawale Krushi (करवळ कृषी)',
  'Nalewadi Food & Packaging',
  'Gajanan Lab (गजानन लॅब)'
];

export const FREQUENT_JOBS = [
  'Delivery Challan',
  'Bill Book',
  'Receipt Book',
  'Letterhead / पॅड',
  'Certificate',
  'Labels / स्टिकर'
];

export const DEFAULT_PAPERS = [
  '9-map (९-मॅपलिथो)',
  '7.7-map (७.७-मॅपलिथो)',
  'SPB [Yellow] (यलो प्रत)',
  'SPB [Pink] (गुलाबी प्रत)',
  'White (पांढरा)',
  'Ledger (80) (८० लेजर)',
  'Bond (80 GSM)',
  'Art Paper 130 GSM',
  'Art Card 300 GSM',
  'Sticker Sheet (स्वयं-चिकट)'
];

export const DEFAULT_SIZES = [
  '1/8 (१० x ६.२५)',
  '1/4 (११ x ८.५)',
  '1/2 (१७ x ११)',
  'A4 (८.२७ x ११.६९)',
  'A5 (५.८ x ८.२७)',
  '20x30 (1/8)',
  '12 x 18 Digital',
  '13 x 19 Digital'
];

export const DEFAULT_BINDINGS = [
  'Regzin (रेक्झीन बायडिंग)',
  'Cloth (रेक्झीन पट्टी)',
  'Perforation Pad (पॅड गमिंग)',
  'Center Pinning (सेंटर पिन)',
  'Spiral Wiro',
  'Loose / Cutting Only'
];

export const DEFAULT_PRINTINGS = [
  'One-side',
  'Duplicate (1000)',
  'Duplicate (2000)',
  'Single-side (2000)',
  'F/b (Front & Back)',
  'Four Colour Process (F/C)',
  'Digital Print'
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
    mr: 'Pending (प्रलंबित)',
    color: 'text-stone-700',
    bg: 'bg-stone-100 border-stone-300',
    badge: 'bg-stone-100 text-stone-700 border-stone-200'
  },
  Printing: {
    en: 'Printing',
    mr: 'Printing',
    color: 'text-sky-800',
    bg: 'bg-sky-50 border-sky-300',
    badge: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  Binding: {
    en: 'Binding',
    mr: 'Binding',
    color: 'text-purple-800',
    bg: 'bg-purple-50 border-purple-300',
    badge: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  Ready: {
    en: 'Ready',
    mr: 'Ready',
    color: 'text-amber-800',
    bg: 'bg-amber-50 border-amber-300',
    badge: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  Delivered: {
    en: 'Delivered',
    mr: 'Delivered',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50 border-emerald-300',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  }
};
