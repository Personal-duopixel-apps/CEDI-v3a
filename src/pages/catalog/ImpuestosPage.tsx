import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny, numberFromString } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets
interface Impuesto extends BaseEntity {
  Codigo?: string
  Nombre: string
  Porcentaje?: number | string
  Descripcion?: string
  Activo?: boolean | string
}

// Schema de validación
const impuestoSchema = z.object({
  Codigo: stringFromAny,
  Nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  Porcentaje: numberFromString,
  Descripcion: optionalString,
  Activo: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "taxes",
  labels: {
    singular: "Impuesto",
    plural: "Impuestos",
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
      success: "Impuesto creado exitosamente",
      error: "Error al crear el impuesto",
    },
    update: {
      success: "Impuesto actualizado exitosamente",
      error: "Error al actualizar el impuesto",
    },
    delete: {
      success: "Impuesto eliminado exitosamente",
      error: "Error al eliminar el impuesto",
    },
  },
}

// Columnas de la tabla
const columns: DataTableColumn<Impuesto>[] = [
  { 
    key: "Codigo" as keyof Impuesto, 
    label: "Código", 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "Nombre" as keyof Impuesto, 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "Porcentaje" as keyof Impuesto, 
    label: "Porcentaje",
    render: (value) => value !== undefined && value !== '' ? `${value}%` : '-'
  },
  { 
    key: "Descripcion" as keyof Impuesto, 
    label: "Descripción",
    render: (value) => value || '-'
  },
  {
    key: "Activo" as keyof Impuesto,
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
    placeholder: "Código del impuesto",
  },
  {
    name: "Nombre",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Ej: IVA, ISR, IEPS...",
  },
  {
    name: "Porcentaje",
    label: "Porcentaje (%)",
    type: "number",
    placeholder: "Ej: 16",
  },
  {
    name: "Descripcion",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción del impuesto",
    className: "sm:col-span-2",
  },
  {
    name: "Activo",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function ImpuestosPage() {
  return (
    <CRUDPage<Impuesto>
      config={config}
      entityName="taxes"
      columns={columns}
      formFields={formFields}
      formSchema={impuestoSchema}
      searchFields={["Codigo", "Nombre"] as (keyof Impuesto)[]}
      defaultValues={{ Activo: true }}
    />
  )
}

