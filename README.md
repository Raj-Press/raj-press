# 🏛️ राज प्रेस (RAJ PRESS) — Commercial Printing ERP
### Full-Stack Production Management & Order Book System ($0 Free-Forever Stack)

> Tailored for commercial printing and binding press operations in Maharashtra, India. Features bilingual Marathi (देवनागरी) & English UI, dynamic dropdown presets, interactive multi-select ink color swatches, thermal/A5 Job Card (जॉब कार्ड) printing, 1-click WhatsApp customer invoicing, and offline-first IndexedDB + Supabase PostgreSQL synchronization.

---

## 🌟 Key Features

1. **Bilingual Domain UI (Marathi + English)**
   - All standard printing ledger terms: तारीख, पावती नं., नांव, कामाचा तपशील, नग, कागदाची जात, साईज, बायडिंग, शाई कलर, प्रिंटींग, नंबरींग, एकूण ₹, ॲडव्हान्स ₹, येणे बाकी, वायदा ता., सद्यस्थिती.
2. **Dynamic "Others" Inputs with Auto-Persistence**
   - Every select field (Primary Paper, Secondary Paper, Size, Binding, Printing, Job Status) includes an "इतर (Others)" option that dynamically reveals a text input and automatically persists custom choices to the database for future re-use.
3. **Interactive Ink Colour Multi-Select Pills**
   - Visual color swatches supporting multi-ink selection: Black, Red, Royal Blue, Peacock-Blue, Magenta, Violet, Orange, Green, Brown, Yellow, and F/C (Full Colour 4-Process).
4. **Live Order Ledger & Real-Time KPIs**
   - Real-time counters: Total Orders, Active Press Jobs, Total Billed (₹), Advance Collected (₹), and Pending Balance (येणे बाकी ₹).
   - Instant search across Receipt No., Customer Name, Job, Paper, Numbering Range, and Status.
   - 1-click status progression (`Pending` → `Printing` → `Binding` → `Ready` → `Delivered`).
   - 1-click `✓ जमा` button to immediately clear customer balance dues.
5. **Press Floor Job Ticket (जॉब कार्ड) & WhatsApp Share**
   - Dedicated `@media print` A5 / thermal slip modal.
   - 1-click WhatsApp button (`https://wa.me/?text=...`) sending formatted bilingual invoice summaries.
6. **Customer Khata Directory (ग्राहक वही)**
   - Automatically tracks aggregate billing and pending dues (येणे बाकी) per customer with 1-click payment reminder WhatsApp messages.
7. **Excel-Compatible CSV Export & Offline Backups**
   - Prepends UTF-8 BOM (`\uFEFF`) so Marathi Devanagari script renders properly in Microsoft Excel.
   - Complete JSON backup and restore capabilities.
8. **100% Free-Forever Stack**
   - **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons + PWA.
   - **Database & Auth**: Supabase (PostgreSQL 15 + RLS).
   - **Hosting**: Cloudflare Pages / Vercel ($0 lifetime free tier, free SSL).
   - **Offline Engine**: IndexedDB (`idb-keyval`) local cache with automatic cloud sync.

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production (PWA Service Worker + Assets)
npm run build
```

---

## 🚀 Cloud Deployment

See [DEPLOYMENT.md](file:///e:/arbitrary_Ideas/Projects/Raj_Press/DEPLOYMENT.md) for step-by-step instructions on setting up Supabase PostgreSQL and deploying to Cloudflare Pages in less than 5 minutes for $0.
