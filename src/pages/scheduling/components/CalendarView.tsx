import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns"
import { es } from "date-fns/locale"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Building2,
  DoorOpen,
  Truck,
  User,
  Phone,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Grid3X3,
  Pencil,
  Trash2,
} from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useSettingsStore, generateTimeSlots, formatTimeWithAmPm } from "@/store/settings.store"

export interface CalendarAppointment {
  id: string
  numero_cita: string
  proveedor_nombre: string
  puerta_nombre: string
  centro_nombre: string
  tipo_vehiculo_nombre: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  estado: string
  conductor_nombre?: string
  conductor_telefono?: string
  placas_vehiculo?: string
  ordenes_compra?: string[]
  notas?: string
  // Nuevos campos para flujo de 3 fases
  token?: string
  contacto_nombre?: string
  contacto_email?: string
  codigo_cita?: string
}

interface Puerta {
  id: string
  name: string
  type?: string
  notes?: string
  distribution_center_id?: string
}

interface Horario {
  id: string
  name?: string
  day?: string  // Legacy: un solo día
  days?: string  // Múltiples días separados por coma
  start_time: string
  end_time: string
  dock_id?: string  // Legacy: una sola puerta
  dock_ids?: string  // Múltiples puertas separadas por coma
  distribution_center_id?: string  // Centro de distribución
  is_available?: boolean | string
  is_active?: boolean | string
}

interface CalendarViewProps {
  appointments: CalendarAppointment[]
  puertas?: Puerta[]
  horarios?: Horario[]
  onAppointmentClick?: (appointment: CalendarAppointment) => void
  onStatusChange?: (appointmentId: string, newStatus: string) => void
  onEditAppointment?: (appointment: CalendarAppointment) => void
  onDeleteAppointment?: (appointmentId: string) => void
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  // Fase 1 - Pendiente datos de transporte
  pending_transport: { label: "Pend. Transporte", color: "bg-amber-100 text-amber-800 border-amber-200", icon: AlertTriangle },
  pending_transport_data: { label: "Pend. Transporte", color: "bg-amber-100 text-amber-800 border-amber-200", icon: AlertTriangle },
  // Fase 2 - Datos de transporte completados, lista para aprobar
  transport_completed: { label: "Lista p/Aprobar", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Calendar },
  // Fase 3 - Aprobada con código
  approved: { label: "Aprobada", color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: CheckCircle2 },
  scheduled: { label: "Programada", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Calendar },
  // En proceso
  receiving_started: { label: "En Recepción", color: "bg-purple-100 text-purple-800 border-purple-200", icon: Truck },
  // Completadas
  complete: { label: "Completa", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2 },
  receiving_finished: { label: "Finalizada", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  // Canceladas/No presentados
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  did_not_show: { label: "No Presentado", color: "bg-gray-100 text-gray-800 border-gray-200", icon: XCircle },
}

export function CalendarView({
  appointments,
  puertas = [],
  horarios = [],
  onAppointmentClick,
  onStatusChange,
  onEditAppointment,
  onDeleteAppointment,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [selectedAppointment, setSelectedAppointment] = React.useState<CalendarAppointment | null>(null)
  const [viewMode, setViewMode] = React.useState<"month" | "day">("month")
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  
  // Obtener información del usuario actual para verificar permisos
  const { user, hasRole } = useAuthStore()
  
  // Verificar si el usuario es administrador
  const isAdmin = hasRole(['superadmin', 'admin', 'scheduling-admin'])
  
  // Verificar si el usuario puede editar/eliminar una cita específica
  const canEditAppointment = (appointment: CalendarAppointment) => {
    // Los administradores pueden editar cualquier cita
    if (isAdmin) return true
    
    // Los demás usuarios solo pueden editar sus propias citas
    // Comparamos por el nombre del proveedor o el email de contacto
    if (user?.supplier_id) {
      // Si el usuario tiene un supplier_id, verificar si la cita es de su proveedor
      return appointment.proveedor_nombre === user.name || 
             appointment.contacto_email === user.email
    }
    
    return false
  }
  
  const canDeleteAppointment = (appointment: CalendarAppointment) => {
    // Solo los administradores pueden eliminar citas
    return isAdmin
  }

  // Generar días del calendario
  const calendarDays = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days: Date[] = []
    let day = startDate

    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }, [currentMonth])

