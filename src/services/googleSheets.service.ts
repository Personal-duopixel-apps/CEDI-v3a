/**
 * Servicio de Google Sheets
 * 
 * Conecta con Google Sheets API para operaciones CRUD
 */

import { databaseConfig } from '@/config/database.config'
import { generateId } from '@/lib/utils'

const { apiKey, spreadsheetId, sheetNames } = databaseConfig.googleSheets

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

interface SheetRow {
  [key: string]: unknown
}

/**
 * Mapeo de nombres de columnas del Google Sheet → nombres de la app
 * El Google Sheet usa nombres en español, la app usa nombres en inglés
 */
const COLUMN_MAPPINGS: Record<string, Record<string, string>> = {
  // Mapeo global (aplica a todas las hojas)
  _global: {
    'ID': 'id',
    'Nombre': 'name',
    'Código': 'code',
    'Descripción': 'description',
    'Activo': 'is_active',
    'Teléfono': 'phone',
    'Email': 'email',
    'Dirección': 'address',
    'País': 'country',
    'Fecha Creación': 'created_at',
    'Fecha Actualización': 'updated_at',
  },
  
  // Laboratorios
  laboratories: {
    'Información de Contacto': 'contact_info',
  },
  
  // Formas Farmacéuticas (español e inglés)
  formas_farmaceuticas: {},
  pharmaceutical_forms: {},  // Alias en inglés
  
  // Unidades de Medida (español e inglés)
  unidades_medida: {
    'Símbolo': 'symbol',
    'Tipo': 'type',
  },
  measurement_units: {  // Alias en inglés
    'Símbolo': 'symbol',
    'Tipo': 'type',
  },
  
  // Tipos de Empaque (español e inglés)
  tipos_empaque: {
    'Unidades por Empaque': 'units_per_pack',
  },
  package_types: {  // Alias en inglés
    'Unidades por Empaque': 'units_per_pack',
  },
  
  // Impuestos (español e inglés)
  impuestos: {
    'Porcentaje': 'percentage',
    'Tasa': 'rate',
  },
  taxes: {  // Alias en inglés
    'Porcentaje': 'percentage',
    'Tasa': 'rate',
  },
  
  // Monedas (español e inglés)
  monedas: {
    'Símbolo': 'symbol',
    'Tasa de Cambio': 'exchange_rate',
  },
  currencies: {  // Alias en inglés
    'Símbolo': 'symbol',
    'Tasa de Cambio': 'exchange_rate',
  },
  
  // Niveles de Producto (español e inglés)
  niveles_producto: {
    'Nivel': 'level',
    'ID Padre': 'parent_id',
  },
  product_levels: {  // Alias en inglés
    'Nivel': 'level',
    'ID Padre': 'parent_id',
  },
  
  // Principios Activos (español e inglés)
  principios_activos: {
    'Concentración': 'concentration',
  },
  active_ingredients: {  // Alias en inglés
    'Concentración': 'concentration',
  },
  
  // Clasificaciones (español e inglés)
  classifications: {},  // Alias en inglés
  
  // Compradores
  buyers: {
    'Persona de Contacto': 'contact_person',
  },
  
  // Proveedores
  suppliers: {
    'Razón Social': 'legal_name',
    'NIT': 'tax_id',
    'ID Comprador Principal': 'main_buyer_id',
    'Nombre Comprador Principal': 'main_buyer_name',
    'Persona de Contacto': 'contact_name',
    'Email': 'contact_email',
    'Teléfono': 'contact_phone',
    'Ciudad': 'city',
  },
  
  // Productos
  products: {
    'ID Centro de Distribución': 'rdc_id',
    'ID Solicitante': 'solicitante_id',
    'ID Laboratorio': 'laboratory_id',
    'Nombre Generado': 'generated_name',
    'Características': 'characteristics',
    'ID Forma Farmacéutica': 'forma_farmaceutica_id',
    'Cantidad': 'quantity',
    'ID Medida Peso/Tamaño': 'medida_peso_id',
    'ID Tipo Empaque': 'tipo_empaque_id',
    'Talla/Capacidad': 'size_capacity',
    'Calibre/Grosor/Diámetro': 'caliber_thickness',
    'Descripción Oferta Especial': 'special_offer_description',
    'Vencimiento Registro Sanitario': 'sanitary_registry_expiration',
    'Número Registro Sanitario': 'sanitary_registry_number',
    'Código de Barras': 'barcode',
    'ID Tipo de Impuesto': 'tax_type_id',
    'ID Clasificación': 'classification_id',
    'Es Controlado': 'is_controlled',
    'Es Refrigerado': 'is_refrigerated',
    'Uso Hospitalario': 'is_hospital_use',
    'Requiere Receta Retenida': 'requires_retained_prescription',
    'Uso Crónico': 'is_chronic_use',
    'Para Farmacias Propias': 'for_own_pharmacies',
    'Para Farmacias Independientes': 'for_independent_pharmacies',
    'Para Uso Institucional/Hospitalario': 'for_institutional_use',
    'Es Ruteado': 'is_routed',
    'Para Venta al por Mayor': 'for_wholesale',
    'Para Autoservicio': 'for_self_service',
    'Es Borrador': 'is_draft',
  },
  
  // Citas
  appointments: {
    'Fecha': 'date',
    'Hora Inicio': 'start_time',
    'Hora Fin': 'end_time',
    'ID Puerta': 'dock_id',
    'ID Proveedor': 'supplier_id',
    'ID Orden de Compra': 'purchase_order_id',
    'Estado': 'status',
    'Notas': 'notes',
  },
  
  // Centros de Distribución
  centros_distribucion: {
    'Código': 'code',
    'Nombre': 'name',
    'Dirección': 'address',
    'Ciudad': 'city',
    'País': 'country',
    'Zona Horaria': 'timezone',
    'Activo': 'is_active',
  },
  
  // Puertas - relacionadas a Centro de Distribución
  docks: {
    'ID centro distribucion': 'distribution_center_id',
    'Número de Puerta': 'code',
    'Tipo': 'type',
    'Capacidad': 'capacity',
    'Estado': 'status',
    'Descripción': 'notes',
  },
  
  // Tipos de Vehículo
  vehicle_types: {
    'Capacidad': 'capacity',
    'Peso Máximo': 'max_weight',
  },
  
  // Horarios - relacionados a Puertas
  horarios: {
    'Fecha': 'date',
    'ID de Puerta': 'dock_id',
    'Día': 'day',
    'Hora Inicio': 'start_time',
    'Hora Fin': 'end_time',
    'Disponible': 'is_available',
    'Descripción': 'notes',
  },
  
  // Días Festivos - relacionados a Centro de Distribución
  dias_festivos: {
    'ID Centro de Distribución': 'distribution_center_id',
    'Fecha': 'date',
    'Descripción': 'notes',
    'Es Día Laboral': 'is_working_day',
    'Hora de Inicio': 'start_time',
    'Hora de Fin': 'end_time',
  },
  
  // Usuarios
  users: {
    'Nombres': 'name',
    'Usuario': 'username',
    'Password': 'password',
    'Perfil de usuario': 'role',
  },
}

