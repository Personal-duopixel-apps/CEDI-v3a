// =====================================================
// TIPOS BASE DEL SISTEMA CEDI
// =====================================================

// Entidad base con campos de auditoría
// Nota: created_at, updated_at, rdc_id son opcionales para compatibilidad con Google Sheets
export interface BaseEntity {
  id: string
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
  rdc_id?: string  // Multi-tenant: ID del Centro de Distribución
}

// =====================================================
// AUTENTICACIÓN Y USUARIOS
// =====================================================

export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'scheduling-admin'
  | 'catalog-admin'
  | 'supplier-admin'
  | 'supplier-user'
  | 'security'
  | 'guest'

export interface User extends BaseEntity {
  email: string
  password_hash?: string  // Solo para backend
  name: string
  role: UserRole
  avatar_url?: string
  phone?: string
  department?: string
  is_active: boolean
  last_login?: string
  supplier_id?: string  // Para usuarios de proveedores
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token?: string
}

// =====================================================
// CENTROS DE DISTRIBUCIÓN (RDC)
// =====================================================

export interface DistributionCenter extends BaseEntity {
  code: string
  name: string
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  timezone: string
  is_active: boolean
  contact_email?: string
  contact_phone?: string
}

// =====================================================
// MÓDULO DE CATÁLOGO
// =====================================================

export interface ActiveIngredient extends BaseEntity {
  name: string
  cas_number?: string  // Chemical Abstracts Service number
  is_controlled: boolean
  description?: string
}

export interface DrugCategory extends BaseEntity {
  code: string
  name: string
  level: 1 | 2 | 3 | 4
  parent_id?: string
  description?: string
}

export interface Laboratory extends BaseEntity {
  code: string
  name: string
  country: string
  is_active: boolean
  contact_email?: string
  contact_phone?: string
}

export interface PharmaceuticalForm extends BaseEntity {
  code: string
  name: string
  description?: string
}

export interface UnitOfMeasure extends BaseEntity {
  code: string
  name: string
  abbreviation: string
  type: 'weight' | 'volume' | 'unit' | 'length'
}

export interface PackageType extends BaseEntity {
  code: string
  name: string
  description?: string
}

export interface TaxType extends BaseEntity {
  code: string
  name: string
  rate: number
  is_active: boolean
}

export interface Currency extends BaseEntity {
  code: string  // ISO 4217
  name: string
  symbol: string
  is_active: boolean
}

export type TemperatureRequirement = 'ambient' | 'refrigerated' | 'frozen' | 'controlled'

export interface Product extends BaseEntity {
  sku: string
  ean: string  // Código de barras
  name: string
  short_name?: string
  description?: string
  laboratory_id: string
  category_id: string
  pharmaceutical_form_id: string
  active_ingredient_ids: string[]

  // Datos logísticos
  unit_of_measure_id: string
  package_type_id: string
  units_per_package: number
  weight_kg?: number
  length_cm?: number
  width_cm?: number
  height_cm?: number
  volume_cm3?: number
  temperature_requirement: TemperatureRequirement
  requires_cold_chain: boolean
  is_controlled: boolean
  is_hazardous: boolean
  shelf_life_days?: number

  // Datos de compra
  tax_type_id: string
  currency_id: string
  unit_cost?: number
  list_price?: number

  // Estado
  is_active: boolean
  registration_number?: string  // Registro sanitario
  registration_expiry?: string

  // Flags adicionales de negocio
  is_hospital_use?: boolean
  requires_retained_prescription?: boolean
  is_chronic_use?: boolean
  for_own_pharmacies?: boolean
  for_independent_pharmacies?: boolean
  for_institutional_use?: boolean
  is_routed?: boolean
  for_wholesale?: boolean
  for_self_service?: boolean
  is_draft?: boolean
}

// =====================================================
// MÓDULO DE PROVEEDORES
// =====================================================

export interface Supplier extends BaseEntity {
  code: string
  name: string
  legal_name: string
  tax_id: string  // RFC en México
  address: string
  city: string
  state: string
  country: string
  postal_code: string
  contact_name: string
  contact_email: string
  contact_phone: string
  is_active: boolean
  payment_terms_days?: number
  notes?: string
}

export interface Buyer extends BaseEntity {
  code: string
  name: string
  email: string
  phone?: string
  is_active: boolean
}

