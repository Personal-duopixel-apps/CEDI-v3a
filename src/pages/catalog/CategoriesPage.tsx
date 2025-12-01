import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo de categoría basado en Google Sheets
interface Category extends BaseEntity {
  Codigo?: string
  Nombre: string
  Descripción?: string
  Activo?: boolean | string
}

// Schema de validación
const categorySchema = z.object({
  Codigo: optionalString,
  Nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  Descripción: optionalString,
  Activo: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "drug_categories",
  labels: {
    singular: "Clasificación",
    plural: "Clasificaciones",
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

// Columnas de la tabla
const columns: DataTableColumn<Category>[] = [
  { 
    key: "Codigo" as keyof Category, 
    label: "Código", 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "Nombre" as keyof Category, 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "Descripción" as keyof Category, 
    label: "Descripción",
    render: (value) => value || '-'
  },
  {
    key: "Activo" as keyof Category,
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
    placeholder: "Código de la clasificación",
  },
  {
    name: "Nombre",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Nombre de la clasificación",
  },
  {
    name: "Descripción",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción de la clasificación",
    className: "sm:col-span-2",
  },
  {
    name: "Activo",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function CategoriesPage() {
  return (
    <CRUDPage<Category>
      config={config}
      entityName="drug_categories"
      columns={columns}
      formFields={formFields}
      formSchema={categorySchema}
      searchFields={["Codigo", "Nombre"] as (keyof Category)[]}
      defaultValues={{ Activo: true }}
    />
  )
}
