import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets (nombres mapeados)
interface Moneda extends BaseEntity {
  code?: string
  name: string
  symbol?: string
  description?: string
  is_active?: boolean | string
}

// Schema de validación
const monedaSchema = z.object({
  code: stringFromAny,
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  symbol: optionalString,
  description: optionalString,
  is_active: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "currencies",
  labels: {
    singular: "Moneda",
    plural: "Monedas",
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
      success: "Moneda creada exitosamente",
      error: "Error al crear la moneda",
    },
    update: {
      success: "Moneda actualizada exitosamente",
      error: "Error al actualizar la moneda",
    },
    delete: {
      success: "Moneda eliminada exitosamente",
      error: "Error al eliminar la moneda",
    },
  },
}

// Columnas de la tabla (nombres mapeados)
const columns: DataTableColumn<Moneda>[] = [
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
    label: "Símbolo",
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
    label: "Código ISO",
    type: "text",
    placeholder: "Ej: MXN, USD, EUR...",
  },
  {
    name: "name",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Ej: Peso Mexicano, Dólar Americano...",
  },
  {
    name: "symbol",
    label: "Símbolo",
    type: "text",
    placeholder: "Ej: $, €, £...",
  },
  {
    name: "description",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción de la moneda",
    className: "sm:col-span-2",
  },
  {
    name: "is_active",
    label: "Activo",
    type: "switch",
    defaultValue: true,
  },
]

export function MonedasPage() {
  return (
    <CRUDPage<Moneda>
      config={config}
      entityName="currencies"
      columns={columns}
      formFields={formFields}
      formSchema={monedaSchema}
      searchFields={["code", "name", "symbol"]}
      defaultValues={{ is_active: true }}
    />
  )
}
