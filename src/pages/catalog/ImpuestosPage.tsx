import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny, numberFromString } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets (nombres mapeados)
interface Impuesto extends BaseEntity {
  code?: string
  name: string
  rate?: number | string  // Tasa en Google Sheets
  description?: string
  is_active?: boolean | string
}

// Schema de validación
const impuestoSchema = z.object({
  code: stringFromAny,
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  rate: numberFromString,
  description: optionalString,
  is_active: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "taxes",
  labels: {
    singular: "Impuesto",
    plural: "Impuestos",
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

// Columnas de la tabla (nombres mapeados)
const columns: DataTableColumn<Impuesto>[] = [
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
    key: "rate", 
    label: "Tasa",
    render: (value) => value !== undefined && value !== '' ? `${value}` : '-'
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
    placeholder: "Código del impuesto",
  },
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Ej: IVA, ISR, IEPS...",
  },
  {
    name: "rate",
    label: "Tasa (%)",
    type: "number",
    placeholder: "Ej: 0.12",
  },
  {
    name: "description",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción del impuesto",
    className: "sm:col-span-2",
  },
  {
    name: "is_active",
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
      searchFields={["code", "name"]}
      defaultValues={{ is_active: true }}
    />
  )
}