/**
 * Normaliza un nombre de columna
 */
function normalizeColumnName(header: string, entity: string): string {
  // Primero buscar en el mapeo específico de la entidad
  const entityMapping = COLUMN_MAPPINGS[entity] || {}
  if (entityMapping[header]) {
    return entityMapping[header]
  }
  
  // Luego buscar en el mapeo global
  const globalMapping = COLUMN_MAPPINGS._global
  if (globalMapping[header]) {
    return globalMapping[header]
  }
  
  // Si no hay mapeo, convertir a snake_case
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]+/g, '_') // Reemplazar caracteres especiales con _
    .replace(/^_+|_+$/g, '') // Quitar _ al inicio/final
}

/**
 * Obtiene el nombre de la hoja para una entidad
 */
function getSheetName(entity: string): string {
  return sheetNames[entity as keyof typeof sheetNames] || entity
}

/**
 * Hace una petición a la API de Google Sheets
 */
async function sheetsRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> {
  const url = `${SHEETS_API_BASE}/${spreadsheetId}${endpoint}?key=${apiKey}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Google Sheets API Error:', error)
    throw new Error(error.error?.message || 'Error en Google Sheets API')
  }

  return response.json()
}

/**
 * Parsea un valor de Google Sheets
 */
function parseValue(value: unknown): unknown {
  if (value === '' || value === null || value === undefined) return ''
  
  const strValue = String(value).trim()
  
  // Booleanos - NO convertir números simples a booleanos
  if (strValue.toLowerCase() === 'true' || strValue.toLowerCase() === 'sí') return true
  if (strValue.toLowerCase() === 'false' || strValue.toLowerCase() === 'no') return false
  
  // Números (pero no si es un string que parece ID o código)
  if (!isNaN(Number(strValue)) && strValue !== '' && !strValue.startsWith('0') || strValue === '0') {
    return Number(strValue)
  }
  
  return strValue
}

/**
 * Lee todos los datos de una hoja
 */
export async function readSheet(entity: string): Promise<SheetRow[]> {
  const sheetName = getSheetName(entity)
  
  try {
    const data = await sheetsRequest(`/values/${encodeURIComponent(sheetName)}`) as {
      values?: string[][]
    }
    
    if (!data.values || data.values.length < 2) {
      return []
    }

    const [rawHeaders, ...rows] = data.values
    
    // Normalizar headers
    const headers = rawHeaders.map(h => normalizeColumnName(h, entity))
    
    return rows.map(row => {
      const obj: SheetRow = {}
      headers.forEach((header, index) => {
        obj[header] = parseValue(row[index])
      })
      return obj
    })
  } catch (error) {
    console.error(`Error reading sheet ${sheetName}:`, error)
    return []
  }
}

/**
 * Obtiene un registro por ID
 */
export async function getById(entity: string, id: string): Promise<SheetRow | null> {
  const rows = await readSheet(entity)
  return rows.find(row => row.id === id) || null
}

/**
 * Verifica la conexión con Google Sheets
 */
export async function testConnection(): Promise<{
  success: boolean
  message: string
  sheets?: string[]
}> {
  try {
    const data = await sheetsRequest('') as {
      sheets?: Array<{ properties: { title: string } }>
    }
    
    const sheets = data.sheets?.map(s => s.properties.title) || []
    
    return {
      success: true,
      message: `Conexión exitosa! Se encontraron ${sheets.length} hojas.`,
      sheets,
    }
  } catch (error) {
    return {
      success: false,
      message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    }
  }
}

/**
 * Obtiene información del spreadsheet
 */
export async function getSpreadsheetInfo(): Promise<{
  title: string
  sheets: string[]
  url: string
}> {
  const data = await sheetsRequest('') as {
    properties: { title: string }
    sheets: Array<{ properties: { title: string } }>
  }
  
  return {
    title: data.properties.title,
    sheets: data.sheets.map(s => s.properties.title),
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
  }
}

/**
 * Carga datos de una hoja específica
 */
export async function loadSheetData(entity: string): Promise<{
  success: boolean
  data: SheetRow[]
  count: number
  columns: string[]
  error?: string
}> {
  try {
    const sheetName = getSheetName(entity)
    const data = await sheetsRequest(`/values/${encodeURIComponent(sheetName)}`) as {
      values?: string[][]
    }
    
    if (!data.values || data.values.length === 0) {
      return {
        success: true,
        data: [],
        count: 0,
        columns: [],
      }
    }

    const [rawHeaders, ...rows] = data.values
    
    // Normalizar headers
    const headers = rawHeaders.map(h => normalizeColumnName(h, entity))
    
    const parsedRows = rows.map(row => {
      const obj: SheetRow = {}
      headers.forEach((header, index) => {
        obj[header] = parseValue(row[index])
      })
      return obj
    })

    return {
      success: true,
      data: parsedRows,
      count: parsedRows.length,
      columns: headers,
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      count: 0,
      columns: [],
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

/**
 * Carga datos de múltiples hojas
 */
export async function loadAllData(): Promise<Record<string, {
  success: boolean
  count: number
  columns: string[]
  sample: SheetRow[]
}>> {
  const entities = Object.keys(databaseConfig.googleSheets.sheetNames)
  const results: Record<string, {
    success: boolean
    count: number
    columns: string[]
    sample: SheetRow[]
  }> = {}

  for (const entity of entities) {
    const result = await loadSheetData(entity)
    results[entity] = {
      success: result.success,
      count: result.count,
      columns: result.columns,
      sample: result.data.slice(0, 3),
    }
  }

  return results
}

// Nota: Para operaciones de escritura (crear, actualizar, eliminar)
// necesitas usar OAuth2 en lugar de API Key, o usar Google Apps Script
// como intermediario. La API Key solo permite lectura.

/**
 * IMPORTANTE: 
 * La API Key de Google Sheets solo permite LECTURA.
 * Para escribir datos necesitas:
 * 1. Usar OAuth2 (más complejo, requiere login)
 * 2. Usar Google Apps Script como API intermedia (recomendado para WeWeb)
 * 
 * Por ahora, el sistema usará localStorage para escritura
 * y Google Sheets para lectura inicial de datos maestros.
 */
