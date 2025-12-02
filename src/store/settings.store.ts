import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimeInterval = 30 | 60  // 30 minutos o 60 minutos

interface SettingsStore {
  // Configuración de horarios
  timeInterval: TimeInterval
  workdayStart: number  // Hora de inicio (ej: 6 para 6am)
  workdayEnd: number    // Hora de fin (ej: 20 para 8pm)
  
  // Actions
  setTimeInterval: (interval: TimeInterval) => void
  setWorkdayHours: (start: number, end: number) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // Valores por defecto
      timeInterval: 60,  // Por defecto cada hora
      workdayStart: 6,   // 6am
      workdayEnd: 20,    // 8pm

      setTimeInterval: (interval: TimeInterval) => {
        set({ timeInterval: interval })
      },

      setWorkdayHours: (start: number, end: number) => {
        set({ workdayStart: start, workdayEnd: end })
      },
    }),
    {
      name: 'cedi-settings',
    }
  )
)

// Helper para generar los slots de tiempo según la configuración
export function generateTimeSlots(
  interval: TimeInterval = 60,
  startHour: number = 6,
  endHour: number = 20
): string[] {
  const slots: string[] = []
  
  for (let hour = startHour; hour <= endHour; hour++) {
    // Hora en punto
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    
    // Media hora (solo si el intervalo es 30 minutos)
    if (interval === 30 && hour < endHour) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  
  return slots
}

// Helper para formatear hora con AM/PM
export function formatTimeWithAmPm(time: string): string {
  const [hourStr, minutes] = time.split(':')
  const hour = parseInt(hourStr, 10)
  if (isNaN(hour)) return time
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  const ampm = hour >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minutes || '00'} ${ampm}`
}

