import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets
interface FormaFarmaceutica extends BaseEntity {
  Codigo?: string
  Nombre: string
  Descripcion?: string
  Activo?: boolean | string
}

// Schema de validación
const formaSchema = z.object({
  Codigo: stringFromAny,
  Nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  Descripcion: optionalString,
  Activo: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "pharmaceutical_forms",
  labels: {
    singular: "Forma Farmacéutica",
    plural: "Formas Farmacéuticas",
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

// Columnas de la tabla
const columns: DataTableColumn<FormaFarmaceutica>[] = [
  { 
    key: "Codigo" as keyof FormaFarmaceutica, 
    label: "Código", 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "Nombre" as keyof FormaFarmaceutica, 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "Descripcion" as keyof FormaFarmaceutica, 
    label: "Descripción",
    render: (value) => value || '-'
  },
  {
    key: "Activo" as keyof FormaFarmaceutica,
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
    placeholder: "Código de la forma farmacéutica",
  },
  {
    name: "Nombre",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Ej: Tableta, Cápsula, Jarabe...",
  },
  {
    name: "Descripcion",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción de la forma farmacéutica",
    className: "sm:col-span-2",
  },
  {
    name: "Activo",
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
      searchFields={["Codigo", "Nombre"] as (keyof FormaFarmaceutica)[]}
      defaultValues={{ Activo: true }}
    />
  )
}

