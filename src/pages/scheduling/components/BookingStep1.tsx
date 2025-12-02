import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format, addDays, startOfWeek, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import {
  Building2,
  DoorOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  MapPin,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useSettingsStore, formatTimeWithAmPm } from "@/store/settings.store"

// Interfaces con nombres mapeados desde Google Sheets
interface CentroDistribucion {
  id: string
  name: string  // Mapeado desde 'Nombre'
  code?: string
  address?: string
  city?: string
  country?: string
}

interface Puerta {
  id: string
  name: string  // Mapeado desde 'Nombre'
  type?: string
  notes?: string
  distribution_center_id?: string  // Mapeado desde 'ID centro distribucion'
}

interface Horario {
  id: string
  dock_id?: string  // Mapeado desde 'ID de Puerta'
  day: string
  start_time: string
  end_time: string
  is_available?: boolean
}

interface TimeSlot {
  time: string
  available: boolean
  appointmentId?: string
}

interface BookingSelection {
  centro: CentroDistribucion | null
  puerta: Puerta | null
  fecha: Date | null
  horario: string | null  // Primer horario seleccionado (para compatibilidad)
  horarios?: string[]     // Lista de horarios seleccionados (para múltiple selección)
  fechas?: Date[]         // Lista de fechas seleccionadas (para múltiple selección)
}

interface ExistingAppointment {
  id: string
  puerta_nombre: string  // Nombre de la puerta (como viene de Google Sheets)
  fecha: string
  hora_inicio: string
  hora_fin: string
}

interface BookingStep1Props {
  centros: CentroDistribucion[]
  puertas: Puerta[]
  horarios: Horario[]
  existingAppointments: ExistingAppointment[]
  onSelectionComplete: (selection: BookingSelection) => void
}

