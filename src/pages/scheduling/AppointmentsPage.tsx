import * as React from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Calendar,
  Plus,
  CalendarDays,
  CheckCircle,
  Mail,
  Copy,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/services/database.service"
import { useToast } from "@/store/ui.store"
import { BookingStep1 } from "./components/BookingStep1"
import { BookingStep2Phase1, type AppointmentFormDataPhase1 } from "./components/BookingStep2Phase1"
import { CalendarView, type CalendarAppointment } from "./components/CalendarView"
import { generateTransportLink, generatePhase1EmailHTML, sendEmail } from "@/services/email.service"

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
  const [proveedores, setProveedores] = React.useState<Array<{ id: string; name: string; contact_email?: string; contact_phone?: string; contact_name?: string }>>([])
  const [tiposVehiculo, setTiposVehiculo] = React.useState<Array<{ id: string; name: string }>>([])
  const [appointments, setAppointments] = React.useState<CalendarAppointment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  
  // Estado para mostrar el enlace de transporte después de crear la cita
  const [createdAppointmentInfo, setCreatedAppointmentInfo] = React.useState<{
    token: string
    transportLink: string
    email: string
    proveedorNombre: string
  } | null>(null)

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

  // Manejar creación de cita - Fase 1 (solo datos básicos)
  const handleCreateAppointment = async (formData: AppointmentFormDataPhase1) => {
    setIsSubmitting(true)
    try {
      const proveedor = proveedores.find(p => p.id === formData.proveedor_id)

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
        "Laboratorio": proveedor?.name || "",
        "Notas": formData.notas || "",
        // Campos de transporte vacíos (se llenarán en Fase 2)
        "Vehiculo": "",
        "tipo de vehiculo": "",
        "Nombre del conductor": "",
      }
      
      // Datos adicionales para el estado local del calendario
      const appointmentForCalendar = {
        id: `temp-${Date.now()}`,
        numero_cita: `CTA-${Date.now().toString().slice(-6)}`,
        proveedor_nombre: proveedor?.name || "Sin proveedor",
        puerta_nombre: bookingSelection.puerta?.name || "Sin puerta",
        centro_nombre: bookingSelection.centro?.name || "Sin centro",
        tipo_vehiculo_nombre: "Pendiente",
        fecha: format(fechaCita, "yyyy-MM-dd"),
        hora_inicio: bookingSelection.horario || "08:00",
        hora_fin: calculateEndTime(bookingSelection.horario || "08:00"),
        estado: "pending_transport",
        conductor_nombre: "",
        conductor_telefono: "",
        placas_vehiculo: "",
        ordenes_compra: formData.ordenes_compra?.split(",").map(s => s.trim()).filter(Boolean),
        notas: formData.notas,
        contacto_email: formData.contacto_email,
        contacto_nombre: formData.contacto_nombre,
      }

      // Guardar en base de datos (Google Sheets)
      const createdAppointment = await db.create("appointments", newAppointment as unknown as Record<string, unknown>)

      // db.create devuelve el item creado directamente, no un objeto {success, id}
      // Si llegamos aquí sin error, la cita fue creada
      const createdId = (createdAppointment as Record<string, unknown>)?.id as string || appointmentForCalendar.id

      // Generar el enlace de transporte usando el ID de la cita
      const transportLink = generateTransportLink(createdId)

      // Actualizar el ID en el objeto del calendario
      appointmentForCalendar.id = createdId
      appointmentForCalendar.numero_cita = `CTA-${createdId.slice(-6)}`

      // Agregar al estado local del calendario
      setAppointments(prev => [...prev, appointmentForCalendar as CalendarAppointment])

      // Intentar enviar email (en segundo plano, no bloquear)
      const emailHtml = generatePhase1EmailHTML({
        appointmentId: createdId,
        proveedorEmail: formData.contacto_email,
        proveedorNombre: formData.contacto_nombre,
        fecha: format(fechaCita, "d 'de' MMMM 'de' yyyy", { locale: es }),
        hora: bookingSelection.horario || "08:00",
        puerta: bookingSelection.puerta?.name || "",
        centro: bookingSelection.centro?.name || "",
        token: createdId, // Usamos el ID como identificador
      })

      // Enviar email en segundo plano (no esperar resultado)
      sendEmail({
        to: formData.contacto_email,
        subject: `Cita Programada - CEDI ${bookingSelection.centro?.name} - ${format(fechaCita, "dd/MM/yyyy")}`,
        body: `Su cita ha sido programada. Complete los datos de transporte en: ${transportLink}`,
        html: emailHtml,
      }).then(emailResult => {
        if (emailResult.success) {
          console.log("✅ Email enviado exitosamente")
        } else {
          console.warn("⚠️ No se pudo enviar el email:", emailResult.error)
        }
      }).catch(err => {
        console.warn("⚠️ Error enviando email:", err)
      })

      // Mostrar información del enlace de transporte
      setCreatedAppointmentInfo({
        token: createdId, // Usamos el ID como identificador
        transportLink,
        email: formData.contacto_email,
        proveedorNombre: proveedor?.name || formData.contacto_nombre,
      })

      toast.success("¡Cita creada!", "La cita ha sido programada exitosamente")
    } catch (error) {
      console.error("Error creando cita:", error)
      toast.error("Error", "No se pudo crear la cita")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cerrar el modal de información de cita creada
  const handleCloseCreatedInfo = () => {
    setCreatedAppointmentInfo(null)
    setBookingStep(1)
    setBookingSelection({ centro: null, puerta: null, fecha: null, horario: null })
    setActiveTab("calendar")
  }

  // Copiar enlace al portapapeles
  const copyTransportLink = async () => {
    if (createdAppointmentInfo?.transportLink) {
      try {
        await navigator.clipboard.writeText(createdAppointmentInfo.transportLink)
        toast.success("Copiado", "El enlace ha sido copiado al portapapeles")
      } catch {
        toast.error("Error", "No se pudo copiar el enlace")
      }
    }
  }

  // Manejar cambio de estado de cita
  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const updateData: Record<string, unknown> = { 
        "Estado": newStatus 
      }

      // Si se está aprobando, generar código de cita
      if (newStatus === "approved") {
        const codigoCita = `CTA-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`
        updateData["Codigo_Cita"] = codigoCita
        updateData["fecha_aprobacion"] = new Date().toISOString()

        // Buscar la cita para enviar email de confirmación
        const appointment = appointments.find(apt => apt.id === appointmentId)
        if (appointment && appointment.contacto_email) {
          // Enviar email de confirmación (Fase 3)
          const { generatePhase3EmailHTML } = await import("@/services/email.service")
          const emailHtml = generatePhase3EmailHTML({
            proveedorNombre: appointment.proveedor_nombre,
            fecha: appointment.fecha,
            hora: appointment.hora_inicio,
            puerta: appointment.puerta_nombre,
            centro: appointment.centro_nombre,
            codigoCita: codigoCita,
            vehiculo: appointment.placas_vehiculo || "No especificado",
            conductor: appointment.conductor_nombre || "No especificado",
          })

          sendEmail({
            to: appointment.contacto_email,
            subject: `✅ Cita Aprobada - Código: ${codigoCita} - CEDI ${appointment.centro_nombre}`,
            body: `Su cita ha sido aprobada. Código de confirmación: ${codigoCita}`,
            html: emailHtml,
          }).then(result => {
            if (result.success) {
              console.log("✅ Email de aprobación enviado")
            }
          })
        }

        // Actualizar estado local con el código
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, estado: newStatus, codigo_cita: codigoCita } 
              : apt
          )
        )
        
        toast.success("¡Cita Aprobada!", `Código generado: ${codigoCita}`)
      } else {
        // Actualizar estado local sin código
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
      }

      // Guardar en base de datos
      await db.update("appointments", appointmentId, updateData)
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
      <div className="grid gap-4 sm:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.estado === "pending_transport").length}
                </p>
                <p className="text-sm text-muted-foreground">Pend. Transporte</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.estado === "transport_completed" || a.estado === "scheduled").length}
                </p>
                <p className="text-sm text-muted-foreground">Listas p/Aprobar</p>
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
                  {appointments.filter(a => a.estado === "approved" || a.estado === "receiving_started").length}
                </p>
                <p className="text-sm text-muted-foreground">En Proceso</p>
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
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
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
          {createdAppointmentInfo ? (
            // Modal de éxito - Cita creada
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cita Creada Exitosamente!</h2>
                  <p className="text-gray-600 mb-6">
                    Se ha enviado un correo a <strong>{createdAppointmentInfo.email}</strong> con el enlace para completar los datos de transporte.
                  </p>

                  {/* Enlace de transporte */}
                  <div className="bg-white rounded-lg border p-4 mb-6">
                    <p className="text-sm text-gray-500 mb-2">Enlace para datos de transporte:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm bg-gray-100 p-2 rounded text-left overflow-x-auto">
                        {createdAppointmentInfo.transportLink}
                      </code>
                      <Button size="sm" variant="outline" onClick={copyTransportLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(createdAppointmentInfo.transportLink, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Próximos pasos */}
                  <div className="bg-blue-50 rounded-lg p-4 text-left mb-6">
                    <p className="font-medium text-blue-800 mb-2">Próximos pasos:</p>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>El proveedor recibirá el correo con el enlace</li>
                      <li>Deberá completar los datos del vehículo y conductor</li>
                      <li>Una vez completados, la cita aparecerá como "Lista para aprobar"</li>
                      <li>Al aprobar, se generará el código de confirmación final</li>
                    </ol>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={handleCloseCreatedInfo}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Calendario
                    </Button>
                    <Button onClick={() => {
                      setCreatedAppointmentInfo(null)
                      setBookingStep(1)
                      setBookingSelection({ centro: null, puerta: null, fecha: null, horario: null })
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Cita
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : bookingStep === 1 ? (
            <BookingStep1
              centros={centros}
              puertas={puertas}
              horarios={horarios}
              existingAppointments={existingAppointmentsForBooking}
              onSelectionComplete={handleStep1Complete}
            />
          ) : (
            <BookingStep2Phase1
              bookingSelection={bookingSelection}
              proveedores={proveedores}
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