export interface SupplierRdcMapping extends BaseEntity {
  supplier_id: string
  assigned_buyer_id?: string
  is_active: boolean
}

// =====================================================
// MÓDULO DE SCHEDULING (CITAS)
// =====================================================

export interface Dock extends BaseEntity {
  code: string
  name: string
  is_active: boolean
  type?: string
  capacity?: number | string
  status?: string
  max_vehicle_height_m?: number
  max_vehicle_length_m?: number
  notes?: string
}

export interface VehicleType extends BaseEntity {
  code: string
  name: string
  max_weight_kg: number
  max_pallets: number
  unload_time_minutes: number
  is_active: boolean
}

export interface BusinessHours extends BaseEntity {
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6  // 0 = Domingo
  open_time: string  // HH:mm
  close_time: string  // HH:mm
  is_closed: boolean
}

export interface CalendarException extends BaseEntity {
  date: string
  type: 'holiday' | 'closure' | 'special'
  name: string
  is_full_day: boolean
  open_time?: string
  close_time?: string
}

export type AppointmentStatus =
  | 'scheduled'
  | 'pending_transport_data'
  | 'complete'
  | 'receiving_started'
  | 'receiving_finished'
  | 'cancelled'
  | 'did_not_show'

export interface PurchaseOrder extends BaseEntity {
  po_number: string
  supplier_id: string
  buyer_id?: string
  expected_date: string
  total_amount?: number
  currency_id?: string
  status: 'pending' | 'scheduled' | 'received' | 'cancelled'
  notes?: string
  appointment_id?: string
}

export interface TransportData {
  driver_name?: string
  driver_license?: string
  driver_phone?: string
  vehicle_plates?: string
  vehicle_type_id?: string
  trailer_plates?: string
  company_name?: string
  seal_number?: string
}

export interface Appointment extends BaseEntity {
  appointment_number: string
  supplier_id: string
  dock_id: string
  vehicle_type_id: string
  scheduled_date: string
  scheduled_time_start: string  // HH:mm
  scheduled_time_end: string    // HH:mm
  status: AppointmentStatus
  purchase_order_ids: string[]
  transport_data?: TransportData

  // Tiempos reales
  actual_arrival_time?: string
  actual_start_time?: string
  actual_end_time?: string

  // Auditoría
  cancelled_at?: string
  cancelled_by?: string
  cancellation_reason?: string
  notes?: string
}

// =====================================================
// AUDITORÍA
// =====================================================

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export'

export interface AuditLog extends BaseEntity {
  user_id: string
  user_email: string
  action: AuditAction
  entity_type: string
  entity_id: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
}

// =====================================================
// NOTIFICACIONES
// =====================================================

export type NotificationType =
  | 'appointment_created'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'transport_data_required'
  | 'appointment_arriving'

export interface Notification extends BaseEntity {
  user_id: string
  type: NotificationType
  title: string
  message: string
  read_at?: string
  entity_type?: string
  entity_id?: string
}

// =====================================================
// UI TYPES
// =====================================================

export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'combobox' |
  'switch' | 'textarea' | 'date' | 'time' | 'datetime' | 'custom'
  required?: boolean
  placeholder?: string
  description?: string
  maxLength?: number
  min?: number
  max?: number
  step?: number
  defaultValue?: unknown
  disabled?: boolean
  hidden?: boolean
  className?: string
  // Para selects/combobox
  options?: { value: string; label: string }[]
  optionsEntity?: string  // Nombre de la entidad para cargar opciones dinámicas
  // Para campos dependientes (select dinámico basado en otro campo)
  dependsOn?: string  // Nombre del campo del que depende
  getOptions?: (dependsOnValue: string) => { value: string; label: string }[]  // Función para obtener opciones dinámicas
  // Validación
  validation?: {
    pattern?: RegExp
    message?: string
  }
}

export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  filterable?: boolean
  hidden?: boolean
  width?: string
  render?: (value: unknown, row: T) => React.ReactNode
}

export interface CRUDConfig {
  entity: string
  labels: {
    singular: string
    plural: string
  }
  displayField: string
  permissions: {
    create: boolean
    read: boolean
    update: boolean
    delete: boolean
  }
  messages: {
    create: { success: string; error: string }
    update: { success: string; error: string }
    delete: { success: string; error: string }
  }
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}


