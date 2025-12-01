/**
 * Helpers de Zod para validación de datos de Google Sheets
 * 
 * Google Sheets devuelve valores como strings ("TRUE", "FALSE", "Sí", etc.)
 * que necesitan ser convertidos a tipos nativos de JavaScript.
 */

import { z } from "zod"

/**
 * Convierte strings a booleanos
 * Acepta: true, false, "TRUE", "FALSE", "Sí", "Si", "No", "1", "0", "yes", "no"
 */
export const booleanFromString = z.preprocess((val) => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim()
    return lower === 'true' || lower === 'sí' || lower === 'si' || lower === '1' || lower === 'yes'
  }
  if (typeof val === 'number') return val === 1
  return false
}, z.boolean())

/**
 * Convierte strings a números
 * Útil para campos numéricos que vienen como strings de Google Sheets
 */
export const numberFromString = z.preprocess((val) => {
  if (typeof val === 'number') return val
  if (typeof val === 'string' && val !== '') {
    const num = Number(val)
    return isNaN(num) ? undefined : num
  }
  return undefined
}, z.number().optional())

/**
 * Campo de texto opcional que acepta strings vacíos como undefined
 */
export const optionalString = z.preprocess((val) => {
  if (typeof val === 'string' && val.trim() === '') return undefined
  return val
}, z.string().optional())

/**
 * Convierte cualquier valor a string
 * Útil para campos que pueden venir como números desde Google Sheets
 */
export const stringFromAny = z.preprocess((val) => {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val
  return String(val)
}, z.string())

