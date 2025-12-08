import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Bell, Moon, Sun, LogOut, User, Settings, ChevronLeft, Calendar, Clock, CheckCircle, Trash2, CheckCheck, X } from "lucide-react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuthStore } from "@/store/auth.store"
import { useUIStore } from "@/store/ui.store"
import { useNotificationsStore, Notification } from "@/store/notifications.store"
import { db } from "@/services/database.service"
import { ROLE_LABELS } from "@/lib/constants"

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, setTheme, sidebarCollapsed } = useUIStore()
  const {
    notifications,
    setNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    removeNotification,
    getUnreadCount
  } = useNotificationsStore()
  const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(true)
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false)

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

          // Citas pendientes de transporte
          if (estado === "pending_transport" || estado === "pending_transport_data") {
            notifs.push({
              id: `pending-transport-${apt.id || index}`,
              type: "warning",
              title: "Cita pendiente de datos",
              description: `${proveedor} - ${fecha} ${hora}`,
              time: "Pendiente",
              color: "bg-amber-500",
              read: false,
              createdAt: Date.now(),
            })
          }

          // Citas de hoy programadas
          if (fecha === today && (estado === "scheduled" || estado === "approved")) {
            notifs.push({
              id: `apt-today-${apt.id || index}`,
              type: "appointment",
              title: "Cita programada para hoy",
              description: `${proveedor} - ${hora} - ${puerta}`,
              time: hora,
              color: "bg-blue-500",
              read: false,
              createdAt: Date.now(),
            })
          }

          // Citas en proceso
          if (estado === "receiving" || estado === "receiving_started") {
            notifs.push({
              id: `receiving-${apt.id || index}`,
              type: "pending",
              title: "Recepción en proceso",
              description: `${proveedor} - ${puerta}`,
              time: "Ahora",
              color: "bg-purple-500",
              read: false,
              createdAt: Date.now(),
            })
          }

          // Citas listas para aprobar
          if (estado === "transport_completed") {
            notifs.push({
              id: `approve-${apt.id || index}`,
              type: "info",
              title: "Cita lista para aprobar",
              description: `${proveedor} - ${fecha} ${hora}`,
              time: "Pendiente",
              color: "bg-indigo-500",
              read: false,
              createdAt: Date.now(),
            })
          }
        })

        // Limitar a las últimas 10 notificaciones
        setNotifications(notifs.slice(0, 10))
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
  }, [setNotifications])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const canGoBack = location.pathname !== "/"

  const unreadCount = getUnreadCount()

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id)
    navigate("/citas")
    setIsNotificationsOpen(false)
  }

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    markAllAsRead()
  }

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    clearAll()
  }

  const handleRemoveNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    removeNotification(id)
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "appointment":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-purple-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "warning":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "info":
        return <Calendar className="h-4 w-4 text-indigo-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

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
        <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Notificaciones</h3>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} nuevas
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleMarkAllAsRead}
                      className="h-8 w-8"
                      title="Marcar todas como leídas"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleClearAll}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Limpiar todas"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {isLoadingNotifications ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-sm">Cargando...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No hay notificaciones</p>
                  <p className="text-xs mt-1">Las notificaciones aparecerán aquí</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        "flex gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors relative group",
                        !notif.read && "bg-primary/5"
                      )}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      {/* Indicador de no leído */}
                      {!notif.read && (
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                      )}

                      {/* Color indicator */}
                      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0", notif.color.replace("bg-", "bg-").replace("500", "100"))}>
                        {getNotificationIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm truncate",
                          !notif.read ? "font-semibold" : "font-medium"
                        )}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{notif.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                      </div>

                      {/* Remove button */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                        onClick={(e) => handleRemoveNotification(e, notif.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigate("/citas")
                    setIsNotificationsOpen(false)
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver todas las citas
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-full p-1 pr-3 hover:bg-muted transition-colors">
              <UserAvatar name={user?.name || "Usuario"} />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.role ? ROLE_LABELS[user.role] : ""}
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
