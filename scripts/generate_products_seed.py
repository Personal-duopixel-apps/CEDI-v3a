
import csv
import uuid
import sys

input_file = '/Users/lpalma/Codes/CEDI-v3/supabase/seeds/productos.csv'
output_file = '/Users/lpalma/Codes/CEDI-v3/supabase/seeds/products.sql'

def clean_bool(val):
    if not val: return 'false'
    return val.strip().upper()

def clean_str(val):
    if not val: return 'NULL'
    # Escape single quotes by doubling them
    cleaned = val.replace("'", "''").strip()
    return f"'{cleaned}'"

def clean_date(val):
    if not val: return 'NULL'
    return f"'{val.strip()}'"

def clean_int(val):
    if not val: return 'NULL'
    try:
        return str(int(float(val)))
    except:
        return 'NULL'

def clean_decimal(val):
    if not val: return 'NULL'
    try:
        return str(float(val))
    except:
        return 'NULL'

print(f"Reading from {input_file}...")

with open(input_file, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    
    values_list = []
    
    for row in reader:
        # Skip empty rows
        if not row.get('ID') or not row.get('Nombre'):
            continue

        # Generate SKU from ID if not present
        row_id = row['ID']
        sku = f"'LEGACY-{row_id}'"
        
        # Handle EAN
        raw_ean = row.get('Código de Barras', '')
        ean = f"'NO-EAN-{row_id}'" # Default
        if raw_ean:
            # Simple check if it looks like scientific notation
            if 'E+' in raw_ean:
                try:
                    # Try to expand it, though precision might be lost
                    ean_val = str(int(float(raw_ean)))
                    ean = f"'{ean_val}'"
                except:
                    ean = f"'{raw_ean}'"
            else:
                ean = f"'{raw_ean.strip()}'"
        
        # Core fields
        name = clean_str(row['Nombre'])
        short_name = clean_str(row['Nombre']) # Use name as short_name for now
        description = clean_str(row['Características']) # Use characteristics as description
        
        # Physical properties
        quantity = clean_int(row['Cantidad'])
        units_per_package = quantity if quantity != 'NULL' else '1'
        
        # Temperature mapping
        is_refrigerated_bool = row.get('Es Refrigerado', 'FALSE').strip().upper() == 'TRUE'
        temp_req = "'refrigerated'" if is_refrigerated_bool else "'ambient'"
        
        # Flags
        requires_cold_chain = 'true' if is_refrigerated_bool else 'false'
        is_controlled = 'true' if row.get('Es Controlado', 'FALSE').strip().upper() == 'TRUE' else 'false'
        
        # Mapped fields
        pharmaceutical_form_id = clean_str(row['ID Forma Farmacéutica'])
        unit_of_measure_id = clean_str(row['ID Medida Peso/Tamaño'])
        package_type_id = clean_str(row['ID Tipo Empaque'])
        registration_number = clean_str(row['Número Registro Sanitario'])
        registration_expiry = clean_date(row['Vencimiento Registro Sanitario'])
        
        # Additional mapped fields
        generated_name = clean_str(row['Nombre Generado'])
        characteristics = clean_str(row['Características'])
        size_capacity = clean_str(row['Talla/Capacidad'])
        caliber_thickness = clean_str(row['Calibre/Grosor/Diámetro'])
        special_offer = clean_str(row['Descripción Oferta Especial'])
        
        # Flags
        # 'Uso Hospitalario' -> is_hospital_use
        is_hospital_use = 'true' if row.get('Uso Hospitalario', 'FALSE').strip().upper() == 'TRUE' else 'false'
        requires_retained_prescription = 'true' if row.get('Requiere Receta Retenida', 'FALSE').strip().upper() == 'TRUE' else 'false'
        is_chronic_use = 'true' if row.get('Uso Crónico', 'FALSE').strip().upper() == 'TRUE' else 'false'
        for_own_pharmacies = 'true' if row.get('Para Farmacias Propias', 'FALSE').strip().upper() == 'TRUE' else 'false'
        for_independent_pharmacies = 'true' if row.get('Para Farmacias Independientes', 'FALSE').strip().upper() == 'TRUE' else 'false'
        for_institutional_use = 'true' if row.get('Para Uso Institucional/Hospitalario', 'FALSE').strip().upper() == 'TRUE' else 'false'
        is_routed = 'true' if row.get('Es Ruteado', 'FALSE').strip().upper() == 'TRUE' else 'false'
        for_wholesale = 'true' if row.get('Para Venta al por Mayor', 'FALSE').strip().upper() == 'TRUE' else 'false'
        for_self_service = 'true' if row.get('Para Autoservicio', 'FALSE').strip().upper() == 'TRUE' else 'false'
        is_draft = 'true' if row.get('Es Borrador', 'FALSE').strip().upper() == 'TRUE' else 'false'
        is_active = 'true' # Default active despite csv saying FALSE mostly
        
        # Construct Value String
        # Order must match INSERT statement below
        val_str = f"({sku}, {ean}, {name}, {short_name}, {description}, {units_per_package}, {temp_req}, {requires_cold_chain}, {is_controlled}, {is_active}, {pharmaceutical_form_id}, {unit_of_measure_id}, {package_type_id}, {registration_number}, {registration_expiry}, {generated_name}, {characteristics}, {size_capacity}, {caliber_thickness}, {special_offer}, {is_hospital_use}, {requires_retained_prescription}, {is_chronic_use}, {for_own_pharmacies}, {for_independent_pharmacies}, {for_institutional_use}, {is_routed}, {for_wholesale}, {for_self_service}, {is_draft})"
        values_list.append(val_str)

print(f"Generated {len(values_list)} rows.")

# Write SQL file
with open(output_file, 'w', encoding='utf-8') as f:
    f.write("-- Seed data for products generated from CSV\n")
    f.write("INSERT INTO public.products (\n")
    f.write("    sku, ean, name, short_name, description, units_per_package, \n")
    f.write("    temperature_requirement, requires_cold_chain, is_controlled, is_active,\n")
    f.write("    pharmaceutical_form_id, unit_of_measure_id, package_type_id, \n")
    f.write("    registration_number, registration_expiry, \n")
    f.write("    generated_name, characteristics, size_capacity, caliber_thickness, special_offer_description,\n")
    f.write("    is_hospital_use, requires_retained_prescription, is_chronic_use, \n")
    f.write("    for_own_pharmacies, for_independent_pharmacies, for_institutional_use, \n")
    f.write("    is_routed, for_wholesale, for_self_service, is_draft\n")
    f.write(") VALUES \n")
    
    f.write(",\n".join(values_list))
    
    f.write("\nON CONFLICT (sku) DO NOTHING;\n")

print(f"Successfully wrote to {output_file}")
