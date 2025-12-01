import * as React from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Plus, Download, FileSpreadsheet, FileText, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable, type DataTableColumn } from "./DataTable"
import { GenericForm } from "./GenericForm"
import { db } from "@/services/database.service"
import { useAuthStore } from "@/store/auth.store"
import { useToast } from "@/store/ui.store"
import { exportToCSV } from "@/lib/utils"
import type { BaseEntity, FormField, CRUDConfig } from "@/types"
import type { ZodSchema } from "zod"

interface CRUDPageProps<T extends BaseEntity> {
  config: CRUDConfig
  entityName: string
  columns: DataTableColumn<T>[]
  formFields: FormField[]
  formSchema: ZodSchema
  searchFields?: (keyof T)[]
  defaultValues?: Partial<T>
  renderCustomView?: (item: T) => React.ReactNode
}

export function CRUDPage<T extends BaseEntity>({
  config,
  entityName,
  columns,
  formFields,
  formSchema,
  searchFields = [],
  defaultValues = {},
  renderCustomView,
}: CRUDPageProps<T>) {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get("mode") // 'new', 'edit', 'view'

  const { currentRdcId, user } = useAuthStore()
  const toast = useToast()

  const [data, setData] = React.useState<T[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<T | null>(null)
  const [deleteConfirm, setDeleteConfirm] = React.useState<T | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [modalMode, setModalMode] = React.useState<"create" | "edit" | "view">("create")

  // Cargar datos
  const loadData = React.useCallback(() => {
    setLoading(true)
    try {
      // Obtener datos sincrónicamente del cache/localStorage
      db.getAll<T>(entityName, { rdcId: currentRdcId || undefined })
        .then(items => {
          console.log(`📊 ${entityName}: Cargados ${items.length} registros`)
          setData(items)
        })
        .catch(error => {
          console.error(`Error cargando ${entityName}:`, error)
        })
        .finally(() => {
          setLoading(false)
        })
    } catch (error) {
      console.error(`Error cargando ${entityName}:`, error)
      setLoading(false)
    }
  }, [entityName, currentRdcId])

  // Cargar datos solo una vez al montar
  const loadedRef = React.useRef(false)
  
  React.useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    loadData()
  }, [loadData])

  // Manejar rutas con parámetros
  React.useEffect(() => {
    if (mode === "new") {
      setModalMode("create")
      setSelectedItem(null)
      setIsModalOpen(true)
    } else if (id && (mode === "edit" || mode === "view")) {
      const item = data.find((d) => d.id === id)
      if (item) {
        setSelectedItem(item)
        setModalMode(mode === "edit" ? "edit" : "view")
        setIsModalOpen(true)
      }
    }
  }, [id, mode, data])

  // Handlers
  const handleCreate = () => {
    navigate(`?mode=new`)
  }

  const handleView = (item: T) => {
    navigate(`?mode=view`, { state: { id: item.id } })
    setSelectedItem(item)
    setModalMode("view")
    setIsModalOpen(true)
  }

  const handleEdit = (item: T) => {
    navigate(`?mode=edit`, { state: { id: item.id } })
    setSelectedItem(item)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  const handleDelete = (item: T) => {
    setDeleteConfirm(item)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
    navigate("", { replace: true })
  }

  const handleSubmit = async (formData: Partial<T>) => {
    try {
      if (modalMode === "create") {
        await db.create<T>(entityName, {
          ...formData,
          rdc_id: currentRdcId || "rdc-1",
        } as Omit<T, "id" | "created_at" | "updated_at">, user?.id)
        toast.success(config.messages.create.success)
      } else if (modalMode === "edit" && selectedItem) {
        await db.update<T>(entityName, selectedItem.id, formData, user?.id)
        toast.success(config.messages.update.success)
      }
      handleCloseModal()
      loadData()
    } catch (error) {
      const message = modalMode === "create" 
        ? config.messages.create.error 
        : config.messages.update.error
      toast.error(message, String(error))
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      await db.delete(entityName, deleteConfirm.id, user?.id)
      toast.success(config.messages.delete.success)
      setDeleteConfirm(null)
      loadData()
    } catch (error) {
      toast.error(config.messages.delete.error, String(error))
    }
  }

  const handleBulkDelete = async (items: T[]) => {
    const count = await db.bulkDelete(entityName, items.map(i => i.id), user?.id)
    toast.success(`${count} registros eliminados`)
    loadData()
  }

  const handleExportCSV = () => {
    const exportColumns = columns.map(col => ({
      key: String(col.key),
      label: col.label,
    }))
    exportToCSV(data as unknown as Record<string, unknown>[], `${entityName}_${new Date().toISOString().split('T')[0]}`, exportColumns)
    toast.success("Exportación completada", `${data.length} registros exportados a CSV`)
  }

  // Recargar datos desde Google Sheets
  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await db.refresh(entityName)
      loadData()
      toast.success("Datos actualizados", `${config.labels.plural} recargados desde Google Sheets`)
    } catch (error) {
      console.error('Error refrescando datos:', error)
      toast.error("Error al recargar", "No se pudieron actualizar los datos")
    } finally {
      setRefreshing(false)
    }
  }

  const getModalTitle = () => {
    if (modalMode === "create") return `Nuevo ${config.labels.singular}`
    if (modalMode === "edit") return `Editar ${config.labels.singular}`
    return `Ver ${config.labels.singular}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{config.labels.plural}</h1>
          <Badge variant="secondary" className="text-sm">
            {data.length}
          </Badge>
        </div>
        {config.permissions.create && (
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo {config.labels.singular}
          </Button>
        )}
      </div>

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        searchFields={searchFields as (keyof T)[]}
        searchPlaceholder={`Buscar ${config.labels.plural.toLowerCase()}...`}
        enableSelection={config.permissions.delete}
        enableActions={true}
        onView={handleView}
        onEdit={config.permissions.update ? handleEdit : undefined}
        onDelete={config.permissions.delete ? handleDelete : undefined}
        onBulkDelete={config.permissions.delete ? handleBulkDelete : undefined}
        onRefresh={handleRefresh}
        onExportCSV={handleExportCSV}
        refreshing={refreshing}
      />

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getModalTitle()}</DialogTitle>
            <DialogDescription>
              {modalMode === "view"
                ? `Detalles del ${config.labels.singular.toLowerCase()}`
                : modalMode === "create"
                ? `Complete los datos para crear un nuevo ${config.labels.singular.toLowerCase()}`
                : `Modifique los datos del ${config.labels.singular.toLowerCase()}`}
            </DialogDescription>
          </DialogHeader>

          {modalMode === "view" && selectedItem && renderCustomView ? (
            renderCustomView(selectedItem)
          ) : (
            <GenericForm
              fields={formFields}
              schema={formSchema}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              defaultValues={
                (modalMode === "edit" && selectedItem ? selectedItem : defaultValues) as any
              }
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              submitLabel={modalMode === "create" ? "Crear" : "Guardar cambios"}
              disabled={modalMode === "view"}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar este {config.labels.singular.toLowerCase()}?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}