  // Agrupar citas por fecha
  const appointmentsByDate = React.useMemo(() => {
    const grouped: Record<string, CalendarAppointment[]> = {}
    appointments.forEach((apt) => {
      const dateKey = apt.fecha
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(apt)
    })
    return grouped
  }, [appointments])

  // Citas del día seleccionado
  const selectedDayAppointments = React.useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, "yyyy-MM-dd")
    return (appointmentsByDate[dateKey] || []).sort((a, b) => 
      a.hora_inicio.localeCompare(b.hora_inicio)
    )
  }, [selectedDate, appointmentsByDate])

  // Obtener configuración de intervalo de horarios
  const { timeInterval } = useSettingsStore()

  // Obtener el día de la semana seleccionado
  const selectedDayName = React.useMemo(() => {
    if (!selectedDate) return ""
    const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
    return dayNames[selectedDate.getDay()]
  }, [selectedDate])

  // Calcular los horarios dinámicamente basándose en los horarios configurados
  const uniqueTimeSlots = React.useMemo(() => {
    if (!selectedDate || !horarios || horarios.length === 0) {
      // Si no hay horarios configurados, usar valores por defecto
      return generateTimeSlots(timeInterval, 8, 18)
    }

    // Filtrar horarios que aplican para el día seleccionado
    const horariosDelDia = horarios.filter(h => {
      // Verificar si el horario está INACTIVO
      const isInactive = h.is_active === false || 
                        h.is_active === 'FALSE' || 
                        h.is_active === 'false' || 
                        h.is_active === 'No' || 
                        h.is_active === 'no' ||
                        h.is_available === false || 
                        h.is_available === 'FALSE' || 
                        h.is_available === 'false' || 
                        h.is_available === 'No' || 
                        h.is_available === 'no'
      
      if (isInactive) return false

      // Verificar si el día está incluido (campo days puede ser "lunes,martes,miércoles,jueves,viernes")
      if (h.days) {
        const diasHorario = h.days.toLowerCase().split(',').map(d => d.trim())
        return diasHorario.includes(selectedDayName)
      }
      
      // Legacy: verificar campo day
      if (h.day) {
        return h.day.toLowerCase() === selectedDayName
      }
      
      return true // Si no tiene días especificados, aplica todos los días
    })

    if (horariosDelDia.length === 0) {
      // Si no hay horarios para este día, mostrar mensaje vacío
      return []
    }

    // Encontrar la hora de inicio más temprana y la hora de fin más tardía
    let minStartHour = 24
    let maxEndHour = 0

    horariosDelDia.forEach(h => {
      // Parsear hora de inicio
      const startTime = h.start_time || ""
      let startHour = 8 // default
      if (startTime.includes('AM') || startTime.includes('PM')) {
        // Formato "8:00 AM"
        const match = startTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
        if (match) {
          startHour = parseInt(match[1])
          if (match[3].toUpperCase() === 'PM' && startHour !== 12) startHour += 12
          if (match[3].toUpperCase() === 'AM' && startHour === 12) startHour = 0
        }
      } else {
        // Formato "08:00" o "8:00"
        const parts = startTime.split(':')
        if (parts.length >= 1) {
          startHour = parseInt(parts[0]) || 8
        }
      }

      // Parsear hora de fin
      const endTime = h.end_time || ""
      let endHour = 18 // default
      if (endTime.includes('AM') || endTime.includes('PM')) {
        // Formato "8:00 PM"
        const match = endTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
        if (match) {
          endHour = parseInt(match[1])
          if (match[3].toUpperCase() === 'PM' && endHour !== 12) endHour += 12
          if (match[3].toUpperCase() === 'AM' && endHour === 12) endHour = 0
        }
      } else {
        // Formato "18:00" o "20:00"
        const parts = endTime.split(':')
        if (parts.length >= 1) {
          endHour = parseInt(parts[0]) || 18
        }
      }

      if (startHour < minStartHour) minStartHour = startHour
      if (endHour > maxEndHour) maxEndHour = endHour
    })

    // Si no se encontraron horarios válidos, usar valores por defecto
    if (minStartHour === 24 || maxEndHour === 0) {
      return generateTimeSlots(timeInterval, 8, 18)
    }

    console.log(`📅 Horarios del día ${selectedDayName}: ${minStartHour}:00 - ${maxEndHour}:00`)
    return generateTimeSlots(timeInterval, minStartHour, maxEndHour)
  }, [selectedDate, selectedDayName, horarios, timeInterval])

  // Función para obtener la cita en una celda específica (horario + puerta)
  const getAppointmentForCell = React.useCallback((timeSlot: string, puertaId: string, puertaName: string) => {
    if (!selectedDate) return null
    
    const dateKey = format(selectedDate, "yyyy-MM-dd")
    const dayAppointments = appointmentsByDate[dateKey] || []
    
    // Normalizar el horario para comparación
    const normalizedTimeSlot = timeSlot.split(':').slice(0, 2).join(':')
    const timeSlotHour = parseInt(normalizedTimeSlot.split(':')[0]).toString()
    
    return dayAppointments.find(apt => {
      const aptHour = parseInt(apt.hora_inicio.split(':')[0]).toString()
      const aptTimeNormalized = apt.hora_inicio.split(':').slice(0, 2).join(':')
      
      // Comparar por hora (ignorando minutos si son :00)
      const timeMatch = aptTimeNormalized === normalizedTimeSlot || aptHour === timeSlotHour
      
      // Comparar por puerta (por ID o por nombre)
      // También comparar ignorando espacios y case
      const puertaMatch = apt.puerta_nombre === puertaName || 
                          apt.puerta_nombre === puertaId ||
                          apt.puerta_nombre?.toLowerCase() === puertaName?.toLowerCase() ||
                          apt.puerta_nombre?.toLowerCase().includes(puertaName?.toLowerCase()) ||
                          puertaName?.toLowerCase().includes(apt.puerta_nombre?.toLowerCase())
      
      return timeMatch && puertaMatch
    })
  }, [selectedDate, appointmentsByDate])

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const handleToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }
  
  // Al hacer click en un día, cambiar a vista de día
  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    setViewMode("day")
  }
  
  // Volver a la vista de mes
  const handleBackToMonth = () => {
    setViewMode("month")
  }
  
  // Usar formatTimeWithAmPm del store para formatear hora
  const formatTimeDisplay = formatTimeWithAmPm

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || statusConfig.scheduled
  }

  // Vista de Día - Matriz de horarios x puertas
  if (viewMode === "day" && selectedDate) {
    return (
      <div className="space-y-4">
        {/* Header de la vista de día */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleBackToMonth} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al Mes
                </Button>
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                    Hoy
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h2 className="text-xl font-bold capitalize flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Disponible
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  Pendiente
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Programada
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matriz de Horarios x Puertas */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="sticky left-0 z-10 bg-muted/50 border-b border-r p-3 text-left font-semibold min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Horario
                      </div>
                    </th>
                    {puertas.length > 0 ? (
                      puertas.map((puerta) => (
                        <th 
                          key={puerta.id} 
                          className="border-b border-r p-3 text-center font-semibold min-w-[180px]"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <DoorOpen className="h-4 w-4 text-primary" />
                            <span>{puerta.name}</span>
                            {puerta.type && (
                              <Badge variant="secondary" className="text-xs">
                                {puerta.type}
                              </Badge>
                            )}
                          </div>
                        </th>
                      ))
                    ) : (
                      <th className="border-b p-3 text-center text-muted-foreground">
                        No hay puertas configuradas
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {uniqueTimeSlots.map((timeSlot, rowIndex) => (
                    <tr 
                      key={timeSlot}
                      className={cn(
                        "transition-colors",
                        rowIndex % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                    >
                      <td className="sticky left-0 z-10 border-r p-3 font-medium bg-inherit">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary/30" />
                          <span className="text-sm font-semibold">{formatTimeDisplay(timeSlot)}</span>
                        </div>
                      </td>
                      {puertas.length > 0 ? (
                        puertas.map((puerta) => {
                          const appointment = getAppointmentForCell(timeSlot, puerta.id, puerta.name)
                          const status = appointment ? getStatusConfig(appointment.estado) : null
                          
                          return (
                            <td 
                              key={`${timeSlot}-${puerta.id}`}
                              className="border-r p-2 align-top"
                            >
                              {appointment ? (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  whileHover={{ scale: 1.02 }}
                                  className={cn(
                                    "p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg",
                                    status?.color
                                  )}
                                  onClick={() => setSelectedAppointment(appointment)}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs font-bold">
                                        {appointment.hora_inicio} - {appointment.hora_fin}
                                      </span>
                                      {status && (
                                        <status.icon className="h-3 w-3 flex-shrink-0" />
                                      )}
                                    </div>
                                    <p className="font-semibold text-sm truncate">
                                      {appointment.proveedor_nombre}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs opacity-80">
                                      <Truck className="h-3 w-3" />
                                      <span className="truncate">{appointment.tipo_vehiculo_nombre}</span>
                                    </div>
                                    {appointment.codigo_cita && (
                                      <div className="mt-1 px-2 py-0.5 bg-white/50 rounded text-xs font-mono">
                                        {appointment.codigo_cita}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              ) : (
                                <div className="h-[80px] rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center hover:border-primary/30 hover:bg-primary/5 transition-all">
                                  <span className="text-xs text-muted-foreground">Disponible</span>
                                </div>
                              )}
                            </td>
                          )
                        })
                      ) : (
                        <td className="p-3 text-center text-muted-foreground">
                          -
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Resumen del día */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{selectedDayAppointments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Citas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {selectedDayAppointments.filter(a => a.estado === 'pending_transport' || a.estado === 'pending_transport_data').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Truck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {selectedDayAppointments.filter(a => a.estado === 'receiving_started').length}
                  </p>
                  <p className="text-sm text-muted-foreground">En Recepción</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {selectedDayAppointments.filter(a => a.estado === 'complete' || a.estado === 'receiving_finished').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de detalle de cita */}
        <AnimatePresence>
          {selectedAppointment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => setSelectedAppointment(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-background rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{selectedAppointment.numero_cita}</h3>
                      <p className="text-muted-foreground">{selectedAppointment.proveedor_nombre}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedAppointment(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <Badge className={getStatusConfig(selectedAppointment.estado).color}>
                    {getStatusConfig(selectedAppointment.estado).label}
                  </Badge>

                  <div className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                        <p className="font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {selectedAppointment.fecha} • {selectedAppointment.hora_inicio} - {selectedAppointment.hora_fin}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Centro / Puerta</p>
                        <p className="font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {selectedAppointment.centro_nombre} - {selectedAppointment.puerta_nombre}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Tipo de Vehículo</p>
                        <p className="font-medium flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          {selectedAppointment.tipo_vehiculo_nombre}
                        </p>
                      </div>
                    </div>

                    {selectedAppointment.codigo_cita && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-600 mb-1">Código de Confirmación</p>
                        <p className="text-2xl font-bold font-mono text-green-800 tracking-wider">
                          {selectedAppointment.codigo_cita}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Acciones de administrador: Editar y Eliminar */}
                  {!showDeleteConfirm && (
                    <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
                      {/* Botón Editar */}
                      {canEditAppointment(selectedAppointment) && onEditAppointment && 
                       selectedAppointment.estado !== "receiving_finished" && 
                       selectedAppointment.estado !== "cancelled" && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            onEditAppointment(selectedAppointment)
                            setSelectedAppointment(null)
                          }}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar Cita
                        </Button>
                      )}
                      
                      {/* Botón Eliminar - solo admins */}
                      {canDeleteAppointment(selectedAppointment) && onDeleteAppointment && (
                        <Button
                          variant="outline"
                          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Confirmación de eliminación */}
                  {showDeleteConfirm && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-medium mb-3">
                        ¿Estás seguro de eliminar esta cita? Esta acción no se puede deshacer.
                      </p>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (onDeleteAppointment) {
                              onDeleteAppointment(selectedAppointment.id)
                            }
                            setShowDeleteConfirm(false)
                            setSelectedAppointment(null)
                          }}
                        >
                          Sí, Eliminar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Acciones según estado */}
                  {!showDeleteConfirm && (
                    <div className="mt-4 flex flex-wrap gap-2 justify-end">
                      {selectedAppointment.estado === "transport_completed" && onStatusChange && (
                        <>
                          {canEditAppointment(selectedAppointment) && (
                            <Button
                              variant="destructive"
                              onClick={() => {
                                onStatusChange(selectedAppointment.id, "cancelled")
                                setSelectedAppointment(null)
                              }}
                            >
                              Cancelar Cita
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                              onClick={() => {
                                onStatusChange(selectedAppointment.id, "approved")
                                setSelectedAppointment(null)
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Aprobar Cita
                            </Button>
                          )}
                        </>
                      )}
                      {(selectedAppointment.estado === "scheduled" || selectedAppointment.estado === "approved") && onStatusChange && (
                        <>
                          {canEditAppointment(selectedAppointment) && (
                            <Button
                              variant="destructive"
                              onClick={() => {
                                onStatusChange(selectedAppointment.id, "cancelled")
                                setSelectedAppointment(null)
                              }}
                            >
                              Cancelar Cita
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              onClick={() => {
                                onStatusChange(selectedAppointment.id, "receiving_started")
                                setSelectedAppointment(null)
                              }}
                            >
                              Iniciar Recepción
                            </Button>
                          )}
                        </>
                      )}
                      {selectedAppointment.estado === "receiving_started" && onStatusChange && isAdmin && (
                        <Button
                          variant="success"
                          onClick={() => {
                            onStatusChange(selectedAppointment.id, "receiving_finished")
                            setSelectedAppointment(null)
                          }}
                        >
                          Finalizar Recepción
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Vista de Mes (por defecto)
  return (
    <div className="space-y-6">
      {/* Header del calendario */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Hoy
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-xl font-bold capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                Programadas
              </Badge>
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                En proceso
              </Badge>
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Completadas
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendario mensual - Ocupa todo el ancho */}
      <Card>
        <CardContent className="p-4">
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd")
              const dayAppointments = appointmentsByDate[dateKey] || []
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isDayToday = isToday(day)

              return (
                <motion.button
                  key={day.toISOString()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "min-h-[100px] p-2 rounded-lg border text-left transition-all relative",
                    isCurrentMonth ? "bg-background" : "bg-muted/30",
                    isSelected && "ring-2 ring-primary border-primary",
                    isDayToday && !isSelected && "border-primary/50",
                    "hover:border-primary/50 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        !isCurrentMonth && "text-muted-foreground",
                        isDayToday && "text-primary font-bold"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {dayAppointments.length > 0 && (
                      <Badge variant="secondary" className="text-xs h-5 px-1.5">
                        {dayAppointments.length}
                      </Badge>
                    )}
                  </div>

                  {/* Indicadores de citas */}
                  {dayAppointments.length > 0 && (
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((apt) => {
                        const status = getStatusConfig(apt.estado)
                        return (
                          <div
                            key={apt.id}
                            className={cn(
                              "text-xs px-1.5 py-0.5 rounded truncate",
                              status.color
                            )}
                          >
                            {apt.hora_inicio} - {apt.proveedor_nombre.substring(0, 12)}...
                          </div>
                        )
                      })}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center font-medium">
                          +{dayAppointments.length - 2} más
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Indicador de click para ver día */}
                  {dayAppointments.length > 0 && (
                    <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Grid3X3 className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
          
          {/* Instrucción */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Haz clic en un día para ver la vista detallada con horarios y puertas
          </p>
        </CardContent>
      </Card>

      {/* Modal de detalle de cita */}
      <AnimatePresence>
        {selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedAppointment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedAppointment.numero_cita}</h3>
                    <p className="text-muted-foreground">{selectedAppointment.proveedor_nombre}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedAppointment(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <Badge className={getStatusConfig(selectedAppointment.estado).color}>
                  {getStatusConfig(selectedAppointment.estado).label}
                </Badge>

                <div className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                      <p className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {selectedAppointment.fecha} • {selectedAppointment.hora_inicio} - {selectedAppointment.hora_fin}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Centro / Puerta</p>
                      <p className="font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {selectedAppointment.centro_nombre} - {selectedAppointment.puerta_nombre}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Tipo de Vehículo</p>
                      <p className="font-medium flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        {selectedAppointment.tipo_vehiculo_nombre}
                      </p>
                    </div>
                    {selectedAppointment.ordenes_compra && selectedAppointment.ordenes_compra.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Órdenes de Compra</p>
                        <p className="font-medium">
                          {selectedAppointment.ordenes_compra.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>

                  {(selectedAppointment.conductor_nombre || selectedAppointment.placas_vehiculo) && (
                    <div className="rounded-lg border p-4 space-y-3">
                      <h4 className="font-semibold">Datos de Transporte</h4>
                      <div className="grid gap-3 sm:grid-cols-2 text-sm">
                        {selectedAppointment.conductor_nombre && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedAppointment.conductor_nombre}</span>
                          </div>
                        )}
                        {selectedAppointment.conductor_telefono && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedAppointment.conductor_telefono}</span>
                          </div>
                        )}
                        {selectedAppointment.placas_vehiculo && (
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono">{selectedAppointment.placas_vehiculo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedAppointment.notas && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Notas</p>
                      <p className="text-sm bg-muted p-3 rounded-lg">{selectedAppointment.notas}</p>
                    </div>
                  )}
                </div>

                {/* Código de cita si está aprobada */}
                {selectedAppointment.codigo_cita && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 mb-1">Código de Confirmación</p>
                    <p className="text-2xl font-bold font-mono text-green-800 tracking-wider">
                      {selectedAppointment.codigo_cita}
                    </p>
                  </div>
                )}

                {/* Acciones de administrador: Editar y Eliminar */}
                {!showDeleteConfirm && (
                  <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
                    {/* Botón Editar - visible para admins o dueños de la cita */}
                    {canEditAppointment(selectedAppointment) && onEditAppointment && 
                     selectedAppointment.estado !== "receiving_finished" && 
                     selectedAppointment.estado !== "cancelled" && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          onEditAppointment(selectedAppointment)
                          setSelectedAppointment(null)
                        }}
                        className="gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar Cita
                      </Button>
                    )}
                    
                    {/* Botón Eliminar - solo visible para administradores */}
                    {canDeleteAppointment(selectedAppointment) && onDeleteAppointment && (
                      <Button
                        variant="outline"
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                )}

                {/* Confirmación de eliminación */}
                {showDeleteConfirm && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-medium mb-3">
                      ¿Estás seguro de eliminar esta cita? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (onDeleteAppointment) {
                            onDeleteAppointment(selectedAppointment.id)
                          }
                          setShowDeleteConfirm(false)
                          setSelectedAppointment(null)
                        }}
                      >
                        Sí, Eliminar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Acciones según estado */}
                {!showDeleteConfirm && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-end">
                    {/* Citas pendientes de transporte */}
                    {selectedAppointment.estado === "pending_transport" && onStatusChange && canEditAppointment(selectedAppointment) && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          onStatusChange(selectedAppointment.id, "cancelled")
                          setSelectedAppointment(null)
                        }}
                      >
                        Cancelar Cita
                      </Button>
                    )}

                    {/* Citas listas para aprobar (transporte completado) */}
                    {selectedAppointment.estado === "transport_completed" && onStatusChange && (
                      <>
                        {canEditAppointment(selectedAppointment) && (
                          <Button
                            variant="destructive"
                            onClick={() => {
                              onStatusChange(selectedAppointment.id, "cancelled")
                              setSelectedAppointment(null)
                            }}
                          >
                            Cancelar Cita
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            onClick={() => {
                              onStatusChange(selectedAppointment.id, "approved")
                              setSelectedAppointment(null)
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Aprobar Cita
                          </Button>
                        )}
                      </>
                    )}

                    {/* Citas programadas/aprobadas */}
                    {(selectedAppointment.estado === "scheduled" || selectedAppointment.estado === "approved") && onStatusChange && (
                      <>
                        {canEditAppointment(selectedAppointment) && (
                          <Button
                            variant="destructive"
                            onClick={() => {
                              onStatusChange(selectedAppointment.id, "cancelled")
                              setSelectedAppointment(null)
                            }}
                          >
                            Cancelar Cita
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            onClick={() => {
                              onStatusChange(selectedAppointment.id, "receiving_started")
                              setSelectedAppointment(null)
                            }}
                          >
                            Iniciar Recepción
                          </Button>
                        )}
                      </>
                    )}

                    {/* Citas en recepción - solo admins pueden finalizar */}
                    {selectedAppointment.estado === "receiving_started" && onStatusChange && isAdmin && (
                      <Button
                        variant="success"
                        onClick={() => {
                          onStatusChange(selectedAppointment.id, "receiving_finished")
                          setSelectedAppointment(null)
                        }}
                      >
                        Finalizar Recepción
                      </Button>
                    )}
                  </div>
                )}
              
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

