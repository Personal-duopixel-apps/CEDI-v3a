/**
 * Servicio de Base de Datos
 * 
 * Este servicio proporciona una capa de abstracción para operaciones CRUD.
 * Soporta múltiples adaptadores:
 * - localStorage (demo/desarrollo)
 * - Google Sheets API (producción - solo lectura con API Key)
 * - MySQL via REST API
 * - Supabase
 * 
 * CONFIGURACIÓN: Edita el archivo src/config/database.config.ts
 */

import type { BaseEntity, PaginatedResponse, AuditLog, AuditAction } from '@/types'
import { generateId } from '@/lib/utils'
import { databaseConfig } from '@/config/database.config'
import { loadSheetData } from './googleSheets.service'

/**
 * Sincroniza operaciones CRUD con Google Apps Script
 * 
 * Google Apps Script requiere un enfoque especial para CORS:
 * - Usar 'text/plain' como Content-Type para evitar preflight
 * - Seguir redirecciones automáticamente
 */
async function syncWithGoogleSheets(
  action: 'create' | 'update' | 'delete',
  entity: string,
  payload?: Record<string, unknown>,
  id?: string
): Promise<{ success: boolean; error?: string }> {
  const appsScriptUrl = databaseConfig.googleSheets.appsScriptUrl
  
  if (!appsScriptUrl) {
    console.warn('⚠️ Apps Script URL no configurada, cambios solo en localStorage')
    return { success: true }
  }

  // Obtener el nombre de la hoja correcta para la entidad
  const sheetName = ENTITY_TO_SHEET[entity] || entity

  try {
    const requestBody = {
      action,
      entity: sheetName, // Usar el nombre de la hoja en Google Sheets
      payload,
      id,
    }

    console.log(`🔄 Sincronizando con Google Sheets: ${action} ${entity} → ${sheetName}`, requestBody)

    // Usar text/plain para evitar preflight CORS
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(requestBody),
      redirect: 'follow',
    })

    // Intentar leer la respuesta
    if (response.ok) {
      try {
        const result = await response.json()
        console.log(`✅ Sincronizado con Google Sheets: ${action} ${entity}`, result)
        return { success: result.success !== false }
      } catch {
        // Si no podemos parsear JSON, asumimos éxito
        console.log(`✅ Sincronizado con Google Sheets: ${action} ${entity}`)
        return { success: true }
      }
    } else {
      // Si hay error HTTP, intentar leer el mensaje
      const errorText = await response.text()
      console.error(`❌ Error HTTP ${response.status}:`, errorText)
      return { success: false, error: errorText }
    }
  } catch (error) {
    console.error('❌ Error sincronizando con Google Sheets:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// Mapeo de nombres de entidades a hojas de Google Sheets
// IMPORTANTE: Los nombres DEBEN coincidir EXACTAMENTE con las pestañas del Google Sheet
const ENTITY_TO_SHEET: Record<string, string> = {
  // Usuarios y Seguridad
  users: 'usuarios',
  audit_logs: 'audit_logs',
  
  // Catálogos
  products: 'productos',
  laboratories: 'laboratorios',
  categories: 'clasificaciones',
  drug_categories: 'clasificaciones',
  formas_farmaceuticas: 'formas farmaceuticas',
  unidades_medida: 'unidades de medida',
  tipos_empaque: 'tipos de empaque',
  impuestos: 'impuestos',
  monedas: 'monedas',
  niveles_producto: 'niveles de producto',
  principios_activos: 'principios activos',
  medidas_peso: 'medidas peso',
  
  // Proveedores
  suppliers: 'proveedores',
  buyers: 'compradores',
  solicitantes: 'Solicitantes',
  
  // Productos - Datos adicionales
  datos_logisticos: 'datos logisticos',
  datos_compra: 'datos compra',
  producto_ingredientes: 'producto ingredientes activos',
  producto_bonificaciones: 'producto bonificaciones',
  producto_categorias: 'producto categorias',
  
  // Configuración
  centros_distribucion: 'centros distribucion',
  horarios_negocio: 'horarios negocio',
  vehicle_types: 'tipos vehiculo',
  docks: 'puertas',
  horarios: 'horarios',
  dias_festivos: 'dias festivos',
  
  // Citas
  appointments: 'citas',
  ordenes_compra: 'ordenes compra',
  anulaciones_disponibilidad: 'anulaciones disponibilidad puerta',
}

class DatabaseService {
  private cache: Map<string, unknown[]> = new Map()
  private initialized: boolean = false
  private initializing: Promise<void> | null = null

  /**
   * Inicializa el servicio cargando datos desde Google Sheets
   */
  async initialize(): Promise<void> {
    if (this.initialized) return
    if (this.initializing) return this.initializing

    this.initializing = this._doInitialize()
    await this.initializing
  }

  private async _doInitialize(): Promise<void> {
    if (databaseConfig.adapter === 'google-sheets') {
      console.log('🔄 Inicializando conexión con Google Sheets...')
      
      try {
        // Cargar todas las entidades desde Google Sheets
        for (const [entity] of Object.entries(ENTITY_TO_SHEET)) {
          await this.loadFromGoogleSheets(entity)
        }
        
        console.log('✅ Datos cargados desde Google Sheets')
        this.initialized = true
      } catch (error) {
        console.error('❌ Error cargando datos de Google Sheets:', error)
        // Fallback a localStorage
        console.log('⚠️ Usando localStorage como fallback')
      }
    } else {
      this.initialized = true
    }
  }

  /**
   * Carga datos de una entidad desde Google Sheets
   */
  private async loadFromGoogleSheets(entity: string): Promise<void> {
    try {
      const result = await loadSheetData(entity)
      
      if (result.success && result.data.length > 0) {
        // Guardar en cache y localStorage
        const key = `cedi_${entity}`
        this.cache.set(key, result.data)
        localStorage.setItem(key, JSON.stringify(result.data))
        console.log(`  ✓ ${entity}: ${result.count} registros`)
      }
    } catch (error) {
      console.warn(`  ⚠️ No se pudo cargar ${entity}:`, error)
    }
  }

  /**
   * Recarga datos desde Google Sheets
   */
  async refresh(entity?: string): Promise<void> {
    if (databaseConfig.adapter !== 'google-sheets') return

    if (entity) {
      await this.loadFromGoogleSheets(entity)
    } else {
      for (const entityName of Object.keys(ENTITY_TO_SHEET)) {
        await this.loadFromGoogleSheets(entityName)
      }
    }
  }

  // =====================================================
  // OPERACIONES CRUD GENÉRICAS
  // =====================================================

  async getAll<T extends BaseEntity>(
    entity: string,
    options?: {
      rdcId?: string
      filters?: Record<string, unknown>
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    }
  ): Promise<T[]> {
    // Asegurar que está inicializado
    await this.initialize()

    const data = this.getFromStorage<T>(entity)
    
    let filtered = data

    // Filtrar por RDC (multi-tenant)
    // Solo filtra si el registro tiene rdc_id definido, permitiendo catálogos globales
    if (options?.rdcId) {
      filtered = filtered.filter(item => 
        !item.rdc_id || item.rdc_id === options.rdcId
      )
    }

    // Aplicar filtros adicionales
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          filtered = filtered.filter(item => {
            const itemValue = (item as Record<string, unknown>)[key]
            if (typeof value === 'string') {
              return String(itemValue).toLowerCase().includes(value.toLowerCase())
            }
            return itemValue === value
          })
        }
      })
    }

    // Ordenar
    if (options?.sortBy) {
      const order = options.sortOrder === 'desc' ? -1 : 1
      filtered.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[options.sortBy!]
        const bVal = (b as Record<string, unknown>)[options.sortBy!]
        if (aVal < bVal) return -1 * order
        if (aVal > bVal) return 1 * order
        return 0
      })
    }

    return filtered
  }

  async getPaginated<T extends BaseEntity>(
    entity: string,
    options: {
      page: number
      pageSize: number
      rdcId?: string
      filters?: Record<string, unknown>
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
      search?: string
      searchFields?: string[]
    }
  ): Promise<PaginatedResponse<T>> {
    let data = await this.getAll<T>(entity, {
      rdcId: options.rdcId,
      filters: options.filters,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
    })

    // Búsqueda global
    if (options.search && options.searchFields?.length) {
      const searchLower = options.search.toLowerCase()
      data = data.filter(item => 
        options.searchFields!.some(field => {
          const value = (item as Record<string, unknown>)[field]
          return String(value).toLowerCase().includes(searchLower)
        })
      )
    }

    const total = data.length
    const totalPages = Math.ceil(total / options.pageSize)
    const start = (options.page - 1) * options.pageSize
    const paginatedData = data.slice(start, start + options.pageSize)

    return {
      data: paginatedData,
      total,
      page: options.page,
      pageSize: options.pageSize,
      totalPages,
    }
  }

  async getById<T extends BaseEntity>(
    entity: string,
    id: string
  ): Promise<T | null> {
    await this.initialize()
    const data = this.getFromStorage<T>(entity)
    return data.find(item => item.id === id) || null
  }

  async create<T extends BaseEntity>(
    entity: string,
    item: Omit<T, 'id' | 'created_at' | 'updated_at'>,
    userId?: string
  ): Promise<T> {
    await this.initialize()
    const data = this.getFromStorage<T>(entity)
    const now = new Date().toISOString()
    
    const newItem = {
      ...item,
      id: generateId(),
      created_at: now,
      updated_at: now,
      created_by: userId,
    } as T

    data.push(newItem)
    this.saveToStorage(entity, data)

    // Sincronizar con Google Sheets
    await syncWithGoogleSheets('create', entity, newItem as unknown as Record<string, unknown>)

    // Registrar auditoría
    await this.logAudit({
      action: 'create',
      entity_type: entity,
      entity_id: newItem.id,
      new_values: newItem as unknown as Record<string, unknown>,
      user_id: userId,
    })

    return newItem
  }

  async update<T extends BaseEntity>(
    entity: string,
    id: string,
    updates: Partial<T>,
    userId?: string
  ): Promise<T | null> {
    await this.initialize()
    const data = this.getFromStorage<T>(entity)
    const index = data.findIndex(item => item.id === id)
    
    if (index === -1) return null

    const oldItem = { ...data[index] }
    const now = new Date().toISOString()
    
    data[index] = {
      ...data[index],
      ...updates,
      updated_at: now,
      updated_by: userId,
    }

    this.saveToStorage(entity, data)

    // Sincronizar con Google Sheets
    await syncWithGoogleSheets('update', entity, data[index] as unknown as Record<string, unknown>, id)

    // Registrar auditoría
    await this.logAudit({
      action: 'update',
      entity_type: entity,
      entity_id: id,
      old_values: oldItem as unknown as Record<string, unknown>,
      new_values: data[index] as unknown as Record<string, unknown>,
      user_id: userId,
    })

    return data[index]
  }

  async delete<T extends BaseEntity>(
    entity: string,
    id: string,
    userId?: string
  ): Promise<boolean> {
    await this.initialize()
    const data = this.getFromStorage<T>(entity)
    const index = data.findIndex(item => item.id === id)
    
    if (index === -1) return false

    const deletedItem = data[index]
    data.splice(index, 1)
    this.saveToStorage(entity, data)

    // Sincronizar con Google Sheets
    await syncWithGoogleSheets('delete', entity, undefined, id)

    // Registrar auditoría
    await this.logAudit({
      action: 'delete',
      entity_type: entity,
      entity_id: id,
      old_values: deletedItem as unknown as Record<string, unknown>,
      user_id: userId,
    })

    return true
  }

  async bulkDelete<T extends BaseEntity>(
    entity: string,
    ids: string[],
    userId?: string
  ): Promise<number> {
    let deleted = 0
    for (const id of ids) {
      const success = await this.delete<T>(entity, id, userId)
      if (success) deleted++
    }
    return deleted
  }

  // =====================================================
  // AUDITORÍA
  // =====================================================

  private async logAudit(params: {
    action: AuditAction
    entity_type: string
    entity_id: string
    old_values?: Record<string, unknown>
    new_values?: Record<string, unknown>
    user_id?: string
  }) {
    const auditLog: Partial<AuditLog> = {
      id: generateId(),
      user_id: params.user_id || 'system',
      user_email: params.user_id || 'system',
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id,
      old_values: params.old_values,
      new_values: params.new_values,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rdc_id: 'rdc-1',
    }

    const logs = this.getFromStorage<AuditLog>('audit_logs')
    logs.push(auditLog as AuditLog)
    this.saveToStorage('audit_logs', logs)
  }

  async getAuditLogs(options?: {
    entity_type?: string
    entity_id?: string
    user_id?: string
    action?: AuditAction
    from_date?: string
    to_date?: string
    limit?: number
  }): Promise<AuditLog[]> {
    await this.initialize()
    let logs = this.getFromStorage<AuditLog>('audit_logs')

    if (options?.entity_type) {
      logs = logs.filter(l => l.entity_type === options.entity_type)
    }
    if (options?.entity_id) {
      logs = logs.filter(l => l.entity_id === options.entity_id)
    }
    if (options?.user_id) {
      logs = logs.filter(l => l.user_id === options.user_id)
    }
    if (options?.action) {
      logs = logs.filter(l => l.action === options.action)
    }
    if (options?.from_date) {
      logs = logs.filter(l => l.created_at >= options.from_date!)
    }
    if (options?.to_date) {
      logs = logs.filter(l => l.created_at <= options.to_date!)
    }

    // Ordenar por fecha descendente
    logs.sort((a, b) => b.created_at.localeCompare(a.created_at))

    if (options?.limit) {
      logs = logs.slice(0, options.limit)
    }

    return logs
  }

  // =====================================================
  // STORAGE HELPERS
  // =====================================================

  private getFromStorage<T>(entity: string): T[] {
    const key = `cedi_${entity}`
    const cached = this.cache.get(key)
    if (cached) return cached as T[]

    const stored = localStorage.getItem(key)
    const data = stored ? JSON.parse(stored) : []
    this.cache.set(key, data)
    return data
  }

  private saveToStorage<T>(entity: string, data: T[]) {
    const key = `cedi_${entity}`
    localStorage.setItem(key, JSON.stringify(data))
    this.cache.set(key, data)
  }

  // Limpiar cache
  clearCache() {
    this.cache.clear()
    this.initialized = false
  }

  // Exportar todos los datos
  async exportAllData(): Promise<Record<string, unknown[]>> {
    await this.initialize()
    const entities = Object.keys(ENTITY_TO_SHEET)

    const data: Record<string, unknown[]> = {}
    for (const entity of entities) {
      data[entity] = this.getFromStorage(entity)
    }

    return data
  }

  // Importar datos
  async importData(data: Record<string, unknown[]>) {
    for (const [entity, items] of Object.entries(data)) {
      this.saveToStorage(entity, items)
    }
  }

  // Obtener estadísticas
  async getStats(): Promise<Record<string, number>> {
    await this.initialize()
    const stats: Record<string, number> = {}
    
    for (const entity of Object.keys(ENTITY_TO_SHEET)) {
      const data = this.getFromStorage(entity)
      stats[entity] = data.length
    }

    return stats
  }
}

export const db = new DatabaseService()

// Funciones wrapper para compatibilidad
let _isReady = false

export async function initializeDatabase(): Promise<void> {
  await db.initialize()
  _isReady = true
}

export function isDatabaseReady(): boolean {
  return _isReady
}
