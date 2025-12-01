import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets (nombres mapeados)
interface FormaFarmaceutica extends BaseEntity {
  code?: string
  name: string
  description?: string
  is_active?: boolean | string
}

// Schema de validación
const formaSchema = z.object({
  code: stringFromAny,
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: optionalString,
  is_active: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "pharmaceutical_forms",
  labels: {
    singular: "Forma Farmacéutica",
    plural: "Formas Farmacéuticas",
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
      success: "Forma farmacéutica creada exitosamente",
      error: "Error al crear la forma farmacéutica",
    },
    update: {
      success: "Forma farmacéutica actualizada exitosamente",
      error: "Error al actualizar la forma farmacéutica",
    },
    delete: {
      success: "Forma farmacéutica eliminada exitosamente",
      error: "Error al eliminar la forma farmacéutica",
    },
  },
}

// Columnas de la tabla (nombres mapeados)
const columns: DataTableColumn<FormaFarmaceutica>[] = [
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
    placeholder: "Código de la forma farmacéutica",
  },
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Ej: Tableta, Cápsula, Jarabe...",
  },
  {
    name: "description",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción de la forma farmacéutica",
    className: "sm:col-span-2",
  },
  {
    name: "is_active",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function FormasFarmaceuticasPage() {
  return (
    <CRUDPage<FormaFarmaceutica>
      config={config}
      entityName="pharmaceutical_forms"
      columns={columns}
      formFields={formFields}
      formSchema={formaSchema}
      searchFields={["code", "name"]}
      defaultValues={{ is_active: true }}
    />
  )
}

