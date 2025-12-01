import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets
interface NivelProducto extends BaseEntity {
  Codigo?: string
  Nombre: string
  Descripción?: string
  Activo?: boolean | string
}

// Schema de validación
const nivelSchema = z.object({
  Codigo: stringFromAny,
  Nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  Descripción: optionalString,
  Activo: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "product_levels",
  labels: {
    singular: "Nivel de Producto",
    plural: "Niveles de Producto",
  },
  displayField: "Nombre",
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

// Columnas de la tabla
const columns: DataTableColumn<NivelProducto>[] = [
  { 
    key: "Codigo" as keyof NivelProducto, 
    label: "Código", 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "Nombre" as keyof NivelProducto, 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "Descripción" as keyof NivelProducto, 
    label: "Descripción",
    render: (value) => value || '-'
  },
  {
    key: "Activo" as keyof NivelProducto,
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

// Campos del formulario
const formFields: FormField[] = [
  {
    name: "Codigo",
    label: "Código",
    type: "text",
    placeholder: "Código del nivel",
  },
  {
    name: "Nombre",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Nombre del nivel de producto",
  },
  {
    name: "Descripción",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción del nivel",
    className: "sm:col-span-2",
  },
  {
    name: "Activo",
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
      searchFields={["Codigo", "Nombre"] as (keyof NivelProducto)[]}
      defaultValues={{ Activo: true }}
    />
  )
}

