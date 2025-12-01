import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Bell, Moon, Sun, LogOut, User, Settings, ChevronLeft, Calendar, Clock, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/input"
import { UserAvatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/auth.store"
import { useUIStore } from "@/store/ui.store"
import { db } from "@/services/database.service"

const roleLabels: Record<string, string> = {
  superadmin: "Super Administrador",
  admin: "Administrador",
  "scheduling-admin": "Admin de Citas",
  "catalog-admin": "Admin de Catálogo",
  "supplier-admin": "Admin de Proveedor",
  "supplier-user": "Usuario Proveedor",
  security: "Seguridad",
}

interface Notification {
  id: string
  type: "appointment" | "pending" | "completed"
  title: string
  description: string
  time: string
  color: string
}

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, setTheme, sidebarCollapsed } = useUIStore()
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(true)

  // Cargar notificaciones reales basadas en citas
  React.useEffect(() => {
    async function loadNotifications() {
      setIsLoadingNotifications(true)
      try {
        const appointmentsData = await db.getAll("appointments")
        const today = format(new Date(), "yyyy-MM-dd")
        
        const notifs: Notification[] = []
        
        // Procesar citas para crear notificaciones
        const appointments = appointmentsData as unknown as Array<Record<string, unknown>>
        
        appointments.forEach((apt, index) => {
          const fecha = String(apt.fecha || apt.Fecha || "")
          const hora = String(apt.hora_inicio || apt.Hora || "")
          const proveedor = String(apt.proveedor_nombre || apt["Nombre del solicitante"] || apt.Laboratorio || "Proveedor")
          const puerta = String(apt.puerta_nombre || apt.Puerta || "")
          const estado = String(apt.estado || apt.Estado || "scheduled")
          
          // Citas de hoy programadas
          if (fecha === today && (estado === "scheduled" || !estado)) {
            notifs.push({
              id: `apt-${index}`,
              type: "appointment",
              title: "Cita programada para hoy",
              description: `${proveedor} - ${hora} - ${puerta}`,
              time: hora,
              color: "bg-blue-500",
            })
          }
          
          // Citas en proceso
          if (estado === "receiving" || estado === "receiving_started") {
            notifs.push({
              id: `receiving-${index}`,
              type: "pending",
              title: "Recepción en proceso",
              description: `${proveedor} - ${puerta}`,
              time: "Ahora",
              color: "bg-amber-500",
            })
          }
          
          // Citas completadas hoy
          if (fecha === today && (estado === "complete" || estado === "receiving_finished")) {
            notifs.push({
              id: `completed-${index}`,
              type: "completed",
              title: "Recepción completada",
              description: `${proveedor} - ${puerta}`,
              time: hora,
              color: "bg-emerald-500",
            })
          }
        })
        
        // Limitar a las últimas 5 notificaciones
        setNotifications(notifs.slice(0, 5))
      } catch (error) {
        console.error("Error cargando notificaciones:", error)
        setNotifications([])
      } finally {
        setIsLoadingNotifications(false)
      }
    }

    loadNotifications()
    
    // Recargar cada 60 segundos
    const interval = setInterval(loadNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const canGoBack = location.pathname !== "/"

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}
    >
      {/* Left Side */}
      <div className="flex items-center gap-4">
        {canGoBack && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="hidden md:block">
          <SearchInput
            placeholder="Buscar en el sistema..."
            className="w-80"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2 max-h-80 overflow-y-auto">
              {isLoadingNotifications ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Cargando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay notificaciones</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className="flex gap-3 rounded-lg p-2 hover:bg-muted cursor-pointer"
                    onClick={() => navigate("/citas")}
                  >
                    <div className={cn("h-2 w-2 rounded-full mt-2", notif.color)} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                    </div>
                    {notif.type === "appointment" && <Calendar className="h-4 w-4 text-blue-500" />}
                    {notif.type === "pending" && <Clock className="h-4 w-4 text-amber-500" />}
                    {notif.type === "completed" && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                  </div>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center text-primary cursor-pointer"
              onClick={() => navigate("/citas")}
            >
              Ver todas las citas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-full p-1 pr-3 hover:bg-muted transition-colors">
              <UserAvatar name={user?.name || "Usuario"} />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.role ? roleLabels[user.role] : ""}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/perfil")} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/config/usuarios")} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}


