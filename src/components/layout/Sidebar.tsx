import * as React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Package,
  Calendar,
  Truck,
  Users,
  Settings,
  FileText,
  ChevronDown,
  Building2,
  FlaskConical,
  Ruler,
  BoxIcon,
  Percent,
  Coins,
  Tag,
  DoorOpen,
  Car,
  Clock,
  ClipboardList,
  ShieldCheck,
  History,
  Database,
  PlusCircle,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/ui.store"
import { usePermission } from "@/hooks/usePermission"

interface NavItem {
  label: string
  icon: React.ReactNode
  href: string
  permission?: string
  children?: NavItem[]
}

// Nota: Los hrefs padres de items con children no se usan para navegación directa, 
// pero sirven para agrupar en la lógica de apertura del menú.
const navigation: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/",
  },
  {
    label: "Catálogo",
    icon: <Package className="h-5 w-5" />,
    href: "/catalogo",
    permission: "catalog.read", // Requiere permiso de lectura en catálogo
    children: [
      { label: "Productos Nuevos", icon: <PlusCircle className="h-4 w-4" />, href: "/catalogo/productos-nuevos", permission: "catalog.create" },
      { label: "Productos", icon: <Eye className="h-4 w-4" />, href: "/catalogo/productos" },
      { label: "Laboratorios", icon: <FlaskConical className="h-4 w-4" />, href: "/catalogo/laboratorios" },
      { label: "Categorías", icon: <Tag className="h-4 w-4" />, href: "/catalogo/categorias" },
      { label: "Formas Farmacéuticas", icon: <BoxIcon className="h-4 w-4" />, href: "/catalogo/formas" },
      { label: "Unidades de Medida", icon: <Ruler className="h-4 w-4" />, href: "/catalogo/unidades" },
      { label: "Tipos de Empaque", icon: <BoxIcon className="h-4 w-4" />, href: "/catalogo/empaques" },
      { label: "Impuestos", icon: <Percent className="h-4 w-4" />, href: "/catalogo/impuestos" },
      { label: "Monedas", icon: <Coins className="h-4 w-4" />, href: "/catalogo/monedas" },
      { label: "Niveles de Producto", icon: <Tag className="h-4 w-4" />, href: "/catalogo/niveles" },
      { label: "Principios Activos", icon: <FlaskConical className="h-4 w-4" />, href: "/catalogo/principios" },
      { label: "Clasificaciones", icon: <Tag className="h-4 w-4" />, href: "/catalogo/clasificaciones" },
      { label: "Compradores", icon: <Users className="h-4 w-4" />, href: "/catalogo/compradores" },
    ],
  },
  {
    label: "Citas",
    icon: <Calendar className="h-5 w-5" />,
    href: "/citas",
    permission: "scheduling.read",
    children: [
      { label: "Agenda de Citas", icon: <ClipboardList className="h-4 w-4" />, href: "/citas" },
      { label: "Nueva Cita", icon: <Calendar className="h-4 w-4" />, href: "/citas/nueva", permission: "scheduling.create" },
    ],
  },
  {
    label: "Proveedores",
    icon: <Truck className="h-5 w-5" />,
    href: "/proveedores",
    permission: "suppliers.read",
    children: [
      { label: "Lista de Proveedores", icon: <Building2 className="h-4 w-4" />, href: "/proveedores" },
    ],
  },
  {
    label: "Configuración",
    icon: <Settings className="h-5 w-5" />,
    href: "/config",
    permission: "config.read",
    children: [
      { label: "Centros de Distribución", icon: <Building2 className="h-4 w-4" />, href: "/config/rdc" },
      { label: "Puertas", icon: <DoorOpen className="h-4 w-4" />, href: "/config/puertas" },
      { label: "Tipos de Vehículo", icon: <Car className="h-4 w-4" />, href: "/config/vehiculos" },
      { label: "Horarios", icon: <Clock className="h-4 w-4" />, href: "/config/horarios" },
      { label: "Usuarios", icon: <Users className="h-4 w-4" />, href: "/config/usuarios", permission: "users.read" }, // Permiso específico
      { label: "Conexión BD", icon: <Database className="h-4 w-4" />, href: "/config/conexion" },
    ],
  },
  {
    label: "Seguridad",
    icon: <ShieldCheck className="h-5 w-5" />,
    href: "/seguridad",
    permission: "security.read", // Seguridad solo ve esto
  },
  {
    label: "Reportes",
    icon: <FileText className="h-5 w-5" />,
    href: "/reportes",
    permission: "reports.read",
  },
  {
    label: "Auditoría",
    icon: <History className="h-5 w-5" />,
    href: "/auditoria",
    permission: "audit.read",
  },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore()
  const { can } = usePermission()
  const location = useLocation()
  const [openMenus, setOpenMenus] = React.useState<string[]>([])

  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    )
  }

  // Abrir menú si la ruta actual está en los hijos
  React.useEffect(() => {
    navigation.forEach(item => {
      if (item.children?.some(child => location.pathname.startsWith(child.href))) {
        if (!openMenus.includes(item.label)) {
          setOpenMenus(prev => [...prev, item.label])
        }
      }
    })
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const filterByPermission = (items: NavItem[]): NavItem[] => {
    return items.reduce<NavItem[]>((acc, item) => {
      // 1. Verificar permiso del padre/item actual
      if (item.permission && !can(item.permission)) {
        return acc
      }

      // 2. Si tiene hijos, filtrar hijos también
      if (item.children) {
        const visibleChildren = filterByPermission(item.children)
        // Si después de filtrar no queda ningún hijo, no mostrar el padre
        if (visibleChildren.length === 0) {
          return acc
        }

        // Retornar nuevo objeto para no mutar el original
        acc.push({ ...item, children: visibleChildren })
        return acc
      }

      // 3. Item sin hijos con permiso válido
      acc.push(item)
      return acc
    }, [])
  }

  const visibleNavigation = filterByPermission(navigation)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b px-4">
        <div className={cn(
          "flex items-center gap-3 transition-all duration-300",
          sidebarCollapsed && "justify-center"
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-lg">
            C
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <h1 className="font-display font-bold text-lg">CEDI Pharma</h1>
              <p className="text-xs text-muted-foreground">Centro de Distribución</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <ul className="space-y-1">
          {visibleNavigation.map((item) => (
            <li key={item.label}>
              {item.children ? (
                // Menu con hijos
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      "hover:bg-muted text-muted-foreground hover:text-foreground",
                      openMenus.includes(item.label) && "bg-muted text-foreground"
                    )}
                  >
                    {item.icon}
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            openMenus.includes(item.label) && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>

                  <AnimatePresence>
                    {openMenus.includes(item.label) && !sidebarCollapsed && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 mt-1 space-y-1 border-l pl-4 overflow-hidden"
                      >
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <NavLink
                              to={child.href}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                                  "hover:bg-muted",
                                  isActive
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                                )
                              }
                            >
                              {child.icon}
                              <span>{child.label}</span>
                            </NavLink>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Link directo
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      "hover:bg-muted",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground",
                      sidebarCollapsed && "justify-center"
                    )
                  }
                >
                  {item.icon}
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Button */}
      <div className="border-t p-3">
        <button
          onClick={toggleSidebarCollapse}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={cn(
              "h-5 w-5 transition-transform",
              sidebarCollapsed ? "rotate-[-90deg]" : "rotate-90"
            )}
          />
        </button>
      </div>
    </aside>
  )
}


