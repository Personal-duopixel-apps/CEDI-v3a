import * as React from "react"
import { motion } from "framer-motion"
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
} from "lucide-react"
import { StatCard, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/auth.store"

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

// Demo data
const todayAppointments = [
  {
    id: 1,
    time: "08:00 - 09:00",
    supplier: "Distribuidora Farmacéutica Nacional",
    dock: "Andén 1",
    status: "receiving" as const,
    vehicle: "Camión 5 ton",
  },
  {
    id: 2,
    time: "09:30 - 10:30",
    supplier: "Laboratorios del Norte",
    dock: "Andén 2",
    status: "scheduled" as const,
    vehicle: "Tráiler",
  },
  {
    id: 3,
    time: "11:00 - 12:00",
    supplier: "Medicamentos Genéricos MX",
    dock: "Andén 3",
    status: "pending" as const,
    vehicle: "Camión 3.5 ton",
  },
  {
    id: 4,
    time: "14:00 - 15:30",
    supplier: "Distribuidora Central",
    dock: "Andén 4",
    status: "scheduled" as const,
    vehicle: "Refrigerado",
  },
]

const recentActivity = [
  {
    id: 1,
    action: "Cita completada",
    description: "Andén 5 - Proveedor: DIFARNA",
    time: "Hace 30 min",
    type: "success",
  },
  {
    id: 2,
    action: "Nuevo producto registrado",
    description: "Paracetamol 500mg - SKU: MED-001",
    time: "Hace 1 hora",
    type: "info",
  },
  {
    id: 3,
    action: "Alerta de stock",
    description: "5 productos con stock bajo",
    time: "Hace 2 horas",
    type: "warning",
  },
  {
    id: 4,
    action: "Proveedor actualizado",
    description: "Laboratorios del Norte - Nuevo comprador",
    time: "Hace 3 horas",
    type: "info",
  },
]

const statusColors = {
  scheduled: "bg-blue-100 text-blue-800",
  pending: "bg-amber-100 text-amber-800",
  receiving: "bg-purple-100 text-purple-800",
  complete: "bg-emerald-100 text-emerald-800",
}

const statusLabels = {
  scheduled: "Programada",
  pending: "Pendiente",
  receiving: "En Recepción",
  complete: "Completada",
}

export function DashboardPage() {
  const { user } = useAuthStore()

  const currentHour = new Date().getHours()
  const greeting =
    currentHour < 12 ? "Buenos días" : currentHour < 18 ? "Buenas tardes" : "Buenas noches"

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
          value="12"
          description="4 en progreso"
          icon={<Calendar className="h-6 w-6" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Productos Activos"
          value="1,234"
          description="32 nuevos este mes"
          icon={<Package className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Proveedores"
          value="48"
          description="5 con entregas hoy"
          icon={<Truck className="h-6 w-6" />}
        />
        <StatCard
          title="Tiempo Promedio"
          value="45 min"
          description="Por recepción"
          icon={<Clock className="h-6 w-6" />}
          trend={{ value: 5, isPositive: false }}
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Appointments */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Citas de Hoy</CardTitle>
              <Button variant="ghost" size="sm">
                Ver todas <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-24 text-sm font-medium text-muted-foreground">
                      {apt.time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{apt.supplier}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.dock} • {apt.vehicle}
                      </p>
                    </div>
                    <Badge className={statusColors[apt.status]}>
                      {statusLabels[apt.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === "success"
                          ? "bg-emerald-100 text-emerald-600"
                          : activity.type === "warning"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {activity.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : activity.type === "warning" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <TrendingUp className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
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
                },
                {
                  title: "Nuevo Producto",
                  description: "Registrar producto",
                  icon: <Package className="h-5 w-5" />,
                  color: "from-emerald-500 to-teal-500",
                },
                {
                  title: "Nuevo Proveedor",
                  description: "Agregar proveedor",
                  icon: <Truck className="h-5 w-5" />,
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  title: "Generar Reporte",
                  description: "Exportar datos",
                  icon: <TrendingUp className="h-5 w-5" />,
                  color: "from-amber-500 to-orange-500",
                },
              ].map((action) => (
                <button
                  key={action.title}
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

