import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets (nombres mapeados)
interface UnidadMedida extends BaseEntity {
  code?: string
  name: string
  symbol?: string  // Símbolo en Google Sheets
  description?: string
  is_active?: boolean | string
}

// Schema de validación
const unidadSchema = z.object({
  code: stringFromAny,
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  symbol: optionalString,
  description: optionalString,
  is_active: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "measurement_units",
  labels: {
    singular: "Unidad de Medida",
    plural: "Unidades de Medida",
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
      success: "Unidad de medida creada exitosamente",
      error: "Error al crear la unidad de medida",
    },
    update: {
      success: "Unidad de medida actualizada exitosamente",
      error: "Error al actualizar la unidad de medida",
    },
    delete: {
      success: "Unidad de medida eliminada exitosamente",
      error: "Error al eliminar la unidad de medida",
    },
  },
}

// Columnas de la tabla (nombres mapeados)
const columns: DataTableColumn<UnidadMedida>[] = [
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
    key: "symbol",
    label: "Abreviatura",
    render: (value) => value ? String(value) : '-'
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
    placeholder: "Código de la unidad",
  },
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Ej: Kilogramo, Litro, Unidad...",
  },
  {
    name: "symbol",
    label: "Abreviatura",
    type: "text",
    placeholder: "Ej: kg, L, ud...",
  },
  {
    name: "description",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción de la unidad de medida",
    className: "sm:col-span-2",
  },
  {
    name: "is_active",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function UnidadesMedidaPage() {
  return (
    <CRUDPage<UnidadMedida>
      config={config}
      entityName="measurement_units"
      columns={columns}
      formFields={formFields}
      formSchema={unidadSchema}
      searchFields={["code", "name", "symbol"]}
      defaultValues={{ is_active: true }}
    />
  )
}
