import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets (nombres mapeados)
interface Clasificacion extends BaseEntity {
  code?: string
  name: string
  description?: string
  is_active?: boolean | string
}

// Schema de validación
const clasificacionSchema = z.object({
  code: stringFromAny,
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: optionalString,
  is_active: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "classifications",
  labels: {
    singular: "Clasificación",
    plural: "Clasificaciones",
  },
  displayField: "name",
  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
  },
  messages: {
    create: {
      success: "Clasificación creada exitosamente",
      error: "Error al crear la clasificación",
    },
    update: {
      success: "Clasificación actualizada exitosamente",
      error: "Error al actualizar la clasificación",
    },
    delete: {
      success: "Clasificación eliminada exitosamente",
      error: "Error al eliminar la clasificación",
    },
  },
}

// Columnas de la tabla (nombres mapeados)
const columns: DataTableColumn<Clasificacion>[] = [
  {
    key: "code",
    label: "Código",
    sortable: true,
    render: (value) => value ? String(value) : '-'
  },
  {
    key: "name",
    label: "Nombre",
    sortable: true
  },
  {
    key: "description",
    label: "Descripción",
    render: (value) => value ? String(value) : '-'
  },
  {
    key: "is_active",
    label: "Estado",
    render: (value) => {
      const isActive = value === true || value === 'TRUE' || value === 'true' || value === 'Sí' || value === undefined
      return (
        <Badge variant={isActive ? "success" : "secondary"}>
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      )
    },
  },
]

// Campos del formulario (nombres mapeados)
const formFields: FormField[] = [
  {
    name: "code",
    label: "Código",
    type: "text",
    placeholder: "Código de la clasificación",
  },
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Nombre de la clasificación",
  },
  {
    name: "description",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción de la clasificación",
    className: "sm:col-span-2",
  },
  {
    name: "is_active",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function ClasificacionesPage() {
  return (
    <CRUDPage<Clasificacion>
      config={config}
      entityName="classifications"
      columns={columns}
      formFields={formFields}
      formSchema={clasificacionSchema}
      searchFields={["code", "name"]}
      defaultValues={{ is_active: true }}
    />
  )
}
