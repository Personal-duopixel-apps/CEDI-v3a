import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { TransportDataForm } from "@/pages/scheduling/components/TransportDataForm"
import { db } from "@/services/database.service"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type PageState = "loading" | "form" | "success" | "error" | "already_completed" | "not_found"

interface AppointmentData {
  id: string
  fecha: string
  hora: string
  puerta: string
  centro: string
  proveedor: string
  estado: string
  token: string
}

export function TransportDataPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [pageState, setPageState] = React.useState<PageState>("loading")
  const [appointment, setAppointment] = React.useState<AppointmentData | null>(null)
  const [tiposVehiculo, setTiposVehiculo] = React.useState<Array<{ id: string; name: string }>>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState("")

  // Cargar datos de la cita usando el token
  React.useEffect(() => {
    async function loadAppointment() {
      if (!token) {
        setPageState("not_found")
        return
      }

      try {
        // Cargar todas las citas y buscar por token
        const [appointmentsData, tiposData] = await Promise.all([
          db.getAll("appointments"),
          db.getAll("vehicle_types"),
        ])

        // Buscar la cita por token
        const appointments = appointmentsData as unknown as Array<Record<string, unknown>>
        const foundAppointment = appointments.find(apt => 
          apt.token === token || apt.Token === token || apt.id === token || apt.ID === token
        )

        if (!foundAppointment) {
          setPageState("not_found")
          return
        }

        // Verificar estado de la cita
        const estado = String(foundAppointment.estado || foundAppointment.Estado || "pending_transport")
        
        if (estado === "transport_completed" || estado === "approved" || estado === "completed") {
          setPageState("already_completed")
          return
        }

        // Mapear datos de la cita
        const mappedAppointment: AppointmentData = {
          id: String(foundAppointment.id || foundAppointment.ID || ""),
          fecha: String(foundAppointment.fecha || foundAppointment.Fecha || ""),
          hora: String(foundAppointment.hora_inicio || foundAppointment.Hora || ""),
          puerta: String(foundAppointment.puerta_nombre || foundAppointment.Puerta || ""),
          centro: String(foundAppointment.centro_nombre || foundAppointment["Centro de distribucion"] || ""),
          proveedor: String(foundAppointment.proveedor_nombre || foundAppointment["Nombre del solicitante"] || foundAppointment.Laboratorio || ""),
          estado: estado,
          token: token,
        }

        setAppointment(mappedAppointment)
        
        // Mapear tipos de vehículo
        const tipos = (tiposData as Array<Record<string, unknown>>).map(t => ({
          id: String(t.id || t.code || ""),
          name: String(t.name || t.Nombre || ""),
        })).filter(t => t.name)

        setTiposVehiculo(tipos)
        setPageState("form")
      } catch (error) {
        console.error("Error cargando cita:", error)
        setErrorMessage("Error al cargar los datos de la cita")
        setPageState("error")
      }
    }

    loadAppointment()
  }, [token])

  // Manejar envío del formulario
  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!appointment) return

    setIsSubmitting(true)
    try {
      // Actualizar la cita con los datos de transporte
      const updateData = {
        // Datos del vehículo
        "tipo de vehiculo": data.tipo_vehiculo,
        "Vehiculo": data.placas_vehiculo,
        "marca_vehiculo": data.marca_vehiculo || "",
        "modelo_vehiculo": data.modelo_vehiculo || "",
        "color_vehiculo": data.color_vehiculo || "",
        // Datos del conductor
        "Nombre del conductor": data.conductor_nombre,
        "telefono_conductor": data.conductor_telefono,
        "licencia_conductor": data.conductor_licencia || "",
        "dpi_conductor": data.conductor_dpi || "",
        "ayudantes": data.ayudantes_cantidad || "0",
        // Notas y estado
        "notas_transporte": data.notas_transporte || "",
        "Estado": "transport_completed",
        "fecha_transporte_completado": new Date().toISOString(),
      }

      await db.update("appointments", appointment.id, updateData)
      
      setPageState("success")
    } catch (error) {
      console.error("Error guardando datos:", error)
      setErrorMessage("Error al guardar los datos de transporte")
      setPageState("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Estados de la página
  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando información de la cita...</p>
        </div>
      </div>
    )
  }

  if (pageState === "not_found") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Cita No Encontrada</h1>
              <p className="text-gray-600 mb-6">
                El enlace que utilizaste no es válido o ha expirado. 
                Por favor, contacta al administrador para obtener un nuevo enlace.
              </p>
              <Button variant="outline" onClick={() => navigate("/")}>
                Ir al Inicio
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (pageState === "already_completed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Datos Ya Completados</h1>
              <p className="text-gray-600 mb-6">
                Los datos de transporte para esta cita ya fueron enviados anteriormente.
                Si necesitas hacer cambios, contacta al administrador.
              </p>
              <Button variant="outline" onClick={() => navigate("/")}>
                Ir al Inicio
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (pageState === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <Button onClick={() => window.location.reload()}>
                Intentar de Nuevo
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (pageState === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Datos Enviados!</h1>
              <p className="text-gray-600 mb-4">
                Los datos de transporte han sido registrados exitosamente.
              </p>
              <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-green-800">
                  <strong>Próximos pasos:</strong>
                </p>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Tu cita será revisada y aprobada</li>
                  <li>• Recibirás un correo con el código de confirmación</li>
                  <li>• Presenta el código al llegar al centro de distribución</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500">
                Puedes cerrar esta ventana
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Mostrar formulario
  if (appointment) {
    return (
      <TransportDataForm
        appointmentInfo={{
          id: appointment.id,
          fecha: appointment.fecha,
          hora: appointment.hora,
          puerta: appointment.puerta,
          centro: appointment.centro,
          proveedor: appointment.proveedor,
        }}
        tiposVehiculo={tiposVehiculo}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    )
  }

  return null
}