export function BookingStep1({
  centros,
  puertas,
  horarios,
  existingAppointments,
  onSelectionComplete,
}: BookingStep1Props) {
  const [selectedCentro, setSelectedCentro] = React.useState<CentroDistribucion | null>(null)
  const [selectedPuerta, setSelectedPuerta] = React.useState<Puerta | null>(null)
  const [selectedDates, setSelectedDates] = React.useState<Date[]>([])  // Múltiples fechas
  const [selectedTimes, setSelectedTimes] = React.useState<string[]>([])  // Múltiples horarios
  const [weekStart, setWeekStart] = React.useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  
  // Obtener configuración de intervalo de horarios
  const { timeInterval } = useSettingsStore()

  // Filtrar puertas por centro seleccionado
  const puertasFiltradas = React.useMemo(() => {
    if (!selectedCentro) return []
    // Filtrar puertas que pertenezcan al centro seleccionado
    return puertas.filter(p => {
      const puertaCentro = p.distribution_center_id
      // Si la puerta no tiene centro asignado, no la mostramos
      if (!puertaCentro) return false
      // Comparar por nombre del centro (el Google Sheet guarda el nombre, no el ID)
      return puertaCentro === selectedCentro.name || puertaCentro === selectedCentro.id
    })
  }, [selectedCentro, puertas])

  // Generar días de la semana
  const weekDays = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  // Generar slots de tiempo basados en horarios para todas las fechas seleccionadas
  // Un slot solo está disponible si está libre en TODAS las fechas seleccionadas
  const timeSlots = React.useMemo(() => {
    if (!selectedPuerta || selectedDates.length === 0) return []

    console.log("📅 Generando slots para fechas:", selectedDates.map(d => format(d, "yyyy-MM-dd")))
    console.log("🚪 Puerta seleccionada:", selectedPuerta.name, selectedPuerta.id)
    console.log("⏰ Horarios disponibles:", horarios)

    // Obtener el rango de horas común a todas las fechas seleccionadas
    let minStartHour = -1  // -1 indica no inicializado
    let maxEndHour = -1
    
    // Verificar que todas las fechas tienen horario disponible
    for (const date of selectedDates) {
      const dayName = format(date, "EEEE", { locale: es })
      console.log(`🔍 Buscando horario para ${dayName}`)
      
      const dayHorario = horarios.find(h => {
        const dayMatches = h.day?.toLowerCase() === dayName.toLowerCase()
        if (!dayMatches) return false
        
        // El horario puede relacionarse por:
        // 1. dock_id coincide con ID de la puerta
        // 2. dock_id coincide con nombre de la puerta
        // 3. name del horario coincide con nombre de la puerta
        // 4. Si no tiene dock_id, mostrar para todas las puertas
        const puertaMatches = !h.dock_id || 
          h.dock_id === selectedPuerta.id || 
          h.dock_id === selectedPuerta.name ||
          h.name === selectedPuerta.name
        
        return puertaMatches
      })

      if (!dayHorario) {
        console.log(`❌ No se encontró horario para ${selectedPuerta.name} en ${dayName}`)
        return []
      }

      console.log(`✅ Horario encontrado para ${dayName}:`, dayHorario)

      const startHour = parseInt(dayHorario.start_time?.split(":")[0] || "8")
      const endHour = parseInt(dayHorario.end_time?.split(":")[0] || "17")
      
      console.log(`   Hora inicio: ${startHour}, Hora fin: ${endHour}`)
      
      // Para la primera fecha, inicializar los valores
      if (minStartHour === -1) {
        minStartHour = startHour
        maxEndHour = endHour
      } else {
        // Usar el rango más restrictivo (intersección de todos los horarios)
        minStartHour = Math.max(minStartHour, startHour)
        maxEndHour = Math.min(maxEndHour, endHour)
      }
    }

    console.log(`📊 Rango final: ${minStartHour}:00 - ${maxEndHour}:00`)

    if (minStartHour === -1 || maxEndHour === -1 || minStartHour >= maxEndHour) {
      console.log("❌ No hay horarios comunes entre las fechas seleccionadas")
      return []
    }

    const slots: TimeSlot[] = []

    // Generar slots según el intervalo configurado (30 o 60 minutos)
    for (let hour = minStartHour; hour < maxEndHour; hour++) {
      // Hora en punto
      const timeStr = `${hour.toString().padStart(2, "0")}:00`
      const timeStrNoPad = `${hour}:00`
      
      // Verificar si está ocupado en ALGUNA de las fechas seleccionadas
      const isOccupied = selectedDates.some(date => {
        const dateStr = format(date, "yyyy-MM-dd")
        return existingAppointments.some(apt => {
          const puertaMatch = apt.puerta_nombre === selectedPuerta.name || 
                             apt.puerta_nombre === selectedPuerta.id
          const fechaMatch = apt.fecha === dateStr
          const aptHora = apt.hora_inicio?.trim()
          const horaMatch = aptHora === timeStr || aptHora === timeStrNoPad
          return puertaMatch && fechaMatch && horaMatch
        })
      })

      slots.push({
        time: timeStr,
        available: !isOccupied,
      })
      
      // Media hora (solo si el intervalo es 30 minutos)
      if (timeInterval === 30) {
        const timeStr30 = `${hour.toString().padStart(2, "0")}:30`
        const timeStrNoPad30 = `${hour}:30`
        
        const isOccupied30 = selectedDates.some(date => {
          const dateStr = format(date, "yyyy-MM-dd")
          return existingAppointments.some(apt => {
            const puertaMatch = apt.puerta_nombre === selectedPuerta.name || 
                               apt.puerta_nombre === selectedPuerta.id
            const fechaMatch = apt.fecha === dateStr
            const aptHora = apt.hora_inicio?.trim()
            const horaMatch = aptHora === timeStr30 || aptHora === timeStrNoPad30
            return puertaMatch && fechaMatch && horaMatch
          })
        })

        slots.push({
          time: timeStr30,
          available: !isOccupied30,
        })
      }
    }

    console.log(`✅ Slots generados: ${slots.length}`, slots)
    return slots
  }, [selectedPuerta, selectedDates, horarios, existingAppointments, timeInterval])

  const handlePrevWeek = () => {
    setWeekStart(prev => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setWeekStart(prev => addDays(prev, 7))
  }

  // Handler para seleccionar/deseleccionar horarios (múltiple selección)
  const handleTimeToggle = (time: string) => {
    setSelectedTimes(prev => {
      if (prev.includes(time)) {
        // Deseleccionar
        return prev.filter(t => t !== time)
      } else {
        // Seleccionar y ordenar
        return [...prev, time].sort()
      }
    })
  }

  // Remover un horario específico
  const handleRemoveTime = (time: string) => {
    setSelectedTimes(prev => prev.filter(t => t !== time))
  }

  // Handler para seleccionar/deseleccionar fechas (múltiple selección)
  const handleDateToggle = (date: Date) => {
    setSelectedDates(prev => {
      const exists = prev.some(d => isSameDay(d, date))
      if (exists) {
        // Deseleccionar
        return prev.filter(d => !isSameDay(d, date))
      } else {
        // Seleccionar y ordenar por fecha
        return [...prev, date].sort((a, b) => a.getTime() - b.getTime())
      }
    })
    // Limpiar horarios cuando cambian las fechas
    setSelectedTimes([])
  }

  // Remover una fecha específica
  const handleRemoveDate = (date: Date) => {
    setSelectedDates(prev => prev.filter(d => !isSameDay(d, date)))
    setSelectedTimes([])
  }

  const handleConfirm = () => {
    if (selectedCentro && selectedPuerta && selectedDates.length > 0 && selectedTimes.length > 0) {
      onSelectionComplete({
        centro: selectedCentro,
        puerta: selectedPuerta,
        fecha: selectedDates[0],    // Primera fecha para compatibilidad
        fechas: selectedDates,      // Todas las fechas seleccionadas
        horario: selectedTimes[0],  // Primer horario para compatibilidad
        horarios: selectedTimes,    // Todos los horarios seleccionados
      })
    }
  }

  const isSelectionComplete = selectedCentro && selectedPuerta && selectedDates.length > 0 && selectedTimes.length > 0

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
          selectedCentro ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {selectedCentro ? <Check className="h-4 w-4" /> : "1"}
        </div>
        <div className={cn("w-12 h-1 rounded", selectedCentro ? "bg-primary" : "bg-muted")} />
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
          selectedPuerta ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {selectedPuerta ? <Check className="h-4 w-4" /> : "2"}
        </div>
        <div className={cn("w-12 h-1 rounded", selectedPuerta ? "bg-primary" : "bg-muted")} />
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
          selectedDates.length > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {selectedDates.length > 0 ? <Check className="h-4 w-4" /> : "3"}
        </div>
        <div className={cn("w-12 h-1 rounded", selectedTimes.length > 0 ? "bg-primary" : "bg-muted")} />
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
          selectedTimes.length > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {selectedTimes.length > 0 ? <Check className="h-4 w-4" /> : "4"}
        </div>
      </div>

      {/* Step 1: Seleccionar Centro de Distribución */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            1. Selecciona el Centro de Distribución
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {centros.map((centro) => (
              <motion.button
                key={centro.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedCentro(centro)
                  setSelectedPuerta(null)
                  setSelectedDates([])
                  setSelectedTimes([])
                }}
                className={cn(
                  "p-4 rounded-lg border-2 text-left transition-all",
                  selectedCentro?.id === centro.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    selectedCentro?.id === centro.id ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{centro.name}</h4>
                    {centro.city && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {centro.city}
                      </p>
                    )}
                  </div>
                  {selectedCentro?.id === centro.id && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Seleccionar Puerta */}
      <AnimatePresence>
        {selectedCentro && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DoorOpen className="h-5 w-5 text-primary" />
                  2. Selecciona la Puerta
                </CardTitle>
              </CardHeader>
              <CardContent>
                {puertasFiltradas.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay puertas disponibles para este centro
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {puertasFiltradas.map((puerta) => (
                      <motion.button
                        key={puerta.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedPuerta(puerta)
                          setSelectedDates([])
                          setSelectedTimes([])
                        }}
                        className={cn(
                          "p-4 rounded-lg border-2 text-left transition-all",
                          selectedPuerta?.id === puerta.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{puerta.name}</h4>
                            {puerta.type && (
                              <Badge variant="outline" className="mt-1">
                                {puerta.type}
                              </Badge>
                            )}
                          </div>
                          {selectedPuerta?.id === puerta.id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3: Seleccionar Fecha(s) */}
      <AnimatePresence>
        {selectedPuerta && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    3. Selecciona las Fechas
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs mr-2">
                      Puedes seleccionar múltiples días
                    </Badge>
                    <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[200px] text-center">
                      {format(weekStart, "d MMM", { locale: es })} - {format(addDays(weekStart, 6), "d MMM yyyy", { locale: es })}
                    </span>
                    <Button variant="outline" size="icon" onClick={handleNextWeek}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Fechas seleccionadas */}
                {selectedDates.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Fechas seleccionadas:</span>
                    {selectedDates.map((date) => (
                      <Badge 
                        key={date.toISOString()} 
                        variant="default"
                        className="gap-1 cursor-pointer hover:bg-primary/80"
                        onClick={() => handleRemoveDate(date)}
                      >
                        {format(date, "EEE d MMM", { locale: es })}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => {
                    const isToday = isSameDay(day, new Date())
                    const isPast = day < new Date() && !isToday
                    const dayName = format(day, "EEEE", { locale: es })
                    const isSelected = selectedDates.some(d => isSameDay(d, day))
                    
                    // Verificar si hay horario para la puerta seleccionada en este día
                    const hasSchedule = horarios.some(h => {
                      const dayMatches = h.day?.toLowerCase() === dayName.toLowerCase()
                      const puertaMatches = !h.dock_id || 
                        h.dock_id === selectedPuerta?.id || 
                        h.dock_id === selectedPuerta?.name ||
                        h.name === selectedPuerta?.name
                      return dayMatches && puertaMatches
                    })

                    return (
                      <motion.button
                        key={day.toISOString()}
                        whileHover={!isPast && hasSchedule ? { scale: 1.05 } : {}}
                        whileTap={!isPast && hasSchedule ? { scale: 0.95 } : {}}
                        disabled={isPast || !hasSchedule}
                        onClick={() => handleDateToggle(day)}
                        className={cn(
                          "p-3 rounded-lg border-2 text-center transition-all relative",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border",
                          isPast && "opacity-50 cursor-not-allowed",
                          !hasSchedule && "opacity-50 cursor-not-allowed bg-muted",
                          isToday && !isSelected && "ring-2 ring-primary/30",
                          !isPast && hasSchedule && !isSelected && "hover:border-primary/50"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <p className={cn(
                          "text-xs uppercase",
                          isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                          {format(day, "EEE", { locale: es })}
                        </p>
                        <p className="text-lg font-bold mt-1">
                          {format(day, "d")}
                        </p>
                        {!hasSchedule && (
                          <p className="text-xs text-muted-foreground">Cerrado</p>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 4: Seleccionar Horario(s) */}
      <AnimatePresence>
        {selectedDates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    4. Selecciona el Horario
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Se aplicará a {selectedDates.length} {selectedDates.length === 1 ? 'día' : 'días'}
                  </Badge>
                </div>
                
                {/* Mostrar fechas seleccionadas */}
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Fechas:</span>
                  {selectedDates.map((date) => (
                    <Badge key={date.toISOString()} variant="secondary">
                      {format(date, "EEE d MMM", { locale: es })}
                    </Badge>
                  ))}
                </div>
                
                {/* Horarios seleccionados */}
                {selectedTimes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Horarios seleccionados:</span>
                    {selectedTimes.map((time) => (
                      <Badge 
                        key={time} 
                        variant="default"
                        className="gap-1 cursor-pointer hover:bg-primary/80"
                        onClick={() => handleRemoveTime(time)}
                      >
                        {formatTimeWithAmPm(time)}
                        <X className="h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {timeSlots.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay horarios disponibles para esta fecha
                  </p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                    {timeSlots.map((slot) => {
                      const isSelected = selectedTimes.includes(slot.time)
                      return (
                        <motion.button
                          key={slot.time}
                          whileHover={slot.available ? { scale: 1.05 } : {}}
                          whileTap={slot.available ? { scale: 0.95 } : {}}
                          disabled={!slot.available}
                          onClick={() => handleTimeToggle(slot.time)}
                          className={cn(
                            "p-3 rounded-lg border-2 text-center transition-all font-medium relative",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : slot.available
                                ? "border-border hover:border-primary/50"
                                : "border-red-200 bg-red-50 text-red-400 cursor-not-allowed"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                          <span className="text-sm">{formatTimeWithAmPm(slot.time)}</span>
                          {!slot.available && (
                            <p className="text-xs mt-1">Ocupado</p>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resumen y Confirmación */}
      <AnimatePresence>
        {isSelectionComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Resumen de tu selección</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {selectedCentro?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <DoorOpen className="h-4 w-4" />
                        {selectedPuerta?.name}
                      </span>
                    </div>
                    
                    {/* Mostrar fechas seleccionadas */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">Fechas:</span>
                      {selectedDates.map((date) => (
                        <Badge key={date.toISOString()} variant="outline">
                          {format(date, "EEE d MMM", { locale: es })}
                        </Badge>
                      ))}
                      {selectedDates.length > 1 && (
                        <span className="text-xs text-muted-foreground">
                          ({selectedDates.length} días)
                        </span>
                      )}
                    </div>
                    
                    {/* Mostrar horarios seleccionados */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">Horarios:</span>
                      {selectedTimes.map((time) => (
                        <Badge key={time} variant="secondary">
                          {formatTimeWithAmPm(time)}
                        </Badge>
                      ))}
                      {selectedTimes.length > 1 && (
                        <span className="text-xs text-muted-foreground">
                          ({selectedTimes.length} horarios)
                        </span>
                      )}
                    </div>
                    
                    {/* Total de citas a crear */}
                    {(selectedDates.length > 1 || selectedTimes.length > 1) && (
                      <div className="mt-3 p-2 bg-primary/10 rounded-lg">
                        <span className="text-sm font-medium">
                          Se crearán {selectedDates.length * selectedTimes.length} citas en total
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({selectedDates.length} {selectedDates.length === 1 ? 'día' : 'días'} × {selectedTimes.length} {selectedTimes.length === 1 ? 'horario' : 'horarios'})
                        </span>
                      </div>
                    )}
                  </div>
                  <Button size="lg" onClick={handleConfirm}>
                    Continuar con el Registro
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


