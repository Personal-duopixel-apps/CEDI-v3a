import { z } from "zod"
import { CRUDPage } from "@/components/crud/CRUDPage"
import { Badge } from "@/components/ui/badge"
import { booleanFromString, optionalString, stringFromAny } from "@/lib/schema-helpers"
import type { FormField, CRUDConfig, BaseEntity } from "@/types"
import type { DataTableColumn } from "@/components/crud/DataTable"

// Tipo basado en Google Sheets
interface Moneda extends BaseEntity {
  Codigo?: string
  Nombre: string
  Simbolo?: string
  Descripcion?: string
  Activo?: boolean | string
}

// Schema de validación
const monedaSchema = z.object({
  Codigo: stringFromAny,
  Nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  Simbolo: optionalString,
  Descripcion: optionalString,
  Activo: booleanFromString.optional(),
})

// Configuración del CRUD
const config: CRUDConfig = {
  entity: "currencies",
  labels: {
    singular: "Moneda",
    plural: "Monedas",
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

// Columnas de la tabla
const columns: DataTableColumn<Moneda>[] = [
  { 
    key: "Codigo" as keyof Moneda, 
    label: "Código", 
    sortable: true,
    render: (value) => value || '-'
  },
  { 
    key: "Nombre" as keyof Moneda, 
    label: "Nombre", 
    sortable: true 
  },
  { 
    key: "Simbolo" as keyof Moneda, 
    label: "Símbolo",
    render: (value) => value || '-'
  },
  { 
    key: "Descripcion" as keyof Moneda, 
    label: "Descripción",
    render: (value) => value || '-'
  },
  {
    key: "Activo" as keyof Moneda,
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
    label: "Código ISO",
    type: "text",
    placeholder: "Ej: MXN, USD, EUR...",
  },
  {
    name: "Nombre",
    label: "Nombre",
    type: "text",
    required: true,
    placeholder: "Ej: Peso Mexicano, Dólar Americano...",
  },
  {
    name: "Simbolo",
    label: "Símbolo",
    type: "text",
    placeholder: "Ej: $, €, £...",
  },
  {
    name: "Descripcion",
    label: "Descripción",
    type: "textarea",
    placeholder: "Descripción de la moneda",
    className: "sm:col-span-2",
  },
  {
    name: "Activo",
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
      searchFields={["Codigo", "Nombre", "Simbolo"] as (keyof Moneda)[]}
      defaultValues={{ Activo: true }}
    />
  )
}

