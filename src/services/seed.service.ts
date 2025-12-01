/**
 * Servicio de Seed Data
 * Inicializa la base de datos con datos de demostración
 */

import { db } from './database.service'
import type {
  DistributionCenter,
  Laboratory,
  PharmaceuticalForm,
  UnitOfMeasure,
  PackageType,
  TaxType,
  Currency,
  DrugCategory,
  Supplier,
  Buyer,
  VehicleType,
  Dock,
  BusinessHours,
  Product,
} from '@/types'

const RDC_ID = 'rdc-1'

export async function seedDatabase() {
  // Verificar si ya hay datos
  const centers = await db.getAll('distribution_centers')
  if (centers.length > 0) {
    console.log('Database already seeded')
    return
  }

  console.log('Seeding database...')

  // Centro de Distribución
  await db.create<DistributionCenter>('distribution_centers', {
    code: 'CEDI-MX-01',
    name: 'CEDI Central México',
    address: 'Av. Industrial 1234, Parque Industrial Norte',
    city: 'Ciudad de México',
    state: 'CDMX',
    country: 'México',
    postal_code: '54000',
    timezone: 'America/Mexico_City',
    is_active: true,
    contact_email: 'cedi.central@pharma.mx',
    contact_phone: '+52 55 1234 5678',
    rdc_id: RDC_ID,
  })

  // Laboratorios
  const labs = [
    { code: 'PFZ', name: 'Pfizer', country: 'USA' },
    { code: 'ROC', name: 'Roche', country: 'Suiza' },
    { code: 'NOV', name: 'Novartis', country: 'Suiza' },
    { code: 'BYR', name: 'Bayer', country: 'Alemania' },
    { code: 'SNF', name: 'Sanofi', country: 'Francia' },
    { code: 'GSK', name: 'GlaxoSmithKline', country: 'Reino Unido' },
    { code: 'AZN', name: 'AstraZeneca', country: 'Reino Unido' },
    { code: 'MRK', name: 'Merck', country: 'USA' },
  ]

  for (const lab of labs) {
    await db.create<Laboratory>('laboratories', {
      ...lab,
      is_active: true,
      rdc_id: RDC_ID,
    })
  }

  // Formas Farmacéuticas
  const forms = [
    { code: 'TAB', name: 'Tableta' },
    { code: 'CAP', name: 'Cápsula' },
    { code: 'JBE', name: 'Jarabe' },
    { code: 'AMP', name: 'Ampolleta' },
    { code: 'INY', name: 'Inyectable' },
    { code: 'CRM', name: 'Crema' },
    { code: 'GEL', name: 'Gel' },
    { code: 'SOL', name: 'Solución' },
    { code: 'SUS', name: 'Suspensión' },
    { code: 'SUP', name: 'Supositorio' },
  ]

  for (const form of forms) {
    await db.create<PharmaceuticalForm>('pharmaceutical_forms', {
      ...form,
      rdc_id: RDC_ID,
    })
  }

  // Unidades de Medida
  const units = [
    { code: 'PZA', name: 'Pieza', abbreviation: 'pza', type: 'unit' as const },
    { code: 'CAJ', name: 'Caja', abbreviation: 'caja', type: 'unit' as const },
    { code: 'BLI', name: 'Blister', abbreviation: 'bli', type: 'unit' as const },
    { code: 'MG', name: 'Miligramo', abbreviation: 'mg', type: 'weight' as const },
    { code: 'G', name: 'Gramo', abbreviation: 'g', type: 'weight' as const },
    { code: 'KG', name: 'Kilogramo', abbreviation: 'kg', type: 'weight' as const },
    { code: 'ML', name: 'Mililitro', abbreviation: 'ml', type: 'volume' as const },
    { code: 'L', name: 'Litro', abbreviation: 'L', type: 'volume' as const },
  ]

  for (const unit of units) {
    await db.create<UnitOfMeasure>('units_of_measure', {
      ...unit,
      rdc_id: RDC_ID,
    })
  }

  // Tipos de Empaque
  const packages = [
    { code: 'CTN', name: 'Cartón', description: 'Caja de cartón estándar' },
    { code: 'PLT', name: 'Tarima', description: 'Tarima de madera' },
    { code: 'BLI', name: 'Blister', description: 'Empaque blister' },
    { code: 'BOT', name: 'Botella', description: 'Botella de vidrio/plástico' },
    { code: 'AMP', name: 'Ampolleta', description: 'Ampolleta de vidrio' },
    { code: 'VIA', name: 'Vial', description: 'Vial para inyectables' },
  ]

  for (const pkg of packages) {
    await db.create<PackageType>('package_types', {
      ...pkg,
      rdc_id: RDC_ID,
    })
  }

  // Tipos de Impuesto
  const taxes = [
    { code: 'IVA16', name: 'IVA 16%', rate: 16 },
    { code: 'IVA0', name: 'IVA 0%', rate: 0 },
    { code: 'EXENTO', name: 'Exento', rate: 0 },
  ]

  for (const tax of taxes) {
    await db.create<TaxType>('tax_types', {
      ...tax,
      is_active: true,
      rdc_id: RDC_ID,
    })
  }

  // Monedas
  const currencies = [
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
    { code: 'USD', name: 'Dólar Estadounidense', symbol: 'US$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
  ]

  for (const currency of currencies) {
    await db.create<Currency>('currencies', {
      ...currency,
      is_active: true,
      rdc_id: RDC_ID,
    })
  }

  // Categorías de Medicamentos
  const categories = [
    { code: 'MED', name: 'Medicamentos', level: 1 as const },
    { code: 'ANA', name: 'Analgésicos', level: 2 as const },
    { code: 'ANT', name: 'Antibióticos', level: 2 as const },
    { code: 'CAR', name: 'Cardiovasculares', level: 2 as const },
    { code: 'DER', name: 'Dermatológicos', level: 2 as const },
    { code: 'GAS', name: 'Gastrointestinales', level: 2 as const },
    { code: 'RES', name: 'Respiratorios', level: 2 as const },
    { code: 'MAT', name: 'Material de Curación', level: 1 as const },
  ]

  for (const cat of categories) {
    await db.create<DrugCategory>('drug_categories', {
      ...cat,
      rdc_id: RDC_ID,
    })
  }

  // Proveedores
  const suppliers = [
    {
      code: 'PROV001',
      name: 'Distribuidora Farmacéutica Nacional',
      legal_name: 'DIFARNA S.A. de C.V.',
      tax_id: 'DIF901234AB1',
      address: 'Av. Insurgentes Sur 1234',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      postal_code: '03100',
      contact_name: 'María García',
      contact_email: 'maria.garcia@difarna.mx',
      contact_phone: '+52 55 9876 5432',
      payment_terms_days: 30,
    },
    {
      code: 'PROV002',
      name: 'Laboratorios del Norte',
      legal_name: 'Laboratorios del Norte S.A.',
      tax_id: 'LDN850512XY3',
      address: 'Blvd. Industrial 567',
      city: 'Monterrey',
      state: 'Nuevo León',
      country: 'México',
      postal_code: '64000',
      contact_name: 'Carlos Rodríguez',
      contact_email: 'carlos@labnorte.mx',
      contact_phone: '+52 81 1234 5678',
      payment_terms_days: 45,
    },
    {
      code: 'PROV003',
      name: 'Medicamentos Genéricos MX',
      legal_name: 'MEDGEN MX S. de R.L.',
      tax_id: 'MMX950823ZW9',
      address: 'Calle Reforma 890',
      city: 'Guadalajara',
      state: 'Jalisco',
      country: 'México',
      postal_code: '44100',
      contact_name: 'Ana López',
      contact_email: 'alopez@medgenmx.com',
      contact_phone: '+52 33 5555 1234',
      payment_terms_days: 60,
    },
  ]

  for (const supplier of suppliers) {
    await db.create<Supplier>('suppliers', {
      ...supplier,
      is_active: true,
      rdc_id: RDC_ID,
    })
  }

  // Compradores
  const buyers = [
    { code: 'BUY001', name: 'Juan Martínez', email: 'jmartinez@cedi.mx', phone: '+52 55 1111 2222' },
    { code: 'BUY002', name: 'Laura Sánchez', email: 'lsanchez@cedi.mx', phone: '+52 55 3333 4444' },
    { code: 'BUY003', name: 'Roberto Hernández', email: 'rhernandez@cedi.mx', phone: '+52 55 5555 6666' },
  ]

  for (const buyer of buyers) {
    await db.create<Buyer>('buyers', {
      ...buyer,
      is_active: true,
      rdc_id: RDC_ID,
    })
  }

  // Tipos de Vehículo
  const vehicleTypes = [
    { code: 'VAN', name: 'Camioneta', max_weight_kg: 1500, max_pallets: 2, unload_time_minutes: 30 },
    { code: 'TRK3', name: 'Camión 3.5 ton', max_weight_kg: 3500, max_pallets: 6, unload_time_minutes: 45 },
    { code: 'TRK5', name: 'Camión 5 ton', max_weight_kg: 5000, max_pallets: 10, unload_time_minutes: 60 },
    { code: 'TRCK', name: 'Tráiler', max_weight_kg: 20000, max_pallets: 24, unload_time_minutes: 120 },
    { code: 'REF', name: 'Refrigerado', max_weight_kg: 8000, max_pallets: 14, unload_time_minutes: 90 },
  ]

  for (const vt of vehicleTypes) {
    await db.create<VehicleType>('vehicle_types', {
      ...vt,
      is_active: true,
      rdc_id: RDC_ID,
    })
  }

  // Andenes/Puertas
  const docks = [
    { code: 'D01', name: 'Andén 1', max_vehicle_height_m: 4.5, max_vehicle_length_m: 12 },
    { code: 'D02', name: 'Andén 2', max_vehicle_height_m: 4.5, max_vehicle_length_m: 12 },
    { code: 'D03', name: 'Andén 3', max_vehicle_height_m: 4.5, max_vehicle_length_m: 18 },
    { code: 'D04', name: 'Andén 4 - Refrigerados', max_vehicle_height_m: 4.0, max_vehicle_length_m: 15 },
    { code: 'D05', name: 'Andén 5', max_vehicle_height_m: 4.5, max_vehicle_length_m: 12 },
  ]

  for (const dock of docks) {
    await db.create<Dock>('docks', {
      ...dock,
      is_active: true,
      rdc_id: RDC_ID,
    })
  }

  // Horarios de Operación
  const businessHours = [
    { day_of_week: 1 as const, open_time: '07:00', close_time: '18:00', is_closed: false },
    { day_of_week: 2 as const, open_time: '07:00', close_time: '18:00', is_closed: false },
    { day_of_week: 3 as const, open_time: '07:00', close_time: '18:00', is_closed: false },
    { day_of_week: 4 as const, open_time: '07:00', close_time: '18:00', is_closed: false },
    { day_of_week: 5 as const, open_time: '07:00', close_time: '18:00', is_closed: false },
    { day_of_week: 6 as const, open_time: '08:00', close_time: '14:00', is_closed: false },
    { day_of_week: 0 as const, open_time: '00:00', close_time: '00:00', is_closed: true },
  ]

  for (const hours of businessHours) {
    await db.create<BusinessHours>('business_hours', {
      ...hours,
      rdc_id: RDC_ID,
    })
  }

  // Productos de ejemplo
  const products = [
    {
      sku: 'MED-001',
      ean: '7501234567890',
      name: 'Paracetamol 500mg',
      short_name: 'Paracetamol',
      description: 'Analgésico y antipirético',
      units_per_package: 20,
      weight_kg: 0.05,
      temperature_requirement: 'ambient' as const,
      requires_cold_chain: false,
      is_controlled: false,
      is_hazardous: false,
      shelf_life_days: 730,
      unit_cost: 15.50,
      list_price: 35.00,
      is_active: true,
    },
    {
      sku: 'MED-002',
      ean: '7501234567891',
      name: 'Amoxicilina 500mg Cápsulas',
      short_name: 'Amoxicilina',
      description: 'Antibiótico de amplio espectro',
      units_per_package: 15,
      weight_kg: 0.08,
      temperature_requirement: 'ambient' as const,
      requires_cold_chain: false,
      is_controlled: false,
      is_hazardous: false,
      shelf_life_days: 365,
      unit_cost: 45.00,
      list_price: 120.00,
      is_active: true,
    },
    {
      sku: 'MED-003',
      ean: '7501234567892',
      name: 'Insulina NPH 100UI/ml',
      short_name: 'Insulina NPH',
      description: 'Insulina humana de acción intermedia',
      units_per_package: 1,
      weight_kg: 0.02,
      temperature_requirement: 'refrigerated' as const,
      requires_cold_chain: true,
      is_controlled: true,
      is_hazardous: false,
      shelf_life_days: 180,
      unit_cost: 250.00,
      list_price: 450.00,
      is_active: true,
    },
  ]

  for (const product of products) {
    await db.create<Product>('products', {
      ...product,
      laboratory_id: '',
      category_id: '',
      pharmaceutical_form_id: '',
      active_ingredient_ids: [],
      unit_of_measure_id: '',
      package_type_id: '',
      tax_type_id: '',
      currency_id: '',
      rdc_id: RDC_ID,
    })
  }

  console.log('Database seeded successfully!')
}

