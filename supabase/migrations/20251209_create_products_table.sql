-- Create enum for temperature requirement
CREATE TYPE public.temperature_requirement AS ENUM (
    'ambient',
    'refrigerated',
    'frozen',
    'controlled'
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Core identification
    sku TEXT NOT NULL,
    ean TEXT NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    description TEXT,
    
    -- Physical properties
    units_per_package INTEGER NOT NULL DEFAULT 1,
    weight_kg DECIMAL(10, 3),
    length_cm DECIMAL(10, 2),
    width_cm DECIMAL(10, 2),
    height_cm DECIMAL(10, 2),
    volume_cm3 DECIMAL(10, 2),
    temperature_requirement public.temperature_requirement NOT NULL,
    requires_cold_chain BOOLEAN NOT NULL DEFAULT false,
    is_controlled BOOLEAN NOT NULL DEFAULT false,
    is_hazardous BOOLEAN NOT NULL DEFAULT false,
    shelf_life_days INTEGER,
    
    -- Financial
    unit_cost DECIMAL(10, 2),
    list_price DECIMAL(10, 2),
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Additional fields mapped to English
    rdc_id TEXT,
    requestor_id TEXT, -- Was solicitante_id
    laboratory_id TEXT,
    generated_name TEXT,
    characteristics TEXT,
    pharmaceutical_form_id TEXT, -- Was forma_farmaceutica_id
    quantity INTEGER,
    unit_of_measure_id TEXT, -- Was medida_peso_id
    package_type_id TEXT, -- Was tipo_empaque_id
    size_capacity TEXT,
    caliber_thickness TEXT,
    special_offer_description TEXT,
    registration_expiry DATE, -- Was sanitary_registry_expiration
    registration_number TEXT, -- Was sanitary_registry_number
    -- barcode is usually EAN, but keeping if different
    barcode TEXT, 
    tax_type_id TEXT,
    category_id TEXT, -- Was classification_id
    
    -- Additional flags from legacy
    is_hospital_use BOOLEAN DEFAULT false,
    requires_retained_prescription BOOLEAN DEFAULT false,
    is_chronic_use BOOLEAN DEFAULT false,
    for_own_pharmacies BOOLEAN DEFAULT false,
    for_independent_pharmacies BOOLEAN DEFAULT false,
    for_institutional_use BOOLEAN DEFAULT false,
    is_routed BOOLEAN DEFAULT false,
    for_wholesale BOOLEAN DEFAULT false,
    for_self_service BOOLEAN DEFAULT false,
    is_draft BOOLEAN DEFAULT false,

    -- Constraints
    CONSTRAINT products_sku_key UNIQUE (sku),
    CONSTRAINT products_ean_key UNIQUE (ean)
);

-- Add RLS Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Enable read access for authenticated users" ON public.products
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert/update/delete for authenticated users (for now, can be restricted by role later)
CREATE POLICY "Enable write access for authenticated users" ON public.products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
