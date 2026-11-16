# 🚀 RAJ PRESS — Zero-Cost ($0) Forever Deployment Guide

This guide details the complete, 100% free-forever deployment workflow for **Raj Press (राज प्रेस) Production ERP** across **Supabase** (PostgreSQL Database & Auth) and **Cloudflare Pages** (Global Edge Hosting & SSL).

---

## 💎 1. Zero-Cost Guarantee ($0.00 / Lifetime Free)

| Service | Free Tier Allocation | Credit Card Required? |
| :--- | :--- | :--- |
| **Supabase** | 500 MB PostgreSQL (200,000+ orders), Auth, Realtime, Backups | **NO** |
| **Cloudflare Pages** | Unlimited bandwidth, 500 builds/month, free SSL, `*.pages.dev` | **NO** |
| **PWA Installation** | Direct install on Android phones, tablets, shop Windows PC | **NO** |

---

## 🗄️ 2. Supabase Database & Auth Setup (5 Minutes)

1. Go to [https://supabase.com](https://supabase.com) and click **"Start your project"** (Sign in with GitHub or Email — no credit card needed).
2. Click **"New Project"**, name it `raj-press-erp`, and choose a database password.
3. Once provisioned, open the **SQL Editor** in the left sidebar.
4. Open the file [`supabase/schema.sql`](file:///e:/arbitrary_Ideas/Projects/Raj_Press/supabase/schema.sql) in this repository:
   - Copy the entire SQL content and paste it into the Supabase SQL Editor.
   - Click **"Run"**. This automatically creates all tables (`parties`, `orders`, `presets`), triggers, performance indexes, and Row-Level Security (RLS) policies.
5. (Optional) In the SQL Editor, copy and run [`supabase/seed.sql`](file:///e:/arbitrary_Ideas/Projects/Raj_Press/supabase/seed.sql) to populate initial sample Maharashtra press data.
6. Retrieve your API credentials:
   - Go to **Project Settings** (gear icon) -> **API**.
   - Copy `Project URL` (e.g. `https://xyzcompany.supabase.co`).
   - Copy `anon public` key (e.g. `eyJhbGciOi...`).

---

## 🌐 3. Cloudflare Pages Deployment (3 Minutes)

### Option A: Via GitHub (Recommended for Automated CI/CD)
1. Push this project to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial Raj Press ERP release"
   git remote add origin https://github.com/your-username/raj-press-erp.git
   git push -u origin main
   ```
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) (Free account).
3. Navigate to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
4. Select your `raj-press-erp` repository.
5. Configure Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Add Environment Variables under **Environment variables (advanced)**:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here`
7. Click **"Save and Deploy"**. In under 60 seconds, your site will be live at `https://raj-press-erp.pages.dev`!

### Option B: Direct Drag-and-Drop / Wrangler CLI (No Git needed)
If you do not want to connect GitHub:
1. Run local build:
   ```bash
   npm run build
   ```
2. In Cloudflare Pages, select **"Direct Upload"** -> drag the generated `dist` folder directly onto Cloudflare.

---

## 📱 4. Installing as a PWA on Shop Phones & Windows PC

1. **On Android Phone / Press Floor Tablet**:
   - Open your deployed URL (`https://raj-press-erp.pages.dev`) in Chrome.
   - Tap the three dots menu (⋮) -> Tap **"Install app"** or **"Add to Home screen"**.
   - An icon with the Devanagari **"रा"** badge appears on your phone screen and launches fullscreen like a native Android app!
2. **On Shop Counter PC**:
   - In Google Chrome or Microsoft Edge, look for the install icon (⊕) on the right side of the address bar.
   - Click **"Install Raj Press ERP"** to run it in a standalone window without browser address bars.

---

## 🛡️ 5. Offline Resilience & Daily Backups

- **Offline Mode**: If the shop's broadband drops, orders are saved directly to the device's IndexedDB. As soon as connectivity returns, updates automatically sync.
- **Excel CSV Export**: Click the **"एक्सेल CSV"** button in the header at any time to generate a UTF-8 BOM CSV compatible with Microsoft Excel.
- **JSON Backup**: Click **"बॅकअप"** to save a complete offline snapshot file.
