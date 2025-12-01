import * as React from "react"
import { motion } from "framer-motion"
import { format, isToday, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  Package,
  Calendar,
  Truck,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Building2,
  Loader2,
} from "lucide-react"
import { StatCard, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth.store"
import { db } from "@/services/database.service"
import { useNavigate } from "react-router-dom"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// Interfaces para los datos
interface Appointment {
  id: string
  fecha: string
  hora_inicio: string
  puerta_nombre: string
  proveedor_nombre: string
  tipo_vehiculo_nombre: string
  estado: string
}

interface Supplier {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  pending: "bg-amber-100 text-amber-800",
  receiving: "bg-purple-100 text-purple-800",
  receiving_started: "bg-purple-100 text-purple-800",
  receiving_finished: "bg-emerald-100 text-emerald-800",
  complete: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabels: Record<string, string> = {
  scheduled: "Programada",
  pending: "Pendiente",
  receiving: "En Recepción",
  receiving_started: "En Recepción",
  receiving_finished: "Completada",
  complete: "Completada",
  cancelled: "Cancelada",
}

export function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(true)
  const [todayAppointments, setTodayAppointments] = React.useState<Appointment[]>([])
  const [stats, setStats] = React.useState({
    totalAppointmentsToday: 0,
    appointmentsInProgress: 0,
    totalProducts: 0,
    totalSuppliers: 0,
    completedToday: 0,
  })

  // Cargar datos reales desde Google Sheets
  React.useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true)
      try {
        const [appointmentsData, suppliersData, productsData] = await Promise.all([
          db.getAll("appointments"),
          db.getAll("suppliers"),
          db.getAll("products"),
        ])

        // Filtrar citas de hoy
        const today = format(new Date(), "yyyy-MM-dd")
        const todayAppts = (appointmentsData as unknown as Array<Record<string, unknown>>)
          .map(apt => ({
            id: String(apt.id || apt.ID || ""),
            fecha: String(apt.fecha || apt.Fecha || ""),
            hora_inicio: String(apt.hora_inicio || apt.Hora || "08:00"),
            puerta_nombre: String(apt.puerta_nombre || apt.Puerta || "Sin puerta"),
            proveedor_nombre: String(apt.proveedor_nombre || apt["Nombre del solicitante"] || apt.Laboratorio || "Sin proveedor"),
            tipo_vehiculo_nombre: String(apt.tipo_vehiculo_nombre || apt["tipo de vehiculo"] || ""),
            estado: String(apt.estado || apt.Estado || "scheduled"),
          }))
          .filter(apt => apt.fecha === today)

        setTodayAppointments(todayAppts)

        // Calcular estadísticas
        const inProgress = todayAppts.filter(a => 
          a.estado === "receiving" || a.estado === "receiving_started"
        ).length
        const completed = todayAppts.filter(a => 
          a.estado === "complete" || a.estado === "receiving_finished"
        ).length

        setStats({
          totalAppointmentsToday: todayAppts.length,
          appointmentsInProgress: inProgress,
          totalProducts: (productsData as Product[]).length,
          totalSuppliers: (suppliersData as Supplier[]).length,
          completedToday: completed,
        })
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12 ? "Buenos días" : currentHour < 18 ? "Buenas tardes" : "Buenas noches"

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">
            {greeting}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Aquí está el resumen de actividad de hoy
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>CEDI Central México</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Citas de Hoy"
          value={String(stats.totalAppointmentsToday)}
          description={`${stats.appointmentsInProgress} en progreso`}
          icon={<Calendar className="h-6 w-6" />}
        />
        <StatCard
          title="Productos Activos"
          value={String(stats.totalProducts)}
          description="En catálogo"
          icon={<Package className="h-6 w-6" />}
        />
        <StatCard
          title="Proveedores"
          value={String(stats.totalSuppliers)}
          description="Registrados"
          icon={<Truck className="h-6 w-6" />}
        />
        <StatCard
          title="Completadas Hoy"
          value={String(stats.completedToday)}
          description="Recepciones finalizadas"
          icon={<CheckCircle2 className="h-6 w-6" />}
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Appointments */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Citas de Hoy</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/citas")}>
                Ver todas <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay citas programadas para hoy</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => navigate("/citas/nueva")}
                  >
                    Programar una cita
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-24 text-sm font-medium text-muted-foreground">
                        {apt.hora_inicio}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{apt.proveedor_nombre}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.puerta_nombre} {apt.tipo_vehiculo_nombre && `• ${apt.tipo_vehiculo_nombre}`}
                        </p>
                      </div>
                      <Badge className={statusColors[apt.estado] || statusColors.scheduled}>
                        {statusLabels[apt.estado] || "Programada"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Card */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Resumen del Día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Citas Programadas</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalAppointmentsToday} citas para hoy
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">En Proceso</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.appointmentsInProgress} recepciones activas
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Completadas</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.completedToday} recepciones finalizadas
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-amber-100 text-amber-600">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Proveedores Activos</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.totalSuppliers} proveedores registrados
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Nueva Cita",
                  description: "Programar una entrega",
                  icon: <Calendar className="h-5 w-5" />,
                  color: "from-purple-500 to-indigo-500",
                  path: "/citas/nueva",
                },
                {
                  title: "Nuevo Producto",
                  description: "Registrar producto",
                  icon: <Package className="h-5 w-5" />,
                  color: "from-emerald-500 to-teal-500",
                  path: "/catalogo/productos/nuevo",
                },
                {
                  title: "Nuevo Proveedor",
                  description: "Agregar proveedor",
                  icon: <Truck className="h-5 w-5" />,
                  color: "from-blue-500 to-cyan-500",
                  path: "/proveedores/lista",
                },
                {
                  title: "Generar Reporte",
                  description: "Exportar datos",
                  icon: <TrendingUp className="h-5 w-5" />,
                  color: "from-amber-500 to-orange-500",
                  path: "/reportes",
                },
              ].map((action) => (
                <button
                  key={action.title}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-4 p-4 rounded-xl border hover:shadow-md transition-all group text-left"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} text-white group-hover:scale-110 transition-transform`}
                  >
                    {action.icon}
                  </div>
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

