import * as React from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Calendar,
  Plus,
  CalendarDays,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/services/database.service"
import { useToast } from "@/store/ui.store"
import { BookingStep1 } from "./components/BookingStep1"
import { BookingStep2, type AppointmentFormData } from "./components/BookingStep2"
import { CalendarView, type CalendarAppointment } from "./components/CalendarView"

interface BookingSelection {
  centro: { id: string; name: string; city?: string } | null
  puerta: { id: string; name: string; type?: string } | null
  fecha: Date | null
  horario: string | null
}

export function AppointmentsPage() {
  const toast = useToast()
  const [activeTab, setActiveTab] = React.useState("calendar")
  const [bookingStep, setBookingStep] = React.useState(1)
  const [bookingSelection, setBookingSelection] = React.useState<BookingSelection>({
    centro: null,
    puerta: null,
    fecha: null,
    horario: null,
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Datos desde Google Sheets (con nombres mapeados a inglés)
  const [centros, setCentros] = React.useState<Array<{ id: string; name: string; city?: string; code?: string }>>([])
  const [puertas, setPuertas] = React.useState<Array<{ id: string; name: string; type?: string; notes?: string; distribution_center_id?: string }>>([])
  const [horarios, setHorarios] = React.useState<Array<{ id: string; day: string; start_time: string; end_time: string; dock_id?: string }>>([])
  const [proveedores, setProveedores] = React.useState<Array<{ id: string; name: string }>>([])
  const [tiposVehiculo, setTiposVehiculo] = React.useState<Array<{ id: string; name: string }>>([])
  const [appointments, setAppointments] = React.useState<CalendarAppointment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Cargar datos - usa caché con TTL automático
  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        // El servicio de DB maneja automáticamente el caché con TTL
        // Solo recarga si el caché ha expirado (60 segundos)
        const [
          centrosData,
          puertasData,
          horariosData,
          proveedoresData,
          tiposVehiculoData,
          appointmentsData,
        ] = await Promise.all([
          db.getAll("centros_distribucion"),
          db.getAll("docks"),
          db.getAll("horarios"),
          db.getAll("suppliers"),
          db.getAll("vehicle_types"),
          db.getAll("appointments"),
        ])

        setCentros(centrosData as typeof centros)
        setPuertas(puertasData as typeof puertas)
        setHorarios(horariosData as typeof horarios)
        setProveedores(proveedoresData as typeof proveedores)
        setTiposVehiculo(tiposVehiculoData as typeof tiposVehiculo)

        // Transformar citas al formato del calendario
        // Los datos vienen mapeados desde Google Sheets con nombres en inglés
        const calendarAppointments: CalendarAppointment[] = (appointmentsData as unknown as Array<Record<string, unknown>>).map((apt) => ({
          id: String(apt.id || apt.ID || crypto.randomUUID()),
          numero_cita: `CTA-${String(apt.id || apt.ID || Date.now()).slice(-6)}`,
          // Usar nombres mapeados (inglés) con fallback a nombres originales (español)
          proveedor_nombre: (apt.proveedor_nombre || apt["Nombre del solicitante"] || apt.laboratorio || apt["Laboratorio"]) as string || "Sin proveedor",
          puerta_nombre: (apt.puerta_nombre || apt["Puerta"]) as string || "Sin puerta",
          centro_nombre: (apt.centro_nombre || apt["Centro de distribucion"]) as string || "Sin centro",
          tipo_vehiculo_nombre: (apt.tipo_vehiculo_nombre || apt["tipo de vehiculo"]) as string || "Sin tipo",
          fecha: (apt.fecha || apt["Fecha"]) as string || format(new Date(), "yyyy-MM-dd"),
          hora_inicio: (apt.hora_inicio || apt["Hora"]) as string || "08:00",
          hora_fin: calculateEndTime((apt.hora_inicio || apt["Hora"]) as string || "08:00"),
          estado: (apt.estado || apt["Estado"]) as string || "scheduled",
          conductor_nombre: (apt.conductor_nombre || apt["Nombre del conductor"]) as string,
          conductor_telefono: "",
          placas_vehiculo: (apt.placas_vehiculo || apt["Vehiculo"]) as string,
          ordenes_compra: [],
          notas: (apt.notas || apt["Notas"]) as string,
        }))

        setAppointments(calendarAppointments)
      } catch (error) {
        console.error("Error cargando datos:", error)
        toast.error("Error", "No se pudieron cargar los datos")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Manejar selección del paso 1
  const handleStep1Complete = (selection: BookingSelection) => {
    setBookingSelection(selection)
    setBookingStep(2)
  }

  // Manejar creación de cita
  const handleCreateAppointment = async (formData: AppointmentFormData) => {
    setIsSubmitting(true)
    try {
      const proveedor = proveedores.find(p => p.id === formData.proveedor_id)
      const tipoVehiculo = tiposVehiculo.find(t => t.id === formData.tipo_vehiculo_id)

      // Debug: Verificar datos seleccionados
      console.log("📋 Creando cita con datos:", {
        proveedor,
        tipoVehiculo,
        bookingSelection,
        formData,
        proveedores_disponibles: proveedores,
        tipos_vehiculo_disponibles: tiposVehiculo,
      })

      // Validar que tenemos todos los datos necesarios
      if (!bookingSelection.puerta?.name) {
        toast.error("Error", "No se ha seleccionado una puerta")
        return
      }
      if (!bookingSelection.centro?.name) {
        toast.error("Error", "No se ha seleccionado un centro de distribución")
        return
      }
      if (!proveedor?.name) {
        toast.error("Error", "No se ha seleccionado un proveedor")
        return
      }

      // Formato para Google Sheets - columnas exactas de la hoja "citas"
      const fechaCita = bookingSelection.fecha || new Date()
      const newAppointment = {
        // ID se genera automáticamente en Apps Script
        "Fecha": format(fechaCita, "yyyy-MM-dd"),
        "Puerta": bookingSelection.puerta?.name || "",
        "Mes": format(fechaCita, "MMMM", { locale: es }),
        "Dia": format(fechaCita, "EEEE", { locale: es }),
        "Hora": bookingSelection.horario || "08:00",
        "Centro de distribucion": bookingSelection.centro?.name || "",
        "Nombre del solicitante": proveedor?.name || "",
        "Vehiculo": formData.placas_vehiculo || "",
        "tipo de vehiculo": tipoVehiculo?.name || "",
        "Nombre del conductor": formData.conductor_nombre || "",
        "Laboratorio": proveedor?.name || "",
        "Notas": formData.notas || "",
      }
      
      // Datos adicionales para el estado local del calendario
      const appointmentForCalendar = {
        id: `temp-${Date.now()}`,
        numero_cita: `CTA-${Date.now().toString().slice(-6)}`,
        proveedor_nombre: proveedor?.name || "Sin proveedor",
        puerta_nombre: bookingSelection.puerta?.name || "Sin puerta",
        centro_nombre: bookingSelection.centro?.name || "Sin centro",
        tipo_vehiculo_nombre: tipoVehiculo?.name || "Sin tipo",
        fecha: format(fechaCita, "yyyy-MM-dd"),
        hora_inicio: bookingSelection.horario || "08:00",
        hora_fin: calculateEndTime(bookingSelection.horario || "08:00"),
        estado: "scheduled",
        conductor_nombre: formData.conductor_nombre,
        conductor_telefono: formData.conductor_telefono,
        placas_vehiculo: formData.placas_vehiculo,
        ordenes_compra: formData.ordenes_compra?.split(",").map(s => s.trim()).filter(Boolean),
        notas: formData.notas,
      }

      // Guardar en base de datos (Google Sheets)
      await db.create("appointments", newAppointment as unknown as Record<string, unknown>)

      // Agregar al estado local del calendario
      setAppointments(prev => [...prev, appointmentForCalendar as CalendarAppointment])

      toast.success("¡Cita creada!", `La cita ha sido programada exitosamente`)

      // Resetear y volver al calendario
      setBookingStep(1)
      setBookingSelection({ centro: null, puerta: null, fecha: null, horario: null })
      setActiveTab("calendar")
    } catch (error) {
      console.error("Error creando cita:", error)
      toast.error("Error", "No se pudo crear la cita")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar cambio de estado de cita
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await db.update("appointments", appointmentId, { estado: newStatus } as unknown as Record<string, unknown>)
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, estado: newStatus } : apt
        )
      )

      const statusLabels: Record<string, string> = {
        cancelled: "Cita cancelada",
        receiving_started: "Recepción iniciada",
        receiving_finished: "Recepción finalizada",
      }

      toast.success("Estado actualizado", statusLabels[newStatus] || "Estado actualizado")
    } catch (error) {
      console.error("Error actualizando estado:", error)
      toast.error("Error", "No se pudo actualizar el estado")
    }
  }

  // Calcular hora de fin (1 hora después)
  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const endHours = (hours + 1) % 24
    return `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  // Convertir citas existentes al formato para el paso 1
  const existingAppointmentsForBooking = appointments.map(apt => ({
    id: apt.id,
    puerta_nombre: apt.puerta_nombre, // Nombre de la puerta para comparar disponibilidad
    fecha: apt.fecha,
    hora_inicio: apt.hora_inicio,
    hora_fin: apt.hora_fin,
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Agenda de Citas</h1>
          <p className="text-muted-foreground">Gestiona las citas de recepción del CEDI</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "booking" ? "default" : "outline"}
            onClick={() => {
              setActiveTab("booking")
              setBookingStep(1)
              setBookingSelection({ centro: null, puerta: null, fecha: null, horario: null })
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.estado === "scheduled").length}
                </p>
                <p className="text-sm text-muted-foreground">Programadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.estado === "receiving_started").length}
                </p>
                <p className="text-sm text-muted-foreground">En Recepción</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => ["complete", "receiving_finished"].includes(a.estado)).length}
                </p>
                <p className="text-sm text-muted-foreground">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => 
                    a.fecha === format(new Date(), "yyyy-MM-dd")
                  ).length}
                </p>
                <p className="text-sm text-muted-foreground">Hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="booking" className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Cita
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <CalendarView
            appointments={appointments}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>

        <TabsContent value="booking" className="mt-6">
          {bookingStep === 1 ? (
            <BookingStep1
              centros={centros}
              puertas={puertas}
              horarios={horarios}
              existingAppointments={existingAppointmentsForBooking}
              onSelectionComplete={handleStep1Complete}
            />
          ) : (
            <BookingStep2
              selection={bookingSelection}
              proveedores={proveedores}
              tiposVehiculo={tiposVehiculo}
              onBack={() => setBookingStep(1)}
              onSubmit={handleCreateAppointment}
              isSubmitting={isSubmitting}
            />
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
