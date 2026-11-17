-- ==============================================================================
-- RAJ PRESS (राज प्रेस) - Production ERP & Order Ledger Database Schema
-- Provider: Supabase (PostgreSQL 15+) - 100% Free Forever Tier
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PARTIES (Customer Directory / Khata / ग्राहक वही)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    gst_no TEXT,
    address TEXT,
    notes TEXT,
    total_billed NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_pending NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index for instant autocomplete and phone lookup
CREATE INDEX IF NOT EXISTS idx_parties_name ON public.parties (name);
CREATE INDEX IF NOT EXISTS idx_parties_phone ON public.parties (phone);
CREATE INDEX IF NOT EXISTS idx_parties_user_id ON public.parties (user_id);

-- ------------------------------------------------------------------------------
-- 2. ORDERS (मुख्य ऑर्डर लेजर / Job Book)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    order_date DATE DEFAULT CURRENT_DATE NOT NULL,
    receipt_no TEXT NOT NULL,
    party_id UUID REFERENCES public.parties(id) ON DELETE SET NULL,
    party_name TEXT NOT NULL,
    party_phone TEXT,
    job_details TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    paper_primary TEXT NOT NULL,
    paper_secondary TEXT,
    paper_tertiary TEXT,
    paper_size TEXT NOT NULL,
    binding_type TEXT NOT NULL,
    ink_colours TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    printing_type TEXT NOT NULL,
    print_qty TEXT,
    numbering_range TEXT,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    advance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_due NUMERIC(12, 2) GENERATED ALWAYS AS (GREATEST(0, total_amount - advance_amount)) STORED,
    promise_date DATE,
    delivered_date DATE,
    dispatches JSONB DEFAULT '[]'::JSONB,
    status TEXT NOT NULL DEFAULT 'Pending',
    order_type TEXT DEFAULT 'General',
    patrika_cost NUMERIC(12, 2) DEFAULT NULL,
    notes TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Essential Performance Indexes
CREATE INDEX IF NOT EXISTS idx_orders_receipt_no ON public.orders (receipt_no);
CREATE INDEX IF NOT EXISTS idx_orders_party_name ON public.orders (party_name);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders (order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders (order_type);
CREATE INDEX IF NOT EXISTS idx_orders_balance_due ON public.orders (balance_due);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);

-- Ensure newly added columns exist if table was created previously
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'General';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS patrika_cost NUMERIC(12, 2) DEFAULT NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paper_tertiary TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_date DATE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS dispatches JSONB DEFAULT '[]'::JSONB;
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders (order_type);

-- ------------------------------------------------------------------------------
-- 3. PRESETS (Dynamic Dropdown Customizations persisted from "Others")
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    category TEXT NOT NULL, -- 'paper_primary', 'paper_secondary', 'paper_size', 'binding_type', 'printing_type', 'status'
    value TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT unique_category_value_user UNIQUE (category, value, user_id)
);

CREATE INDEX IF NOT EXISTS idx_presets_category ON public.presets (category);
CREATE INDEX IF NOT EXISTS idx_presets_user_id ON public.presets (user_id);

-- ------------------------------------------------------------------------------
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presets ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can manage their own data
CREATE POLICY "Users can manage their own parties"
    ON public.parties
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own orders"
    ON public.orders
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own presets"
    ON public.presets
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Open demo policy for anon access if user has not yet configured Auth or uses counter tablet without login
CREATE POLICY "Allow anon read/write for standalone shop mode when user_id is null"
    ON public.parties
    FOR ALL
    TO anon
    USING (user_id IS NULL)
    WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow anon read/write for standalone shop orders when user_id is null"
    ON public.orders
    FOR ALL
    TO anon
    USING (user_id IS NULL)
    WITH CHECK (user_id IS NULL);

CREATE POLICY "Allow anon read/write for standalone presets when user_id is null"
    ON public.presets
    FOR ALL
    TO anon
    USING (user_id IS NULL)
    WITH CHECK (user_id IS NULL);

-- ------------------------------------------------------------------------------
-- 5. AUTOMATED REALTIME & PARTY BALANCE CALCULATION TRIGGERS
-- ------------------------------------------------------------------------------

-- Function: Recalculate party total billed & pending when orders change
CREATE OR REPLACE FUNCTION public.recalculate_party_totals()
RETURNS TRIGGER AS $$
DECLARE
    target_party_id UUID;
BEGIN
    target_party_id := COALESCE(NEW.party_id, OLD.party_id);
    
    IF target_party_id IS NOT NULL THEN
        UPDATE public.parties
        SET 
            total_billed = COALESCE((SELECT SUM(total_amount) FROM public.orders WHERE party_id = target_party_id), 0.00),
            total_pending = COALESCE((SELECT SUM(balance_due) FROM public.orders WHERE party_id = target_party_id), 0.00),
            updated_at = NOW()
        WHERE id = target_party_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalculate_party_totals_insert ON public.orders;
CREATE TRIGGER trg_recalculate_party_totals_insert
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.recalculate_party_totals();

-- Enable Supabase Realtime for instant multi-device counter/press sync (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'parties'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.parties;
  END IF;
END $$;
