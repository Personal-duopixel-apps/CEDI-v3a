import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets (nombres mapeados)
interface NivelProducto extends BaseEntity {
  code?: string
  name: string
  description?: string
  is_active?: boolean | string
}

// Schema de validación
const nivelSchema = z.object({
  code: stringFromAny,
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: optionalString,
  is_active: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "product_levels",
  labels: {
    singular: "Nivel de Producto",
    plural: "Niveles de Producto",
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
      success: "Nivel de producto creado exitosamente",
      error: "Error al crear el nivel de producto",
    },
    update: {
      success: "Nivel de producto actualizado exitosamente",
      error: "Error al actualizar el nivel de producto",
    },
    delete: {
      success: "Nivel de producto eliminado exitosamente",
      error: "Error al eliminar el nivel de producto",
    },
  },
}

// Columnas de la tabla (nombres mapeados)
const columns: DataTableColumn<NivelProducto>[] = [
  { 
    key: "code", 
    label: "Código", 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "name", 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "description", 
    label: "Descripción",
    render: (value) => value || '-'
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
    placeholder: "Código del nivel",
  },
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Nombre del nivel de producto",
  },
  {
    name: "description",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción del nivel",
    className: "sm:col-span-2",
  },
  {
    name: "is_active",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function NivelesProductoPage() {
  return (
    <CRUDPage<NivelProducto>
      config={config}
      entityName="product_levels"
      columns={columns}
      formFields={formFields}
      formSchema={nivelSchema}
      searchFields={["code", "name"]}
      defaultValues={{ is_active: true }}
    />
  )
}
