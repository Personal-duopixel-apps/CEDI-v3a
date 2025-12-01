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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CentroDistribucion {
  id: string
  Nombre: string
  Dirección?: string
  Ciudad?: string
}

interface Puerta {
  id: string
  Nombre: string
  Tipo?: string
  Descripción?: string
  "ID centro distribucion"?: string
}

interface Horario {
  id: string
  Día: string
  "Hora Inicio": string
  "Hora Fin": string
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
  horario: string | null
}

interface BookingStep1Props {
  centros: CentroDistribucion[]
  puertas: Puerta[]
  horarios: Horario[]
  existingAppointments: Array<{
    id: string
    puerta_id: string
    fecha: string
    hora_inicio: string
    hora_fin: string
  }>
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
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null)
  const [weekStart, setWeekStart] = React.useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))

  // Filtrar puertas por centro seleccionado
  const puertasFiltradas = React.useMemo(() => {
    if (!selectedCentro) return []
    // Filtrar puertas que pertenezcan al centro seleccionado (por nombre)
    return puertas.filter(p => {
      const puertaCentro = p["ID centro distribucion"]
      // Si la puerta no tiene centro asignado, no la mostramos
      if (!puertaCentro) return false
      // Comparar por nombre del centro
      return puertaCentro === selectedCentro.Nombre
    })
  }, [selectedCentro, puertas])

  // Generar días de la semana
  const weekDays = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  // Generar slots de tiempo basados en horarios
  const timeSlots = React.useMemo(() => {
    if (!selectedPuerta || !selectedDate) return []

    const dayName = format(selectedDate, "EEEE", { locale: es })
    const dayHorario = horarios.find(h => 
      h.Día?.toLowerCase() === dayName.toLowerCase()
    )

    if (!dayHorario) return []

    const slots: TimeSlot[] = []
    const startHour = parseInt(dayHorario["Hora Inicio"]?.split(":")[0] || "8")
    const endHour = parseInt(dayHorario["Hora Fin"]?.split(":")[0] || "17")

    for (let hour = startHour; hour < endHour; hour++) {
      const timeStr = `${hour.toString().padStart(2, "0")}:00`
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      
      // Verificar si el slot está ocupado
      const isOccupied = existingAppointments.some(apt => 
        apt.puerta_id === selectedPuerta.id &&
        apt.fecha === dateStr &&
        apt.hora_inicio === timeStr
      )

      slots.push({
        time: timeStr,
        available: !isOccupied,
      })
    }

    return slots
  }, [selectedPuerta, selectedDate, horarios, existingAppointments])

  const handlePrevWeek = () => {
    setWeekStart(prev => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setWeekStart(prev => addDays(prev, 7))
  }

  const handleConfirm = () => {
    if (selectedCentro && selectedPuerta && selectedDate && selectedTime) {
      onSelectionComplete({
        centro: selectedCentro,
        puerta: selectedPuerta,
        fecha: selectedDate,
        horario: selectedTime,
      })
    }
  }

  const isSelectionComplete = selectedCentro && selectedPuerta && selectedDate && selectedTime

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
          selectedDate ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {selectedDate ? <Check className="h-4 w-4" /> : "3"}
        </div>
        <div className={cn("w-12 h-1 rounded", selectedTime ? "bg-primary" : "bg-muted")} />
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
          selectedTime ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {selectedTime ? <Check className="h-4 w-4" /> : "4"}
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
                  setSelectedDate(null)
                  setSelectedTime(null)
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
                    <h4 className="font-semibold truncate">{centro.Nombre}</h4>
                    {centro.Ciudad && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {centro.Ciudad}
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
                          setSelectedDate(null)
                          setSelectedTime(null)
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
                            <h4 className="font-semibold">{puerta.Nombre}</h4>
                            {puerta.Tipo && (
                              <Badge variant="outline" className="mt-1">
                                {puerta.Tipo}
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

      {/* Step 3: Seleccionar Fecha */}
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
                    3. Selecciona la Fecha
                  </CardTitle>
                  <div className="flex items-center gap-2">
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
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => {
                    const isToday = isSameDay(day, new Date())
                    const isPast = day < new Date() && !isToday
                    const dayName = format(day, "EEEE", { locale: es })
                    const hasSchedule = horarios.some(h => 
                      h.Día?.toLowerCase() === dayName.toLowerCase()
                    )

                    return (
                      <motion.button
                        key={day.toISOString()}
                        whileHover={!isPast && hasSchedule ? { scale: 1.05 } : {}}
                        whileTap={!isPast && hasSchedule ? { scale: 0.95 } : {}}
                        disabled={isPast || !hasSchedule}
                        onClick={() => {
                          setSelectedDate(day)
                          setSelectedTime(null)
                        }}
                        className={cn(
                          "p-3 rounded-lg border-2 text-center transition-all",
                          selectedDate && isSameDay(selectedDate, day)
                            ? "border-primary bg-primary/5"
                            : "border-border",
                          isPast && "opacity-50 cursor-not-allowed",
                          !hasSchedule && "opacity-50 cursor-not-allowed bg-muted",
                          isToday && "ring-2 ring-primary/30",
                          !isPast && hasSchedule && "hover:border-primary/50"
                        )}
                      >
                        <p className="text-xs text-muted-foreground uppercase">
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

      {/* Step 4: Seleccionar Horario */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  4. Selecciona el Horario - {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timeSlots.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No hay horarios disponibles para esta fecha
                  </p>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                    {timeSlots.map((slot) => (
                      <motion.button
                        key={slot.time}
                        whileHover={slot.available ? { scale: 1.05 } : {}}
                        whileTap={slot.available ? { scale: 0.95 } : {}}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={cn(
                          "p-3 rounded-lg border-2 text-center transition-all font-medium",
                          selectedTime === slot.time
                            ? "border-primary bg-primary text-primary-foreground"
                            : slot.available
                              ? "border-border hover:border-primary/50"
                              : "border-red-200 bg-red-50 text-red-400 cursor-not-allowed"
                        )}
                      >
                        {slot.time}
                        {!slot.available && (
                          <p className="text-xs mt-1">Ocupado</p>
                        )}
                      </motion.button>
                    ))}
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
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">Resumen de tu selección</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {selectedCentro?.Nombre}
                      </span>
                      <span className="flex items-center gap-1">
                        <DoorOpen className="h-4 w-4" />
                        {selectedPuerta?.Nombre}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {selectedDate && format(selectedDate, "d MMM yyyy", { locale: es })} a las {selectedTime}
                      </span>
                    </div>
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


