import * as React from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  History,
  FileEdit,
  Trash2,
  Plus,
  Download,
  LogIn,
  LogOut,
  FileSpreadsheet,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input, SearchInput } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { exportToCSV } from "@/lib/utils"
import type { AuditLog, AuditAction } from "@/types"

const actionConfig: Record<AuditAction, { label: string; icon: React.ReactNode; color: string }> = {
  create: {
    label: "Creación",
    icon: <Plus className="h-4 w-4" />,
    color: "bg-emerald-100 text-emerald-800",
  },
  update: {
    label: "Actualización",
    icon: <FileEdit className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-800",
  },
  delete: {
    label: "Eliminación",
    icon: <Trash2 className="h-4 w-4" />,
    color: "bg-red-100 text-red-800",
  },
  login: {
    label: "Inicio de Sesión",
    icon: <LogIn className="h-4 w-4" />,
    color: "bg-purple-100 text-purple-800",
  },
  logout: {
    label: "Cierre de Sesión",
    icon: <LogOut className="h-4 w-4" />,
    color: "bg-gray-100 text-gray-800",
  },
  export: {
    label: "Exportación",
    icon: <FileSpreadsheet className="h-4 w-4" />,
    color: "bg-amber-100 text-amber-800",
  },
}

const entityLabels: Record<string, string> = {
  products: "Productos",
  laboratories: "Laboratorios",
  suppliers: "Proveedores",
  appointments: "Citas",
  docks: "Andenes",
  vehicle_types: "Tipos de Vehículo",
  users: "Usuarios",
  buyers: "Compradores",
  drug_categories: "Categorías",
}

// Demo audit logs
const demoLogs: Partial<AuditLog>[] = [
  {
    id: "log-1",
    user_id: "user-1",
    user_email: "admin@cedi.com",
    action: "create",
    entity_type: "appointments",
    entity_id: "apt-123",
    new_values: { appointment_number: "CTA-2024-001", supplier_id: "supplier-1" },
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "log-2",
    user_id: "user-2",
    user_email: "catalogo@cedi.com",
    action: "update",
    entity_type: "products",
    entity_id: "prod-456",
    old_values: { list_price: 35.00 },
    new_values: { list_price: 38.50 },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "log-3",
    user_id: "user-1",
    user_email: "admin@cedi.com",
    action: "delete",
    entity_type: "suppliers",
    entity_id: "sup-789",
    old_values: { code: "PROV999", name: "Proveedor Inactivo" },
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "log-4",
    user_id: "user-4",
    user_email: "proveedor@cedi.com",
    action: "login",
    entity_type: "auth",
    entity_id: "session-001",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "log-5",
    user_id: "user-2",
    user_email: "catalogo@cedi.com",
    action: "export",
    entity_type: "products",
    entity_id: "export-001",
    new_values: { format: "csv", count: 150 },
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "log-6",
    user_id: "user-3",
    user_email: "citas@cedi.com",
    action: "update",
    entity_type: "appointments",
    entity_id: "apt-456",
    old_values: { status: "scheduled" },
    new_values: { status: "receiving_started" },
    created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
]

export function AuditPage() {
  const [logs] = React.useState(demoLogs)
  const [actionFilter, setActionFilter] = React.useState<string>("all")
  const [entityFilter, setEntityFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")

  const filteredLogs = React.useMemo(() => {
    return logs.filter(log => {
      if (actionFilter !== "all" && log.action !== actionFilter) return false
      if (entityFilter !== "all" && log.entity_type !== entityFilter) return false
      if (searchQuery && !log.user_email?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      return true
    })
  }, [logs, actionFilter, entityFilter, searchQuery])

  const handleExport = () => {
    const exportData = filteredLogs.map(log => ({
      fecha: log.created_at,
      usuario: log.user_email,
      accion: actionConfig[log.action!]?.label || log.action,
      entidad: entityLabels[log.entity_type!] || log.entity_type,
      id_registro: log.entity_id,
    }))
    exportToCSV(
      exportData,
      `auditoria_${new Date().toISOString().split("T")[0]} `,
      [
        { key: "fecha", label: "Fecha" },
        { key: "usuario", label: "Usuario" },
        { key: "accion", label: "Acción" },
        { key: "entidad", label: "Entidad" },
        { key: "id_registro", label: "ID Registro" },
      ]
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
          <h1 className="text-2xl font-bold">Registro de Auditoría</h1>
          <p className="text-muted-foreground">
            Historial completo de cambios en el sistema
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <SearchInput
                placeholder="Buscar por usuario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                <SelectItem value="create">Creación</SelectItem>
                <SelectItem value="update">Actualización</SelectItem>
                <SelectItem value="delete">Eliminación</SelectItem>
                <SelectItem value="login">Inicio de Sesión</SelectItem>
                <SelectItem value="export">Exportación</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las entidades</SelectItem>
                <SelectItem value="products">Productos</SelectItem>
                <SelectItem value="suppliers">Proveedores</SelectItem>
                <SelectItem value="appointments">Citas</SelectItem>
                <SelectItem value="laboratories">Laboratorios</SelectItem>
                <SelectItem value="auth">Autenticación</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Desde"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-36"
            />
            <Input
              type="date"
              placeholder="Hasta"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-36"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Log List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Registros ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No hay registros</h3>
                <p className="text-muted-foreground">
                  No se encontraron registros de auditoría con los filtros seleccionados
                </p>
              </div>
            ) : (
              filteredLogs.map((log, index) => {
                const actionCfg = actionConfig[log.action!] || actionConfig.update
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    {/* Icon */}
                    <div className={`p - 2 rounded - lg ${actionCfg.color} `}>
                      {actionCfg.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.user_email}</span>
                        <Badge variant="outline" className="text-xs">
                          {actionCfg.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entityLabels[log.entity_type!] || log.entity_type}
                        {log.entity_id && log.entity_type !== "auth" && (
                          <span className="font-mono ml-1">({log.entity_id})</span>
                        )}
                      </p>

                      {/* Changes */}
                      {(log.old_values || log.new_values) && (
                        <div className="mt-2 text-xs bg-muted rounded-lg p-2 font-mono overflow-x-auto">
                          {log.old_values && (
                            <div className="text-red-600">
                              - {JSON.stringify(log.old_values)}
                            </div>
                          )}
                          {log.new_values && (
                            <div className="text-emerald-600">
                              + {JSON.stringify(log.new_values)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      {log.created_at && format(new Date(log.created_at), "dd MMM yyyy", { locale: es })}
                      <br />
                      <span className="text-xs">
                        {log.created_at && format(new Date(log.created_at), "HH:mm:ss")}
                      </span>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

