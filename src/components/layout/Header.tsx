import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Bell, Search, Moon, Sun, LogOut, User, Settings, ChevronLeft } from "lucide-react"
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

const roleLabels: Record<string, string> = {
  superadmin: "Super Administrador",
  admin: "Administrador",
  "scheduling-admin": "Admin de Citas",
  "catalog-admin": "Admin de Catálogo",
  "supplier-admin": "Admin de Proveedor",
  "supplier-user": "Usuario Proveedor",
  security: "Seguridad",
}

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, setTheme, sidebarCollapsed } = useUIStore()
  const [notifications] = React.useState(3) // Demo

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
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {notifications}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-2 p-2">
              <div className="flex gap-3 rounded-lg p-2 hover:bg-muted cursor-pointer">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nueva cita programada</p>
                  <p className="text-xs text-muted-foreground">Proveedor: DIFARNA - 10:30 AM</p>
                  <p className="text-xs text-muted-foreground mt-1">Hace 5 minutos</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg p-2 hover:bg-muted cursor-pointer">
                <div className="h-2 w-2 rounded-full bg-amber-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Datos de transporte pendientes</p>
                  <p className="text-xs text-muted-foreground">Cita #CTA-001234</p>
                  <p className="text-xs text-muted-foreground mt-1">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg p-2 hover:bg-muted cursor-pointer">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Recepción completada</p>
                  <p className="text-xs text-muted-foreground">Andén 3 - Laboratorios del Norte</p>
                  <p className="text-xs text-muted-foreground mt-1">Hace 4 horas</p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-primary">
              Ver todas las notificaciones
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


