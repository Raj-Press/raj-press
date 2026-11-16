import { InkColorOption, OrderStatus } from '../types';

export const INK_COLORS: InkColorOption[] = [
  { id: 'Black', nameEn: 'Black', nameMr: 'काळा (Black)', hex: '#18181b' },
  { id: 'Red', nameEn: 'Red', nameMr: 'लाल (Red)', hex: '#dc2626' },
  { id: 'Blue', nameEn: 'Royal Blue', nameMr: 'निळा (Royal Blue)', hex: '#2563eb' },
  { id: 'Peacock-Blue', nameEn: 'Peacock Blue', nameMr: 'मोरपंखी (Peacock Blue)', hex: '#0284c7' },
  { id: 'Magenta', nameEn: 'Magenta', nameMr: 'मॅजेन्टा (Magenta)', hex: '#db2777' },
  { id: 'Violet', nameEn: 'Violet', nameMr: 'जांभळा (Violet)', hex: '#7c3aed' },
  { id: 'Orange', nameEn: 'Orange', nameMr: 'केशरी (Orange)', hex: '#ea580c' },
  { id: 'Green', nameEn: 'Green', nameMr: 'हिरवा (Green)', hex: '#16a34a' },
  { id: 'Brown', nameEn: 'Brown', nameMr: 'तपकिरी (Brown)', hex: '#78350f' },
  { id: 'Yellow', nameEn: 'Yellow', nameMr: 'पिवळा (Yellow)', hex: '#eab308', textDark: true },
  { id: 'F/C', nameEn: 'Full Colour (4-Col)', nameMr: 'फुल कलर (F/C 4-Color)', hex: 'linear-gradient(135deg, #06b6d4, #ec4899, #eab308, #18181b)' },
];

export const DEFAULT_PAPERS = [
  '70 GSM Maplitho (७० मॅपलिथो)',
  '80 GSM Royal Executive Bond (८० बॉण्ड)',
  '130 GSM Art Paper Gloss (१३० आर्ट पेपर ग्लॉस)',
  '170 GSM Art Card (१७० आर्ट कार्ड)',
  '300 GSM Art Card (३०० आर्ट कार्ड)',
  '70 GSM Ledger Green Paper (७० लेजर वही)',
  '55 GSM Pink / Yellow Tint (५५ बिल बुक प्रत)',
  '100 GSM Super Sunshine (१०० सुपर सनशाईन)',
  'Self-Adhesive Sticker Paper (स्टिकर पेपर)',
];

export const DEFAULT_SIZES = [
  '1/8 Demmy (८.५ x ५.५ इंच - 1/8 डेमी)',
  '1/4 Demmy (११ x ८.५ इंच - 1/4 डेमी)',
  '1/2 Demmy (१७ x ११ इंच - 1/2 डेमी)',
  'A4 Size (८.२७ x ११.६९ इंच)',
  'A5 Size (५.८ x ८.२७ इंच)',
  '12 x 18 Digital Sheet (१२ x १८ डिजिटल)',
  '13 x 19 Digital Sheet (१३ x १९ डिजिटल)',
  'Royal 1/8 (१० x ६.२५ इंच)',
  'Visiting Card (३.५ x २ इंच)',
];

export const DEFAULT_BINDINGS = [
  'Side Pin & Cloth Tape Binding (साईड पिन व पट्टी)',
  'Center Pinning (सेंटर पिन)',
  'Hard Board Leather Rexine (हार्ड बोर्ड लेदर रेक्झिन)',
  'Pad Binding / Top Gumming (पॅड गमिंग)',
  'Spiral / Wiro Binding (स्पायरल बायडिंग)',
  'Perfect Book Binding (परफेक्ट गम बायडिंग)',
  'No Binding / Loose Sheets (सुट्टे/कापून देणे)',
];

export const DEFAULT_PRINTINGS = [
  'Single Side Offset (सिंगल साईड ऑफसेट)',
  'Double Side Offset (डबल साईड ऑफसेट)',
  'Multicolour 4-Color Process (फोर कलर प्रोसेस)',
  'Digital Laser Color (डिजिटल लेझर कलर)',
  'Single Color Digital (सिंगल कलर डिजिटल)',
  'Screen Printing (स्क्रीन प्रिंटींग)',
];

export const STATUS_PROGRESSION: OrderStatus[] = [
  'Pending',
  'Printing',
  'Binding',
  'Ready',
  'Delivered'
];

export const STATUS_LABELS: Record<OrderStatus, { en: string; mr: string; color: string; bg: string }> = {
  Pending: {
    en: 'Pending',
    mr: 'प्रलंबित (Pending)',
    color: 'text-amber-800',
    bg: 'bg-amber-100 border-amber-300'
  },
  Printing: {
    en: 'Printing',
    mr: 'प्रिंटिंग चालू (Printing)',
    color: 'text-blue-800',
    bg: 'bg-blue-100 border-blue-300'
  },
  Binding: {
    en: 'Binding',
    mr: 'बायडिंग चालू (Binding)',
    color: 'text-purple-800',
    bg: 'bg-purple-100 border-purple-300'
  },
  Ready: {
    en: 'Ready for Delivery',
    mr: 'तयार (Ready)',
    color: 'text-emerald-800',
    bg: 'bg-emerald-100 border-emerald-300'
  },
  Delivered: {
    en: 'Delivered',
    mr: 'डिलिव्हर झाले (Delivered)',
    color: 'text-slate-800',
    bg: 'bg-slate-200 border-slate-300'
  }
};
