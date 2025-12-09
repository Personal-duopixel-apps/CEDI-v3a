import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo de categoría basado en Google Sheets (nombres mapeados)
interface Category extends BaseEntity {
  code?: string
  name: string
  description?: string
  is_active?: boolean | string
}

// Schema de validación
const categorySchema = z.object({
  code: stringFromAny,
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: optionalString,
  is_active: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "drug_categories",
  labels: {
    singular: "Categoría",
    plural: "Categorías",
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
      success: "Categoría creada exitosamente",
      error: "Error al crear la categoría",
    },
    update: {
      success: "Categoría actualizada exitosamente",
      error: "Error al actualizar la categoría",
    },
    delete: {
      success: "Categoría eliminada exitosamente",
      error: "Error al eliminar la categoría",
    },
  },
}

// Columnas de la tabla (nombres mapeados)
const columns: DataTableColumn<Category>[] = [
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
    placeholder: "Código de la categoría",
  },
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Nombre de la categoría",
  },
  {
    name: "description",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción de la categoría",
    className: "sm:col-span-2",
  },
  {
    name: "is_active",
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
      searchFields={["code", "name"]}
      defaultValues={{ is_active: true }}
    />
  )
}
